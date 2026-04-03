package sn.ism.cdsd.api.dto;

public class UserProfileResponse {
    private Long id;
    private String username;
    private String publicKey;
    private String protocols;
    private boolean cryptoOnboardingCompleted;
    private String keyBundle;
    private String cryptoVersion;

    public UserProfileResponse() {
        // Constructeur vide requis par Jackson pour la sérialisation JSON.
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPublicKey() { return publicKey; }
    public void setPublicKey(String publicKey) { this.publicKey = publicKey; }

    public String getProtocols() { return protocols; }
    public void setProtocols(String protocols) { this.protocols = protocols; }

    public boolean isCryptoOnboardingCompleted() { return cryptoOnboardingCompleted; }
    public void setCryptoOnboardingCompleted(boolean cryptoOnboardingCompleted) { this.cryptoOnboardingCompleted = cryptoOnboardingCompleted; }

    public String getKeyBundle() { return keyBundle; }
    public void setKeyBundle(String keyBundle) { this.keyBundle = keyBundle; }

    public String getCryptoVersion() { return cryptoVersion; }
    public void setCryptoVersion(String cryptoVersion) { this.cryptoVersion = cryptoVersion; }
}
