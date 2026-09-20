// src/main/java/org/wisdom/oc01/controller/chat/ChatWebSocketController.java
package org.wisdom.oc01.controller.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.wisdom.oc01.dto.request.chat.SendMessageRequest;
import org.wisdom.oc01.dto.response.chat.MessageResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.service.ChatService;

import java.security.Principal;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final AccountRepository accountRepository;

    /** Lấy Account từ Principal (trả null nếu chưa auth) */
    private Account getAccountFromPrincipal(Principal principal) {
        if (principal == null) return null;
        return accountRepository.findByUsername(principal.getName()).orElse(null);
    }

    /** Gửi tin nhắn — senderId tự set từ Principal */
    @MessageMapping("/conversation/{conversationId}/send")
    public void sendMessage(
            @DestinationVariable Integer conversationId,
            @Payload SendMessageRequest request,
            Principal principal) {
        Account currentAccount = getAccountFromPrincipal(principal);
        if (currentAccount == null) return;

        request.setConversationId(conversationId);
        request.setSenderId(currentAccount.getIdAccount());

        // Không try-catch — WebSocketExceptionAdvice tự xử lý
        MessageResponse response = chatService.sendMessage(request);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, response);
    }

    /** Broadcast typing indicator */
    @MessageMapping("/conversation/{conversationId}/typing")
    public void typing(
            @DestinationVariable Integer conversationId,
            @Payload Map<String, Object> payload,
            Principal principal) {
        Account currentAccount = getAccountFromPrincipal(principal);
        if (currentAccount == null) return;

        payload.put("senderId", currentAccount.getIdAccount());
        payload.put("senderName", currentAccount.getUsername());
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/typing", payload);
    }

    /** Đánh dấu đã đọc qua WebSocket */
    @MessageMapping("/conversation/{conversationId}/read")
    public void markAsRead(
            @DestinationVariable Integer conversationId,
            @Payload Map<String, Object> payload,
            Principal principal) {
        Account currentAccount = getAccountFromPrincipal(principal);
        if (currentAccount == null) return;

        Object rawId = payload.get("lastReadMessageId");
        if (rawId == null) return;

        Integer lastReadMessageId = Integer.parseInt(rawId.toString());
        chatService.markAsRead(conversationId, currentAccount.getIdAccount(), lastReadMessageId);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/read",
                Map.of("accountId", currentAccount.getIdAccount(),
                        "lastReadMessageId", lastReadMessageId));
    }

    /** Xóa tin nhắn qua WebSocket */
    @MessageMapping("/conversation/{conversationId}/message/{messageId}/delete")
    public void deleteMessage(
            @DestinationVariable Integer conversationId,
            @DestinationVariable Integer messageId,
            Principal principal) {
        Account currentAccount = getAccountFromPrincipal(principal);
        if (currentAccount == null) return;

        chatService.deleteMessage(messageId, currentAccount.getIdAccount());
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/message-deleted",
                Map.of("messageId", messageId));
    }
}