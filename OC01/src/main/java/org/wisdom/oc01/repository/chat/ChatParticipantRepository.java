// src/main/java/org/wisdom/oc01/repository/chat/ChatParticipantRepository.java
package org.wisdom.oc01.repository.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.chat.ChatParticipant;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Integer> {

    // ==================== QUERY CƠ BẢN ====================

    // Lấy participant theo conversation + account
    Optional<ChatParticipant> findByConversationIdConversationAndAccountId(
            Integer conversationId, Integer accountId);

    // Lấy tất cả participants của conversation
    List<ChatParticipant> findByConversationIdConversation(Integer conversationId);

    // Lấy tất cả participants của account
    List<ChatParticipant> findByAccountId(Integer accountId);

    // Kiểm tra tồn tại participant
    boolean existsByConversationIdConversationAndAccountId(
            Integer conversationId, Integer accountId);

    // Đếm participants trong conversation
    Long countByConversationIdConversation(Integer conversationId);

    // ==================== HARD DELETE ====================

    /**
     * Xóa cứng participant khỏi conversation
     * Spring Data JPA tự generate SQL DELETE
     */
    void deleteByConversationIdConversationAndAccountId(
            Integer conversationId, Integer accountId);

    // ==================== BATCH UPDATE OPERATIONS ====================

    // Tăng unread count - batch update
    @Modifying
    @Query("UPDATE ChatParticipant cp SET cp.unreadCount = COALESCE(cp.unreadCount, 0) + 1, " +
            "cp.lastMessagePreview = :content " +
            "WHERE cp.conversation.idConversation = :conversationId " +
            "AND cp.accountId != :senderId")
    void incrementUnreadCount(@Param("conversationId") Integer conversationId,
                              @Param("senderId") Integer senderId,
                              @Param("content") String content);

    // Mark as read - update
    @Modifying
    @Query("UPDATE ChatParticipant cp SET cp.unreadCount = 0, " +
            "cp.lastReadMessageId = :lastReadMessageId " +
            "WHERE cp.conversation.idConversation = :conversationId " +
            "AND cp.accountId = :accountId")
    void markAsRead(@Param("conversationId") Integer conversationId,
                    @Param("accountId") Integer accountId,
                    @Param("lastReadMessageId") Integer lastReadMessageId);
}