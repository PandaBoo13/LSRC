// src/main/java/org/wisdom/oc01/service/ChatService.java
package org.wisdom.oc01.service;

import org.wisdom.oc01.dto.request.chat.AddParticipantRequest;
import org.wisdom.oc01.dto.request.chat.CreateConversationRequest;
import org.wisdom.oc01.dto.request.chat.SendMessageRequest;
import org.wisdom.oc01.dto.response.chat.ConversationResponse;
import org.wisdom.oc01.dto.response.chat.MessageResponse;
import org.wisdom.oc01.dto.response.chat.ParticipantResponse;
import org.wisdom.oc01.dto.response.chat.UserSearchResponse;
import org.wisdom.oc01.entity.chat.ChatParticipant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ChatService {
    // ==================== CONVERSATION ====================

    ConversationResponse createConversation(CreateConversationRequest request);

    /** Lấy danh sách conversation của user, sắp xếp theo lastMessageAt DESC */
    List<ConversationResponse> getMyConversations(Integer accountId, Integer page, Integer size);

    ConversationResponse getConversationById(Integer conversationId, Integer currentAccountId);

    // ==================== PARTICIPANT ====================

    List<ParticipantResponse> getParticipants(Integer conversationId);

    List<ParticipantResponse> addParticipants(AddParticipantRequest request);

    /** Xóa thành viên khỏi conversation (kiểm tra quyền qua currentAccountId) */
    void removeParticipant(Integer conversationId, Integer accountId, Integer currentAccountId);

    // ==================== MESSAGE ====================

    MessageResponse sendMessage(SendMessageRequest request);

    /** Lấy tin nhắn của conversation theo thứ tự cũ → mới */
    List<MessageResponse> getMessages(Integer conversationId, Integer page, Integer size, Integer currentAccountId);

    void markAsRead(Integer conversationId, Integer accountId, Integer lastReadMessageId);

    void deleteMessage(Integer messageId, Integer currentAccountId);

    MessageResponse editMessage(Integer messageId, String newContent, Integer currentAccountId);

    // ==================== CONTACTS ====================

    List<Map<String, Object>> getTeachers();

    List<Map<String, Object>> getMyCourses();

    List<Map<String, Object>> getStudentsByCourse(Integer courseId);

    // ==================== PHÂN QUYỀN (PERMISSION MANAGEMENT) ====================

    void updateMessagePermission(Integer conversationId, String permission, Integer currentAccountId);

    /** Gán quyền cho thành viên (ADMIN, MODERATOR, MEMBER) */
    void grantRole(Integer conversationId, Integer targetAccountId, ChatParticipant.ConversationRole role, Integer currentAccountId);

    /** Thu hồi quyền của thành viên (đưa về MEMBER) */
    void revokeRole(Integer conversationId, Integer targetAccountId, Integer currentAccountId);

    /** Mute thành viên (tạm khóa chat) */
    void muteMember(Integer conversationId, Integer targetAccountId, LocalDateTime mutedUntil, String reason, Integer currentAccountId);

    /** Unmute thành viên (mở khóa chat) */
    void unmuteMember(Integer conversationId, Integer targetAccountId, Integer currentAccountId);

    /** Ban thành viên (cấm chat vĩnh viễn) */
    void banMember(Integer conversationId, Integer targetAccountId, String reason, Integer currentAccountId);

    /** Unban thành viên (bỏ cấm chat) */
    void unbanMember(Integer conversationId, Integer targetAccountId, Integer currentAccountId);

    /** Chuyển quyền OWNER cho người khác */
    void transferOwnership(Integer conversationId, Integer newOwnerAccountId, Integer currentAccountId);

    /** Đổi tên nhóm chat (chỉ GROUP, không cho COURSE/PRIVATE). Chỉ OWNER/ADMIN/MODERATOR được đổi. */
    void updateConversationName(Integer conversationId, String newName, Integer currentAccountId);

    List<UserSearchResponse> searchUsersForChat(String keyword, Integer currentAccountId);
}