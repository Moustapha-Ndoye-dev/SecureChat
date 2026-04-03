package sn.ism.cdsd.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI secureChatOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SecureChat API")
                        .version("1.0.0")
                        .description(
                                "API REST de SecureChat : authentification JWT, annuaire utilisateurs, "
                                        + "onboarding cryptographique (publication des clés publiques), "
                                        + "historique et préférences de conversations. "
                                        + "Le chiffrement des messages est effectué dans le navigateur (Web Crypto) ; "
                                        + "cette API ne propose pas de déchiffrement des messages CHAT.")
                        .contact(new Contact().name("Moustapha Ndoye")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Développement local")))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description(
                                        "Préfixe Authorization : `Bearer <token>`. "
                                                + "Obtenez le jeton via POST /api/auth/login (champ `token` du corps JSON).")));
    }
}
