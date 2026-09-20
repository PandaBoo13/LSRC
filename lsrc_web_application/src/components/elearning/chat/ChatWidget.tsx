// src/components/elearning/chat/ChatWidget.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FaComments, FaTimes, FaSpinner, FaUserGraduate, FaBook, FaSearch, FaUsers,
  FaUndo,
} from 'react-icons/fa';
import { useChat } from '../../../hooks/useChat';
import { useAuth } from '../../../context/AuthContext';
import { useChatWidget } from '../../../context/ChatContext';
import { useDraggable } from '../../../hooks/useDraggable';
import { ChatWindow } from './ChatWindow';
import { CreateGroupInlineView } from './views/CreateGroupInlineView';
import { Toast } from '../ui/Toast';
import type { ToastMessage } from '../ui/Toast';
import {
  getTeachers,
  getMyCoursesForChat,
  createConversation,
  searchUsers,
  createPrivateConversation,
} from '../../../service/chatService';
import type {
  TeacherContact,
  CourseContact,
  ConversationRole,
  UserSearchResult,
  Conversation,
} from '../../../types/chat.types';

export const ChatWidget: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isOpen, close: closeChat, setTotalUnread } = useChatWidget();
  const [activeTab, setActiveTab] = useState<'conversations' | 'contacts'>('conversations');
  const [teachers, setTeachers] = useState<TeacherContact[]>([]);
  const [myCourses, setMyCourses] = useState<CourseContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [widgetView, setWidgetView] = useState<'list' | 'conversation' | 'createGroup'>('list');

  const [searchUserResults, setSearchUserResults] = useState<UserSearchResult[]>([]);
  const [searchUserLoading, setSearchUserLoading] = useState(false);

  const [startingPrivateChat, setStartingPrivateChat] = useState<number | null>(null);

  const [createGroupPreselected, setCreateGroupPreselected] = useState<
    { accountId: number; name: string }[] | null
  >(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const {
    conversations,
    activeConversation,
    messages,
    loading,
    totalUnread,
    typingUsers,
    currentUserId,
    selectConversation,
    sendMessage,
    sendTyping,
    closeConversation,
    fetchConversations,
    participants,
    handleGrantRole,
    handleRevokeRole,
    handleMuteMember,
    handleUnmuteMember,
    handleBanMember,
    handleUnbanMember,
    handleTransferOwnership,
    handleUpdateMessagePermission,
    getCurrentUserRole,
    deleteMessage,
    editMessage,
    handleUpdateName,
  } = useChat((errorMessage) => {
    console.log('📢 [ChatWidget] Hiển thị lỗi:', errorMessage);
    setToast({ message: errorMessage, type: 'error' });
  });

  // ✅ Đồng bộ totalUnread lên ChatContext (dùng cho badge ở DashboardShell)
  useEffect(() => {
    setTotalUnread(totalUnread);
  }, [totalUnread, setTotalUnread]);

  // ==================== ✅ DRAGGABLE ====================
  const widgetWidth = 400;
  const widgetHeight = 500;

  const defaultPosition = useMemo(() => ({
    x: window.innerWidth - widgetWidth - 24,
    y: window.innerHeight - widgetHeight - 96,
  }), []);

  const {
    position,
    isDragging,
    handleMouseDown: handleDragStart,
    resetPosition,
  } = useDraggable({
    width: widgetWidth,
    height: widgetHeight,
    defaultPosition,
    storageKey: 'chat_widget_position',
  });

  // ==================== ROLE ====================

  const userRole = useMemo<ConversationRole | null>(() => {
    const roleFromHook = getCurrentUserRole();
    if (roleFromHook) return roleFromHook;

    const currentParticipant = participants.find(p => p.accountId === currentUserId);
    if (currentParticipant?.roleInConversation) {
      return currentParticipant.roleInConversation;
    }

    const convParticipant = activeConversation?.participants?.find(
      (p: any) => p.accountId === currentUserId
    );
    if (convParticipant?.roleInConversation) {
      return convParticipant.roleInConversation;
    }

    return null;
  }, [activeConversation, participants, currentUserId, getCurrentUserRole]);

  // ==================== FILTER DATA ====================

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (!searchTerm.trim()) return true;
      const name = conv.name || conv.participants?.map(p => p.username).join(' ') || '';
      const preview = conv.lastMessagePreview || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             preview.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      if (!searchTerm.trim()) return true;
      const fullName = `${teacher.firstName} ${teacher.lastName} ${teacher.username}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  }, [teachers, searchTerm]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (isOpen) {
      closeConversation();
      setWidgetView('list');
      setCreateGroupPreselected(null);
      setActiveTab('conversations');
      setSearchTerm('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      setContactsLoading(true);
      Promise.all([
        getTeachers().catch(() => []),
        getMyCoursesForChat().catch(() => []),
      ]).then(([teachersData, coursesData]) => {
        setTeachers(teachersData);
        setMyCourses(coursesData);
      }).finally(() => {
        setContactsLoading(false);
      });
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (activeTab !== 'contacts') return;
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchUserResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchUserLoading(true);
      try {
        const results = await searchUsers(searchTerm.trim());
        setSearchUserResults(results);
      } catch (err) {
        console.error('Lỗi search users:', err);
        setSearchUserResults([]);
      } finally {
        setSearchUserLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  // ==================== HANDLERS ====================

  const handleSelectConversation = (conv: Conversation) => {
    setWidgetView('conversation');
    selectConversation(conv);
  };

  const handleStartPrivateChat = async (teacher: TeacherContact) => {
    try {
      const conversation = await createConversation({
        conversationType: 'PRIVATE',
        participantIds: [teacher.accountId],
      });
      await fetchConversations();
      handleSelectConversation(conversation);
      setActiveTab('conversations');
    } catch (err) {
      console.error('Lỗi tạo conversation:', err);
    }
  };

  const handleStartPrivateChatFromSearch = async (u: UserSearchResult) => {
    try {
      if (u.existingConversationId) {
        const existingConv = conversations.find(c => c.id === u.existingConversationId);
        if (existingConv) {
          handleSelectConversation(existingConv);
          setActiveTab('conversations');
          setSearchTerm('');
          setSearchUserResults([]);
          return;
        }
      }

      const conversation = await createPrivateConversation(u.accountId);
      await fetchConversations();
      handleSelectConversation(conversation);
      setActiveTab('conversations');
      setSearchTerm('');
      setSearchUserResults([]);
    } catch (err) {
      console.error('Lỗi tạo chat riêng:', err);
      setToast({ message: 'Không thể tạo cuộc trò chuyện', type: 'error' });
    }
  };

  const handleStartPrivateChatFromMember = async (accountId: number) => {
    if (accountId === currentUserId) return;
    if (startingPrivateChat) return;

    setStartingPrivateChat(accountId);
    try {
      const conversation = await createPrivateConversation(accountId);
      await fetchConversations();
      setWidgetView('conversation');
      selectConversation(conversation);
    } catch (err) {
      console.error('Lỗi mở chat riêng:', err);
      setToast({
        message: 'Không thể mở cuộc trò chuyện',
        type: 'error',
      });
    } finally {
      setStartingPrivateChat(null);
    }
  };

  const handleStartCreateGroupWithMember = (
    partnerAccountId: number,
    partnerName?: string
  ) => {
    let name = partnerName;
    if (!name) {
      const partner = participants.find(p => p.accountId === partnerAccountId);
      name = partner?.username || `User ${partnerAccountId}`;
    }

    closeConversation();
    setWidgetView('list');
    setCreateGroupPreselected([
      { accountId: partnerAccountId, name },
    ]);
  };

  const handleOpenCreateGroupEmpty = () => {
    setCreateGroupPreselected(null);
    setWidgetView('createGroup');
  };

  const handleJoinCourseChat = async (course: CourseContact) => {
    try {
      const conversation = await createConversation({
        conversationType: 'COURSE',
        courseId: course.courseId,
      });
      await fetchConversations();
      handleSelectConversation(conversation);
      setActiveTab('conversations');
    } catch (err) {
      console.error('Lỗi tạo course chat:', err);
    }
  };

  const handleBack = () => {
    closeConversation();
    setWidgetView('list');
    setActiveTab('conversations');
    setSearchTerm('');
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${widgetWidth}px`,
            height: `${widgetHeight}px`,
          }}
          className={`z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden ${
            isDragging ? '' : 'animate-slide-up'
          }`}
        >
          {createGroupPreselected ? (
            <CreateGroupInlineView
              myCourses={myCourses}
              preselectedMembers={createGroupPreselected}
              onBack={() => setCreateGroupPreselected(null)}
              onClose={closeChat}
              onCreated={async (conversation) => {
                setCreateGroupPreselected(null);
                await fetchConversations();
                setWidgetView('conversation');
                selectConversation(conversation);
              }}
              onToast={(msg, type) => setToast({ message: msg, type })}
            />
          ) : widgetView === 'createGroup' ? (
            <CreateGroupInlineView
              myCourses={myCourses}
              onBack={() => setWidgetView('list')}
              onClose={closeChat}
              onCreated={async (conversation) => {
                await fetchConversations();
                setWidgetView('conversation');
                selectConversation(conversation);
              }}
              onToast={(msg, type) => setToast({ message: msg, type })}
            />
          ) : (
            <>
              {/* ==================== HEADER XANH — KÉO ĐƯỢC ==================== */}
              <div
                onMouseDown={handleDragStart}
                className={`bg-[#49BBBD] text-white px-4 py-3 flex items-center justify-between shrink-0 ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                title="Giữ và kéo để di chuyển"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">Tin nhắn</h3>
                    <p className="text-xs text-white/70 truncate">
                      {typingUsers.size > 0 ? 'Đang gõ...' : 'Trò chuyện với mọi người'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!activeConversation && (
                    <>
                      <button
                        onClick={() => setActiveTab('conversations')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'conversations' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                      >
                        Đoạn chat
                      </button>
                      <button
                        onClick={() => setActiveTab('contacts')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${activeTab === 'contacts' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                      >
                        Mới
                      </button>
                    </>
                  )}
                  {/* ✅ Nút reset vị trí */}
                  <button
                    onClick={resetPosition}
                    className="p-1 hover:bg-white/20 rounded-lg shrink-0"
                    title="Đưa về vị trí mặc định"
                  >
                    <FaUndo size={13} />
                  </button>
                  <button
                    onClick={closeChat}
                    className="p-1 hover:bg-white/20 rounded-lg ml-1 shrink-0"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              {/* ==================== CONTENT ==================== */}
              {loading && !activeConversation && widgetView === 'list' ? (
                <div className="flex-1 flex items-center justify-center">
                  <FaSpinner className="animate-spin text-[#49BBBD]" size={28} />
                </div>
              ) : widgetView === 'conversation' && activeConversation ? (
                <ChatWindow
                  key={activeConversation.id}
                  conversation={activeConversation}
                  messages={messages}
                  typingUsers={typingUsers}
                  currentUserId={currentUserId}
                  myCourses={myCourses}
                  participants={participants}
                  currentUserRole={userRole}
                  onSend={sendMessage}
                  onTyping={sendTyping}
                  onBack={handleBack}
                  showHeader={true}
                  onGrantRole={handleGrantRole}
                  onRevokeRole={handleRevokeRole}
                  onMuteMember={handleMuteMember}
                  onUnmuteMember={handleUnmuteMember}
                  onBanMember={handleBanMember}
                  onUnbanMember={handleUnbanMember}
                  onTransferOwnership={handleTransferOwnership}
                  onUpdateMessagePermission={handleUpdateMessagePermission}
                  onStartPrivateChat={handleStartPrivateChatFromMember}
                  onStartCreateGroup={handleStartCreateGroupWithMember}
                  onDeleteMessage={deleteMessage}
                  onEditMessage={editMessage}
                  onUpdateName={handleUpdateName}
                />
              ) : activeTab === 'conversations' ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-2 border-b border-slate-100 shrink-0">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm..."
                        className="w-full h-9 rounded-lg border border-slate-200 pl-8 pr-3 text-xs outline-none focus:border-[#49BBBD] bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto chat-scrollbar">
                    {filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <FaComments className="text-3xl mb-2" />
                        <p className="text-sm">
                          {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có cuộc trò chuyện nào'}
                        </p>
                      </div>
                    ) : (
                      filteredConversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 text-left transition"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#49BBBD]/10 text-[#49BBBD] flex items-center justify-center font-bold shrink-0">
                            {conv.conversationType === 'COURSE' ? '📚' : conv.conversationType === 'GROUP' ? '👥' : '👤'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {conv.name || conv.participants?.map(p => p.username).join(', ') || 'Conversation'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {conv.lastMessagePreview || 'Chưa có tin nhắn'}
                            </p>
                          </div>
                          {(conv.unreadCount || 0) > 0 && (
                            <span className="w-6 h-6 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0">
                              {conv.unreadCount || 0}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-2 border-b border-slate-100 shrink-0">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Tìm giảng viên, email, SĐT, username..."
                        className="w-full h-9 rounded-lg border border-slate-200 pl-8 pr-3 text-xs outline-none focus:border-[#49BBBD] bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto chat-scrollbar p-3">
                    {contactsLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <FaSpinner className="animate-spin text-[#49BBBD]" size={24} />
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleOpenCreateGroupEmpty}
                          className="w-full flex items-center justify-center gap-2 p-3 mb-3 rounded-xl bg-[#49BBBD] text-white hover:bg-[#3db0b2] transition shadow-sm"
                        >
                          <FaUsers size={13} />
                          <span className="text-xs font-bold">Tạo nhóm chat mới</span>
                        </button>

                        {searchTerm.trim().length >= 2 && (
                          <div className="mb-4">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                              <FaSearch className="text-[#49BBBD]" /> Kết quả tìm kiếm
                            </h4>
                            {searchUserLoading ? (
                              <div className="flex justify-center py-3">
                                <FaSpinner className="animate-spin text-[#49BBBD]" size={16} />
                              </div>
                            ) : searchUserResults.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">Không tìm thấy user nào</p>
                            ) : (
                              <div className="space-y-1">
                                {searchUserResults.map((u) => (
                                  <div
                                    key={u.accountId}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-[#49BBBD]/10 text-[#49BBBD] flex items-center justify-center font-bold text-xs shrink-0">
                                      {u.avatarUrl ? (
                                        <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        u.fullName?.charAt(0).toUpperCase() || 'U'
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-slate-700 truncate">{u.fullName}</p>
                                      <p className="text-[10px] text-slate-400 truncate">
                                        {u.email || u.phone || `@${u.username}`}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleStartPrivateChatFromSearch(u)}
                                      className="text-[10px] font-bold text-[#49BBBD] hover:bg-[#49BBBD]/10 px-2 py-1 rounded-lg shrink-0"
                                    >
                                      {u.hasPrivateConversation ? '💬 Vào chat' : '💬 Nhắn tin'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mb-4">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                            <FaUserGraduate className="text-[#49BBBD]" /> Giảng viên
                          </h4>
                          {filteredTeachers.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Không có giảng viên nào</p>
                          ) : (
                            <div className="space-y-1">
                              {filteredTeachers.map((teacher) => (
                                <div
                                  key={teacher.accountId}
                                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition"
                                >
                                  <div className="w-8 h-8 rounded-full bg-[#49BBBD]/10 text-[#49BBBD] flex items-center justify-center font-bold text-xs shrink-0">
                                    {teacher.username?.charAt(0).toUpperCase() || 'T'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate">
                                      {teacher.firstName} {teacher.lastName}
                                    </p>
                                    <p className="text-[10px] text-slate-400">@{teacher.username}</p>
                                  </div>
                                  <button
                                    onClick={() => handleStartPrivateChat(teacher)}
                                    className="text-[10px] font-bold text-[#49BBBD] hover:bg-[#49BBBD]/10 px-2 py-1 rounded-lg shrink-0"
                                  >
                                    💬 Nhắn tin
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                            <FaBook className="text-[#49BBBD]" /> Khóa học của tôi
                          </h4>
                          {myCourses.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Chưa đăng ký khóa học nào</p>
                          ) : (
                            <div className="space-y-1">
                              {myCourses.map((course) => (
                                <div
                                  key={course.courseId}
                                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition"
                                >
                                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs shrink-0">
                                    📚
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate">{course.title}</p>
                                    <p className="text-[10px] text-slate-400">Course chat</p>
                                  </div>
                                  <button
                                    onClick={() => handleJoinCourseChat(course)}
                                    className="text-[10px] font-bold text-[#49BBBD] hover:bg-[#49BBBD]/10 px-2 py-1 rounded-lg shrink-0"
                                  >
                                    💬 Vào chat
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};