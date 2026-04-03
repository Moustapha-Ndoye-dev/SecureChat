package sn.ism.cdsd.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sn.ism.cdsd.api.dto.CryptoOnboardingRequest;
import sn.ism.cdsd.api.dto.CryptoOnboardingResponse;
import sn.ism.cdsd.api.dto.UserProfileResponse;
import sn.ism.cdsd.api.model.User;
import sn.ism.cdsd.api.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/users")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Utilisateurs", description = "Profil, annuaire, protocoles crypto et onboarding (key bundle public).")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private static final Logger LOG = Logger.getLogger(UserController.class.getName());
    private static final Set<String> ALLOWED_PROFILES = Set.of(
            "RSA_AES_GCM",
            "ECDH_AES_GCM",
            "ECDH_AES_GCM_SIGNED"
    );

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public UserController(UserRepository userRepository, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    @Operation(summary = "Lister les utilisateurs")
    public List<User> getAllUsers() {
        LOG.info("[USERS] Chargement de la liste des utilisateurs");
        return userRepository.findAll();
    }

    @GetMapping("/me")
    @Operation(summary = "Récupérer mon profil")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        LOG.info(() -> "[USERS] Chargement du profil de " + username);
        return userRepository.findByUsername(username)
                .map(this::toProfileResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/protocols")
    @Operation(summary = "Mettre à jour mes protocoles")
    public ResponseEntity<Object> updateProtocols(@RequestBody Map<String, String> payload) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String protocols = payload.get("protocols");
        LOG.info(() -> "[CRYPTO] Mise a jour simple des protocoles pour " + username + " -> " + protocols);
        return userRepository.findByUsername(username)
                .map(user -> {
                    user.setProtocols(protocols);
                    userRepository.save(user);
                    return ResponseEntity.ok((Object) null);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/crypto/onboarding")
    @Operation(summary = "Finaliser l'onboarding crypto")
    public ResponseEntity<Object> completeCryptoOnboarding(@RequestBody CryptoOnboardingRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        LinkedHashSet<String> normalizedProfiles = normalizeProfiles(request.getSelectedProfiles());
        LOG.info(() -> "[CRYPTO] Onboarding demande pour " + username + " | profils=" + normalizedProfiles);
        if (!hasValidProfileCount(normalizedProfiles)) {
            return ResponseEntity.badRequest().body("Choisissez entre 1 et 3 profils cryptographiques.");
        }
        if (!areAllowedProfiles(normalizedProfiles)) {
            return ResponseEntity.badRequest().body("Un ou plusieurs profils cryptographiques sont invalides.");
        }
        if (!hasValidKeyBundle(request, normalizedProfiles)) {
            return ResponseEntity.badRequest().body("Le paquet de clés publiques est obligatoire.");
        }
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            applyCryptoConfiguration(user, request, normalizedProfiles);
            userRepository.save(user);
            LOG.info(() -> "[CRYPTO] Onboarding termine pour " + username
                    + " | profils=" + normalizedProfiles
                    + " | publicKeyPresente=" + isPresent(user.getPublicKey())
                    + " | keyBundlePresent=" + isPresent(user.getKeyBundle()));
            return ResponseEntity.ok((Object) new CryptoOnboardingResponse(true, true, normalizedProfiles.toArray(String[]::new)));
        } catch (JsonProcessingException e) {
            return ResponseEntity.internalServerError().body("Impossible de stocker la configuration crypto.");
        }
    }

    private UserProfileResponse toProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setPublicKey(user.getPublicKey());
        response.setProtocols(user.getProtocols());
        response.setCryptoOnboardingCompleted(user.isCryptoOnboardingCompleted());
        response.setKeyBundle(user.getKeyBundle());
        response.setCryptoVersion(user.getCryptoVersion());
        return response;
    }

    private LinkedHashSet<String> normalizeProfiles(String[] selectedProfiles) {
        String[] profiles = selectedProfiles == null ? new String[0] : selectedProfiles;
        return Arrays.stream(profiles)
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    }

    private boolean hasValidProfileCount(LinkedHashSet<String> normalizedProfiles) {
        return !normalizedProfiles.isEmpty() && normalizedProfiles.size() <= 3;
    }

    private boolean areAllowedProfiles(LinkedHashSet<String> normalizedProfiles) {
        return ALLOWED_PROFILES.containsAll(normalizedProfiles);
    }

    private boolean hasValidKeyBundle(CryptoOnboardingRequest request, LinkedHashSet<String> normalizedProfiles) {
        if (request.getKeyBundle() == null || request.getKeyBundle().isEmpty()) {
            return false;
        }

        for (String profile : normalizedProfiles) {
            Map<String, String> profileKeys = request.getKeyBundle().get(profile);
            if (profileKeys == null || profileKeys.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private void applyCryptoConfiguration(User user, CryptoOnboardingRequest request, LinkedHashSet<String> normalizedProfiles)
            throws JsonProcessingException {
        user.setProtocols(String.join(",", normalizedProfiles));
        user.setKeyBundle(objectMapper.writeValueAsString(request.getKeyBundle()));
        user.setCryptoVersion(request.getCryptoVersion() == null || request.getCryptoVersion().isBlank() ? "v1" : request.getCryptoVersion().trim());
        user.setCryptoOnboardingCompleted(true);
        user.setCryptoOnboardedAt(LocalDateTime.now());

        Map<String, String> ecdhProfile = request.getKeyBundle().get("ECDH_AES_GCM");
        if (ecdhProfile == null) {
            ecdhProfile = request.getKeyBundle().get("ECDH_AES_GCM_SIGNED");
        }
        if (ecdhProfile != null && ecdhProfile.get("publicKey") != null) {
            user.setPublicKey(ecdhProfile.get("publicKey"));
        }
    }

    private String isPresent(String value) {
        return value == null || value.isBlank() ? "non" : "oui";
    }
}
