package sn.ism.cdsd.api.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import sn.ism.cdsd.api.model.ChatMessageEntity;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

    @Query("""
            SELECT m FROM ChatMessageEntity m
            WHERE m.type = 'CHAT'
              AND ((m.senderId = :u1 AND m.recipientId = :u2) OR (m.senderId = :u2 AND m.recipientId = :u1))
            ORDER BY m.timestamp DESC, m.id DESC
            """)
    List<ChatMessageEntity> findConversation(@Param("u1") String u1, @Param("u2") String u2, Pageable pageable);

    @Query("""
            SELECT m FROM ChatMessageEntity m
            WHERE m.type = 'CHAT'
              AND ((m.senderId = :u1 AND m.recipientId = :u2) OR (m.senderId = :u2 AND m.recipientId = :u1))
              AND m.timestamp > :after
            ORDER BY m.timestamp DESC, m.id DESC
            """)
    List<ChatMessageEntity> findConversationAfter(@Param("u1") String u1, @Param("u2") String u2, @Param("after") java.time.LocalDateTime after, Pageable pageable);

    @Query("SELECT m FROM ChatMessageEntity m WHERE m.recipientId IS NULL OR m.recipientId = '' ORDER BY m.timestamp DESC, m.id DESC")
    List<ChatMessageEntity> findPublicHistory(Pageable pageable);

    @Query("""
            SELECT DISTINCT m.recipientId FROM ChatMessageEntity m
            WHERE m.type = 'CHAT'
              AND m.senderId = :username
              AND m.recipientId IS NOT NULL
              AND m.recipientId != ''
            """)
    List<String> findSentTo(@Param("username") String username);

    @Query("""
            SELECT DISTINCT m.senderId FROM ChatMessageEntity m
            WHERE m.type = 'CHAT'
              AND m.recipientId = :username
            """)
    List<String> findReceivedFrom(@Param("username") String username);

    @Query("""
            SELECT m FROM ChatMessageEntity m
            WHERE m.recipientId = :username
              AND m.type = 'NEG_REQUEST'
              AND m.timestamp = (
                    SELECT MAX(m2.timestamp) FROM ChatMessageEntity m2
                    WHERE m2.recipientId = :username
                      AND m2.senderId = m.senderId
                      AND m2.type = 'NEG_REQUEST'
              )
              AND NOT EXISTS (
                    SELECT 1 FROM ChatMessageEntity r
                    WHERE r.senderId = :username
                      AND r.recipientId = m.senderId
                      AND (r.type = 'NEG_ACCEPT' OR r.type = 'NEG_REFUSE' OR r.type = 'NEG_MISMATCH')
                      AND r.timestamp >= m.timestamp
              )
            ORDER BY m.timestamp DESC, m.id DESC
            """)
    List<ChatMessageEntity> findPendingNegotiationRequests(@Param("username") String username, Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessageEntity m WHERE m.senderId = :currentUser AND m.recipientId = :otherUser")
    void deleteMyMessages(@Param("currentUser") String currentUser, @Param("otherUser") String otherUser);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessageEntity m WHERE (m.senderId = :u1 AND m.recipientId = :u2) OR (m.senderId = :u2 AND m.recipientId = :u1)")
    void deleteConversation(@Param("u1") String user1, @Param("u2") String user2);
}
