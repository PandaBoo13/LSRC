// src/components/elearning/chat/views/MembersView.tsx
import React from 'react';
import {
  FaSpinner, FaCheckSquare, FaSquare,
  FaCrown, FaUserShield, FaChevronDown, FaTimes,
} from 'react-icons/fa';
import type { Participant, ConversationRole } from '../../../../../types/chat.types';

interface MembersViewProps {
  participants: Participant[];
  currentUserId?: number;
  isOwner: boolean;
  canManage: boolean;
  canModerate: boolean;
  selectMode: boolean;
  selectedMemberIds: Set<number>;
  loadingMembers: boolean;
  isActionable: (p: Participant) => boolean;
  onExitSelectMode: () => void;
  onToggleSelectMember: (accountId: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkMute: () => void;
  onBulkBan: () => void;
  onBulkRemove: () => void;
  onContextMenu: (e: React.MouseEvent, participant: Participant) => void;

  // ✅ THÊM
  onStartPrivateChat?: (accountId: number) => void | Promise<void>;
}

export const MembersView: React.FC<MembersViewProps> = ({
  participants,
  currentUserId,
  isOwner,
  canManage,
  canModerate,
  selectMode,
  selectedMemberIds,
  loadingMembers,
  isActionable,
  onExitSelectMode,
  onToggleSelectMember,
  onSelectAll,
  onClearSelection,
  onBulkMute,
  onBulkBan,
  onBulkRemove,
  onContextMenu,
  onStartPrivateChat,      // ✅ THÊM
}) => {
  const getRoleLabel = (role?: ConversationRole) => {
    switch (role) {
      case 'OWNER': return 'Chủ sở hữu';
      case 'ADMIN': return 'Quản trị viên';
      case 'MODERATOR': return 'Điều phối viên';
      default: return 'Thành viên';
    }
  };

  return (
    <>
      {/* ✅ Toolbar CHỈ hiện khi đang ở select mode (để bulk action + thoát) */}
      {selectMode && (canManage || canModerate) && (
        <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 shrink-0 flex-wrap">
          <button
            onClick={onExitSelectMode}
            className="px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 bg-slate-200 text-slate-600 hover:bg-slate-300"
            title="Thoát chế độ chọn"
          >
            <FaTimes size={10} />
            Thoát
          </button>

          <button
            onClick={onSelectAll}
            className="px-2 py-1 rounded-lg bg-slate-200 text-slate-600 text-[10px] font-bold hover:bg-slate-300 transition"
          >
            Tất cả
          </button>

          <button
            onClick={onClearSelection}
            className="px-2 py-1 rounded-lg bg-slate-200 text-slate-600 text-[10px] font-bold hover:bg-slate-300 transition"
          >
            Bỏ chọn
          </button>

          {canModerate && (
            <button
              onClick={onBulkMute}
              disabled={selectedMemberIds.size === 0}
              className="px-2 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-bold hover:bg-orange-600 transition disabled:opacity-40"
            >
              Mute 1h ({selectedMemberIds.size})
            </button>
          )}

          {canManage && (
            <button
              onClick={onBulkBan}
              disabled={selectedMemberIds.size === 0}
              className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold hover:bg-rose-600 transition disabled:opacity-40"
            >
              Ban ({selectedMemberIds.size})
            </button>
          )}

          {canManage && (
            <button
              onClick={onBulkRemove}
              disabled={selectedMemberIds.size === 0}
              className="px-2 py-1 rounded-lg bg-slate-500 text-white text-[10px] font-bold hover:bg-slate-600 transition disabled:opacity-40"
            >
              Xóa ({selectedMemberIds.size})
            </button>
          )}
        </div>
      )}

      {/* ✅ Khi KHÔNG ở select mode: hiện hint */}
      {!selectMode && (
        <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 italic shrink-0">
          💡 Nhấp đúp để chat riêng
          {(canManage || canModerate) && ' • Chuột phải để thao tác'}
        </div>
      )}

      {/* Danh sách */}
      <div className="flex-1 overflow-y-auto p-2 bg-slate-50 chat-scrollbar">
        {loadingMembers ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-[#49BBBD]" size={20} />
          </div>
        ) : participants.map((participant) => {
          const isSelf = participant.accountId === currentUserId;
          const isTargetOwner = participant.roleInConversation === 'OWNER';
          const isActionableMember = isActionable(participant);
          const isSelected = selectedMemberIds.has(participant.accountId);

          return (
            <div
              key={participant.accountId}
              onContextMenu={(e) => onContextMenu(e, participant)}
              onClick={() => {
                if (selectMode && isActionableMember) {
                  onToggleSelectMember(participant.accountId);
                }
              }}
              // ✅ THÊM: double-click để chat riêng
              onDoubleClick={() => {
                // Không cho double-click chính mình
                if (isSelf) return;
                // Không hoạt động khi đang select mode
                if (selectMode) return;
                // Gọi handler
                onStartPrivateChat?.(participant.accountId);
              }}
              title={isSelf ? undefined : 'Nhấp đúp để mở chat riêng'}
              className={`flex items-center gap-2.5 p-2.5 mb-1 rounded-xl border transition ${
                isSelected ? 'bg-[#49BBBD]/10 border-[#49BBBD] shadow-sm' : 'bg-white border-slate-100 hover:bg-slate-50'
              } ${selectMode && isActionableMember ? 'cursor-pointer' : ''} ${
                isSelf || (isTargetOwner && !isOwner) ? 'opacity-60' : ''
              }`}
            >
              {selectMode && isActionableMember && (
                <div className="shrink-0">
                  {isSelected ? (
                    <FaCheckSquare size={14} className="text-[#49BBBD]" />
                  ) : (
                    <FaSquare size={14} className="text-slate-300" />
                  )}
                </div>
              )}

              <div className="w-8 h-8 rounded-full bg-[#49BBBD]/10 text-[#49BBBD] flex items-center justify-center font-bold text-xs shrink-0">
                {participant.username?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate flex items-center gap-1">
                  {participant.username}
                  {isSelf && <span className="text-[10px] text-slate-400 font-normal">(Tôi)</span>}
                  {participant.roleInConversation === 'OWNER' && <FaCrown size={10} className="text-amber-500 shrink-0" />}
                  {participant.roleInConversation === 'ADMIN' && <FaUserShield size={10} className="text-blue-500 shrink-0" />}
                  {participant.roleInConversation === 'MODERATOR' && <FaUserShield size={10} className="text-emerald-500 shrink-0" />}
                </p>
                <p className="text-[10px] text-slate-400">
                  {getRoleLabel(participant.roleInConversation)}
                  {participant.chatStatus === 'MUTED' && ' • Đang bị mute'}
                  {participant.chatStatus === 'BANNED' && ' • Đã bị cấm'}
                </p>
              </div>

              {!selectMode && isActionableMember && (canManage || canModerate) && (
                <FaChevronDown size={10} className="text-slate-300 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};