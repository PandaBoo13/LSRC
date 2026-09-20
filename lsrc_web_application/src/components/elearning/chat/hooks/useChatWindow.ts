// src/components/elearning/chat/hooks/useChatWindow.ts
import { useState, useCallback, useEffect } from 'react';
import type { Participant, ConversationRole } from '../../../../types/chat.types';
import { useAuth } from '../../../../context/AuthContext';

interface UseChatWindowProps {
  currentUserId?: number;
  participants: Participant[];
  currentUserRole?: ConversationRole | null;
  conversationId: number;
  onMuteMember?: (targetAccountId: number, mutedUntil: string | null, reason?: string) => Promise<void> | void;
  onBanMember?: (targetAccountId: number, reason?: string) => Promise<void> | void;
}

export const useChatWindow = ({
  currentUserId,
  participants,
  currentUserRole,
  conversationId,
  onMuteMember,
  onBanMember,
}: UseChatWindowProps) => {
  const { user } = useAuth();
  const [localParticipants, setLocalParticipants] = useState<Participant[]>(participants);
  const [viewMode, setViewMode] = useState<'chat' | 'members' | 'addMembers'>('chat');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLocalParticipants(participants);
  }, [participants]);

  // ==================== ROLE RESOLUTION ====================

  // ✅ System role: ADMIN hệ thống
  const systemRoleName = typeof user?.role === 'string'
    ? user.role
    : (user?.role as any)?.roleName || '';
  const isSystemAdmin = systemRoleName === 'ADMIN';

  // ✅ Conversation role thật
  const currentParticipant = localParticipants.find(p => p.accountId === currentUserId);
  const convRole = currentParticipant?.roleInConversation || currentUserRole;

  // ==================== PERMISSIONS ====================

  // Conv OWNER thật (không tính super admin)
  const isConvOwner = convRole === 'OWNER';

  // isOwner = "có quyền owner" (dùng cho check cao nhất)
  // → true nếu: là conv OWNER hoặc là SUPER_ADMIN
  const isOwner = isConvOwner || isSystemAdmin;

  // canManage: quản lý thành viên (thêm/xóa/mute/ban)
  const canManage = isSystemAdmin || isConvOwner || convRole === 'ADMIN';

  // canModerate: mute cơ bản
  const canModerate = canManage || convRole === 'MODERATOR';

  // ✅ Chỉ conv OWNER hoặc SUPER_ADMIN mới transfer được
  const canTransferOwnership = isConvOwner || isSystemAdmin;

  // ==================== ACTIONABLE ====================

  const isActionable = useCallback((participant: Participant): boolean => {
    const isSelf = participant.accountId === currentUserId;
    const isTargetOwner = participant.roleInConversation === 'OWNER';

    // Không thao tác với chính mình
    if (isSelf) return false;

    // Không thao tác với OWNER (trừ khi mình là OWNER hoặc SUPER_ADMIN)
    if (isTargetOwner && !isConvOwner && !isSystemAdmin) return false;

    return true;
  }, [currentUserId, isConvOwner, isSystemAdmin]);

  // ==================== SELECT MODE ====================

  const toggleSelectMode = useCallback(() => {
    setSelectMode(prev => !prev);
    setSelectedMemberIds(new Set());
  }, []);

  const toggleSelectMember = useCallback((accountId: number) => {
    const participant = localParticipants.find(p => p.accountId === accountId);
    if (!participant || !isActionable(participant)) return;

    setSelectedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      return next;
    });
  }, [localParticipants, isActionable]);

  const handleSelectAll = useCallback(() => {
    const selectable = localParticipants.filter(p => isActionable(p));
    setSelectedMemberIds(new Set(selectable.map(p => p.accountId)));
  }, [localParticipants, isActionable]);

  const handleClearSelection = useCallback(() => {
    setSelectedMemberIds(new Set());
  }, []);

  return {
    localParticipants,
    setLocalParticipants,
    viewMode,
    setViewMode,
    selectMode,
    setSelectMode,
    selectedMemberIds,
    setSelectedMemberIds,

    // Role info
    isOwner,               // true nếu conv OWNER hoặc SUPER_ADMIN
    isConvOwner,           // true CHỈ khi là conv OWNER
    isSystemAdmin,         // true nếu system role = ADMIN
    canManage,
    canModerate,
    canTransferOwnership,  // Dùng cho nút "Chuyển quyền OWNER"

    // Actions
    isActionable,
    toggleSelectMode,
    toggleSelectMember,
    handleSelectAll,
    handleClearSelection,
  };
};