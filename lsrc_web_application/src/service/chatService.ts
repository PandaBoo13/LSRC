// src/service/chatService.ts
import api from '../api/axiosConfig';
import type {
  Conversation,
  Message,
  Participant,
  CreateConversationRequest,
  SendMessageRequest,
  AddParticipantRequest,
  TeacherContact,
  CourseContact,
  StudentContact,
  ConversationRole,
  MuteMemberRequest,
  BanMemberRequest,
  MessagePermission,
  UserSearchResult,        // ✅ THÊM
} from '../types/chat.types';
import type { RequestResponse } from '../types/course.types';

// ==================== CONTACTS ====================

export const getTeachers = async (): Promise<TeacherContact[]> => {
  const response = await api.get<RequestResponse<TeacherContact[]>>('/chat/contacts/teachers');
  return response.data.data;
};

export const getMyCoursesForChat = async (): Promise<CourseContact[]> => {
  const response = await api.get<RequestResponse<CourseContact[]>>('/chat/contacts/courses');
  return response.data.data;
};

export const getStudentsByCourse = async (courseId: number): Promise<StudentContact[]> => {
  const response = await api.get<RequestResponse<StudentContact[]>>(
    `/chat/contacts/courses/${courseId}/students`
  );
  return response.data.data;
};

// ==================== ✅ SEARCH USER ====================

/**
 * Tìm user theo email / số điện thoại / username để chat
 * GET /api/chat/users/search?keyword=...
 */
export const searchUsers = async (keyword: string): Promise<UserSearchResult[]> => {
  if (!keyword || keyword.trim().length < 2) return [];

  const response = await api.get<RequestResponse<UserSearchResult[]>>(
    '/chat/users/search',
    { params: { keyword: keyword.trim() } }
  );
  return response.data.data;
};

// ==================== CONVERSATION ====================

export const createConversation = async (
  data: CreateConversationRequest
): Promise<Conversation> => {
  const response = await api.post<RequestResponse<Conversation>>('/chat/conversations', data);
  return response.data.data;
};

// ==================== ✅ TẠO CHAT RIÊNG / NHÓM ====================

/**
 * Tạo chat riêng với 1 user
 * POST /api/chat/conversations
 */
export const createPrivateConversation = async (
  otherAccountId: number
): Promise<Conversation> => {
  const response = await api.post<RequestResponse<Conversation>>(
    '/chat/conversations',
    {
      conversationType: 'PRIVATE',
      participantIds: [otherAccountId],
    }
  );
  return response.data.data;
};

/**
 * Tạo nhóm chat với nhiều user
 * POST /api/chat/conversations
 */
export const createGroupConversation = async (
  name: string,
  memberIds: number[]
): Promise<Conversation> => {
  const response = await api.post<RequestResponse<Conversation>>(
    '/chat/conversations',
    {
      conversationType: 'GROUP',
      name: name.trim(),
      participantIds: memberIds,
    }
  );
  return response.data.data;
};

export const getMyConversations = async (
  page: number = 0,
  size: number = 20
): Promise<Conversation[]> => {
  const response = await api.get<RequestResponse<Conversation[]>>('/chat/conversations', {
    params: { page, size },
  });
  return response.data.data;
};

export const getConversationById = async (conversationId: number): Promise<Conversation> => {
  const response = await api.get<RequestResponse<Conversation>>(
    `/chat/conversations/${conversationId}`
  );
  return response.data.data;
};

/**
 * ✅ NEW: Đổi quyền gửi tin nhắn trong conversation
 * PUT /chat/conversations/{id}/message-permission
 */
export const updateMessagePermission = async (
  conversationId: number,
  permission: MessagePermission
): Promise<void> => {
  await api.put(`/chat/conversations/${conversationId}/message-permission`, {
    permission,
  });
};

// ==================== PARTICIPANT ====================

export const getParticipants = async (conversationId: number): Promise<Participant[]> => {
  const response = await api.get<RequestResponse<Participant[]>>(
    `/chat/conversations/${conversationId}/participants`
  );
  return response.data.data;
};

export const addParticipants = async (
  conversationId: number,
  data: AddParticipantRequest
): Promise<Participant[]> => {
  const response = await api.post<RequestResponse<Participant[]>>(
    `/chat/conversations/${conversationId}/participants`,
    data
  );
  return response.data.data;
};

export const removeParticipant = async (
  conversationId: number,
  accountId: number
): Promise<void> => {
  await api.delete(`/chat/conversations/${conversationId}/participants/${accountId}`);
};

// ==================== MESSAGE ====================

export const getMessages = async (
  conversationId: number,
  page: number = 0,
  size: number = 20
): Promise<Message[]> => {
  const response = await api.get<RequestResponse<Message[]>>(
    `/chat/conversations/${conversationId}/messages`,
    { params: { page, size } }
  );
  
  // ✅ FIX: Sắp xếp tin nhắn cũ → mới (tăng dần theo createdAt)
  const messages = response.data.data;
  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  
  return sortedMessages;
};

export const sendMessage = async (
  conversationId: number,
  data: SendMessageRequest
): Promise<Message> => {
  const response = await api.post<RequestResponse<Message>>(
    `/chat/conversations/${conversationId}/messages`,
    data
  );
  return response.data.data;
};

export const markAsRead = async (
  conversationId: number,
  lastReadMessageId: number
): Promise<void> => {
  await api.put(`/chat/conversations/${conversationId}/read`, null, {
    params: { lastReadMessageId },
  });
};

export const deleteMessage = async (messageId: number): Promise<void> => {
  await api.delete(`/chat/messages/${messageId}`);
};

export const editMessage = async (
  messageId: number,
  content: string
): Promise<Message> => {
  const response = await api.put<RequestResponse<Message>>(
    `/chat/messages/${messageId}`,
    { content }
  );
  return response.data.data;
};

// ==================== PHÂN QUYỀN ====================

export const grantRole = async (
  conversationId: number,
  targetAccountId: number,
  role: ConversationRole
): Promise<void> => {
  await api.post(
    `/chat/conversations/${conversationId}/participants/${targetAccountId}/grant`,
    null,
    { params: { role } }
  );
};

export const revokeRole = async (
  conversationId: number,
  targetAccountId: number
): Promise<void> => {
  await api.post(
    `/chat/conversations/${conversationId}/participants/${targetAccountId}/revoke`
  );
};

// ✅ FIX: muteMember hỗ trợ cả mute vĩnh viễn (null) và mute có thời hạn
export const muteMember = async (
  conversationId: number,
  targetAccountId: number,
  data: MuteMemberRequest
): Promise<void> => {
  // ✅ Xử lý mutedUntil null (vĩnh viễn) hoặc có giá trị (có thời hạn)
  let mutedUntil = data.mutedUntil;
  
  if (mutedUntil) {
    // Nếu có Z (ISO format từ JS), bỏ Z và milliseconds
    if (mutedUntil.endsWith('Z')) {
      mutedUntil = mutedUntil.slice(0, 19);
    }
  } else {
    // null → mute vĩnh viễn
    mutedUntil = null;
  }
  
  console.log('🔍 muteMember gửi:', { conversationId, targetAccountId, mutedUntil, reason: data.reason });
  
  await api.post(
    `/chat/conversations/${conversationId}/participants/${targetAccountId}/mute`,
    { mutedUntil, reason: data.reason }
  );
};

export const unmuteMember = async (
  conversationId: number,
  targetAccountId: number
): Promise<void> => {
  await api.post(
    `/chat/conversations/${conversationId}/participants/${targetAccountId}/unmute`
  );
};

export const banMember = async (
  conversationId: number,
  targetAccountId: number,
  data: BanMemberRequest
): Promise<void> => {
  await api.post(
    `/chat/conversations/${conversationId}/participants/${targetAccountId}/ban`,
    data
  );
};

export const unbanMember = async (
  conversationId: number,
  targetAccountId: number
): Promise<void> => {
  await api.post(
    `/chat/conversations/${conversationId}/participants/${targetAccountId}/unban`
  );
};

export const transferOwnership = async (
  conversationId: number,
  newOwnerAccountId: number
): Promise<void> => {
  await api.post(
    `/chat/conversations/${conversationId}/transfer-ownership/${newOwnerAccountId}`
  );
};

/**
 * Đổi tên nhóm chat (chỉ GROUP)
 * PATCH /api/chat/conversations/{id}/name
 */
export const updateConversationName = async (
  conversationId: number,
  name: string
): Promise<void> => {
  await api.patch(`/chat/conversations/${conversationId}/name`, { name });
};