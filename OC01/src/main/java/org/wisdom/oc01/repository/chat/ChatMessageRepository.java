// src/main/java/org/wisdom/oc01/repository/chat/ChatMessageRepository.java
package org.wisdom.oc01.repository.chat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.chat.ChatMessage;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {

    // Lấy tin nhắn theo conversation (mới nhất trước) - có phân trang
    @Query("SELECT m FROM ChatMessage m " +
            "WHERE m.conversation.idConversation = :conversationId " +
            "AND m.isDeleted = false " +
            "ORDER BY m.createdAt DESC")
    Page<ChatMessage> findByConversationId(@Param("conversationId") Integer conversationId,
                                           Pageable pageable);

    // Lấy tin nhắn theo conversation (cũ nhất trước)
    List<ChatMessage> findByConversationIdConversationAndIsDeletedFalseOrderByCreatedAtAsc(
            Integer conversationId);

    // Lấy tin nhắn cuối cùng của conversation
    @Query("SELECT m FROM ChatMessage m " +
            "WHERE m.conversation.idConversation = :conversationId " +
            "AND m.isDeleted = false " +
            "ORDER BY m.createdAt DESC")
    List<ChatMessage> findLastMessage(@Param("conversationId") Integer conversationId,
                                      Pageable pageable);

    // Đếm tin nhắn chưa đọc (sau last_read_message_id)
    @Query("SELECT COUNT(m) FROM ChatMessage m " +
            "WHERE m.conversation.idConversation = :conversationId " +
            "AND m.idMessage > :lastReadMessageId " +
            "AND m.senderId != :accountId " +
            "AND m.isDeleted = false")
    Long countUnreadMessages(@Param("conversationId") Integer conversationId,
                             @Param("lastReadMessageId") Integer lastReadMessageId,
                             @Param("accountId") Integer accountId);

    // Soft delete message
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isDeleted = true " +
            "WHERE m.idMessage = :messageId")
    void softDeleteMessage(@Param("messageId") Integer messageId);

    // Update message content
    @Modifying
    @Query("UPDATE ChatMessage m SET m.content = :content, m.isEdited = true " +
            "WHERE m.idMessage = :messageId")
    void updateMessageContent(@Param("messageId") Integer messageId,
                              @Param("content") String content);
}