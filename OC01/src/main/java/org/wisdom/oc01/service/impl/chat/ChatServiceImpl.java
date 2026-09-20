// src/main/java/org/wisdom/oc01/service/impl/chat/ChatServiceImpl.java
package org.wisdom.oc01.service.impl.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.request.NotificationRequest;
import org.wisdom.oc01.dto.request.chat.AddParticipantRequest;
import org.wisdom.oc01.dto.request.chat.CreateConversationRequest;
import org.wisdom.oc01.dto.request.chat.SendMessageRequest;
import org.wisdom.oc01.dto.response.chat.ConversationResponse;
import org.wisdom.oc01.dto.response.chat.MessageResponse;
import org.wisdom.oc01.dto.response.chat.ParticipantResponse;
import org.wisdom.oc01.dto.response.chat.UserSearchResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.entity.chat.ChatConversation;
import org.wisdom.oc01.entity.chat.ChatMessage;
import org.wisdom.oc01.entity.chat.ChatParticipant;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.ChatMapper;
import org.wisdom.oc01.generic.validator.ChatValidator;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.CourseRepository;
import org.wisdom.oc01.repository.OrderItemRepository;
import org.wisdom.oc01.repository.chat.ChatConversationRepository;
import org.wisdom.oc01.repository.chat.ChatMessageRepository;
import org.wisdom.oc01.repository.chat.ChatParticipantRepository;
import org.wisdom.oc01.service.ChatService;
import org.wisdom.oc01.service.notification.NotificationService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatServiceImpl implements ChatService {

    private final ChatConversationRepository conversationRepository;
    private final ChatParticipantRepository participantRepository;
    private final ChatMessageRepository messageRepository;
    private final ChatMapper mapper;
    private final ChatValidator validator;
    private final ChatPermissionServiceImpl permissionService;
    private final NotificationService notificationService;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final OrderItemRepository orderItemRepository;
    private final SimpMessagingTemplate messagingTemplate;
    // KHÔNG còn field generalService — dùng SecurityUtils static.

    // ==================== CONVERSATION ====================

    /** Tạo conversation mới (PRIVATE, GROUP, COURSE) — gửi thông báo cho participants */
    @Override
    @Transactional
    public ConversationResponse createConversation(CreateConversationRequest request) {
        if (request.getConversationType() == null || request.getConversationType().trim().isEmpty())
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Loại conversation không được để trống");
        if (request.getAccountId() == null)
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Người tạo không được để trống");

        permissionService.checkCanCreateConversation(request);

        // PRIVATE: kiểm tra đã tồn tại
        if ("PRIVATE".equals(request.getConversationType())) {
            Integer otherUserId = request.getParticipantIds() != null
                    && !request.getParticipantIds().isEmpty()
                    ? request.getParticipantIds().get(0) : null;
            if (otherUserId != null) {
                var existing = conversationRepository.findPrivateConversation(
                        request.getAccountId(), otherUserId);
                if (existing.isPresent()) {
                    log.info("🔄 Private chat đã tồn tại giữa {} và {}",
                            request.getAccountId(), otherUserId);
                    return mapper.toConversationResponse(existing.get(), request.getAccountId());
                }
            }
        }

        // COURSE: kiểm tra đã tồn tại
        if ("COURSE".equals(request.getConversationType()) && request.getCourseId() != null) {
            var existingCourseChat = conversationRepository
                    .findByConversationTypeAndCourseId(
                            ChatConversation.ConversationType.COURSE, request.getCourseId());
            if (existingCourseChat.isPresent()) {
                ChatConversation existingConv = existingCourseChat.get();
                log.info("🔄 Course chat đã tồn tại cho course {}", request.getCourseId());
                if (!participantRepository.existsByConversationIdConversationAndAccountId(
                        existingConv.getIdConversation(), request.getAccountId())) {
                    ChatParticipant.ConversationRole role = permissionService
                            .determineCourseRole(request.getCourseId(), request.getAccountId());
                    addParticipant(existingConv.getIdConversation(), request.getAccountId(), role);
                }
                return mapper.toConversationResponse(existingConv, request.getAccountId());
            }
        }

        // Tạo conversation mới
        ChatConversation conversation = new ChatConversation();
        conversation.setConversationType(
                ChatConversation.ConversationType.valueOf(request.getConversationType()));
        conversation.setName(request.getName());
        conversation.setCourseId(request.getCourseId());
        conversation.setCreatedBy(request.getAccountId());
        validator.validateForCreate(conversation);
        final ChatConversation savedConversation = conversationRepository.save(conversation);
        log.info("✅ Tạo conversation mới: {} (ID: {})",
                savedConversation.getConversationType(),
                savedConversation.getIdConversation());

        // Thêm creator làm OWNER
        ChatParticipant creator = new ChatParticipant();
        creator.setConversation(savedConversation);
        creator.setAccountId(request.getAccountId());
        creator.setRoleInConversation(ChatParticipant.ConversationRole.OWNER);
        creator.setChatStatus(ChatParticipant.ChatStatus.ACTIVE);
        creator.setIsAdmin(true);
        participantRepository.save(creator);

        // Thêm participants khác
        final Integer currentAccountId = request.getAccountId();
        if (request.getParticipantIds() != null && !request.getParticipantIds().isEmpty()) {
            List<ChatParticipant> participants = request.getParticipantIds().stream()
                    .filter(pid -> !pid.equals(currentAccountId))
                    .map(pid -> {
                        ChatParticipant p = new ChatParticipant();
                        p.setConversation(savedConversation);
                        p.setAccountId(pid);
                        p.setRoleInConversation(ChatParticipant.ConversationRole.MEMBER);
                        p.setChatStatus(ChatParticipant.ChatStatus.ACTIVE);
                        p.setIsAdmin(false);
                        return p;
                    }).collect(Collectors.toList());

            if (!participants.isEmpty()) {
                participantRepository.saveAll(participants);
                for (ChatParticipant p : participants) {
                    sendConversationCreatedNotification(savedConversation, p.getAccountId(), currentAccountId);
                    messagingTemplate.convertAndSend(
                            "/topic/user/" + p.getAccountId() + "/conversations",
                            Map.of("action", "NEW_CONVERSATION",
                                    "conversationId", savedConversation.getIdConversation(),
                                    "timestamp", System.currentTimeMillis()));
                }
            }
        }
        return mapper.toConversationResponse(savedConversation, request.getAccountId());
    }

    /** Lấy danh sách conversation của user (phân trang) */
    @Override
    public List<ConversationResponse> getMyConversations(Integer accountId, Integer page, Integer size) {
        if (accountId == null)
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "accountId không được để trống");
        PageRequest pageRequest = PageRequest.of(
                page != null ? page : 0,
                size != null ? size : 20,
                Sort.by(Sort.Direction.DESC, "lastMessageAt"));
        return conversationRepository.findByAccountId(accountId, pageRequest)
                .getContent().stream()
                .map(conv -> mapper.toConversationResponse(conv, accountId))
                .collect(Collectors.toList());
    }

    /** Lấy chi tiết conversation theo ID */
    @Override
    public ConversationResponse getConversationById(Integer conversationId, Integer currentAccountId) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));
        if (!participantRepository.existsByConversationIdConversationAndAccountId(
                conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không phải là thành viên của conversation này");
        }
        return mapper.toConversationResponse(conversation, currentAccountId);
    }

    /**
     * Lấy danh sách thành viên trong conversation.
     * FIXED [HIGH]: trước đây không check — bất kỳ user nào cũng xem được thành viên.
     *               Nay yêu cầu current user phải là thành viên.
     */
    @Override
    public List<ParticipantResponse> getParticipants(Integer conversationId) {
        Integer currentAccountId = SecurityUtils.requireCurrentAccountId();
        if (!participantRepository.existsByConversationIdConversationAndAccountId(
                conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không phải là thành viên của conversation này");
        }
        return participantRepository.findByConversationIdConversation(conversationId)
                .stream().map(mapper::toParticipantResponse).collect(Collectors.toList());
    }

    /**
     * Thêm thành viên vào conversation.
     * FIXED [HIGH]: trước đây không check — bất kỳ user nào cũng thêm được vào nhóm bất kỳ.
     *               Nay yêu cầu current user phải là ADMIN/OWNER hoặc ADMIN hệ thống.
     */
    @Override
    @Transactional
    public List<ParticipantResponse> addParticipants(AddParticipantRequest request) {
        ChatConversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));

        Integer currentAccountId = SecurityUtils.requireCurrentAccountId();
        boolean isSuperAdmin = permissionService.isSuperAdmin(currentAccountId);
        boolean isAdminOrOwner = permissionService.isAdminOrOwner(
                request.getConversationId(), currentAccountId);
        if (!isSuperAdmin && !isAdminOrOwner) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Chỉ ADMIN/OWNER của conversation hoặc ADMIN hệ thống mới có thể thêm thành viên");
        }

        if (conversation.getConversationType() == ChatConversation.ConversationType.PRIVATE) {
            Long count = participantRepository.countByConversationIdConversation(
                    request.getConversationId());
            if (count >= 2)
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Private chat chỉ cho phép tối đa 2 người");
        }

        List<Integer> addedAccountIds = new ArrayList<>();
        for (Integer accountId : request.getAccountIds()) {
            boolean exists = participantRepository.existsByConversationIdConversationAndAccountId(
                    request.getConversationId(), accountId);
            if (!exists) {
                addParticipant(request.getConversationId(), accountId,
                        ChatParticipant.ConversationRole.MEMBER);
                addedAccountIds.add(accountId);
                sendAddedToConversationNotification(conversation, accountId);
            } else {
                log.warn("⚠️ Account {} đã là thành viên, bỏ qua", accountId);
            }
        }

        if (!addedAccountIds.isEmpty()) {
            messagingTemplate.convertAndSend(
                    "/topic/conversation/" + request.getConversationId() + "/participant-changed",
                    Map.of("action", "ADDED",
                            "accountIds", addedAccountIds,
                            "timestamp", System.currentTimeMillis()));
            for (Integer accountId : addedAccountIds) {
                messagingTemplate.convertAndSend(
                        "/topic/user/" + accountId + "/conversations",
                        Map.of("action", "NEW_CONVERSATION",
                                "conversationId", request.getConversationId(),
                                "timestamp", System.currentTimeMillis()));
            }
        }
        return getParticipants(request.getConversationId());
    }

    /** Xóa thành viên khỏi conversation (HARD DELETE) — gửi thông báo + broadcast */
    @Override
    @Transactional
    public void removeParticipant(Integer conversationId, Integer accountId, Integer currentAccountId) {
        permissionService.checkCanRemoveParticipant(conversationId, accountId, currentAccountId);
        participantRepository.findByConversationIdConversationAndAccountId(conversationId, accountId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Participant không tồn tại"));
        participantRepository.deleteByConversationIdConversationAndAccountId(conversationId, accountId);
        log.info("🗑️ User {} đã bị xóa khỏi conversation {}", accountId, conversationId);

        ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation != null) {
            sendRemovedFromConversationNotification(conversation, accountId, currentAccountId);
        }
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/participant-changed",
                Map.of("action", "REMOVED", "accountId", accountId,
                        "removedBy", currentAccountId,
                        "timestamp", System.currentTimeMillis()));
        messagingTemplate.convertAndSend(
                "/topic/user/" + accountId + "/conversations",
                Map.of("action", "REMOVED_FROM_CONVERSATION",
                        "conversationId", conversationId,
                        "timestamp", System.currentTimeMillis()));
    }

    /** Gửi tin nhắn mới — broadcast realtime */
    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request) {
        ChatConversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));
        permissionService.checkCanSendMessage(request.getConversationId(), request.getSenderId());

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSenderId(request.getSenderId());
        message.setMessageType(ChatMessage.MessageType.valueOf(
                request.getMessageType() != null ? request.getMessageType() : "TEXT"));
        message.setContent(request.getContent());
        message.setFileUrl(request.getFileUrl());
        message.setFileName(request.getFileName());
        message.setFileSize(request.getFileSize());
        message.setMimeType(request.getMimeType());
        message.setFileFormat(request.getFileFormat());
        message.setReplyToMessageId(request.getReplyToMessageId());
        validator.validateForSendMessage(message);
        message = messageRepository.save(message);

        conversation.setLastMessageId(message.getIdMessage());
        conversation.setLastMessageAt(message.getCreatedAt());
        conversationRepository.save(conversation);
        participantRepository.incrementUnreadCount(
                conversation.getIdConversation(), request.getSenderId(), request.getContent());

        MessageResponse response = mapper.toMessageResponse(message);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversation.getIdConversation(), response);
        log.info("📨 Realtime message → /topic/conversation/{}: {}",
                conversation.getIdConversation(), request.getContent());
        return response;
    }

    /** Lấy danh sách tin nhắn (phân trang, kiểm tra quyền) */
    @Override
    public List<MessageResponse> getMessages(Integer conversationId, Integer page,
                                             Integer size, Integer currentAccountId) {
        if (currentAccountId != null
                && !participantRepository.existsByConversationIdConversationAndAccountId(
                conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền xem tin nhắn này");
        }
        PageRequest pageRequest = PageRequest.of(
                page != null ? page : 0,
                size != null ? size : 20,
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ChatMessage> messagePage = messageRepository.findByConversationId(conversationId, pageRequest);
        List<MessageResponse> messages = messagePage.getContent().stream()
                .map(mapper::toMessageResponse).collect(Collectors.toList());
        java.util.Collections.reverse(messages);
        return messages;
    }

    /** Đánh dấu đã đọc tin nhắn — broadcast read receipt */
    @Override
    @Transactional
    public void markAsRead(Integer conversationId, Integer accountId, Integer lastReadMessageId) {
        if (!participantRepository.existsByConversationIdConversationAndAccountId(
                conversationId, accountId)) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Participant không tồn tại");
        }
        participantRepository.markAsRead(conversationId, accountId, lastReadMessageId);
        log.info("✅ User {} đã đọc tin nhắn trong conversation {}", accountId, conversationId);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/read",
                Map.of("accountId", accountId,
                        "lastReadMessageId", lastReadMessageId,
                        "readAt", LocalDateTime.now().toString()));
    }

    /** Xóa tin nhắn (soft delete) — broadcast */
    @Override
    @Transactional
    public void deleteMessage(Integer messageId, Integer currentAccountId) {
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Tin nhắn không tồn tại"));
        if (message.getSenderId().equals(currentAccountId)) {
            validator.validateForDeleteMessage(message, currentAccountId);
        } else {
            permissionService.checkCanDeleteAnyMessage(
                    message.getConversation().getIdConversation(), currentAccountId);
        }
        messageRepository.softDeleteMessage(messageId);
        log.info("🗑️ Message {} đã bị xóa bởi user {}", messageId, currentAccountId);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + message.getConversation().getIdConversation()
                        + "/message-deleted",
                Map.of("messageId", messageId, "deletedBy", currentAccountId));
    }

    /** Chỉnh sửa tin nhắn — broadcast */
    @Override
    @Transactional
    public MessageResponse editMessage(Integer messageId, String newContent, Integer currentAccountId) {
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Tin nhắn không tồn tại"));
        validator.validateForEditMessage(message, currentAccountId);
        messageRepository.updateMessageContent(messageId, newContent);
        message = messageRepository.findById(messageId).get();
        MessageResponse response = mapper.toMessageResponse(message);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + message.getConversation().getIdConversation() + "/edit",
                response);
        return response;
    }

    // ==================== PHÂN QUYỀN - DELEGATE ====================

    @Override @Transactional
    public void grantRole(Integer conversationId, Integer targetAccountId,
                          ChatParticipant.ConversationRole role, Integer currentAccountId) {
        permissionService.grantRole(conversationId, targetAccountId, role, currentAccountId);
    }

    @Override @Transactional
    public void revokeRole(Integer conversationId, Integer targetAccountId, Integer currentAccountId) {
        permissionService.revokeRole(conversationId, targetAccountId, currentAccountId);
    }

    @Override @Transactional
    public void muteMember(Integer conversationId, Integer targetAccountId,
                           LocalDateTime mutedUntil, String reason, Integer currentAccountId) {
        permissionService.muteMember(conversationId, targetAccountId, mutedUntil, reason, currentAccountId);
    }

    @Override @Transactional
    public void unmuteMember(Integer conversationId, Integer targetAccountId, Integer currentAccountId) {
        permissionService.unmuteMember(conversationId, targetAccountId, currentAccountId);
    }

    @Override @Transactional
    public void banMember(Integer conversationId, Integer targetAccountId,
                          String reason, Integer currentAccountId) {
        permissionService.banMember(conversationId, targetAccountId, reason, currentAccountId);
    }

    @Override @Transactional
    public void unbanMember(Integer conversationId, Integer targetAccountId, Integer currentAccountId) {
        permissionService.unbanMember(conversationId, targetAccountId, currentAccountId);
    }

    @Override @Transactional
    public void transferOwnership(Integer conversationId, Integer newOwnerAccountId,
                                  Integer currentAccountId) {
        permissionService.transferOwnership(conversationId, newOwnerAccountId, currentAccountId);
    }

    /** Đổi quyền gửi tin — broadcast WS */
    @Override
    @Transactional
    public void updateMessagePermission(Integer conversationId, String permission,
                                        Integer currentAccountId) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));

        boolean isSuperAdmin = permissionService.isSuperAdmin(currentAccountId);
        boolean isAdminOrOwner = permissionService.isAdminOrOwner(conversationId, currentAccountId);
        if (!isSuperAdmin && !isAdminOrOwner) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Chỉ OWNER/ADMIN hoặc ADMIN hệ thống mới có thể đổi cài đặt này");
        }
        if (permission == null || permission.trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Permission không được để trống");
        }

        ChatConversation.MessagePermission newPermission;
        try {
            newPermission = ChatConversation.MessagePermission.valueOf(permission.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Permission không hợp lệ: " + permission + ". Chỉ chấp nhận EVERYONE hoặc ADMINS_ONLY");
        }

        conversation.setMessagePermission(newPermission);
        conversationRepository.save(conversation);
        log.info("🔧 User {} đổi message_permission của conv {} thành {}",
                currentAccountId, conversationId, newPermission);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/permission",
                Map.of("action", "MESSAGE_PERMISSION_CHANGED",
                        "permission", newPermission.name(),
                        "changedBy", currentAccountId,
                        "timestamp", System.currentTimeMillis()));
    }

    // ==================== CONTACTS ====================

    /** Lấy danh sách giảng viên (loại trừ chính mình) */
    @Override
    public List<Map<String, Object>> getTeachers() {
        Integer currentAccountId = SecurityUtils.requireCurrentAccountId();
        return accountRepository.findAllTeachers(currentAccountId).stream()
                .map(this::buildTeacherMap).collect(Collectors.toList());
    }

    /** Lấy danh sách khóa học của user hiện tại theo role */
    @Override
    public List<Map<String, Object>> getMyCourses() {
        Account currentAccount = SecurityUtils.requireCurrentAccount();
        String role = currentAccount.getRole() != null
                ? currentAccount.getRole().getRoleName() : "";

        List<Map<String, Object>> courses;
        if ("ADMIN".equals(role)) {
            courses = courseRepository.findAllActiveCourses().stream()
                    .map(c -> buildCourseMap(c.getIdCourse(), c.getTitle(), c.getThumbnailUrl()))
                    .collect(Collectors.toList());
        } else if ("TEACHER".equals(role)) {
            courses = courseRepository.findByAccountIdAccount(currentAccount.getIdAccount()).stream()
                    .filter(c -> c.getDeletedAt() == null)
                    .map(c -> buildCourseMap(c.getIdCourse(), c.getTitle(), c.getThumbnailUrl()))
                    .collect(Collectors.toList());
        } else {
            courses = orderItemRepository.findByAccountIdAccount(currentAccount.getIdAccount())
                    .stream()
                    .filter(oi -> oi.getCourse() != null && oi.getCourse().getDeletedAt() == null)
                    .map(oi -> buildCourseMap(oi.getCourse().getIdCourse(),
                            oi.getCourse().getTitle(), oi.getCourse().getThumbnailUrl()))
                    .collect(Collectors.toList());
        }
        return courses;
    }

    /**
     * Lấy danh sách học viên của khóa học (dùng cho chat).
     * FIXED [HIGH]: trước đây ai cũng gọi được với mọi courseId.
     *               Nay yêu cầu current user phải là giảng viên của khóa học hoặc ADMIN.
     */
    @Override
    public List<Map<String, Object>> getStudentsByCourse(Integer courseId) {
        Account current = SecurityUtils.requireCurrentAccount();
        boolean isAdmin = current.getRole() != null
                && "ADMIN".equalsIgnoreCase(current.getRole().getRoleName());

        if (!isAdmin) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại"));
            if (course.getAccount() == null
                    || !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
                throw new ErrorHandler(HttpStatus.FORBIDDEN,
                        "Bạn không phải giảng viên của khóa học này");
            }
        }

        return orderItemRepository.findByCourseIdCourse(courseId).stream()
                .filter(oi -> oi.getAccount() != null)
                .map(oi -> buildStudentMap(oi.getAccount()))
                .collect(Collectors.toList());
    }

    // ==================== SEARCH USERS FOR CHAT ====================

    /** Tìm user theo email / số điện thoại / username */
    @Override
    public List<UserSearchResponse> searchUsersForChat(String keyword, Integer currentAccountId) {
        if (keyword == null || keyword.trim().length() < 2) return List.of();
        List<Account> accounts = accountRepository.searchUsersForChat(
                keyword.trim(), currentAccountId, PageRequest.of(0, 20));
        return accounts.stream()
                .map(acc -> toUserSearchResponse(acc, currentAccountId))
                .collect(Collectors.toList());
    }

    private UserSearchResponse toUserSearchResponse(Account acc, Integer currentAccountId) {
        var builder = UserSearchResponse.builder()
                .accountId(acc.getIdAccount())
                .username(acc.getUsername())
                .fullName(getFullNameForSearch(acc))
                .email(acc.getEmail())
                .phone(acc.getUser() != null ? acc.getUser().getPhone() : null)
                .avatarUrl(acc.getUser() != null ? acc.getUser().getAvatarUrl() : null)
                .hasPrivateConversation(false);

        conversationRepository.findPrivateConversation(currentAccountId, acc.getIdAccount())
                .ifPresent(conv -> builder.hasPrivateConversation(true)
                        .existingConversationId(conv.getIdConversation()));
        return builder.build();
    }

    private String getFullNameForSearch(Account account) {
        if (account == null) return "User";
        if (account.getUser() != null) {
            String fn = account.getUser().getFirstName() != null ? account.getUser().getFirstName() : "";
            String ln = account.getUser().getLastName() != null ? account.getUser().getLastName() : "";
            String full = (fn + " " + ln).trim();
            if (!full.isEmpty()) return full;
        }
        return account.getUsername() != null ? account.getUsername() : "User";
    }

    // ==================== NOTIFICATION HELPERS ====================

    private void sendConversationCreatedNotification(ChatConversation conversation,
                                                     Integer receiverId, Integer creatorId) {
        try {
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Bạn được thêm vào cuộc trò chuyện mới");
            notif.setContent(String.format("Bạn đã được thêm vào cuộc trò chuyện \"%s\"",
                    getConversationName(conversation)));
            notif.setSenderAccountId(creatorId);
            notif.setReceiverAccountId(receiverId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversation.getIdConversation());
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "CONVERSATION_CREATED");
            extra.put("conversationId", conversation.getIdConversation());
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo tạo conversation: {}", e.getMessage());
        }
    }

    private void sendAddedToConversationNotification(ChatConversation conversation, Integer receiverId) {
        try {
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Bạn được thêm vào nhóm chat");
            notif.setContent(String.format("Bạn đã được thêm vào cuộc trò chuyện \"%s\"",
                    getConversationName(conversation)));
            notif.setReceiverAccountId(receiverId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversation.getIdConversation());
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "ADDED_TO_CONVERSATION");
            extra.put("conversationId", conversation.getIdConversation());
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo thêm participant: {}", e.getMessage());
        }
    }

    private void sendRemovedFromConversationNotification(ChatConversation conversation,
                                                         Integer receiverId, Integer removerId) {
        try {
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Bạn đã bị xóa khỏi nhóm chat");
            notif.setContent(String.format("Bạn đã bị xóa khỏi cuộc trò chuyện \"%s\"",
                    getConversationName(conversation)));
            notif.setSenderAccountId(removerId);
            notif.setReceiverAccountId(receiverId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversation.getIdConversation());
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "REMOVED_FROM_CONVERSATION");
            extra.put("conversationId", conversation.getIdConversation());
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo xóa participant: {}", e.getMessage());
        }
    }

    private String getConversationName(ChatConversation conversation) {
        if (conversation.getName() != null && !conversation.getName().trim().isEmpty())
            return conversation.getName();
        if (conversation.getConversationType() == ChatConversation.ConversationType.PRIVATE)
            return "Chat riêng";
        if (conversation.getConversationType() == ChatConversation.ConversationType.COURSE)
            return "Chat khóa học";
        return "Nhóm chat";
    }

    @Override
    @Transactional
    public void updateConversationName(Integer conversationId, String newName, Integer currentAccountId) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));
        if (conversation.getConversationType() != ChatConversation.ConversationType.GROUP)
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Chỉ có thể đổi tên nhóm chat (GROUP)");

        boolean canRename = permissionService.isAdminOrOwner(conversationId, currentAccountId)
                || permissionService.isSuperAdmin(currentAccountId);
        if (!canRename)
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền đổi tên nhóm");
        if (newName == null || newName.trim().isEmpty())
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tên nhóm không được để trống");
        if (newName.length() > 100)
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tên nhóm không vượt quá 100 ký tự");

        conversation.setName(newName.trim());
        conversationRepository.save(conversation);
        log.info("✏️ User {} đổi tên conv {} thành \"{}\"", currentAccountId, conversationId, newName);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/name-changed",
                Map.of("conversationId", conversationId,
                        "newName", newName.trim(),
                        "changedBy", currentAccountId,
                        "timestamp", System.currentTimeMillis()));
    }

    // ==================== HELPER METHODS ====================

    /** Thêm participant mới — bỏ qua nếu đã tồn tại */
    private void addParticipant(Integer conversationId, Integer accountId,
                                ChatParticipant.ConversationRole role) {
        if (participantRepository.existsByConversationIdConversationAndAccountId(
                conversationId, accountId)) {
            log.warn("⚠️ Participant {} đã tồn tại trong conversation {}", accountId, conversationId);
            return;
        }
        ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation == null) {
            log.error("❌ Conversation {} không tồn tại", conversationId);
            return;
        }
        ChatParticipant participant = new ChatParticipant();
        participant.setConversation(conversation);
        participant.setAccountId(accountId);
        participant.setRoleInConversation(role);
        participant.setChatStatus(ChatParticipant.ChatStatus.ACTIVE);
        participant.setIsAdmin(role == ChatParticipant.ConversationRole.OWNER
                || role == ChatParticipant.ConversationRole.ADMIN);
        participantRepository.save(participant);
        log.info("✅ Đã thêm participant {} vào conversation {} với role {}",
                accountId, conversationId, role);
    }

    private Map<String, Object> buildTeacherMap(Account account) {
        Map<String, Object> map = new HashMap<>();
        map.put("accountId", account.getIdAccount());
        map.put("username", account.getUsername());
        map.put("firstName", account.getUser() != null && account.getUser().getFirstName() != null
                ? account.getUser().getFirstName() : "");
        map.put("lastName", account.getUser() != null && account.getUser().getLastName() != null
                ? account.getUser().getLastName() : "");
        map.put("avatarUrl", account.getUser() != null ? account.getUser().getAvatarUrl() : null);
        return map;
    }

    private Map<String, Object> buildStudentMap(Account account) {
        Map<String, Object> map = new HashMap<>();
        map.put("accountId", account.getIdAccount());
        map.put("username", account.getUsername());
        map.put("firstName", account.getUser() != null && account.getUser().getFirstName() != null
                ? account.getUser().getFirstName() : "");
        map.put("lastName", account.getUser() != null && account.getUser().getLastName() != null
                ? account.getUser().getLastName() : "");
        map.put("avatarUrl", account.getUser() != null ? account.getUser().getAvatarUrl() : null);
        return map;
    }

    private Map<String, Object> buildCourseMap(Integer courseId, String title, String thumbnailUrl) {
        Map<String, Object> map = new HashMap<>();
        map.put("courseId", courseId);
        map.put("title", title);
        map.put("thumbnailUrl", thumbnailUrl);
        return map;
    }
}