package sn.ism.cdsd.api.dto;

import java.time.LocalDateTime;

public class ChatMessage {
    private Long id;
    private String senderId;
    private String recipientId;
    private String cipherText;
    private String iv;
    private String wrappedKey;
    private String senderWrappedKey;
    private String algorithmProfile;
    private String signature;
    private String type;
    private LocalDateTime timestamp;
    private String clientTmpId; // SÉCURITÉ : Pour la réconciliation d'état client

    public ChatMessage() {
        // Constructeur vide requis par Jackson pour la sérialisation JSON.
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    public String getCipherText() { return cipherText; }
    public void setCipherText(String cipherText) { this.cipherText = cipherText; }
    public String getIv() { return iv; }
    public void setIv(String iv) { this.iv = iv; }
    public String getWrappedKey() { return wrappedKey; }
    public void setWrappedKey(String wrappedKey) { this.wrappedKey = wrappedKey; }
    public String getSenderWrappedKey() { return senderWrappedKey; }
    public void setSenderWrappedKey(String senderWrappedKey) { this.senderWrappedKey = senderWrappedKey; }
    public String getAlgorithmProfile() { return algorithmProfile; }
    public void setAlgorithmProfile(String algorithmProfile) { this.algorithmProfile = algorithmProfile; }
    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getClientTmpId() { return clientTmpId; }
    public void setClientTmpId(String clientTmpId) { this.clientTmpId = clientTmpId; }
}
