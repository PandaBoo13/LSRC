// src/components/elearning/chat/ChatWindowHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  FaArrowLeft, FaEllipsisV, FaUsers, FaUserPlus, FaLock, FaUnlock,
  FaCheck, FaTimes as FaTimesIcon,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { Participant, MessagePermission } from '../../../types/chat.types';

interface ChatWindowHeaderProps {
  viewMode: 'chat' | 'members' | 'addMembers';
  conversationName: string;
  participantCount: number;
  selectMode: boolean;
  selectedCount: number;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  onBackToList?: () => void;
  onBackToChat: () => void;
  onShowMembers: () => void;
  onShowAddMembers: () => void;
  canManage: boolean;
  messagePermission?: MessagePermission;
  onToggleMessagePermission?: () => void;
  isPrivate?: boolean;
  onUpdateName?: (newName: string) => Promise<void> | void;
}

export const ChatWindowHeader: React.FC<ChatWindowHeaderProps> = ({
  viewMode,
  conversationName,
  participantCount,
  selectMode,
  selectedCount,
  showMenu,
  setShowMenu,
  onBackToList,
  onBackToChat,
  onShowMembers,
  onShowAddMembers,
  canManage,
  messagePermission,
  onToggleMessagePermission,
  isPrivate = false,
  onUpdateName,
}) => {
  const { t } = useTranslation();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [editingName]);

  const handleStartEdit = () => {
    if (isPrivate || !onUpdateName) return;
    setNameInput(conversationName);
    setEditingName(true);
  };

  const handleCancelEdit = () => {
    setEditingName(false);
    setNameInput('');
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === conversationName) {
      handleCancelEdit();
      return;
    }

    setSavingName(true);
    try {
      await onUpdateName?.(trimmed);
      setEditingName(false);
    } catch (err) {
      console.error('Lỗi đổi tên:', err);
    } finally {
      setSavingName(false);
    }
  };

  const renderBackButton = () => {
    if (viewMode !== 'chat') {
      return (
        <button
          onClick={onBackToChat}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition shrink-0"
          title={t('chat.backToChat')}
        >
          <FaArrowLeft size={13} />
        </button>
      );
    }
    if (onBackToList) {
      return (
        <button
          onClick={onBackToList}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition shrink-0"
          title={t('chat.backToList')}
        >
          <FaArrowLeft size={13} />
        </button>
      );
    }
    return null;
  };

  const renderTitle = () => {
    switch (viewMode) {
      case 'chat':
        return (
          <>
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  maxLength={100}
                  disabled={savingName}
                  className="flex-1 min-w-0 text-sm font-bold text-slate-800 bg-white border border-cyan-400 rounded px-2 py-0.5 outline-none"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded shrink-0"
                  title="Lưu"
                >
                  <FaCheck size={11} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={savingName}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded shrink-0"
                  title="Hủy"
                >
                  <FaTimesIcon size={11} />
                </button>
              </div>
            ) : (
              <h4
                className={`font-bold text-sm text-slate-800 truncate flex items-center gap-1.5 ${
                  !isPrivate && onUpdateName ? 'cursor-pointer hover:text-cyan-600' : ''
                }`}
                onDoubleClick={handleStartEdit}
                title={!isPrivate && onUpdateName ? 'Nháy đúp để đổi tên' : undefined}
              >
                {conversationName}
                {messagePermission === 'ADMINS_ONLY' && (
                  <FaLock
                    size={10}
                    className="text-amber-500 shrink-0"
                    title={t('chat.messagePermission.onlyAdminsCanChat')}
                  />
                )}
              </h4>
            )}
            {isPrivate ? (
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Đang hoạt động
              </p>
            ) : (
              <p className="text-[11px] text-slate-500">
                {participantCount} {t('chat.memberCount')}
              </p>
            )}
          </>
        );

      case 'members':
        if (isPrivate) {
          return (
            <>
              <h4 className="font-bold text-sm text-slate-800">Thông tin</h4>
              <p className="text-[11px] text-slate-500">Cuộc trò chuyện riêng tư</p>
            </>
          );
        }
        return (
          <>
            {/* ✅ Tên nhóm làm title chính */}
            <h4 className="font-bold text-sm text-slate-800 truncate">
              {conversationName}
            </h4>
            {/* ✅ Subtitle: số thành viên + select mode */}
            <p className="text-[11px] text-slate-500">
              {t('chat.members')} ({participantCount})
              {selectMode && ` • ${t('chat.selectedMembersCount', { count: selectedCount })}`}
            </p>
          </>
        );

      case 'addMembers':
        return (
          <>
            <h4 className="font-bold text-sm text-slate-800">{t('chat.addMembers')}</h4>
            <p className="text-[11px] text-slate-500">
              {t('chat.selectMembersHint') || 'Chọn từ khóa học hoặc tìm kiếm'}
            </p>
          </>
        );
    }
  };

  const isAdminsOnly = messagePermission === 'ADMINS_ONLY';

  return (
    <div className="px-3 py-2.5 border-b border-slate-200 flex items-center gap-2 shrink-0 bg-white z-10">
      {renderBackButton()}

      <div className="flex-1 min-w-0">{renderTitle()}</div>

      {(viewMode === 'chat' || viewMode === 'members') && (
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"
            title={t('common.options')}
          >
            <FaEllipsisV size={13} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 min-w-[220px]">
                {viewMode === 'chat' && (
                  <button
                    onClick={onShowMembers}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <FaUsers size={12} className="text-slate-500" />
                    {isPrivate ? 'Xem thông tin' : t('chat.manageSettings')}
                  </button>
                )}

                {viewMode === 'members' && canManage && onToggleMessagePermission && !isPrivate && (
                  <>
                    <button
                      onClick={() => {
                        onToggleMessagePermission();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      {isAdminsOnly ? (
                        <>
                          <FaUnlock size={12} className="text-emerald-500" />
                          {t('chat.messagePermission.allowEveryone')}
                        </>
                      ) : (
                        <>
                          <FaLock size={12} className="text-amber-500" />
                          {t('chat.messagePermission.restrictToAdmins')}
                        </>
                      )}
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                  </>
                )}

                {viewMode === 'members' && canManage && !isPrivate && (
                  <button
                    onClick={onShowAddMembers}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <FaUserPlus size={12} className="text-[#49BBBD]" /> {t('chat.addMembers')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};