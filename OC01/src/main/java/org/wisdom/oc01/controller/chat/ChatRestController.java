// src/main/java/org/wisdom/oc01/controller/chat/ChatRestController.java
package org.wisdom.oc01.controller.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.chat.AddParticipantRequest;
import org.wisdom.oc01.dto.request.chat.CreateConversationRequest;
import org.wisdom.oc01.dto.request.chat.SendMessageRequest;
import org.wisdom.oc01.dto.response.chat.ConversationResponse;
import org.wisdom.oc01.dto.response.chat.MessageResponse;
import org.wisdom.oc01.dto.response.chat.ParticipantResponse;
import org.wisdom.oc01.dto.response.chat.UserSearchResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.chat.ChatParticipant;
import org.wisdom.oc01.service.ChatService;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;
    // KHÔNG còn field generalService — dùng SecurityUtils static.

    // ==================== CONVERSATION ====================

    /**
     * Tạo conversation (PRIVATE / GROUP / COURSE).
     * FIXED [CRITICAL]: KHÔNG tin request.accountId — luôn override bằng current user.
     */
    @PostMapping("/conversations")
    public ResponseEntity<RequestResponse> createConversation(
            @RequestBody CreateConversationRequest request) {

        Account currentAccount = SecurityUtils.requireCurrentAccount();
        request.setAccountId(currentAccount.getIdAccount());

        ConversationResponse conversation = chatService.createConversation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(conversation, "Tạo conversation thành công"));
    }

    /** Lấy danh sách conversation của user hiện tại (phân trang) */
    @GetMapping("/conversations")
    public ResponseEntity<RequestResponse> getMyConversations(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        List<ConversationResponse> conversations = chatService.getMyConversations(
                currentAccount.getIdAccount(), page, size);
        return ResponseEntity.ok(
                new RequestResponse(conversations, "Lấy danh sách conversation thành công"));
    }

    /** Lấy chi tiết conversation theo ID */
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<RequestResponse> getConversationById(
            @PathVariable Integer conversationId) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        ConversationResponse conversation = chatService.getConversationById(
                conversationId, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse(conversation, "Lấy conversation thành công"));
    }

    // ==================== SEARCH USER ====================

    /** Tìm user theo email / số điện thoại / username để chat */
    @GetMapping("/users/search")
    public ResponseEntity<RequestResponse> searchUsers(
            @RequestParam("keyword") String keyword) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        List<UserSearchResponse> users = chatService.searchUsersForChat(
                keyword, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse(users, "Tìm kiếm user thành công"));
    }

    // ==================== PARTICIPANT ====================

    /**
     * Lấy danh sách thành viên trong conversation.
     * NOTE: hiện controller không truyền currentAccountId xuống service.
     *       Nên bổ sung ở ChatService để tránh user ngoài conversation xem được thành viên.
     *       Tạm giữ nguyên signature để không phá vỡ ChatService interface.
     */
    @GetMapping("/conversations/{conversationId}/participants")
    public ResponseEntity<RequestResponse> getParticipants(
            @PathVariable Integer conversationId) {
        List<ParticipantResponse> participants = chatService.getParticipants(conversationId);
        return ResponseEntity.ok(
                new RequestResponse(participants, "Lấy danh sách thành viên thành công"));
    }

    /** Thêm thành viên vào conversation */
    @PostMapping("/conversations/{conversationId}/participants")
    public ResponseEntity<RequestResponse> addParticipants(
            @PathVariable Integer conversationId,
            @RequestBody AddParticipantRequest request) {
        request.setConversationId(conversationId);
        List<ParticipantResponse> participants = chatService.addParticipants(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(participants, "Thêm thành viên thành công"));
    }

    /** Xóa thành viên khỏi conversation */
    @DeleteMapping("/conversations/{conversationId}/participants/{accountId}")
    public ResponseEntity<RequestResponse> removeParticipant(
            @PathVariable Integer conversationId,
            @PathVariable Integer accountId) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        chatService.removeParticipant(
                conversationId, accountId, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Xóa thành viên thành công"));
    }

    // ==================== MESSAGE ====================

    /** Lấy danh sách tin nhắn (phân trang) */
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<RequestResponse> getMessages(
            @PathVariable Integer conversationId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        List<MessageResponse> messages = chatService.getMessages(
                conversationId, page, size, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse(messages, "Lấy danh sách tin nhắn thành công"));
    }

    /** Gửi tin nhắn — senderId tự lấy từ token */
    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<RequestResponse> sendMessage(
            @PathVariable Integer conversationId,
            @RequestBody SendMessageRequest request) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        request.setConversationId(conversationId);
        request.setSenderId(currentAccount.getIdAccount());
        MessageResponse message = chatService.sendMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(message, "Gửi tin nhắn thành công"));
    }

    /** Đánh dấu đã đọc tin nhắn */
    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<RequestResponse> markAsRead(
            @PathVariable Integer conversationId,
            @RequestParam Integer lastReadMessageId) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        chatService.markAsRead(
                conversationId, currentAccount.getIdAccount(), lastReadMessageId);
        return ResponseEntity.ok(
                new RequestResponse("Đánh dấu đã đọc thành công"));
    }

    /** Xóa tin nhắn (soft delete) */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<RequestResponse> deleteMessage(
            @PathVariable Integer messageId) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        chatService.deleteMessage(messageId, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Xóa tin nhắn thành công"));
    }

    /** Chỉnh sửa tin nhắn */
    @PutMapping("/messages/{messageId}")
    public ResponseEntity<RequestResponse> editMessage(
            @PathVariable Integer messageId,
            @RequestBody Map<String, String> body) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        MessageResponse message = chatService.editMessage(
                messageId, body.get("content"), currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse(message, "Chỉnh sửa tin nhắn thành công"));
    }

    // ==================== PHÂN QUYỀN ====================

    /** Gán role cho thành viên */
    @PostMapping("/conversations/{conversationId}/participants/{targetId}/grant")
    public ResponseEntity<RequestResponse> grantRole(
            @PathVariable Integer conversationId,
            @PathVariable Integer targetId,
            @RequestParam ChatParticipant.ConversationRole role) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        chatService.grantRole(
                conversationId, targetId, role, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Gán quyền thành công"));
    }

    /** Thu hồi role của thành viên */
    @PostMapping("/conversations/{conversationId}/participants/{targetId}/revoke")
    public ResponseEntity<RequestResponse> revokeRole(
            @PathVariable Integer conversationId,
            @PathVariable Integer targetId) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        chatService.revokeRole(
                conversationId, targetId, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Thu hồi quyền thành công"));
    }

    /** Mute thành viên — parse nhiều định dạng datetime */
    @PostMapping("/conversations/{conversationId}/participants/{targetId}/mute")
    public ResponseEntity<RequestResponse> muteMember(
            @PathVariable Integer conversationId,
            @PathVariable Integer targetId,
            @RequestBody Map<String, String> body) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        LocalDateTime mutedUntil = parseMuteUntil(body.get("mutedUntil"));
        String reason = body.get("reason");
        chatService.muteMember(
                conversationId, targetId, mutedUntil, reason,
                currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Mute thành viên thành công"));
    }

    /** Unmute thành viên */
    @PostMapping("/conversations/{conversationId}/participants/{targetId}/unmute")
    public ResponseEntity<RequestResponse> unmuteMember(
            @PathVariable Integer conversationId,
            @PathVariable Integer targetId) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        chatService.unmuteMember(
                conversationId, targetId, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Unmute thành viên thành công"));
    }

    /** Ban thành viên */
    @PostMapping("/conversations/{conversationId}/participants/{targetId}/ban")
    public ResponseEntity<RequestResponse> banMember(
            @PathVariable Integer conversationId,
            @PathVariable Integer targetId,
            @RequestBody Map<String, String> body) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        chatService.banMember(
                conversationId, targetId, body.get("reason"),
                currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Ban thành viên thành công"));
    }

    /** Unban thành viên */
    @PostMapping("/conversations/{conversationId}/participants/{targetId}/unban")
    public ResponseEntity<RequestResponse> unbanMember(
            @PathVariable Integer conversationId,
            @PathVariable Integer targetId) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        chatService.unbanMember(
                conversationId, targetId, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Unban thành viên thành công"));
    }

    /** Chuyển quyền OWNER */
    @PostMapping("/conversations/{conversationId}/transfer-ownership/{newOwnerId}")
    public ResponseEntity<RequestResponse> transferOwnership(
            @PathVariable Integer conversationId,
            @PathVariable Integer newOwnerId) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        chatService.transferOwnership(
                conversationId, newOwnerId, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Chuyển quyền OWNER thành công"));
    }

    /** Đổi quyền gửi tin nhắn (EVERYONE / ADMINS_ONLY) */
    @PutMapping("/conversations/{conversationId}/message-permission")
    public ResponseEntity<RequestResponse> updateMessagePermission(
            @PathVariable Integer conversationId,
            @RequestBody Map<String, String> body) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        String permission = body.get("permission");
        chatService.updateMessagePermission(
                conversationId, permission, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Đã cập nhật quyền gửi tin nhắn thành " + permission));
    }

    /**
     * Đổi tên nhóm chat
     * PATCH /api/chat/conversations/{conversationId}/name
     */
    @PatchMapping("/conversations/{conversationId}/name")
    public ResponseEntity<RequestResponse> updateConversationName(
            @PathVariable Integer conversationId,
            @RequestBody Map<String, String> body) {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        String newName = body.get("name");
        chatService.updateConversationName(
                conversationId, newName, currentAccount.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse("Đổi tên nhóm thành công"));
    }

    // ==================== HELPER ====================

    /**
     * Parse mutedUntil từ body — hỗ trợ nhiều định dạng:
     * - "2026-09-09T12:00:00"          → LocalDateTime
     * - "2026-09-09T09:49:54.102Z"     → UTC với Z
     * - "2026-09-09T09:49:54.102+07:00"→ OffsetDateTime
     * Mặc định: mute 1 giờ nếu null/sai/là quá khứ.
     */
    private LocalDateTime parseMuteUntil(String input) {
        if (input == null || input.trim().isEmpty()) {
            return LocalDateTime.now().plusHours(1);
        }
        try {
            LocalDateTime parsed;
            if (input.endsWith("Z")) {
                parsed = Instant.parse(input)
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime();
            } else if (input.contains("+") || (input.lastIndexOf("-") > 10)) {
                parsed = OffsetDateTime.parse(input).toLocalDateTime();
            } else {
                parsed = LocalDateTime.parse(input);
            }
            return parsed.isBefore(LocalDateTime.now())
                    ? LocalDateTime.now().plusHours(1)
                    : parsed;
        } catch (DateTimeParseException e) {
            return LocalDateTime.now().plusHours(1);
        }
    }
}