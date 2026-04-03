package sn.ism.cdsd.api.dto;

public class RegisterRequest {
    private String username;
    private String password;
    private String confirmPassword;
    private String publicKey;

    public RegisterRequest() {}

    public RegisterRequest(String username, String password, String confirmPassword, String publicKey) {
        this.username = username;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.publicKey = publicKey;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    
    public String getPublicKey() { return publicKey; }
    public void setPublicKey(String publicKey) { this.publicKey = publicKey; }
}
