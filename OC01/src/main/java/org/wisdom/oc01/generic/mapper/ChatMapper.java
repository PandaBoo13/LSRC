// src/main/java/org/wisdom/oc01/generic/mapper/ChatMapper.java
package org.wisdom.oc01.generic.mapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.chat.ConversationResponse;
import org.wisdom.oc01.dto.response.chat.MessageResponse;
import org.wisdom.oc01.dto.response.chat.ParticipantResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.chat.ChatConversation;
import org.wisdom.oc01.entity.chat.ChatMessage;
import org.wisdom.oc01.entity.chat.ChatParticipant;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.CourseRepository;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatMapper {

    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;

    // ==================== CONVERSATION ====================

    public ConversationResponse toConversationResponse(ChatConversation conversation) {
        return toConversationResponse(conversation, null);
    }

    public ConversationResponse toConversationResponse(ChatConversation conversation, Integer currentAccountId) {
        if (conversation == null) return null;

        String displayName = getDisplayName(conversation, currentAccountId);

        Integer unreadCount = 0;
        String lastMessagePreview = null;

        if (currentAccountId != null && conversation.getParticipants() != null) {
            for (ChatParticipant participant : conversation.getParticipants()) {
                if (participant.getAccountId().equals(currentAccountId)) {
                    unreadCount = participant.getUnreadCount() != null ? participant.getUnreadCount() : 0;
                    lastMessagePreview = participant.getLastMessagePreview();
                    break;
                }
            }
        }

        return ConversationResponse.builder()
                .id(conversation.getIdConversation())
                .conversationType(conversation.getConversationType() != null
                        ? conversation.getConversationType().name() : null)
                .name(displayName)
                .courseId(conversation.getCourseId())
                .createdBy(conversation.getCreatedBy())
                .lastMessageId(conversation.getLastMessageId())
                .lastMessageAt(conversation.getLastMessageAt())
                .messagePermission(conversation.getMessagePermission() != null
                        ? conversation.getMessagePermission().name() : "EVERYONE")   // ✅ THÊM DÒNG NÀY
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .unreadCount(unreadCount)
                .lastMessagePreview(lastMessagePreview)
                .participants(toParticipantInfoList(conversation.getParticipants()))
                .build();
    }

    public List<ConversationResponse> toConversationResponseList(
            List<ChatConversation> conversations, Integer currentAccountId) {
        if (conversations == null || conversations.isEmpty()) return List.of();

        Set<Integer> accountIds = new HashSet<>();
        Set<Integer> courseIds = new HashSet<>();

        for (ChatConversation conv : conversations) {
            if (conv.getParticipants() != null) {
                conv.getParticipants().forEach(p -> accountIds.add(p.getAccountId()));
            }
            if (conv.getCourseId() != null) {
                courseIds.add(conv.getCourseId());
            }
        }

        Map<Integer, Account> accountMap = accountIds.isEmpty() ? Map.of() :
                accountRepository.findAllById(accountIds).stream()
                        .collect(Collectors.toMap(Account::getIdAccount, a -> a));

        Map<Integer, Course> courseMap = courseIds.isEmpty() ? Map.of() :
                courseRepository.findAllById(courseIds).stream()
                        .collect(Collectors.toMap(Course::getIdCourse, c -> c));

        return conversations.stream()
                .map(conv -> toConversationResponseWithCache(conv, currentAccountId, accountMap, courseMap))
                .collect(Collectors.toList());
    }

    private ConversationResponse toConversationResponseWithCache(
            ChatConversation conversation, Integer currentAccountId,
            Map<Integer, Account> accountMap, Map<Integer, Course> courseMap) {
        if (conversation == null) return null;

        String displayName = getDisplayNameWithCache(conversation, currentAccountId, accountMap, courseMap);

        Integer unreadCount = 0;
        String lastMessagePreview = null;

        if (currentAccountId != null && conversation.getParticipants() != null) {
            for (ChatParticipant participant : conversation.getParticipants()) {
                // ✅ HARD DELETE: Bỏ check participant.getLeftAt() == null
                if (participant.getAccountId().equals(currentAccountId)) {
                    unreadCount = participant.getUnreadCount() != null ? participant.getUnreadCount() : 0;
                    lastMessagePreview = participant.getLastMessagePreview();
                    break;
                }
            }
        }

        return ConversationResponse.builder()
                .id(conversation.getIdConversation())
                .conversationType(conversation.getConversationType() != null
                        ? conversation.getConversationType().name() : null)
                .name(displayName)
                .courseId(conversation.getCourseId())
                .createdBy(conversation.getCreatedBy())
                .lastMessageId(conversation.getLastMessageId())
                .lastMessageAt(conversation.getLastMessageAt())
                .messagePermission(conversation.getMessagePermission() != null
                        ? conversation.getMessagePermission().name() : "EVERYONE")   // ✅ NEW
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .unreadCount(unreadCount)
                .lastMessagePreview(lastMessagePreview)
                .participants(toParticipantInfoList(conversation.getParticipants()))
                .build();
    }

    private String getDisplayName(ChatConversation conversation, Integer currentAccountId) {
        if (conversation.getConversationType() == null) {
            return conversation.getName();
        }

        switch (conversation.getConversationType()) {
            case GROUP:
                if (conversation.getName() != null && !conversation.getName().trim().isEmpty()) {
                    return conversation.getName();
                }
                return "Nhóm không tên";

            case COURSE:
                if (conversation.getCourseId() != null) {
                    Course course = courseRepository.findById(conversation.getCourseId()).orElse(null);
                    if (course != null) {
                        return course.getTitle();
                    }
                }
                return conversation.getName() != null && !conversation.getName().trim().isEmpty()
                        ? conversation.getName()
                        : "Course Chat";

            case PRIVATE:
                if (currentAccountId != null && conversation.getParticipants() != null) {
                    for (ChatParticipant participant : conversation.getParticipants()) {
                        // ✅ HARD DELETE: Bỏ check participant.getLeftAt() == null
                        if (!participant.getAccountId().equals(currentAccountId)) {
                            Account other = accountRepository.findById(participant.getAccountId()).orElse(null);
                            if (other != null) {
                                return getFullName(other);
                            }
                        }
                    }
                }
                return "Private Chat";

            default:
                return conversation.getName() != null ? conversation.getName() : "Conversation";
        }
    }

    private String getDisplayNameWithCache(ChatConversation conversation, Integer currentAccountId,
                                           Map<Integer, Account> accountMap, Map<Integer, Course> courseMap) {
        if (conversation.getConversationType() == null) {
            return conversation.getName();
        }

        switch (conversation.getConversationType()) {
            case GROUP:
                if (conversation.getName() != null && !conversation.getName().trim().isEmpty()) {
                    return conversation.getName();
                }
                return "Nhóm không tên";

            case COURSE:
                if (conversation.getCourseId() != null) {
                    Course course = courseMap.get(conversation.getCourseId());
                    if (course != null) {
                        return course.getTitle();
                    }
                }
                return conversation.getName() != null && !conversation.getName().trim().isEmpty()
                        ? conversation.getName()
                        : "Course Chat";

            case PRIVATE:
                if (currentAccountId != null && conversation.getParticipants() != null) {
                    for (ChatParticipant participant : conversation.getParticipants()) {
                        // ✅ HARD DELETE: Bỏ check participant.getLeftAt() == null
                        if (!participant.getAccountId().equals(currentAccountId)) {
                            Account other = accountMap.get(participant.getAccountId());
                            if (other != null) {
                                return getFullName(other);
                            }
                        }
                    }
                }
                return "Private Chat";

            default:
                return conversation.getName() != null ? conversation.getName() : "Conversation";
        }
    }

    private String getFullName(Account account) {
        if (account.getUser() != null) {
            String firstName = account.getUser().getFirstName() != null ? account.getUser().getFirstName() : "";
            String lastName = account.getUser().getLastName() != null ? account.getUser().getLastName() : "";
            String fullName = (firstName + " " + lastName).trim();
            if (!fullName.isEmpty()) {
                return fullName;
            }
        }
        return account.getUsername();
    }

    private List<ConversationResponse.ParticipantInfo> toParticipantInfoList(List<ChatParticipant> participants) {
        if (participants == null || participants.isEmpty()) return null;

        return participants.stream()
                // ✅ HARD DELETE: Bỏ filter leftAt
                .map(p -> {
                    Account account = accountRepository.findById(p.getAccountId()).orElse(null);
                    String displayName = account != null ? getFullName(account) : "User " + p.getAccountId();
                    String avatarUrl = account != null && account.getUser() != null
                            ? account.getUser().getAvatarUrl() : null;

                    return ConversationResponse.ParticipantInfo.builder()
                            .accountId(p.getAccountId())
                            .username(displayName)
                            .avatarUrl(avatarUrl)
                            .isAdmin(p.getIsAdmin())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<ConversationResponse.ParticipantInfo> toParticipantInfoListWithCache(
            List<ChatParticipant> participants, Map<Integer, Account> accountMap) {
        if (participants == null || participants.isEmpty()) return null;

        return participants.stream()
                // ✅ HARD DELETE: Bỏ filter leftAt
                .map(p -> {
                    Account account = accountMap.get(p.getAccountId());
                    String displayName = account != null ? getFullName(account) : "User " + p.getAccountId();
                    String avatarUrl = account != null && account.getUser() != null
                            ? account.getUser().getAvatarUrl() : null;

                    return ConversationResponse.ParticipantInfo.builder()
                            .accountId(p.getAccountId())
                            .username(displayName)
                            .avatarUrl(avatarUrl)
                            .isAdmin(p.getIsAdmin())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ==================== MESSAGE ====================

    public MessageResponse toMessageResponse(ChatMessage message) {
        if (message == null) return null;

        Account sender = accountRepository.findById(message.getSenderId()).orElse(null);
        String senderUsername = sender != null ? getFullName(sender) : "User " + message.getSenderId();
        String senderAvatarUrl = sender != null && sender.getUser() != null
                ? sender.getUser().getAvatarUrl() : null;

        return MessageResponse.builder()
                .id(message.getIdMessage())
                .conversationId(message.getConversation() != null
                        ? message.getConversation().getIdConversation() : null)
                .senderId(message.getSenderId())
                .senderUsername(senderUsername)
                .senderAvatarUrl(senderAvatarUrl)
                .messageType(message.getMessageType() != null ? message.getMessageType().name() : null)
                .content(message.getContent())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .mimeType(message.getMimeType())
                .fileFormat(message.getFileFormat())
                .replyToMessageId(message.getReplyToMessageId())
                .isDeleted(message.getIsDeleted())
                .isEdited(message.getIsEdited())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }

    public List<MessageResponse> toMessageResponseList(List<ChatMessage> messages) {
        if (messages == null || messages.isEmpty()) return List.of();

        Set<Integer> senderIds = messages.stream()
                .map(ChatMessage::getSenderId)
                .collect(Collectors.toSet());

        Map<Integer, Account> accountMap = accountRepository.findAllById(senderIds).stream()
                .collect(Collectors.toMap(Account::getIdAccount, a -> a));

        return messages.stream()
                .map(message -> toMessageResponseWithCache(message, accountMap))
                .collect(Collectors.toList());
    }

    private MessageResponse toMessageResponseWithCache(ChatMessage message, Map<Integer, Account> accountMap) {
        if (message == null) return null;

        Account sender = accountMap.get(message.getSenderId());
        String senderUsername = sender != null ? getFullName(sender) : "User " + message.getSenderId();
        String senderAvatarUrl = sender != null && sender.getUser() != null
                ? sender.getUser().getAvatarUrl() : null;

        return MessageResponse.builder()
                .id(message.getIdMessage())
                .conversationId(message.getConversation() != null
                        ? message.getConversation().getIdConversation() : null)
                .senderId(message.getSenderId())
                .senderUsername(senderUsername)
                .senderAvatarUrl(senderAvatarUrl)
                .messageType(message.getMessageType() != null ? message.getMessageType().name() : null)
                .content(message.getContent())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .mimeType(message.getMimeType())
                .fileFormat(message.getFileFormat())
                .replyToMessageId(message.getReplyToMessageId())
                .isDeleted(message.getIsDeleted())
                .isEdited(message.getIsEdited())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }

    // ==================== PARTICIPANT ====================

    public ParticipantResponse toParticipantResponse(ChatParticipant participant) {
        if (participant == null) return null;

        Account account = accountRepository.findById(participant.getAccountId()).orElse(null);

        return ParticipantResponse.builder()
                .id(participant.getIdParticipant())
                .conversationId(participant.getConversation() != null
                        ? participant.getConversation().getIdConversation() : null)
                .accountId(participant.getAccountId())
                .username(account != null ? getFullName(account) : "User " + participant.getAccountId())
                .avatarUrl(account != null && account.getUser() != null
                        ? account.getUser().getAvatarUrl() : null)
                .isAdmin(participant.getIsAdmin())
                .roleInConversation(participant.getRoleInConversation() != null
                        ? participant.getRoleInConversation().name() : null)
                .chatStatus(participant.getChatStatus() != null
                        ? participant.getChatStatus().name() : null)
                .mutedUntil(participant.getMutedUntil())
                .mutedReason(participant.getMutedReason())
                .banReason(participant.getBanReason())
                .lastReadMessageId(participant.getLastReadMessageId())
                .unreadCount(participant.getUnreadCount())
                .lastMessagePreview(participant.getLastMessagePreview())
                .joinedAt(participant.getJoinedAt())
                // ✅ HARD DELETE: Giữ setter nhưng giá trị luôn null

                .build();
    }

    public List<ParticipantResponse> toParticipantResponseList(List<ChatParticipant> participants) {
        if (participants == null || participants.isEmpty()) return List.of();

        Set<Integer> accountIds = participants.stream()
                .map(ChatParticipant::getAccountId)
                .collect(Collectors.toSet());

        Map<Integer, Account> accountMap = accountRepository.findAllById(accountIds).stream()
                .collect(Collectors.toMap(Account::getIdAccount, a -> a));

        return participants.stream()
                .map(participant -> toParticipantResponseWithCache(participant, accountMap))
                .collect(Collectors.toList());
    }

    private ParticipantResponse toParticipantResponseWithCache(
            ChatParticipant participant, Map<Integer, Account> accountMap) {
        if (participant == null) return null;

        Account account = accountMap.get(participant.getAccountId());

        return ParticipantResponse.builder()
                .id(participant.getIdParticipant())
                .conversationId(participant.getConversation() != null
                        ? participant.getConversation().getIdConversation() : null)
                .accountId(participant.getAccountId())
                .username(account != null ? getFullName(account) : "User " + participant.getAccountId())
                .avatarUrl(account != null && account.getUser() != null
                        ? account.getUser().getAvatarUrl() : null)
                .isAdmin(participant.getIsAdmin())
                .roleInConversation(participant.getRoleInConversation() != null
                        ? participant.getRoleInConversation().name() : null)
                .chatStatus(participant.getChatStatus() != null
                        ? participant.getChatStatus().name() : null)
                .mutedUntil(participant.getMutedUntil())
                .mutedReason(participant.getMutedReason())
                .banReason(participant.getBanReason())
                .lastReadMessageId(participant.getLastReadMessageId())
                .unreadCount(participant.getUnreadCount())
                .lastMessagePreview(participant.getLastMessagePreview())
                .joinedAt(participant.getJoinedAt())
                // ✅ HARD DELETE: Giữ setter nhưng giá trị luôn null

                .build();
    }
}