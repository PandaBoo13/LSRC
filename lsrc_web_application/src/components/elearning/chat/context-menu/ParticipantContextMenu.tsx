// src/components/elearning/chat/context-menu/ParticipantContextMenu.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  FaUserShield, FaUserCog, FaMicrophoneSlash, FaBan, FaCrown, FaTrash,
  FaCheckSquare,
} from 'react-icons/fa';
import type { Participant, ConversationRole } from '../../../../types/chat.types';

interface ParticipantContextMenuProps {
  x: number;
  y: number;
  participant: Participant;
  isOwner: boolean;
  canManage: boolean;
  canModerate: boolean;
  canTransferOwnership: boolean;   // ✅ NEW
  selectMode: boolean;
  onClose: () => void;
  onStartSelectMode: (p: Participant) => void;
  onGrantRole: (accountId: number, role: ConversationRole) => void;
  onRevokeRole: (accountId: number) => void;
  onMute1Hour: (p: Participant) => void;
  onMute24Hours: (p: Participant) => void;
  onMutePermanent: (p: Participant) => void;
  onUnmute: (accountId: number) => void;
  onBan: (accountId: number) => void;
  onUnban: (accountId: number) => void;
  onTransferOwnership: (accountId: number) => void;
  onRemove: (accountId: number) => void;
}

const MENU_PADDING = 8;
const MAX_MENU_HEIGHT = 420;

export const ParticipantContextMenu: React.FC<ParticipantContextMenuProps> = ({
  x, y, participant,
  isOwner, canManage, canModerate,
  canTransferOwnership,   // ✅ NEW
  selectMode,
  onClose, onStartSelectMode, onGrantRole, onRevokeRole,
  onMute1Hour, onMute24Hours, onMutePermanent, onUnmute,
  onBan, onUnban, onTransferOwnership, onRemove,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<{
    left: number;
    top: number;
    ready: boolean;
  }>({
    left: x,
    top: y,
    ready: false,
  });

  // ==================== ĐÓNG KHI ESC ====================
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [onClose]);

  // ==================== TÍNH VỊ TRÍ ====================
  useLayoutEffect(() => {
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const menuWidth = rect.width || 200;
    const menuHeight = rect.height || MAX_MENU_HEIGHT;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Trục X
    let left = x;
    if (left + menuWidth > viewportW - MENU_PADDING) {
      left = x - menuWidth;
    }
    if (left < MENU_PADDING) left = MENU_PADDING;
    if (left + menuWidth > viewportW - MENU_PADDING) {
      left = viewportW - menuWidth - MENU_PADDING;
    }

    // Trục Y
    let top = y;
    const spaceBelow = viewportH - y;
    const spaceAbove = y;

    if (spaceBelow < menuHeight + MENU_PADDING && spaceAbove > spaceBelow) {
      top = y - menuHeight;
    } else if (spaceBelow < menuHeight + MENU_PADDING) {
      top = viewportH - menuHeight - MENU_PADDING;
    }

    if (top < MENU_PADDING) top = MENU_PADDING;
    if (top + menuHeight > viewportH - MENU_PADDING) {
      top = viewportH - menuHeight - MENU_PADDING;
    }

    setPosition({ left, top, ready: true });
  }, [x, y]);

  // ==================== HELPERS ====================
  const getRoleLabel = (role?: ConversationRole) => {
    switch (role) {
      case 'OWNER': return 'Chủ sở hữu';
      case 'ADMIN': return 'Quản trị viên';
      case 'MODERATOR': return 'Điều phối viên';
      default: return 'Thành viên';
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[200] bg-white rounded-xl shadow-2xl border border-slate-200 py-1 min-w-[180px] max-h-[420px] overflow-y-auto"
      style={{
        left: position.left,
        top: position.top,
        visibility: position.ready ? 'visible' : 'hidden',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 border-b border-slate-100">
        <p className="text-xs font-bold text-slate-700 truncate">{participant.username}</p>
        <p className="text-[10px] text-slate-400">{getRoleLabel(participant.roleInConversation)}</p>
      </div>

      {/* "Chọn nhiều" - chỉ hiện khi chưa ở select mode */}
      {!selectMode && (canManage || canModerate) && (
        <>
          <button
            onClick={() => {
              onStartSelectMode(participant);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 transition"
          >
            <FaCheckSquare size={12} className="text-cyan-500" /> Chọn nhiều
          </button>
          <div className="border-t border-slate-100 my-1" />
        </>
      )}

      {/* Các option khác */}
      {!selectMode && (
        <>
          {isOwner && participant.roleInConversation !== 'ADMIN' && (
            <button
              onClick={() => onGrantRole(participant.accountId, 'ADMIN')}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              <FaUserShield size={12} className="text-blue-500" /> Cấp quyền ADMIN
            </button>
          )}

          {canManage && participant.roleInConversation === 'MEMBER' && (
            <button
              onClick={() => onGrantRole(participant.accountId, 'MODERATOR')}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
            >
              <FaUserShield size={12} className="text-emerald-500" /> Cấp quyền MODERATOR
            </button>
          )}

          {(participant.roleInConversation === 'ADMIN' || participant.roleInConversation === 'MODERATOR') && canManage && (
            <button
              onClick={() => onRevokeRole(participant.accountId)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <FaUserCog size={12} className="text-slate-500" /> Thu hồi quyền
            </button>
          )}

          {canModerate && participant.chatStatus !== 'MUTED' && (
            <>
              <button
                onClick={() => onMute1Hour(participant)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"
              >
                <FaMicrophoneSlash size={12} className="text-orange-500" /> Mute 1 giờ
              </button>
              <button
                onClick={() => onMute24Hours(participant)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"
              >
                <FaMicrophoneSlash size={12} className="text-orange-500" /> Mute 24 giờ
              </button>
            </>
          )}

          {canManage && participant.chatStatus !== 'MUTED' && (
            <button
              onClick={() => onMutePermanent(participant)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              <FaBan size={12} /> Mute vĩnh viễn
            </button>
          )}

          {canModerate && participant.chatStatus === 'MUTED' && (
            <button
              onClick={() => onUnmute(participant.accountId)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"
            >
              <FaMicrophoneSlash size={12} className="text-orange-500" /> Unmute
            </button>
          )}

          {canManage && participant.chatStatus !== 'BANNED' && (
            <button
              onClick={() => onBan(participant.accountId)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              <FaBan size={12} /> Ban vĩnh viễn
            </button>
          )}

          {canManage && participant.chatStatus === 'BANNED' && (
            <button
              onClick={() => onUnban(participant.accountId)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <FaBan size={12} className="text-slate-500" /> Unban
            </button>
          )}

          {/* ✅ FIX: Dùng canTransferOwnership thay vì isOwner */}
          {canTransferOwnership && participant.roleInConversation !== 'OWNER' && (
            <button
              onClick={() => onTransferOwnership(participant.accountId)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition"
            >
              <FaCrown size={12} className="text-amber-500" /> Chuyển quyền OWNER
            </button>
          )}

          {canManage && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => onRemove(participant.accountId)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition"
              >
                <FaTrash size={12} /> Xóa khỏi nhóm
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};