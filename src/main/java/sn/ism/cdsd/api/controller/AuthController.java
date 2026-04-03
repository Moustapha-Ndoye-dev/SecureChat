package sn.ism.cdsd.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import sn.ism.cdsd.api.config.JwtService;
import sn.ism.cdsd.api.dto.LoginRequest;
import sn.ism.cdsd.api.dto.LoginResponse;
import sn.ism.cdsd.api.dto.RegisterRequest;
import sn.ism.cdsd.api.model.User;
import sn.ism.cdsd.api.repository.UserRepository;

import java.util.Arrays;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/auth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Authentification", description = "Inscription et connexion. Aucun JWT requis.")
@SecurityRequirements
public class AuthController {
    private static final Logger LOG = Logger.getLogger(AuthController.class.getName());
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/register")
    @Operation(summary = "S'inscrire")
    public ResponseEntity<Object> register(@RequestBody RegisterRequest request) {
        LOG.info(() -> "[AUTH] Tentative d'inscription pour " + request.getUsername());
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            LOG.warning(() -> "[AUTH] Inscription refusee, nom deja pris: " + request.getUsername());
            return ResponseEntity.badRequest().body("Nom d'utilisateur déjà pris");
        }
        
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            LOG.warning(() -> "[AUTH] Inscription refusee, mots de passe differents pour " + request.getUsername());
            return ResponseEntity.badRequest().body("Les mots de passe ne correspondent pas");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPublicKey(null);
        user.setProtocols("");
        user.setCryptoOnboardingCompleted(false);
        user.setKeyBundle(null);
        user.setCryptoVersion("v1");
        userRepository.save(user);
        LOG.info(() -> "[AUTH] Inscription reussie pour " + request.getUsername());
        return ResponseEntity.ok((Object) user);
    }

    @PostMapping("/login")
    @Operation(summary = "Se connecter")
    public ResponseEntity<Object> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            String token = jwtService.generateToken(userDetails);
            LOG.info(() -> "[AUTH] Connexion reussie pour " + request.getUsername());

            return userRepository.findByUsername(request.getUsername())
                    .map(user -> {
                        String[] configuredProfiles = Arrays.stream((user.getProtocols() == null ? "" : user.getProtocols()).split(","))
                                .map(String::trim)
                                .filter(value -> !value.isEmpty())
                                .toArray(String[]::new);

                        // Toujours le nom canonique en base (JWT / WS / topics utilisent ce même identifiant).
                        LoginResponse response = new LoginResponse(
                                token,
                                user.getUsername(),
                                !user.isCryptoOnboardingCompleted(),
                                configuredProfiles
                        );
                        return ResponseEntity.ok((Object) response);
                    })
                    .orElseGet(() -> ResponseEntity.status(404).body("Utilisateur introuvable"));
        } catch (org.springframework.security.core.AuthenticationException e) {
            LOG.warning(() -> "[AUTH] Connexion echouee pour " + request.getUsername());
            return ResponseEntity.status(401).body("Identifiants invalides");
        }
    }
}
