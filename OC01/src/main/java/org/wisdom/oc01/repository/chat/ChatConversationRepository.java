// src/main/java/org/wisdom/oc01/repository/chat/ChatConversationRepository.java
package org.wisdom.oc01.repository.chat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.chat.ChatConversation;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Integer> {

    // ==================== QUERY CHO USER ====================

    // Lấy tất cả conversation của user (qua participant) - có phân trang
    @Query("SELECT DISTINCT c FROM ChatConversation c " +
            "JOIN c.participants cp " +
            "WHERE cp.accountId = :accountId " +
            "ORDER BY c.lastMessageAt DESC NULLS LAST")
    Page<ChatConversation> findByAccountId(@Param("accountId") Integer accountId, Pageable pageable);

    // Lấy tất cả conversation của user (không phân trang)
    @Query("SELECT DISTINCT c FROM ChatConversation c " +
            "JOIN c.participants cp " +
            "WHERE cp.accountId = :accountId " +
            "ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<ChatConversation> findAllByAccountId(@Param("accountId") Integer accountId);

    // ==================== QUERY CHO PRIVATE CHAT ====================

    // Tìm private conversation giữa 2 user
    @Query("SELECT c FROM ChatConversation c " +
            "JOIN c.participants cp1 " +
            "JOIN c.participants cp2 " +
            "WHERE c.conversationType = 'PRIVATE' " +
            "AND cp1.accountId = :user1Id " +
            "AND cp2.accountId = :user2Id")
    Optional<ChatConversation> findPrivateConversation(@Param("user1Id") Integer user1Id,
                                                       @Param("user2Id") Integer user2Id);

    // ==================== QUERY CHO COURSE CHAT ====================

    // Tìm course conversation
    Optional<ChatConversation> findByConversationTypeAndCourseId(
            ChatConversation.ConversationType type, Integer courseId);

    // Kiểm tra tồn tại course conversation
    boolean existsByConversationTypeAndCourseId(
            ChatConversation.ConversationType type, Integer courseId);

    // ==================== QUERY KHÁC ====================

    // Tìm conversation theo type
    List<ChatConversation> findByConversationType(ChatConversation.ConversationType type);
}