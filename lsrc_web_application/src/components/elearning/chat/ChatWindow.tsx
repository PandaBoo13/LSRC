// src/components/elearning/chat/ChatWindow.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Toast } from '../ui/Toast';
import type { ToastMessage } from '../ui/Toast';
import { getParticipants, removeParticipant } from '../../../service/chatService';
import { getErrorMessage } from '../../../utils/errorUtils';
import type { Conversation, Message, Participant, ConversationRole, CourseContact } from '../../../types/chat.types';

// Import các components đã tách
import { ChatView } from './views/ChatView';
import { MembersView } from './views/MembersView';
import { AddMembersView } from './views/AddMembersView';
import { PrivateInfoView } from './views/PrivateInfoView';
import { ChatWindowHeader } from './ChatWindowHeader';
import { ParticipantContextMenu } from './context-menu/ParticipantContextMenu';
import { useChatWindow } from './hooks/useChatWindow';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  typingUsers: Set<number>;
  currentUserId?: number;
  myCourses?: CourseContact[];
  participants?: Participant[];
  currentUserRole?: ConversationRole | null;
  onSend: (content: string) => void;
  onTyping: () => void;
  onBack?: () => void;
  showHeader?: boolean;
  onGrantRole?: (targetAccountId: number, role: ConversationRole) => Promise<void> | void;
  onRevokeRole?: (targetAccountId: number) => Promise<void> | void;
  onMuteMember?: (targetAccountId: number, mutedUntil: string | null, reason?: string) => Promise<void> | void;
  onUnmuteMember?: (targetAccountId: number) => Promise<void> | void;
  onBanMember?: (targetAccountId: number, reason?: string) => Promise<void> | void;
  onUnbanMember?: (targetAccountId: number) => Promise<void> | void;
  onTransferOwnership?: (targetAccountId: number) => Promise<void> | void;
  onUpdateMessagePermission?: (permission: 'EVERYONE' | 'ADMINS_ONLY') => Promise<void> | void;
  onLoadOlderMessages?: () => void;
  hasMoreMessages?: boolean;
  isLoadingMore?: boolean;

  // ✅ Double-click member để mở chat riêng
  onStartPrivateChat?: (accountId: number) => Promise<void> | void;

  // ✅ Từ PrivateInfoView → tạo nhóm với người này
  onStartCreateGroup?: (partnerAccountId: number) => void;

  // ✅ Edit/Delete message
  onDeleteMessage?: (messageId: number) => Promise<void> | void;
  onEditMessage?: (messageId: number, content: string) => Promise<Message> | void;

  // ✅ NEW: Đổi tên nhóm chat
  onUpdateName?: (newName: string) => Promise<void> | void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  typingUsers,
  currentUserId,
  myCourses = [],
  participants = [],
  currentUserRole = null,
  onSend,
  onTyping,
  onBack,
  showHeader = true,
  onGrantRole,
  onRevokeRole,
  onMuteMember,
  onUnmuteMember,
  onBanMember,
  onUnbanMember,
  onTransferOwnership,
  onUpdateMessagePermission,
  onLoadOlderMessages,
  hasMoreMessages = false,
  isLoadingMore = false,
  onStartPrivateChat,
  onStartCreateGroup,
  onDeleteMessage,
  onEditMessage,
  onUpdateName,             // ✅ NEW
}) => {
  const { t } = useTranslation();

  // ==================== STATE ====================
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    participant: Participant;
  } | null>(null);

  // ==================== HOOK ====================
  const chat = useChatWindow({
    currentUserId,
    participants,
    currentUserRole,
    conversationId: conversation.id,
    onMuteMember,
    onBanMember,
  });

  // ✅ Xác định chat riêng + partner (người còn lại)
  const isPrivate = conversation.conversationType === 'PRIVATE';
  const partner = isPrivate
    ? chat.localParticipants.find(p => p.accountId !== currentUserId) || null
    : null;

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!contextMenu) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [contextMenu]);

  // ==================== HELPERS ====================
  const fetchLatestParticipants = useCallback(async () => {
    try {
      const data = await getParticipants(conversation.id);
      chat.setLocalParticipants(data);
    } catch (err) {
      console.error('Lỗi cập nhật participants:', err);
    }
  }, [conversation.id, chat]);

  const handleShowMembers = async () => {
    setShowMenu(false);
    chat.setViewMode('members');
    await fetchLatestParticipants();
  };

  const handleShowAddMembers = async () => {
    setShowMenu(false);
    chat.setViewMode('addMembers');
    setContextMenu(null);
    await fetchLatestParticipants();
  };

  const handleBackToChat = () => {
    chat.setViewMode('chat');
    setContextMenu(null);
    chat.setSelectMode(false);
    chat.setSelectedMemberIds(new Set());
  };

  // ==================== TOGGLE MESSAGE PERMISSION ====================
  const handleToggleMessagePermission = async () => {
    if (!onUpdateMessagePermission) return;

    const current = conversation.messagePermission || 'EVERYONE';
    const next = current === 'EVERYONE' ? 'ADMINS_ONLY' : 'EVERYONE';

    try {
      await onUpdateMessagePermission(next);
      setToast({
        message: t('chat.messagePermission.updateSuccess'),
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: getErrorMessage(err, t('errors.unknownError')),
        type: 'error',
      });
    }
  };

  // ==================== CONTEXT MENU HANDLER ====================
  const handleContextMenu = (e: React.MouseEvent, participant: Participant) => {
    e.preventDefault();
    e.stopPropagation();

    if (!chat.isActionable(participant)) return;
    if (!chat.canManage && !chat.canModerate) return;

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      participant,
    });
  };

  const handleStartSelectMode = (participant: Participant) => {
    chat.setSelectMode(true);
    chat.setSelectedMemberIds(new Set([participant.accountId]));
    setContextMenu(null);
  };

  // ==================== ACTION HELPERS ====================
  const handleAction = async (
    action: () => Promise<void> | void,
    successMessage?: string
  ) => {
    try {
      await action();
      await fetchLatestParticipants();
      setContextMenu(null);
      chat.setSelectedMemberIds(new Set());
      chat.setSelectMode(false);

      if (successMessage) {
        setToast({ message: successMessage, type: 'success' });
      }
    } catch (err) {
      setToast({
        message: getErrorMessage(err, t('errors.unknownError')),
        type: 'error',
      });
    }
  };

  const handleBulkAction = async (
    action: (accountId: number) => Promise<void> | void,
    successMessage?: string
  ) => {
    try {
      for (const accountId of chat.selectedMemberIds) {
        await action(accountId);
      }
      await fetchLatestParticipants();
      chat.setSelectedMemberIds(new Set());
      chat.setSelectMode(false);
      setToast({
        message: successMessage || t('common.success'),
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: getErrorMessage(err, t('errors.unknownError')),
        type: 'error',
      });
    }
  };

  // ==================== DATETIME HELPER ====================
  const formatLocalDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // ==================== MUTE HANDLERS ====================
  const handleMute1Hour = (participant: Participant) => {
    const mutedUntil = formatLocalDateTime(new Date(Date.now() + 3600000));
    handleAction(
      () => onMuteMember?.(participant.accountId, mutedUntil, t('chat.violationReason')),
      t('chat.muteSuccess', { username: participant.username, duration: '1h' })
    );
  };

  const handleMute24Hours = (participant: Participant) => {
    const mutedUntil = formatLocalDateTime(new Date(Date.now() + 24 * 3600000));
    handleAction(
      () => onMuteMember?.(participant.accountId, mutedUntil, t('chat.violationReason')),
      t('chat.muteSuccess', { username: participant.username, duration: '24h' })
    );
  };

  const handleMutePermanent = (participant: Participant) => {
    handleAction(
      () => onMuteMember?.(participant.accountId, null, t('chat.seriousViolation')),
      t('chat.mutePermanentSuccess', { username: participant.username })
    );
  };

  // ==================== BULK HANDLERS ====================
  const handleBulkMute = async () => {
    if (chat.selectedMemberIds.size === 0) return;
    const mutedUntil = formatLocalDateTime(new Date(Date.now() + 3600000));

    await handleBulkAction(
      async (accountId) => {
        await onMuteMember?.(accountId, mutedUntil, t('chat.violationReason'));
      },
      t('chat.bulkMuteSuccess', { count: chat.selectedMemberIds.size })
    );
  };

  const handleBulkBan = async () => {
    if (chat.selectedMemberIds.size === 0) return;
    if (!confirm(t('chat.confirmBulkBan', { count: chat.selectedMemberIds.size }))) return;

    await handleBulkAction(
      async (accountId) => {
        await onBanMember?.(accountId, t('chat.violationReason'));
      },
      t('chat.bulkBanSuccess', { count: chat.selectedMemberIds.size })
    );
  };

  const handleBulkRemove = async () => {
    if (chat.selectedMemberIds.size === 0) return;
    if (!confirm(t('chat.confirmBulkRemove', { count: chat.selectedMemberIds.size }))) return;

    await handleBulkAction(
      async (accountId) => {
        await removeParticipant(conversation.id, accountId);
      },
      t('chat.bulkRemoveSuccess', { count: chat.selectedMemberIds.size })
    );
  };

  // ==================== REMOVE HANDLER ====================
  const handleRemoveMember = async (accountId: number) => {
    if (!confirm(t('chat.confirmRemove'))) return;

    try {
      await removeParticipant(conversation.id, accountId);
      await fetchLatestParticipants();
      setContextMenu(null);
      setToast({ message: t('chat.removeSuccess'), type: 'success' });
    } catch (err) {
      setToast({
        message: getErrorMessage(err, t('errors.unknownError')),
        type: 'error',
      });
    }
  };

  // ==================== COMPUTE INPUT DISABLED ====================
  const inputDisabled = React.useMemo(() => {
    if (conversation.messagePermission !== 'ADMINS_ONLY') return false;
    if (chat.canModerate) return false;
    return true;
  }, [conversation.messagePermission, chat.canModerate]);

  const inputDisabledReason = inputDisabled
    ? t('chat.messagePermission.onlyAdminsCanChat')
    : undefined;

  // ==================== RENDER ====================
  return (
    <div className="flex-1 flex flex-col min-h-0 relative bg-white overflow-hidden">
      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      {showHeader && (
        <ChatWindowHeader
          viewMode={chat.viewMode}
          conversationName={
            conversation.name ||
            chat.localParticipants.map(p => p.username).join(', ') ||
            t('chat.conversation')
          }
          participantCount={chat.localParticipants.length}
          selectMode={chat.selectMode}
          selectedCount={chat.selectedMemberIds.size}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          onBackToList={onBack}
          onBackToChat={handleBackToChat}
          onShowMembers={handleShowMembers}
          onShowAddMembers={handleShowAddMembers}
          canManage={chat.canManage}
          messagePermission={conversation.messagePermission}
          onToggleMessagePermission={handleToggleMessagePermission}
          isPrivate={isPrivate}
          onUpdateName={onUpdateName}    
        />
      )}

      {/* View: Chat */}
      {chat.viewMode === 'chat' && (
        <ChatView
          messages={messages}
          typingUsers={typingUsers}
          currentUserId={currentUserId}
          participants={chat.localParticipants}
          isLoadingMore={isLoadingMore}
          hasMoreMessages={hasMoreMessages}
          onLoadOlderMessages={onLoadOlderMessages}
          onSend={onSend}
          onTyping={onTyping}
          inputDisabled={inputDisabled}
          inputDisabledReason={inputDisabledReason}
          onDeleteMessage={onDeleteMessage}
          onEditMessage={onEditMessage}
        />
      )}

      {/* View: Members */}
      {chat.viewMode === 'members' && (
        isPrivate && partner ? (
          <PrivateInfoView
            partner={partner}
            onStartCreateGroup={onStartCreateGroup}
            onBack={handleBackToChat}
          />
        ) : (
          <MembersView
            participants={chat.localParticipants}
            currentUserId={currentUserId}
            isOwner={chat.isOwner}
            canManage={chat.canManage}
            canModerate={chat.canModerate}
            selectMode={chat.selectMode}
            selectedMemberIds={chat.selectedMemberIds}
            loadingMembers={false}
            isActionable={chat.isActionable}
            onExitSelectMode={() => {
              chat.setSelectMode(false);
              chat.setSelectedMemberIds(new Set());
            }}
            onToggleSelectMember={chat.toggleSelectMember}
            onSelectAll={chat.handleSelectAll}
            onClearSelection={chat.handleClearSelection}
            onBulkMute={handleBulkMute}
            onBulkBan={handleBulkBan}
            onBulkRemove={handleBulkRemove}
            onContextMenu={handleContextMenu}
            onStartPrivateChat={onStartPrivateChat}
          />
        )
      )}

      {/* View: Add Members */}
      {chat.viewMode === 'addMembers' && (
        <AddMembersView
          myCourses={myCourses}
          localParticipants={chat.localParticipants}
          conversationId={conversation.id}
          onBack={handleBackToChat}
          onAdded={fetchLatestParticipants}
          onToast={(msg: string, type: 'success' | 'error') =>
            setToast({ message: msg, type })
          }
        />
      )}

      {contextMenu && (
        <ParticipantContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          participant={contextMenu.participant}
          isOwner={chat.isOwner}
          canManage={chat.canManage}
          canModerate={chat.canModerate}
          canTransferOwnership={chat.canTransferOwnership}
          selectMode={chat.selectMode}
          onClose={() => setContextMenu(null)}
          onStartSelectMode={handleStartSelectMode}
          onGrantRole={(id, role) =>
            handleAction(
              () => onGrantRole?.(id, role),
              t('chat.grantRoleSuccess', { role, username: contextMenu.participant.username })
            )
          }
          onRevokeRole={(id) =>
            handleAction(
              () => onRevokeRole?.(id),
              t('chat.revokeRoleSuccess', { username: contextMenu.participant.username })
            )
          }
          onMute1Hour={handleMute1Hour}
          onMute24Hours={handleMute24Hours}
          onMutePermanent={handleMutePermanent}
          onUnmute={(id) =>
            handleAction(
              () => onUnmuteMember?.(id),
              t('chat.unmuteSuccess', { username: contextMenu.participant.username })
            )
          }
          onBan={(id) =>
            handleAction(
              () => onBanMember?.(id, t('chat.violationReason')),
              t('chat.banSuccess', { username: contextMenu.participant.username })
            )
          }
          onUnban={(id) =>
            handleAction(
              () => onUnbanMember?.(id),
              t('chat.unbanSuccess', { username: contextMenu.participant.username })
            )
          }
          onTransferOwnership={(id) => {
            if (confirm(t('chat.confirmTransferOwner'))) {
              handleAction(
                () => onTransferOwnership?.(id),
                t('chat.transferOwnerSuccess')
              );
            }
          }}
          onRemove={handleRemoveMember}
        />
      )}
    </div>
  );
};