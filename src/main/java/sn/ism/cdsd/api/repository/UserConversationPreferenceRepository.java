package sn.ism.cdsd.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.ism.cdsd.api.model.UserConversationPreference;

import java.util.Optional;

public interface UserConversationPreferenceRepository extends JpaRepository<UserConversationPreference, Long> {
    Optional<UserConversationPreference> findByUsernameAndContactName(String username, String contactName);
}
