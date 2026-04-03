package sn.ism.cdsd.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_conversation_preferences")
public class UserConversationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String contactName;

    private LocalDateTime lastDeletedAt;

    public UserConversationPreference() {}

    public UserConversationPreference(String username, String contactName, LocalDateTime lastDeletedAt) {
        this.username = username;
        this.contactName = contactName;
        this.lastDeletedAt = lastDeletedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public LocalDateTime getLastDeletedAt() { return lastDeletedAt; }
    public void setLastDeletedAt(LocalDateTime lastDeletedAt) { this.lastDeletedAt = lastDeletedAt; }
}
