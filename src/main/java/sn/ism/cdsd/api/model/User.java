package sn.ism.cdsd.api.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;

    @JsonIgnore
    @Column(nullable = false)
    private String password;
    
    @Column(columnDefinition = "TEXT")
    private String publicKey;

    @Column(columnDefinition = "TEXT")
    private String protocols;

    @Column(nullable = false)
    private boolean cryptoOnboardingCompleted = false;

    private LocalDateTime cryptoOnboardedAt;

    @Column(columnDefinition = "TEXT")
    private String keyBundle;

    private String cryptoVersion;

    public User() {
        // Constructeur vide requis par JPA.
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getPublicKey() { return publicKey; }
    public void setPublicKey(String publicKey) { this.publicKey = publicKey; }

    public String getProtocols() { return protocols; }
    public void setProtocols(String protocols) { this.protocols = protocols; }

    public boolean isCryptoOnboardingCompleted() { return cryptoOnboardingCompleted; }
    public void setCryptoOnboardingCompleted(boolean cryptoOnboardingCompleted) { this.cryptoOnboardingCompleted = cryptoOnboardingCompleted; }

    public LocalDateTime getCryptoOnboardedAt() { return cryptoOnboardedAt; }
    public void setCryptoOnboardedAt(LocalDateTime cryptoOnboardedAt) { this.cryptoOnboardedAt = cryptoOnboardedAt; }

    public String getKeyBundle() { return keyBundle; }
    public void setKeyBundle(String keyBundle) { this.keyBundle = keyBundle; }

    public String getCryptoVersion() { return cryptoVersion; }
    public void setCryptoVersion(String cryptoVersion) { this.cryptoVersion = cryptoVersion; }
}
