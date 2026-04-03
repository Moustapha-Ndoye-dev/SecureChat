package sn.ism.cdsd.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class ChatMessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String senderId;

    private String recipientId;

    @Column(columnDefinition = "TEXT")
    private String cipherText;

    private String iv;

    @Column(columnDefinition = "TEXT")
    private String wrappedKey;

    @Column(columnDefinition = "TEXT")
    private String senderWrappedKey;

    private String algorithmProfile;

    @Column(columnDefinition = "TEXT")
    private String signature;

    @Column(nullable = false)
    private String type;

    private LocalDateTime timestamp;

    public ChatMessageEntity() {
        // Constructeur vide requis par JPA.
    }

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "ChatMessageEntity{" +
                "id=" + id +
                ", senderId='" + senderId + '\'' +
                ", recipientId='" + recipientId + '\'' +
                ", type='" + type + '\'' +
                ", timestamp=" + timestamp +
                '}';
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

    // Static Builder equivalent
    public static class Builder {
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

        public Builder senderId(String senderId) { this.senderId = senderId; return this; }
        public Builder recipientId(String recipientId) { this.recipientId = recipientId; return this; }
        public Builder cipherText(String cipherText) { this.cipherText = cipherText; return this; }
        public Builder iv(String iv) { this.iv = iv; return this; }
        public Builder wrappedKey(String wrappedKey) { this.wrappedKey = wrappedKey; return this; }
        public Builder senderWrappedKey(String senderWrappedKey) { this.senderWrappedKey = senderWrappedKey; return this; }
        public Builder algorithmProfile(String algorithmProfile) { this.algorithmProfile = algorithmProfile; return this; }
        public Builder signature(String signature) { this.signature = signature; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public ChatMessageEntity build() {
            ChatMessageEntity entity = new ChatMessageEntity();
            entity.setSenderId(senderId);
            entity.setRecipientId(recipientId);
            entity.setCipherText(cipherText);
            entity.setIv(iv);
            entity.setWrappedKey(wrappedKey);
            entity.setSenderWrappedKey(senderWrappedKey);
            entity.setAlgorithmProfile(algorithmProfile);
            entity.setSignature(signature);
            entity.setType(type);
            entity.setTimestamp(timestamp);
            return entity;
        }
    }
    
    public static Builder builder() {
        return new Builder();
    }
}
