package sn.ism.cdsd.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SecureChatApiApplication {

    public static void main(String[] args) {
        // Création du dossier data s'il n'existe pas
        java.io.File dataDir = new java.io.File("data");
        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }
        SpringApplication.run(SecureChatApiApplication.class, args);
    }
}
