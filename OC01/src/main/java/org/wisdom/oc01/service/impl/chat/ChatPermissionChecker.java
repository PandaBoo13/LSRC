// src/main/java/org/wisdom/oc01/service/impl/chat/ChatPermissionChecker.java
package org.wisdom.oc01.service.impl.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.chat.ChatConversation;
import org.wisdom.oc01.entity.chat.ChatParticipant;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.chat.ChatConversationRepository;
import org.wisdom.oc01.repository.chat.ChatParticipantRepository;
import java.time.LocalDateTime;

@Component @RequiredArgsConstructor public class ChatPermissionChecker {
    private final ChatPermissionService permissionService;
    private final AccountRepository accountRepository;
    private final ChatConversationRepository conversationRepository;
    private final ChatParticipantRepository participantRepository;

    /** Kiểm tra user có phải là system admin không */
    public boolean isSystemAdmin(Integer accountId) {
        return accountRepository.findById(accountId).map(account -> account.getRole() != null && "ADMIN".equals(account.getRole().getRoleName())).orElse(false);
    }

    /** Kiểm tra user có phải là teacher không */
    public boolean isTeacher(Integer accountId) {
        return accountRepository.findById(accountId).map(account -> account.getRole() != null && "TEACHER".equals(account.getRole().getRoleName())).orElse(false);
    }

    /** Kiểm tra user có phải là student không */
    public boolean isStudent(Integer accountId) {
        return accountRepository.findById(accountId).map(account -> account.getRole() != null && "STUDENT".equals(account.getRole().getRoleName())).orElse(false);
    }

    /** ✅ THÊM: Kiểm tra quyền xem conversation */
    public void checkCanViewConversation(Integer conversationId, Integer accountId) {
        if (isSystemAdmin(accountId)) {
            ChatConversation conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));
            if (conversation.getConversationType() == ChatConversation.ConversationType.PRIVATE) {
                if (!permissionService.isActiveParticipant(conversationId, accountId)) {
                    throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền xem private chat này");
                }
            }
            return;
        }
        if (!permissionService.isActiveParticipant(conversationId, accountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không phải là thành viên của conversation này");
        }
    }

    /** Kiểm tra quyền gửi tin nhắn */
    public void checkCanSendMessage(Integer conversationId, Integer accountId) {
        if (!permissionService.isActiveParticipant(conversationId, accountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không phải là thành viên của conversation này");
        }
        ChatParticipant participant = getParticipant(conversationId, accountId);
        if (participant.getChatStatus() == ChatParticipant.ChatStatus.MUTED) {
            if (participant.getMutedUntil() != null && participant.getMutedUntil().isAfter(LocalDateTime.now())) {
                throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn đang bị mute đến " + participant.getMutedUntil() + ". Lý do: " + participant.getMutedReason());
            } else {
                participant.setChatStatus(ChatParticipant.ChatStatus.ACTIVE);
                participant.setMutedUntil(null);
                participant.setMutedReason(null);
                participantRepository.save(participant);
            }
        } else if (participant.getChatStatus() == ChatParticipant.ChatStatus.BANNED) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn đã bị cấm chat. Lý do: " + participant.getBanReason());
        }
    }

    /** Kiểm tra quyền xóa tin nhắn của người khác */
    public void checkCanDeleteAnyMessage(Integer conversationId, Integer accountId) {
        ChatConversation conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));
        if (conversation.getConversationType() == ChatConversation.ConversationType.PRIVATE) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Không thể xóa tin nhắn của người khác trong private chat");
        }
        if (isSystemAdmin(accountId)) return;
        if (!permissionService.canModerate(conversationId, accountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền xóa tin nhắn của người khác");
        }
    }

    /** Kiểm tra quyền quản lý thành viên (thêm/xóa/ban/unban) */
    public void checkCanManageMembers(Integer conversationId, Integer accountId) {
        ChatConversation conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));
        if (conversation.getConversationType() == ChatConversation.ConversationType.PRIVATE) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Private chat không thể thêm/xóa thành viên");
        }
        if (isSystemAdmin(accountId)) return;
        if (!permissionService.canManageConversation(conversationId, accountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền quản lý thành viên");
        }
    }

    /** ✅ THÊM: Kiểm tra quyền moderate (mute/unmute) */
    public void checkCanModerate(Integer conversationId, Integer accountId) {
        ChatConversation conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));
        if (conversation.getConversationType() == ChatConversation.ConversationType.PRIVATE) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Private chat không hỗ trợ mute");
        }
        if (isSystemAdmin(accountId)) return;
        if (!permissionService.canModerate(conversationId, accountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền moderate");
        }
    }

    /** Kiểm tra quyền gán role */
    public void checkCanGrantRole(Integer conversationId, Integer accountId, ChatParticipant.ConversationRole targetRole) {
        if (isSystemAdmin(accountId)) return;
        if (targetRole == ChatParticipant.ConversationRole.ADMIN) {
            if (!permissionService.isOwner(conversationId, accountId)) {
                throw new ErrorHandler(HttpStatus.FORBIDDEN, "Chỉ OWNER mới có thể gán quyền ADMIN");
            }
        }
        if (targetRole == ChatParticipant.ConversationRole.MODERATOR) {
            if (!permissionService.canManageConversation(conversationId, accountId)) {
                throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền gán MODERATOR");
            }
        }
    }

    /** ✅ THÊM: Kiểm tra quyền thu hồi role */
    public void checkCanRevokeRole(Integer conversationId, Integer targetAccountId, Integer currentAccountId) {
        if (isSystemAdmin(currentAccountId)) return;
        if (permissionService.isOwner(conversationId, targetAccountId)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Không thể thu hồi quyền của OWNER");
        }
        ChatParticipant.ConversationRole targetRole = permissionService.getConversationRole(conversationId, targetAccountId);
        if (targetRole == ChatParticipant.ConversationRole.ADMIN) {
            if (!permissionService.isOwner(conversationId, currentAccountId)) {
                throw new ErrorHandler(HttpStatus.FORBIDDEN, "Chỉ OWNER mới có thể thu hồi quyền ADMIN");
            }
        }
        if (targetRole == ChatParticipant.ConversationRole.MODERATOR) {
            if (!permissionService.canManageConversation(conversationId, currentAccountId)) {
                throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền thu hồi MODERATOR");
            }
        }
    }

    /** ✅ THÊM: Kiểm tra quyền chuyển ownership */
    public void checkCanTransferOwnership(Integer conversationId, Integer currentAccountId) {
        if (isSystemAdmin(currentAccountId)) return;
        if (!permissionService.isOwner(conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Chỉ OWNER mới có thể chuyển quyền OWNER");
        }
    }

    /** Helper: Lấy participant */
    private ChatParticipant getParticipant(Integer conversationId, Integer accountId) {
        return participantRepository.findByConversationIdConversationAndAccountId(conversationId, accountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Participant không tồn tại"));
    }
}