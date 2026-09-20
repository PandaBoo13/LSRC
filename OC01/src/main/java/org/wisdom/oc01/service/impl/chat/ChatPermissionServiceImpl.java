// src/main/java/org/wisdom/oc01/service/impl/chat/ChatPermissionServiceImpl.java
package org.wisdom.oc01.service.impl.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.dto.request.NotificationRequest;
import org.wisdom.oc01.dto.request.chat.CreateConversationRequest;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.chat.ChatConversation;
import org.wisdom.oc01.entity.chat.ChatParticipant;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.chat.ChatConversationRepository;
import org.wisdom.oc01.repository.chat.ChatParticipantRepository;
import org.wisdom.oc01.service.notification.NotificationService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j @Service @RequiredArgsConstructor @Transactional(readOnly = true) public class ChatPermissionServiceImpl {
    private final ChatParticipantRepository participantRepository;
    private final ChatConversationRepository conversationRepository;
    private final AccountRepository accountRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    // ==================== SUPER_ADMIN CHECK ====================
    public boolean isSuperAdmin(Integer accountId) {
        if (accountId == null) return false;
        return accountRepository.findById(accountId).map(acc -> acc.getRole() != null && "ADMIN".equals(acc.getRole().getRoleName())).orElse(false);
    }

    // ==================== CHECK PERMISSION ====================
    public void checkCanCreateConversation(CreateConversationRequest request) {
        Account account = accountRepository.findById(request.getAccountId()).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Account không tồn tại"));
        String role = account.getRole() != null ? account.getRole().getRoleName() : "";
        String type = request.getConversationType();
        if ("COURSE".equals(type) && "STUDENT".equals(role)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Học viên không có quyền tạo course chat");
        }
        if ("GROUP".equals(type)) {
            List<Integer> pids = request.getParticipantIds();
            if (pids == null || pids.size() < 2) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Nhóm cần ít nhất 2 thành viên khác");
            }
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tên nhóm không được để trống");
            }
        }
        if ("PRIVATE".equals(type)) {
            List<Integer> pids = request.getParticipantIds();
            if (pids == null || pids.size() != 1) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Chat riêng phải có đúng 1 người nhận");
            }
            if (pids.get(0).equals(request.getAccountId())) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Không thể chat riêng với chính mình");
            }
        }
    }

    /** ✅ HARD DELETE: Bỏ check leftAt vì record đã bị xóa cứng khi user rời nhóm */
    public void checkCanSendMessage(Integer conversationId, Integer accountId) {
        ChatParticipant participant = participantRepository.findByConversationIdConversationAndAccountId(conversationId, accountId).orElseThrow(() -> new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không phải là thành viên của conversation này"));
        if (participant.getChatStatus() == ChatParticipant.ChatStatus.MUTED) {
            if (participant.getMutedUntil() == null) {
                log.warn("🔇 Account {} bị mute VĨNH VIỄN", accountId);
                throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn đã bị mute vĩnh viễn. Lý do: " + participant.getMutedReason());
            }
            if (participant.getMutedUntil().isAfter(LocalDateTime.now())) {
                log.warn("🔇 Account {} đang bị mute đến {}", accountId, participant.getMutedUntil());
                throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn đang bị mute đến " + participant.getMutedUntil() + ". Lý do: " + participant.getMutedReason());
            } else {
                log.info("✅ Mute hết hạn, tự động unmute account {}", accountId);
                participant.setChatStatus(ChatParticipant.ChatStatus.ACTIVE);
                participant.setMutedUntil(null);
                participant.setMutedReason(null);
                participantRepository.save(participant);
            }
        }
        if (participant.getChatStatus() == ChatParticipant.ChatStatus.BANNED) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn đã bị cấm chat vĩnh viễn. Lý do: " + participant.getBanReason());
        }
        ChatConversation conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Conversation không tồn tại"));
        if (conversation.getMessagePermission() == ChatConversation.MessagePermission.ADMINS_ONLY) {
            boolean canSend = canModerate(conversationId, accountId);
            if (!canSend) {
                log.warn("🚫 Account {} không có quyền gửi tin (ADMINS_ONLY)", accountId);
                throw new ErrorHandler(HttpStatus.FORBIDDEN, "Chỉ trưởng/phó nhóm được nhắn tin vào nhóm này");
            }
        }
    }

    public void checkCanDeleteAnyMessage(Integer conversationId, Integer accountId) {
        if (!canModerate(conversationId, accountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền xóa tin nhắn của người khác");
        }
    }

    public void checkCanRemoveParticipant(Integer conversationId, Integer accountId, Integer currentAccountId) {
        if (!isSuperAdmin(currentAccountId) && !isAdminOrOwner(conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền xóa thành viên");
        }
        if (isOwner(conversationId, accountId) && !isSuperAdmin(currentAccountId)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Không thể xóa OWNER khỏi conversation");
        }
    }

    // ==================== ROLE MANAGEMENT ====================
    @Transactional
    public void grantRole(Integer conversationId, Integer targetAccountId, ChatParticipant.ConversationRole role, Integer currentAccountId) {
        boolean superAdmin = isSuperAdmin(currentAccountId);
        if (role == ChatParticipant.ConversationRole.ADMIN && !superAdmin && !isOwner(conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Chỉ OWNER hoặc ADMIN hệ thống mới có thể gán quyền ADMIN");
        }
        if (role == ChatParticipant.ConversationRole.MODERATOR && !superAdmin && !isAdminOrOwner(conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền gán MODERATOR");
        }
        ChatParticipant participant = participantRepository.findByConversationIdConversationAndAccountId(conversationId, targetAccountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Participant không tồn tại"));
        participant.setRoleInConversation(role);
        if (role == ChatParticipant.ConversationRole.ADMIN || role == ChatParticipant.ConversationRole.OWNER) {
            participant.setIsAdmin(true);
        }
        participantRepository.save(participant);
        log.info("✅ User {} đã gán quyền {} cho user {} trong conversation {}", currentAccountId, role, targetAccountId, conversationId);
        sendRoleNotification(conversationId, targetAccountId, currentAccountId, role, true);
        broadcastPermissionChange(conversationId, "GRANT_ROLE", targetAccountId, currentAccountId);
    }

    @Transactional
    public void revokeRole(Integer conversationId, Integer targetAccountId, Integer currentAccountId) {
        boolean superAdmin = isSuperAdmin(currentAccountId);
        if (isOwner(conversationId, targetAccountId) && !superAdmin) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Không thể thu hồi quyền của OWNER");
        }
        if (isAdmin(conversationId, targetAccountId) && !superAdmin && !isOwner(conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Chỉ OWNER hoặc ADMIN hệ thống mới có thể thu hồi quyền ADMIN");
        }
        if (!superAdmin && !isAdminOrOwner(conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền thu hồi quyền");
        }
        ChatParticipant participant = participantRepository.findByConversationIdConversationAndAccountId(conversationId, targetAccountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Participant không tồn tại"));
        participant.setRoleInConversation(ChatParticipant.ConversationRole.MEMBER);
        participant.setIsAdmin(false);
        participantRepository.save(participant);
        log.info("✅ User {} đã thu hồi quyền của user {} trong conversation {}", currentAccountId, targetAccountId, conversationId);
        sendRevokeNotification(conversationId, targetAccountId, currentAccountId);
        broadcastPermissionChange(conversationId, "REVOKE_ROLE", targetAccountId, currentAccountId);
    }

    // ==================== MUTE/UNMUTE ====================
    @Transactional
    public void muteMember(Integer conversationId, Integer targetAccountId, LocalDateTime mutedUntil, String reason, Integer currentAccountId) {
        boolean superAdmin = isSuperAdmin(currentAccountId);
        if (!superAdmin && !canModerate(conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền mute thành viên");
        }
        if (isOwner(conversationId, targetAccountId) && !superAdmin) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Không thể mute OWNER");
        }
        ChatParticipant participant = participantRepository.findByConversationIdConversationAndAccountId(conversationId, targetAccountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Participant không tồn tại"));
        participant.setChatStatus(ChatParticipant.ChatStatus.MUTED);
        participant.setMutedUntil(mutedUntil);
        participant.setMutedReason(reason);
        participantRepository.save(participant);
        log.info("🔇 User {} mute user {} đến {} - Lý do: {}", currentAccountId, targetAccountId, mutedUntil, reason);
        sendMuteNotification(conversationId, targetAccountId, currentAccountId, mutedUntil, reason);
        broadcastPermissionChange(conversationId, "MUTE", targetAccountId, currentAccountId);
    }

    @Transactional
    public void unmuteMember(Integer conversationId, Integer targetAccountId, Integer currentAccountId) {
        if (!isSuperAdmin(currentAccountId) && !canModerate(conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền unmute thành viên");
        }
        ChatParticipant participant = participantRepository.findByConversationIdConversationAndAccountId(conversationId, targetAccountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Participant không tồn tại"));
        participant.setChatStatus(ChatParticipant.ChatStatus.ACTIVE);
        participant.setMutedUntil(null);
        participant.setMutedReason(null);
        participantRepository.save(participant);
        log.info("🔊 User {} unmute user {}", currentAccountId, targetAccountId);
        sendUnmuteNotification(conversationId, targetAccountId, currentAccountId);
        broadcastPermissionChange(conversationId, "UNMUTE", targetAccountId, currentAccountId);
    }

    // ==================== BAN/UNBAN ====================
    @Transactional
    public void banMember(Integer conversationId, Integer targetAccountId, String reason, Integer currentAccountId) {
        boolean superAdmin = isSuperAdmin(currentAccountId);
        if (!superAdmin && !isAdminOrOwner(conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền ban thành viên");
        }
        if (isOwner(conversationId, targetAccountId) && !superAdmin) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Không thể ban OWNER");
        }
        ChatParticipant participant = participantRepository.findByConversationIdConversationAndAccountId(conversationId, targetAccountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Participant không tồn tại"));
        participant.setChatStatus(ChatParticipant.ChatStatus.BANNED);
        participant.setBanReason(reason);
        participantRepository.save(participant);
        log.info("🚫 User {} ban user {} - Lý do: {}", currentAccountId, targetAccountId, reason);
        sendBanNotification(conversationId, targetAccountId, currentAccountId, reason);
        broadcastPermissionChange(conversationId, "BAN", targetAccountId, currentAccountId);
    }

    @Transactional
    public void unbanMember(Integer conversationId, Integer targetAccountId, Integer currentAccountId) {
        if (!isSuperAdmin(currentAccountId) && !isAdminOrOwner(conversationId, currentAccountId)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn không có quyền unban thành viên");
        }
        ChatParticipant participant = participantRepository.findByConversationIdConversationAndAccountId(conversationId, targetAccountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Participant không tồn tại"));
        participant.setChatStatus(ChatParticipant.ChatStatus.ACTIVE);
        participant.setBanReason(null);
        participantRepository.save(participant);
        log.info("✅ User {} unban user {}", currentAccountId, targetAccountId);
        sendUnbanNotification(conversationId, targetAccountId, currentAccountId);
        broadcastPermissionChange(conversationId, "UNBAN", targetAccountId, currentAccountId);
    }

    // ==================== TRANSFER OWNERSHIP ====================
    @Transactional
    public void transferOwnership(Integer conversationId, Integer newOwnerAccountId, Integer currentAccountId) {
        boolean superAdmin = isSuperAdmin(currentAccountId);
        boolean currentIsOwner = isOwner(conversationId, currentAccountId);
        if (!superAdmin && !currentIsOwner) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Chỉ OWNER hoặc ADMIN hệ thống mới có thể chuyển quyền OWNER");
        }
        if (currentAccountId.equals(newOwnerAccountId)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Không thể chuyển quyền OWNER cho chính mình");
        }
        List<Integer> oldOwnerIds = new ArrayList<>();
        if (currentIsOwner) {
            ChatParticipant oldOwner = participantRepository.findByConversationIdConversationAndAccountId(conversationId, currentAccountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Old owner không tồn tại"));
            oldOwner.setRoleInConversation(ChatParticipant.ConversationRole.MEMBER);
            oldOwner.setIsAdmin(false);
            participantRepository.save(oldOwner);
            oldOwnerIds.add(currentAccountId);
        } else {
            List<ChatParticipant> existingOwners = participantRepository.findByConversationIdConversation(conversationId).stream().filter(p -> ChatParticipant.ConversationRole.OWNER.equals(p.getRoleInConversation())).toList();
            for (ChatParticipant oldOwner : existingOwners) {
                oldOwner.setRoleInConversation(ChatParticipant.ConversationRole.MEMBER);
                oldOwner.setIsAdmin(false);
                participantRepository.save(oldOwner);
                oldOwnerIds.add(oldOwner.getAccountId());
            }
        }
        ChatParticipant newOwner = participantRepository.findByConversationIdConversationAndAccountId(conversationId, newOwnerAccountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "New owner không phải thành viên"));
        newOwner.setRoleInConversation(ChatParticipant.ConversationRole.OWNER);
        newOwner.setIsAdmin(true);
        participantRepository.save(newOwner);
        log.info("👑 User {} (superAdmin={}) đã chuyển quyền OWNER cho user {} trong conversation {}", currentAccountId, superAdmin, newOwnerAccountId, conversationId);
        sendTransferOwnershipNotification(conversationId, newOwnerAccountId, currentAccountId);
        for (Integer oldOwnerId : oldOwnerIds) {
            sendDemotedFromOwnerNotification(conversationId, oldOwnerId, newOwnerAccountId);
        }
        broadcastPermissionChange(conversationId, "TRANSFER_OWNER", newOwnerAccountId, currentAccountId);
    }

    // ==================== NOTIFICATION HELPERS ====================
    private void sendRoleNotification(Integer conversationId, Integer targetAccountId, Integer actorId, ChatParticipant.ConversationRole role, boolean isGrant) {
        try {
            ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation == null) return;
            String conversationName = getConversationName(conversation);
            String roleLabel = getRoleLabel(role);
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Bạn được cấp quyền " + roleLabel);
            notif.setContent(String.format("Bạn đã được cấp quyền %s trong cuộc trò chuyện \"%s\"", roleLabel, conversationName));
            notif.setSenderAccountId(actorId);
            notif.setReceiverAccountId(targetAccountId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversationId);
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "GRANT_ROLE");
            extra.put("conversationId", conversationId);
            extra.put("role", role.name());
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo cấp quyền: {}", e.getMessage());
        }
    }

    private void sendRevokeNotification(Integer conversationId, Integer targetAccountId, Integer actorId) {
        try {
            ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation == null) return;
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Quyền của bạn đã bị thu hồi");
            notif.setContent(String.format("Quyền quản lý của bạn trong cuộc trò chuyện \"%s\" đã bị thu hồi", getConversationName(conversation)));
            notif.setSenderAccountId(actorId);
            notif.setReceiverAccountId(targetAccountId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversationId);
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "REVOKE_ROLE");
            extra.put("conversationId", conversationId);
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo thu hồi quyền: {}", e.getMessage());
        }
    }

    private void sendMuteNotification(Integer conversationId, Integer targetAccountId, Integer actorId, LocalDateTime mutedUntil, String reason) {
        try {
            ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation == null) return;
            String timeText = mutedUntil == null ? "vĩnh viễn" : "đến " + mutedUntil;
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Bạn đã bị mute");
            notif.setContent(String.format("Bạn đã bị mute %s trong cuộc trò chuyện \"%s\". Lý do: %s", timeText, getConversationName(conversation), reason != null ? reason : "Không có"));
            notif.setSenderAccountId(actorId);
            notif.setReceiverAccountId(targetAccountId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversationId);
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "MUTE");
            extra.put("conversationId", conversationId);
            extra.put("mutedUntil", mutedUntil != null ? mutedUntil.toString() : "PERMANENT");
            extra.put("reason", reason);
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo mute: {}", e.getMessage());
        }
    }

    private void sendUnmuteNotification(Integer conversationId, Integer targetAccountId, Integer actorId) {
        try {
            ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation == null) return;
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Bạn đã được unmute");
            notif.setContent(String.format("Bạn đã có thể chat trở lại trong cuộc trò chuyện \"%s\"", getConversationName(conversation)));
            notif.setSenderAccountId(actorId);
            notif.setReceiverAccountId(targetAccountId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversationId);
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "UNMUTE");
            extra.put("conversationId", conversationId);
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo unmute: {}", e.getMessage());
        }
    }

    private void sendBanNotification(Integer conversationId, Integer targetAccountId, Integer actorId, String reason) {
        try {
            ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation == null) return;
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Bạn đã bị ban");
            notif.setContent(String.format("Bạn đã bị cấm chat trong cuộc trò chuyện \"%s\". Lý do: %s", getConversationName(conversation), reason != null ? reason : "Không có"));
            notif.setSenderAccountId(actorId);
            notif.setReceiverAccountId(targetAccountId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversationId);
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "BAN");
            extra.put("conversationId", conversationId);
            extra.put("reason", reason);
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo ban: {}", e.getMessage());
        }
    }

    private void sendUnbanNotification(Integer conversationId, Integer targetAccountId, Integer actorId) {
        try {
            ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation == null) return;
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Bạn đã được bỏ cấm");
            notif.setContent(String.format("Bạn đã có thể chat trở lại trong cuộc trò chuyện \"%s\"", getConversationName(conversation)));
            notif.setSenderAccountId(actorId);
            notif.setReceiverAccountId(targetAccountId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversationId);
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "UNBAN");
            extra.put("conversationId", conversationId);
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo unban: {}", e.getMessage());
        }
    }

    private void sendTransferOwnershipNotification(Integer conversationId, Integer newOwnerId, Integer oldOwnerId) {
        try {
            ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation == null) return;
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Bạn trở thành chủ sở hữu nhóm");
            notif.setContent(String.format("Bạn đã trở thành chủ sở hữu mới của cuộc trò chuyện \"%s\"", getConversationName(conversation)));
            notif.setSenderAccountId(oldOwnerId);
            notif.setReceiverAccountId(newOwnerId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversationId);
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "TRANSFER_OWNER");
            extra.put("conversationId", conversationId);
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo chuyển quyền: {}", e.getMessage());
        }
    }

    private void sendDemotedFromOwnerNotification(Integer conversationId, Integer oldOwnerId, Integer newOwnerId) {
        try {
            ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation == null) return;
            NotificationRequest notif = new NotificationRequest();
            notif.setTitle("Bạn không còn là chủ sở hữu nhóm");
            notif.setContent(String.format("Bạn đã chuyển quyền chủ sở hữu cuộc trò chuyện \"%s\" cho người khác. Bạn hiện là Thành viên.", getConversationName(conversation)));
            notif.setSenderAccountId(newOwnerId);
            notif.setReceiverAccountId(oldOwnerId);
            notif.setReferenceType("CHAT");
            notif.setReferenceId(conversationId);
            Map<String, Object> extra = new HashMap<>();
            extra.put("action", "DEMOTED_FROM_OWNER");
            extra.put("conversationId", conversationId);
            extra.put("newOwnerId", newOwnerId);
            extra.put("newRole", "MEMBER");
            notif.setExtraData(extra);
            notificationService.sendNotification(notif);
            log.info("📨 Đã gửi thông báo hạ quyền cho old owner {} (→ MEMBER)", oldOwnerId);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi thông báo hạ quyền: {}", e.getMessage());
        }
    }

    private void broadcastPermissionChange(Integer conversationId, String action, Integer targetAccountId, Integer actorId) {
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/permission", Map.of("action", action, "targetId", targetAccountId, "actorId", actorId, "timestamp", System.currentTimeMillis()));
        } catch (Exception e) {
            log.warn("⚠️ Lỗi broadcast permission change: {}", e.getMessage());
        }
    }

    // ==================== HELPER ====================
    private String getConversationName(ChatConversation conversation) {
        if (conversation.getName() != null && !conversation.getName().trim().isEmpty()) {
            return conversation.getName();
        }
        if (conversation.getConversationType() == ChatConversation.ConversationType.PRIVATE) {
            return "Chat riêng";
        }
        if (conversation.getConversationType() == ChatConversation.ConversationType.COURSE) {
            return "Chat khóa học";
        }
        return "Nhóm chat";
    }

    private String getRoleLabel(ChatParticipant.ConversationRole role) {
        switch (role) {
            case OWNER: return "Chủ sở hữu";
            case ADMIN: return "Quản trị viên";
            case MODERATOR: return "Điều phối viên";
            default: return "Thành viên";
        }
    }

    public ChatParticipant.ConversationRole determineCourseRole(Integer courseId, Integer accountId) {
        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null) return ChatParticipant.ConversationRole.MEMBER;
        String role = account.getRole() != null ? account.getRole().getRoleName() : "";
        if ("ADMIN".equals(role) || "TEACHER".equals(role)) {
            return ChatParticipant.ConversationRole.OWNER;
        }
        return ChatParticipant.ConversationRole.MEMBER;
    }

    private boolean isOwner(Integer conversationId, Integer accountId) {
        return participantRepository.findByConversationIdConversationAndAccountId(conversationId, accountId).map(p -> ChatParticipant.ConversationRole.OWNER.equals(p.getRoleInConversation())).orElse(false);
    }

    private boolean isAdmin(Integer conversationId, Integer accountId) {
        return participantRepository.findByConversationIdConversationAndAccountId(conversationId, accountId).map(p -> ChatParticipant.ConversationRole.ADMIN.equals(p.getRoleInConversation())).orElse(false);
    }

    public boolean isAdminOrOwner(Integer conversationId, Integer accountId) {
        return participantRepository.findByConversationIdConversationAndAccountId(conversationId, accountId).map(p -> ChatParticipant.ConversationRole.ADMIN.equals(p.getRoleInConversation()) || ChatParticipant.ConversationRole.OWNER.equals(p.getRoleInConversation())).orElse(false);
    }

    private boolean canModerate(Integer conversationId, Integer accountId) {
        return participantRepository.findByConversationIdConversationAndAccountId(conversationId, accountId).map(p -> ChatParticipant.ConversationRole.MODERATOR.equals(p.getRoleInConversation()) || ChatParticipant.ConversationRole.ADMIN.equals(p.getRoleInConversation()) || ChatParticipant.ConversationRole.OWNER.equals(p.getRoleInConversation())).orElse(false);
    }
}