// src/hooks/useChat.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { websocketService } from '../service/websocketService';
import { 
  getMessages, 
  getMyConversations,
  getParticipants,
  addParticipants,
  removeParticipant,
  grantRole,
  revokeRole,
  muteMember,
  unmuteMember,
  banMember,
  unbanMember,
  transferOwnership,
  updateMessagePermission,
  updateConversationName,                 // ✅ THÊM
  deleteMessage as deleteMessageApi,
  editMessage as editMessageApi,
} from '../service/chatService';
import { useAuth } from '../context/AuthContext';
import type { 
  Conversation, 
  Message, 
  Participant,
  ConversationRole,
  MessagePermission,
} from '../types/chat.types';

const PAGE_SIZE = 20;

// ✅ Các event liên quan đến role/permission → cần refetch participants + force re-render
const ROLE_CHANGING_EVENTS = [
  'GRANT_ROLE',
  'REVOKE_ROLE',
  'TRANSFER_OWNER',
  'BAN',
  'UNBAN',
  'MUTE',
  'UNMUTE',
] as const;

export const useChat = (onError?: (message: string) => void) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const activeConversationRef = useRef<Conversation | null>(null);
  const subscribedConversationsRef = useRef<Set<number>>(new Set());
  const receivedMessageIdsRef = useRef<Set<number>>(new Set());

  // ==================== HELPER: DEDUPLICATE + SORT MESSAGES ====================
  
  const addMessageToList = useCallback((prev: Message[], newMessage: Message): Message[] => {
    if (receivedMessageIdsRef.current.has(newMessage.id)) {
      console.log(`⚠️ [Chat] Message ${newMessage.id} đã nhận trước đó, bỏ qua`);
      return prev;
    }
    
    if (prev.some(m => m.id === newMessage.id)) {
      console.log(`⚠️ [Chat] Message ${newMessage.id} đã có trong state, bỏ qua`);
      return prev;
    }
    
    receivedMessageIdsRef.current.add(newMessage.id);
    
    return [...prev, newMessage].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, []);

  // ==================== WEBSOCKET CONNECTION ====================
  
  useEffect(() => {
    if (isAuthenticated && user) {
      websocketService.connect();
      return () => {
        websocketService.disconnect();
        subscribedConversationsRef.current.clear();
        receivedMessageIdsRef.current.clear();
      };
    }
  }, [isAuthenticated, user]);

  // ==================== SUBSCRIBE WEBSOCKET ERRORS ====================
  
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const unsubscribe = websocketService.subscribeToErrors((error) => {
      console.error('❌ [Chat] Lỗi từ server:', error);
      
      if (onError) {
        onError(error.message || 'Có lỗi xảy ra');
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, user, onError]);

  // ==================== SUBSCRIBE TO CONVERSATION ====================
  
  const subscribeToConversation = useCallback((conversationId: number) => {
    if (subscribedConversationsRef.current.has(conversationId)) {
      return;
    }
    
    subscribedConversationsRef.current.add(conversationId);
    console.log(`🔔 [Chat] Subscribe conversation ${conversationId}`);
    
    // ========== SUBSCRIBE TIN NHẮN ==========
    websocketService.subscribeToConversation(conversationId, (message: Message) => {
      console.log(`📥 [Chat] Nhận message id=${message.id} trong conv ${conversationId}`);
      
      const isActiveConv = activeConversationRef.current?.id === conversationId;
      
      if (isActiveConv) {
        setConversations(prev => prev.map(c => 
          c.id === conversationId 
            ? { 
                ...c, 
                lastMessagePreview: message.content,
                lastMessageAt: message.createdAt,
                lastMessageId: message.id,
                unreadCount: 0,
              }
            : c
        ));
        
        setMessages(prev => addMessageToList(prev, message));
        websocketService.sendRead(conversationId, message.id);
        
      } else {
        setConversations(prev => {
          const updated = prev.map(c => 
            c.id === conversationId 
              ? { 
                  ...c, 
                  lastMessagePreview: message.content,
                  lastMessageAt: message.createdAt,
                  lastMessageId: message.id,
                  unreadCount: (c.unreadCount || 0) + 1,
                }
              : c
          );
          
          const newTotal = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setTotalUnread(newTotal);
          
          return updated;
        });
      }
    });

    // ========== SUBSCRIBE PERMISSION / ROLE EVENTS ==========
    websocketService.subscribeToPermission(conversationId, (data) => {
      console.log(`📡 [Permission] Nhận update conv ${conversationId}:`, data);

      // ----------------------------------------
      // 1. Xử lý MESSAGE_PERMISSION_CHANGED
      // ----------------------------------------
      if (data?.action === 'MESSAGE_PERMISSION_CHANGED') {
        const newPermission = data.permission as MessagePermission;
        console.log(`🔧 [Chat] Message permission changed → ${newPermission}`);

        setConversations(prev => prev.map(c =>
          c.id === conversationId
            ? { ...c, messagePermission: newPermission }
            : c
        ));

        if (activeConversationRef.current?.id === conversationId) {
          const updated = {
            ...activeConversationRef.current,
            messagePermission: newPermission,
          };
          activeConversationRef.current = updated;
          setActiveConversation(updated);
        }
      }

      // ----------------------------------------
      // 2. Refetch participants cho role events
      // ----------------------------------------
      const isRoleChangingEvent = ROLE_CHANGING_EVENTS.includes(data?.action as any);

      if (isRoleChangingEvent && activeConversationRef.current?.id === conversationId) {
        console.log(`🔄 [Permission] Refetch participants conv ${conversationId} do ${data.action}`);

        getParticipants(conversationId)
          .then((newParticipants) => {
            setParticipants(newParticipants);

            if (activeConversationRef.current?.id === conversationId) {
              const updated = { ...activeConversationRef.current };
              activeConversationRef.current = updated;
              setActiveConversation(updated);
            }

            console.log(`✅ [Permission] Đã refresh participants conv ${conversationId}`);
          })
          .catch((err) => {
            console.error('❌ [Permission] Lỗi refetch participants:', err);
          });
      }
    });

    // ========== ✅ SUBSCRIBE MESSAGE DELETED ==========
    websocketService.subscribeToDelete(conversationId, (data: { messageId: number }) => {
      console.log(`🗑️ [WS] Message ${data.messageId} đã bị xóa (conv ${conversationId})`);
      setMessages(prev => prev.filter(m => m.id !== data.messageId));
      receivedMessageIdsRef.current.delete(data.messageId);
    });

    // ========== ✅ SUBSCRIBE MESSAGE EDITED ==========
    websocketService.subscribeToEdit(conversationId, (updated: Message) => {
      console.log(`✏️ [WS] Message ${updated.id} đã được sửa (conv ${conversationId})`);
      setMessages(prev =>
        prev.map(m => (m.id === updated.id ? { ...m, ...updated } : m))
      );
    });

  }, [addMessageToList]);

  // ==================== LOAD CONVERSATIONS ====================
  
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const data = await getMyConversations();
      setConversations(data);
      
      const unread = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setTotalUnread(unread);
      
      data.forEach(conv => {
        subscribeToConversation(conv.id);
      });
      
      console.log(`✅ Load ${data.length} conversations, đã subscribe tất cả`);
    } catch (err) {
      console.error('Lỗi tải conversations:', err);
    }
  }, [isAuthenticated, user, subscribeToConversation]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();
    }
  }, [isAuthenticated, user, fetchConversations]);

  // ==================== SUBSCRIBE USER CONVERSATIONS ====================

  useEffect(() => {
    if (!isAuthenticated || !user?.idAccount) return;

    const timer = setTimeout(() => {
      websocketService.subscribeToUserConversations(user.idAccount, () => {
        console.log('🔄 [UserConv] Refetch conversations do có event mới');
        fetchConversations();
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.idAccount]);

  // ==================== SELECT CONVERSATION ====================
  
  const selectConversation = useCallback(async (conversation: Conversation) => {
    if (!isAuthenticated || !user) return;

    setActiveConversation(conversation);
    activeConversationRef.current = conversation;
    setLoading(true);
    
    setCurrentPage(0);
    setHasMoreMessages(true);
    receivedMessageIdsRef.current.clear();

    subscribeToConversation(conversation.id);

    const unreadBefore = conversation.unreadCount || 0;
    
    setConversations(prev =>
      prev.map(c =>
        c.id === conversation.id ? { ...c, unreadCount: 0 } : c
      )
    );
    
    if (unreadBefore > 0) {
      setTotalUnread(prev => Math.max(0, prev - unreadBefore));
    }

    try {
      const participantsData = await getParticipants(conversation.id);
      setParticipants(participantsData);

      const messagesData = await getMessages(conversation.id, 0, PAGE_SIZE);
      
      const sortedMessages = [...messagesData].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      sortedMessages.forEach(m => receivedMessageIdsRef.current.add(m.id));
      
      setMessages(sortedMessages);
      setHasMoreMessages(messagesData.length === PAGE_SIZE);
      
      console.log(`✅ Load ${sortedMessages.length} tin nhắn mới nhất`);

      const lastMessage = sortedMessages[sortedMessages.length - 1];
      if (lastMessage) {
        websocketService.sendRead(conversation.id, lastMessage.id);
      }
      
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
      
      if (unreadBefore > 0) {
        setConversations(prev =>
          prev.map(c =>
            c.id === conversation.id ? { ...c, unreadCount: unreadBefore } : c
          )
        );
        setTotalUnread(prev => prev + unreadBefore);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, subscribeToConversation]);

  // ==================== LOAD OLDER MESSAGES ====================
  
  const loadOlderMessages = useCallback(async () => {
    if (!activeConversationRef.current || !hasMoreMessages || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = currentPage + 1;
      const olderMessages = await getMessages(
        activeConversationRef.current.id, 
        nextPage, 
        PAGE_SIZE
      );
      
      if (olderMessages.length > 0) {
        const sortedOlder = [...olderMessages].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = sortedOlder.filter(m => !existingIds.has(m.id));
          
          newMessages.forEach(m => receivedMessageIdsRef.current.add(m.id));
          
          return [...newMessages, ...prev];
        });
        
        setCurrentPage(nextPage);
        console.log(`✅ Load thêm ${sortedOlder.length} tin nhắn cũ (page ${nextPage})`);
      }
      
      if (olderMessages.length < PAGE_SIZE) {
        setHasMoreMessages(false);
        console.log('✅ Đã load hết tin nhắn');
      }
    } catch (err) {
      console.error('Lỗi tải tin nhắn cũ:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMoreMessages, isLoadingMore]);

  // ==================== PARTICIPANTS ====================
  
  const fetchParticipants = useCallback(async (conversationId: number) => {
    setLoadingParticipants(true);
    try {
      const data = await getParticipants(conversationId);
      setParticipants(data);

      if (activeConversationRef.current?.id === conversationId) {
        const updated = { ...activeConversationRef.current };
        activeConversationRef.current = updated;
        setActiveConversation(updated);
      }
    } catch (err) {
      console.error('Lỗi tải participants:', err);
    } finally {
      setLoadingParticipants(false);
    }
  }, []);

  // ==================== MESSAGE ACTIONS ====================
  
  const sendMessage = useCallback((content: string) => {
    if (!activeConversationRef.current || !content.trim()) return;
    const conversationId = activeConversationRef.current.id;
    websocketService.sendMessage(conversationId, content.trim());
    console.log(`📤 [Chat] Đã gửi message: ${content}`);
  }, []);

  const sendTyping = useCallback(() => {
    if (!activeConversationRef.current) return;
    websocketService.sendTyping(activeConversationRef.current.id);
  }, []);

  // ✅ Xóa/Thu hồi tin nhắn — optimistic update + gọi API
  const deleteMessage = useCallback(async (messageId: number) => {
    const backup = messages;
    setMessages(prev => prev.filter(m => m.id !== messageId));
    receivedMessageIdsRef.current.delete(messageId);

    try {
      await deleteMessageApi(messageId);
      console.log(`🗑️ [Chat] Đã xóa message ${messageId}`);
    } catch (err) {
      console.error('❌ [Chat] Lỗi xóa message:', err);
      setMessages(backup);
      throw err;
    }
  }, [messages]);

  // ✅ Chỉnh sửa tin nhắn — optimistic update + gọi API
  const editMessage = useCallback(async (messageId: number, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) throw new Error('Nội dung không được để trống');

    const backup = messages;
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? { ...m, content: trimmed, isEdited: true, updatedAt: new Date().toISOString() }
          : m
      )
    );

    try {
      const updated = await editMessageApi(messageId, trimmed);
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, ...updated } : m))
      );
      console.log(`✏️ [Chat] Đã sửa message ${messageId}`);
      return updated;
    } catch (err) {
      console.error('❌ [Chat] Lỗi sửa message:', err);
      setMessages(backup);
      throw err;
    }
  }, [messages]);

  // ✅ NEW: Đổi tên nhóm chat — optimistic update + gọi API
  const handleUpdateName = useCallback(async (newName: string) => {
    const convId = activeConversationRef.current?.id;
    if (!convId) return;

    const trimmed = newName.trim();
    if (!trimmed) throw new Error('Tên nhóm không được để trống');

    // Optimistic update
    const backup = activeConversationRef.current;
    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, name: trimmed } : c
    ));
    if (activeConversationRef.current) {
      const updated = { ...activeConversationRef.current, name: trimmed };
      activeConversationRef.current = updated;
      setActiveConversation(updated);
    }

    try {
      await updateConversationName(convId, trimmed);
      console.log(`✏️ [Chat] Đã đổi tên nhóm thành "${trimmed}"`);
    } catch (err) {
      console.error('❌ Lỗi đổi tên:', err);
      // Rollback
      if (backup) {
        activeConversationRef.current = backup;
        setActiveConversation(backup);
      }
      throw err;
    }
  }, []);

  // ==================== PARTICIPANT MANAGEMENT ====================
  
  const handleAddParticipants = useCallback(async (accountIds: number[]) => {
    if (!activeConversationRef.current) return;
    
    try {
      const updatedParticipants = await addParticipants(
        activeConversationRef.current.id,
        { accountIds }
      );
      setParticipants(updatedParticipants);
    } catch (err) {
      console.error('Lỗi thêm thành viên:', err);
      throw err;
    }
  }, []);

  const handleRemoveParticipant = useCallback(async (accountId: number) => {
    if (!activeConversationRef.current) return;
    
    try {
      await removeParticipant(activeConversationRef.current.id, accountId);
      setParticipants(prev => prev.filter(p => p.accountId !== accountId));
    } catch (err) {
      console.error('Lỗi xóa thành viên:', err);
      throw err;
    }
  }, []);

  // ==================== PERMISSION MANAGEMENT ====================
  
  const handleGrantRole = useCallback(async (
    targetAccountId: number,
    role: ConversationRole
  ) => {
    if (!activeConversationRef.current) return;
    
    try {
      await grantRole(activeConversationRef.current.id, targetAccountId, role);
      await fetchParticipants(activeConversationRef.current.id);
    } catch (err) {
      console.error('Lỗi gán quyền:', err);
      throw err;
    }
  }, [fetchParticipants]);

  const handleRevokeRole = useCallback(async (targetAccountId: number) => {
    if (!activeConversationRef.current) return;
    
    try {
      await revokeRole(activeConversationRef.current.id, targetAccountId);
      await fetchParticipants(activeConversationRef.current.id);
    } catch (err) {
      console.error('Lỗi thu hồi quyền:', err);
      throw err;
    }
  }, [fetchParticipants]);

  const handleMuteMember = useCallback(async (
    targetAccountId: number,
    mutedUntil: string | null,
    reason?: string
  ) => {
    if (!activeConversationRef.current) return;
    
    try {
      await muteMember(activeConversationRef.current.id, targetAccountId, {
        mutedUntil,
        reason,
      });
      await fetchParticipants(activeConversationRef.current.id);
    } catch (err) {
      console.error('Lỗi mute:', err);
      throw err;
    }
  }, [fetchParticipants]);

  const handleUnmuteMember = useCallback(async (targetAccountId: number) => {
    if (!activeConversationRef.current) return;
    
    try {
      await unmuteMember(activeConversationRef.current.id, targetAccountId);
      await fetchParticipants(activeConversationRef.current.id);
    } catch (err) {
      console.error('Lỗi unmute:', err);
      throw err;
    }
  }, [fetchParticipants]);

  const handleBanMember = useCallback(async (
    targetAccountId: number,
    reason?: string
  ) => {
    if (!activeConversationRef.current) return;
    
    try {
      await banMember(activeConversationRef.current.id, targetAccountId, { reason });
      await fetchParticipants(activeConversationRef.current.id);
    } catch (err) {
      console.error('Lỗi ban:', err);
      throw err;
    }
  }, [fetchParticipants]);

  const handleUnbanMember = useCallback(async (targetAccountId: number) => {
    if (!activeConversationRef.current) return;
    
    try {
      await unbanMember(activeConversationRef.current.id, targetAccountId);
      await fetchParticipants(activeConversationRef.current.id);
    } catch (err) {
      console.error('Lỗi unban:', err);
      throw err;
    }
  }, [fetchParticipants]);

  const handleTransferOwnership = useCallback(async (newOwnerAccountId: number) => {
    if (!activeConversationRef.current) return;
    
    try {
      await transferOwnership(activeConversationRef.current.id, newOwnerAccountId);
      await fetchParticipants(activeConversationRef.current.id);
    } catch (err) {
      console.error('Lỗi chuyển quyền:', err);
      throw err;
    }
  }, [fetchParticipants]);

  // ==================== MESSAGE PERMISSION ====================

  const handleUpdateMessagePermission = useCallback(async (
    permission: MessagePermission
  ) => {
    if (!activeConversationRef.current) return;

    const conversationId = activeConversationRef.current.id;

    try {
      await updateMessagePermission(conversationId, permission);

      setConversations(prev => prev.map(c =>
        c.id === conversationId
          ? { ...c, messagePermission: permission }
          : c
      ));

      if (activeConversationRef.current) {
        const updated = {
          ...activeConversationRef.current,
          messagePermission: permission,
        };
        activeConversationRef.current = updated;
        setActiveConversation(updated);
      }

      console.log(`✅ [Chat] Đã đổi message permission thành ${permission}`);
    } catch (err) {
      console.error('❌ Lỗi đổi message permission:', err);
      throw err;
    }
  }, []);

  // ==================== HELPERS ====================

  const getCurrentUserRole = useCallback((): ConversationRole | null => {
    if (!activeConversation || !user) return null;

    const currentParticipant = participants.find(p => p.accountId === user.idAccount);
    if (currentParticipant?.roleInConversation) {
      return currentParticipant.roleInConversation;
    }

    const convParticipant = activeConversation.participants?.find(
      (p: any) => p.accountId === user.idAccount
    );
    if (convParticipant?.roleInConversation) {
      return convParticipant.roleInConversation;
    }

    return null;
  }, [activeConversation, participants, user]);

  const canManageMembers = useCallback((): boolean => {
    const role = getCurrentUserRole();
    return role === 'OWNER' || role === 'ADMIN';
  }, [getCurrentUserRole]);

  const canModerate = useCallback((): boolean => {
    const role = getCurrentUserRole();
    return role === 'OWNER' || role === 'ADMIN' || role === 'MODERATOR';
  }, [getCurrentUserRole]);

  const isOwner = useCallback((): boolean => {
    return getCurrentUserRole() === 'OWNER';
  }, [getCurrentUserRole]);

  const canSendMessageInConversation = useMemo((): boolean => {
    if (!activeConversation) return false;

    if (activeConversation.messagePermission !== 'ADMINS_ONLY') return true;

    const role = getCurrentUserRole();
    return role === 'OWNER' || role === 'ADMIN' || role === 'MODERATOR';
  }, [activeConversation, getCurrentUserRole]);

  const inputDisabledReason = useMemo((): string | undefined => {
    if (canSendMessageInConversation) return undefined;

    if (activeConversation?.messagePermission === 'ADMINS_ONLY') {
      return 'Chỉ trưởng/phó nhóm được nhắn tin vào nhóm này';
    }
    return 'Bạn không có quyền gửi tin nhắn';
  }, [canSendMessageInConversation, activeConversation]);

  // ==================== CLOSE CONVERSATION ====================
  
  const closeConversation = useCallback(() => {
    setActiveConversation(null);
    activeConversationRef.current = null;
    setMessages([]);
    setParticipants([]);
    setTypingUsers(new Set());
    setCurrentPage(0);
    setHasMoreMessages(true);
    setIsLoadingMore(false);
    receivedMessageIdsRef.current.clear();
  }, []);

  return {
    conversations,
    activeConversation,
    messages,
    participants,
    loading,
    loadingParticipants,
    totalUnread,
    typingUsers,
    currentUserId: user?.idAccount || 0,
    hasMoreMessages,
    isLoadingMore,
    fetchConversations,
    selectConversation,
    closeConversation,
    sendMessage,
    sendTyping,
    deleteMessage,
    editMessage,
    handleUpdateName,               // ✅ THÊM
    loadOlderMessages,
    fetchParticipants,
    handleAddParticipants,
    handleRemoveParticipant,
    handleGrantRole,
    handleRevokeRole,
    handleMuteMember,
    handleUnmuteMember,
    handleBanMember,
    handleUnbanMember,
    handleTransferOwnership,
    handleUpdateMessagePermission,
    getCurrentUserRole,
    canManageMembers,
    canModerate,
    isOwner,
    canSendMessageInConversation,
    inputDisabledReason,
  };
};