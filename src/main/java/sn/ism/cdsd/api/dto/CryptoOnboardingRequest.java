package sn.ism.cdsd.api.dto;

import java.util.Map;

public class CryptoOnboardingRequest {
    private String[] selectedProfiles;
    private Map<String, Map<String, String>> keyBundle;
    private String cryptoVersion;

    public CryptoOnboardingRequest() {
        // Constructeur vide requis par Jackson pour la désérialisation JSON.
    }

    public String[] getSelectedProfiles() { return selectedProfiles; }
    public void setSelectedProfiles(String[] selectedProfiles) { this.selectedProfiles = selectedProfiles; }

    public Map<String, Map<String, String>> getKeyBundle() { return keyBundle; }
    public void setKeyBundle(Map<String, Map<String, String>> keyBundle) { this.keyBundle = keyBundle; }

    public String getCryptoVersion() { return cryptoVersion; }
    public void setCryptoVersion(String cryptoVersion) { this.cryptoVersion = cryptoVersion; }
}
