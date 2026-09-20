// src/main/java/org/wisdom/oc01/service/impl/chat/ChatPermissionService.java
package org.wisdom.oc01.service.impl.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.wisdom.oc01.entity.chat.ChatParticipant;
import org.wisdom.oc01.repository.chat.ChatParticipantRepository;

@Service @RequiredArgsConstructor public class ChatPermissionService {
    private final ChatParticipantRepository participantRepository;

    /** ✅ HARD DELETE: Kiểm tra user có phải là participant không (Không cần check leftAt vì record đã bị xóa cứng khi rời) */
    public boolean isActiveParticipant(Integer conversationId, Integer accountId) {
        return participantRepository.existsByConversationIdConversationAndAccountId(conversationId, accountId);
    }

    /** Lấy vai trò của user trong conversation */
    public ChatParticipant.ConversationRole getConversationRole(Integer conversationId, Integer accountId) {
        return participantRepository.findByConversationIdConversationAndAccountId(conversationId, accountId).map(ChatParticipant::getRoleInConversation).orElse(null);
    }

    /** Kiểm tra user có phải là OWNER không */
    public boolean isOwner(Integer conversationId, Integer accountId) {
        return ChatParticipant.ConversationRole.OWNER.equals(getConversationRole(conversationId, accountId));
    }

    /** Kiểm tra user có phải là ADMIN không */
    public boolean isAdmin(Integer conversationId, Integer accountId) {
        ChatParticipant.ConversationRole role = getConversationRole(conversationId, accountId);
        return ChatParticipant.ConversationRole.ADMIN.equals(role) || ChatParticipant.ConversationRole.OWNER.equals(role);
    }

    /** Kiểm tra user có phải là MODERATOR trở lên không */
    public boolean isModeratorOrAbove(Integer conversationId, Integer accountId) {
        ChatParticipant.ConversationRole role = getConversationRole(conversationId, accountId);
        return ChatParticipant.ConversationRole.MODERATOR.equals(role) || ChatParticipant.ConversationRole.ADMIN.equals(role) || ChatParticipant.ConversationRole.OWNER.equals(role);
    }

    /** ✅ HARD DELETE: Kiểm tra user có thể gửi tin nhắn không (không bị mute/ban) Bỏ check leftAt vì record đã bị xóa cứng khi rời */
    public boolean canSendMessage(Integer conversationId, Integer accountId) {
        return participantRepository.findByConversationIdConversationAndAccountId(conversationId, accountId).map(participant -> ChatParticipant.ChatStatus.ACTIVE.equals(participant.getChatStatus())).orElse(false);
    }

    /** Kiểm tra user có thể quản lý conversation không (OWNER hoặc ADMIN) */
    public boolean canManageConversation(Integer conversationId, Integer accountId) {
        return isAdmin(conversationId, accountId);
    }

    /** Kiểm tra user có thể moderate không (OWNER, ADMIN, MODERATOR) */
    public boolean canModerate(Integer conversationId, Integer accountId) {
        return isModeratorOrAbove(conversationId, accountId);
    }
}