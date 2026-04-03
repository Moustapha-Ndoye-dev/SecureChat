package sn.ism.cdsd.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sn.ism.cdsd.api.model.ChatMessageEntity;
import sn.ism.cdsd.api.repository.ChatMessageRepository;
import sn.ism.cdsd.api.repository.UserConversationPreferenceRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/messages")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Messages & conversations", description = "Historique chiffré, fils actifs, négociations, suppression logique.")
@SecurityRequirement(name = "bearerAuth")
public class HistoryController {
    private static final Logger LOG = Logger.getLogger(HistoryController.class.getName());
    private final ChatMessageRepository chatMessageRepository;
    private final UserConversationPreferenceRepository preferenceRepository;

    public HistoryController(ChatMessageRepository chatMessageRepository, UserConversationPreferenceRepository preferenceRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.preferenceRepository = preferenceRepository;
    }

    @GetMapping("/history")
    @Operation(summary = "Récupérer l'historique privé ou public paginé")
    public List<ChatMessageEntity> getPrivateHistory(@RequestParam String withUser, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        Pageable pageable = PageRequest.of(page, size);
        LOG.info(() -> "[HISTORY] Chargement historique | user=" + currentUser + " | avec=" + withUser + " | page=" + page + " | size=" + size);
        
        if ("PUBLIC".equals(withUser)) {
            return chatMessageRepository.findPublicHistory(pageable);
        }
        
        return preferenceRepository.findByUsernameAndContactName(currentUser, withUser)
                .map(prefs -> {
                    if (prefs.getLastDeletedAt() == null) return chatMessageRepository.findConversation(currentUser, withUser, pageable);
                    return chatMessageRepository.findConversationAfter(currentUser, withUser, prefs.getLastDeletedAt(), pageable);
                })
                .orElseGet(() -> chatMessageRepository.findConversation(currentUser, withUser, pageable));
    }

    @GetMapping("/active-chats")
    @Operation(summary = "Lister les conversations actives")
    public Set<String> getActiveChats() {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        LOG.info(() -> "[HISTORY] Chargement conversations actives pour " + currentUser);
        Set<String> chats = new HashSet<>();
        chats.addAll(chatMessageRepository.findSentTo(currentUser));
        chats.addAll(chatMessageRepository.findReceivedFrom(currentUser));
        // Retrait insensible à la casse : sinon « dou » reste si le principal est « Dou »
        chats.removeIf(c -> c != null && c.equalsIgnoreCase(currentUser));
        chats.remove("PUBLIC");
        // Ne plus lister un contact si l utilisateur a supprimé la discussion et aucun CHAT n a suivi
        chats.removeIf(c -> c != null && isConversationFullyClearedForUser(currentUser, c));
        return chats;
    }

    /**
     * Vrai si des préférences indiquent une suppression logique et qu il n y a plus aucun message CHAT visible après cette date.
     */
    private boolean isConversationFullyClearedForUser(String currentUser, String contact) {
        return preferenceRepository.findByUsernameAndContactName(currentUser, contact)
                .filter(prefs -> prefs.getLastDeletedAt() != null)
                .map(prefs -> {
                    List<ChatMessageEntity> anyAfter = chatMessageRepository.findConversationAfter(
                            currentUser, contact, prefs.getLastDeletedAt(), PageRequest.of(0, 1));
                    return anyAfter.isEmpty();
                })
                .orElse(false);
    }

    @GetMapping("/pending-negotiations")
    @Operation(summary = "Lister les demandes de negociation en attente")
    public List<ChatMessageEntity> getPendingNegotiations(@RequestParam(defaultValue = "10") int size) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        Pageable pageable = PageRequest.of(0, size);
        LOG.info(() -> "[HISTORY] Chargement demandes de negociation en attente pour " + currentUser + " | size=" + size);
        return chatMessageRepository.findPendingNegotiationRequests(currentUser, pageable);
    }

    @DeleteMapping("/conversation/{withUser}")
    @Operation(summary = "Supprimer une conversation (logique)")
    public ResponseEntity<Void> deleteConversation(@PathVariable String withUser) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        LOG.info(() -> "[HISTORY] Suppression logique conversation | user=" + currentUser + " | avec=" + withUser);
        sn.ism.cdsd.api.model.UserConversationPreference prefs = preferenceRepository.findByUsernameAndContactName(currentUser, withUser)
                .orElse(new sn.ism.cdsd.api.model.UserConversationPreference(currentUser, withUser, null));
        prefs.setLastDeletedAt(java.time.LocalDateTime.now());
        preferenceRepository.save(prefs);
        return ResponseEntity.ok().build();
    }
}
