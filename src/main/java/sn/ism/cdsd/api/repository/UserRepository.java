package sn.ism.cdsd.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sn.ism.cdsd.api.model.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
