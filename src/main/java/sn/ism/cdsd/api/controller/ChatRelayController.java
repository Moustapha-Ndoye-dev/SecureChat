package sn.ism.cdsd.api.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import sn.ism.cdsd.api.dto.ChatMessage;
import sn.ism.cdsd.api.model.ChatMessageEntity;
import sn.ism.cdsd.api.repository.ChatMessageRepository;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.logging.Level;
import java.util.logging.Logger;

@Controller
public class ChatRelayController {
    private static final Logger LOG = Logger.getLogger(ChatRelayController.class.getName());
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    public ChatRelayController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository chatMessageRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
    }

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage, Principal principal) {
        if (principal == null) {
            LOG.warning("[ SÉCURITÉ ] Tentative d'envoi de message sans session authentifiée.");
            return;
        }
        String actualSender = principal.getName();
        chatMessage.setSenderId(actualSender);

        String to = chatMessage.getRecipientId();
        if ("CHAT".equals(chatMessage.getType()) && to != null && !to.isBlank()
                && to.trim().equalsIgnoreCase(actualSender.trim())) {
            LOG.log(Level.WARNING, "[SÉCURITÉ] CHAT refusé : expéditeur et destinataire identiques ({0})", actualSender);
            return;
        }

        LOG.log(Level.INFO,
                "[TRACE] Relais -> type={0} | from={1} | to={2} | algo={3} | cipherPresent={4} | cipherSize={5} | ivPresent={6} | wrappedPresent={7} | senderWrappedPresent={8} | signaturePresent={9}",
                new Object[] {
                        chatMessage.getType(),
                        actualSender,
                        chatMessage.getRecipientId(),
                        chatMessage.getAlgorithmProfile(),
                        present(chatMessage.getCipherText()),
                        sizeOf(chatMessage.getCipherText()),
                        present(chatMessage.getIv()),
                        present(chatMessage.getWrappedKey()),
                        present(chatMessage.getSenderWrappedKey()),
                        present(chatMessage.getSignature())
                });

        ChatMessageEntity entity = new ChatMessageEntity();
        entity.setSenderId(actualSender);
        entity.setRecipientId(chatMessage.getRecipientId());
        entity.setCipherText(chatMessage.getCipherText());
        entity.setIv(chatMessage.getIv());
        entity.setWrappedKey(chatMessage.getWrappedKey());
        entity.setSenderWrappedKey(chatMessage.getSenderWrappedKey());
        entity.setAlgorithmProfile(chatMessage.getAlgorithmProfile());
        entity.setSignature(chatMessage.getSignature());
        entity.setType(chatMessage.getType());
        entity.setTimestamp(LocalDateTime.now());

        ChatMessageEntity saved = chatMessageRepository.save(entity);

        logE2EPayloadJavaConsole(saved.getId(), chatMessage, actualSender);

        chatMessage.setId(saved.getId());
        chatMessage.setTimestamp(saved.getTimestamp());

        if (chatMessage.getRecipientId() != null && !chatMessage.getRecipientId().isEmpty()) {
            LOG.log(Level.INFO, "[TRACE] Diffusion privee vers {0} puis echo vers {1}",
                    new Object[] { chatMessage.getRecipientId(), actualSender });
            messagingTemplate.convertAndSend("/topic/user-" + chatMessage.getRecipientId(), chatMessage);
            messagingTemplate.convertAndSend("/topic/user-" + actualSender, chatMessage);
        } else {
            LOG.info("[TRACE] Diffusion publique du message");
            messagingTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }

    /**
     * Journalise dans la console Java (IDE / terminal) le paquet tel que le serveur le voit.
     * En vrai E2E, le texte clair et la clé AES ne transitent pas : ils ne peuvent pas être affichés ici.
     */
    private void logE2EPayloadJavaConsole(long messageId, ChatMessage m, String actualSender) {
        String type = m.getType() != null ? m.getType() : "";
        logE2EHeaderFooter(messageId, type, true);
        logE2EMessageMeta(m, actualSender);
        if ("CHAT".equals(type)) {
            logE2EChatPayload(m);
        } else {
            logE2ENegotiationPayload(m);
        }
        logE2EHeaderFooter(messageId, type, false);
    }

    private void logE2EHeaderFooter(long messageId, String type, boolean start) {
        if (start) {
            LOG.log(Level.INFO, "========== [E2E — console Java] id={0} type={1} ==========", new Object[] { messageId, type });
        } else {
            LOG.log(Level.INFO, "========== [E2E — fin] id={0} ==========", messageId);
        }
    }

    private void logE2EMessageMeta(ChatMessage m, String actualSender) {
        LOG.log(Level.INFO, "[E2E] Expéditeur authentifié: {0} | Destinataire: {1}",
                new Object[] { actualSender, m.getRecipientId() });
        String profile = m.getAlgorithmProfile() != null ? m.getAlgorithmProfile() : "(n/a)";
        LOG.log(Level.INFO, "[E2E] Profil / algorithme (client): {0}", profile);
    }

    private void logE2EChatPayload(ChatMessage m) {
        LOG.info("[E2E] --- Message CHIFFRÉ (cipherText, base64) ---");
        LOG.log(Level.INFO, "{0}", nonBlankOrPlaceholder(m.getCipherText()));
        LOG.info("[E2E] --- IV AES-GCM (base64) ---");
        LOG.log(Level.INFO, "{0}", nonBlankOrPlaceholder(m.getIv()));
        logIfPresent("[E2E] --- Matériel de déchiffrement RSA : clé AES ENVELOPPÉE pour le destinataire (base64) ---",
                m.getWrappedKey());
        logIfPresent("[E2E] --- Matériel RSA : clé AES ENVELOPPÉE pour l'expéditeur (base64) ---",
                m.getSenderWrappedKey());
        logIfPresent("[E2E] --- Signature (base64) ---", m.getSignature());
        LOG.warning("[E2E] Message en CLAIR : non disponible côté serveur (déchiffrement uniquement dans le navigateur).");
        LOG.warning("[E2E] Clé AES en clair (ECDH) : jamais envoyée au serveur. Blocs ci-dessus = chiffrés / enveloppés.");
    }

    private void logE2ENegotiationPayload(ChatMessage m) {
        String cipher = m.getCipherText() != null ? m.getCipherText() : "";
        String iv = m.getIv() != null ? m.getIv() : "";
        LOG.log(Level.INFO, "[E2E] Négociation / signal — cipherText (souvent métadonnées lisibles côté app) : {0}", cipher);
        LOG.log(Level.INFO, "[E2E] iv / clé publique (selon type) : {0}", iv);
    }

    private void logIfPresent(String label, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        LOG.info(label);
        LOG.log(Level.INFO, "{0}", value);
    }

    private static String nonBlankOrPlaceholder(String s) {
        return s == null || s.isBlank() ? "(vide)" : s;
    }

    private String present(String value) {
        return value == null || value.isBlank() ? "non" : "oui";
    }

    private int sizeOf(String value) {
        return value == null ? 0 : value.length();
    }
}
