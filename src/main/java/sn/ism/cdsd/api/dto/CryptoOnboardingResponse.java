package sn.ism.cdsd.api.dto;

public class CryptoOnboardingResponse {
    private boolean success;
    private boolean cryptoOnboardingCompleted;
    private String[] selectedProfiles;

    public CryptoOnboardingResponse() {}

    public CryptoOnboardingResponse(boolean success, boolean cryptoOnboardingCompleted, String[] selectedProfiles) {
        this.success = success;
        this.cryptoOnboardingCompleted = cryptoOnboardingCompleted;
        this.selectedProfiles = selectedProfiles;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public boolean isCryptoOnboardingCompleted() { return cryptoOnboardingCompleted; }
    public void setCryptoOnboardingCompleted(boolean cryptoOnboardingCompleted) { this.cryptoOnboardingCompleted = cryptoOnboardingCompleted; }

    public String[] getSelectedProfiles() { return selectedProfiles; }
    public void setSelectedProfiles(String[] selectedProfiles) { this.selectedProfiles = selectedProfiles; }
}
