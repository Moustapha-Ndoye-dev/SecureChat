package sn.ism.cdsd.api.dto;

public class LoginResponse {
    private String token;
    private String username;
    private boolean cryptoOnboardingRequired;
    private String[] cryptoProfilesConfigured;

    public LoginResponse() {}

    public LoginResponse(String token, String username) {
        this.token = token;
        this.username = username;
    }

    public LoginResponse(String token, String username, boolean cryptoOnboardingRequired, String[] cryptoProfilesConfigured) {
        this.token = token;
        this.username = username;
        this.cryptoOnboardingRequired = cryptoOnboardingRequired;
        this.cryptoProfilesConfigured = cryptoProfilesConfigured;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public boolean isCryptoOnboardingRequired() { return cryptoOnboardingRequired; }
    public void setCryptoOnboardingRequired(boolean cryptoOnboardingRequired) { this.cryptoOnboardingRequired = cryptoOnboardingRequired; }

    public String[] getCryptoProfilesConfigured() { return cryptoProfilesConfigured; }
    public void setCryptoProfilesConfigured(String[] cryptoProfilesConfigured) { this.cryptoProfilesConfigured = cryptoProfilesConfigured; }
}
