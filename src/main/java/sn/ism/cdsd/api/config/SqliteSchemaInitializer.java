package sn.ism.cdsd.api.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

@Configuration
public class SqliteSchemaInitializer {

    @Bean
    public ApplicationRunner sqliteColumnsInitializer(JdbcTemplate jdbcTemplate) {
        return args -> {
            ensureUserColumns(jdbcTemplate);
            ensureMessageColumns(jdbcTemplate);
        };
    }

    private void ensureUserColumns(JdbcTemplate jdbcTemplate) {
        List<String> userColumns = readColumnNames(jdbcTemplate, "users");
        addColumnIfMissing(jdbcTemplate, userColumns, "username", "ALTER TABLE users ADD COLUMN username VARCHAR(255)");
        addColumnIfMissing(jdbcTemplate, userColumns, "password", "ALTER TABLE users ADD COLUMN password VARCHAR(255)");
        addColumnIfMissing(jdbcTemplate, userColumns, "public_key", "ALTER TABLE users ADD COLUMN public_key TEXT");
        addColumnIfMissing(jdbcTemplate, userColumns, "protocols", "ALTER TABLE users ADD COLUMN protocols TEXT");
        addColumnIfMissing(jdbcTemplate, userColumns, "crypto_onboarding_completed", "ALTER TABLE users ADD COLUMN crypto_onboarding_completed BOOLEAN DEFAULT 0");
        addColumnIfMissing(jdbcTemplate, userColumns, "crypto_onboarded_at", "ALTER TABLE users ADD COLUMN crypto_onboarded_at DATETIME");
        addColumnIfMissing(jdbcTemplate, userColumns, "key_bundle", "ALTER TABLE users ADD COLUMN key_bundle TEXT");
        addColumnIfMissing(jdbcTemplate, userColumns, "crypto_version", "ALTER TABLE users ADD COLUMN crypto_version VARCHAR(255)");
    }

    private void ensureMessageColumns(JdbcTemplate jdbcTemplate) {
        List<String> messageColumns = readColumnNames(jdbcTemplate, "messages");
        addColumnIfMissing(jdbcTemplate, messageColumns, "wrapped_key", "ALTER TABLE messages ADD COLUMN wrapped_key TEXT");
        addColumnIfMissing(jdbcTemplate, messageColumns, "sender_wrapped_key", "ALTER TABLE messages ADD COLUMN sender_wrapped_key TEXT");
        addColumnIfMissing(jdbcTemplate, messageColumns, "algorithm_profile", "ALTER TABLE messages ADD COLUMN algorithm_profile VARCHAR(255)");
        addColumnIfMissing(jdbcTemplate, messageColumns, "signature", "ALTER TABLE messages ADD COLUMN signature TEXT");
    }

    private List<String> readColumnNames(JdbcTemplate jdbcTemplate, String tableName) {
        return jdbcTemplate.query(
                "PRAGMA table_info(" + tableName + ")",
                (rs, rowNum) -> rs.getString("name")
        );
    }

    private void addColumnIfMissing(JdbcTemplate jdbcTemplate, List<String> columns, String columnName, String sql) {
        if (!columns.contains(columnName)) {
            jdbcTemplate.execute(sql);
        }
    }
}
