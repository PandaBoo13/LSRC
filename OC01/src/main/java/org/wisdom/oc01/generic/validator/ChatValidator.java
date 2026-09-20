// src/main/java/org/wisdom/oc01/generic/validator/ChatValidator.java
package org.wisdom.oc01.generic.validator;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.chat.ChatConversation;
import org.wisdom.oc01.entity.chat.ChatMessage;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.repository.chat.ChatConversationRepository;
import org.wisdom.oc01.repository.chat.ChatParticipantRepository;

@Component
@RequiredArgsConstructor
public class ChatValidator {

    private final ChatConversationRepository conversationRepository;
    private final ChatParticipantRepository participantRepository;

    // ==================== CONVERSATION VALIDATION ====================

    public void validateForCreate(ChatConversation conversation) {
        validateType(conversation);
        validateCreator(conversation);

        if (conversation.getConversationType() == ChatConversation.ConversationType.COURSE) {
            validateCourseChat(conversation);
        }

        if (conversation.getConversationType() == ChatConversation.ConversationType.GROUP) {
            validateGroupChat(conversation);
        }

        if (conversation.getConversationType() == ChatConversation.ConversationType.PRIVATE) {
            validatePrivateChat(conversation);
        }
    }

    private void validateType(ChatConversation conversation) {
        if (conversation.getConversationType() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Loại conversation không được để trống");
        }
    }

    private void validateCreator(ChatConversation conversation) {
        if (conversation.getCreatedBy() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Người tạo không được để trống");
        }
    }

    private void validateCourseChat(ChatConversation conversation) {
        if (conversation.getCourseId() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Course chat phải có courseId");
        }
    }

    private void validateGroupChat(ChatConversation conversation) {
        if (conversation.getName() == null || conversation.getName().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Group chat phải có tên");
        }
        if (conversation.getName().length() > 255) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tên nhóm không được vượt quá 255 ký tự");
        }
    }

    private void validatePrivateChat(ChatConversation conversation) {
        if (conversation.getParticipants() != null && conversation.getParticipants().size() > 2) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Private chat chỉ cho phép tối đa 2 người");
        }
    }

    // ==================== PARTICIPANT VALIDATION ====================

    public void validateForAddParticipant(Integer conversationId, Integer accountId) {
        if (conversationId == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "conversationId không được để trống");
        }
        if (accountId == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "accountId không được để trống");
        }

        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));

        // Kiểm tra giới hạn private chat
        if (conversation.getConversationType() == ChatConversation.ConversationType.PRIVATE) {
            // ✅ HARD DELETE: Bỏ AndLeftAtIsNull
            Long participantCount = participantRepository.countByConversationIdConversation(conversationId);
            if (participantCount >= 2) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Private chat chỉ cho phép tối đa 2 người");
            }
        }

        // ✅ HARD DELETE: Bỏ AndLeftAtIsNull
        if (participantRepository.existsByConversationIdConversationAndAccountId(
                conversationId, accountId)) {
            throw new ErrorHandler(HttpStatus.CONFLICT, "User đã là thành viên của conversation này");
        }
    }

    public void validateForRemoveParticipant(Integer conversationId, Integer accountId) {
        if (conversationId == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "conversationId không được để trống");
        }
        if (accountId == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "accountId không được để trống");
        }

        // ✅ HARD DELETE: Bỏ AndLeftAtIsNull
        if (!participantRepository.existsByConversationIdConversationAndAccountId(
                conversationId, accountId)) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "User không phải là thành viên của conversation này");
        }
    }

    // ==================== MESSAGE VALIDATION ====================

    public void validateForSendMessage(ChatMessage message) {
        validateConversation(message);
        validateSender(message);
        validateMessageContent(message);
        validateMessageType(message);
    }

    private void validateConversation(ChatMessage message) {
        if (message.getConversation() == null || message.getConversation().getIdConversation() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Conversation không được để trống");
        }
    }

    private void validateSender(ChatMessage message) {
        if (message.getSenderId() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Sender không được để trống");
        }

        // ✅ HARD DELETE: Bỏ AndLeftAtIsNull
        boolean isActiveParticipant = participantRepository
                .existsByConversationIdConversationAndAccountId(
                        message.getConversation().getIdConversation(), message.getSenderId());

        if (!isActiveParticipant) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không phải là thành viên của conversation này");
        }
    }

    private void validateMessageContent(ChatMessage message) {
        boolean hasContent = message.getContent() != null && !message.getContent().trim().isEmpty();
        boolean hasFile = message.getFileUrl() != null && !message.getFileUrl().trim().isEmpty();

        if (!hasContent && !hasFile) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tin nhắn phải có nội dung hoặc file đính kèm");
        }

        if (message.getContent() != null && message.getContent().length() > 10000) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Nội dung tin nhắn không được vượt quá 10000 ký tự");
        }

        if (message.getFileUrl() != null && message.getFileUrl().length() > 500) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "URL file không được vượt quá 500 ký tự");
        }
    }

    private void validateMessageType(ChatMessage message) {
        if (message.getMessageType() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Loại tin nhắn không được để trống");
        }
    }

    // ==================== VALIDATE XÓA TIN NHẮN ====================

    public void validateForDeleteMessage(ChatMessage message, Integer currentAccountId) {
        if (message == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Tin nhắn không tồn tại");
        }

        if (message.getIsDeleted() != null && message.getIsDeleted()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tin nhắn đã bị xóa trước đó");
        }

        if (!message.getSenderId().equals(currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn chỉ có thể xóa tin nhắn của chính mình");
        }
    }

    // ==================== VALIDATE CHỈNH SỬA TIN NHẮN ====================

    public void validateForEditMessage(ChatMessage message, Integer currentAccountId) {
        if (message == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Tin nhắn không tồn tại");
        }

        if (message.getIsDeleted() != null && message.getIsDeleted()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Không thể sửa tin nhắn đã bị xóa");
        }

        if (!message.getSenderId().equals(currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn chỉ có thể sửa tin nhắn của chính mình");
        }
    }
}