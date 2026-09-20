// src/types/chat.types.ts

// ==================== ENUMS ====================

export type ConversationType = 'PRIVATE' | 'GROUP' | 'COURSE';
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO' | 'AUDIO' | 'SYSTEM';
export type ConversationRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
export type ChatStatus = 'ACTIVE' | 'MUTED' | 'BANNED';

// ✅ NEW: Quyền gửi tin nhắn
export type MessagePermission = 'EVERYONE' | 'ADMINS_ONLY';

// ==================== CONTACTS ====================

export interface TeacherContact {
  accountId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface CourseContact {
  courseId: number;
  title: string;
  thumbnailUrl?: string;
}

export interface StudentContact {
  accountId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// ==================== ENTITIES ====================

/**
 * Conversation entity - dùng khi hiển thị danh sách chat
 */
export interface Conversation {
  id: number;
  conversationType: ConversationType;
  name?: string;
  courseId?: number;
  createdBy: number;
  lastMessageId?: number;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Thông tin thêm cho mỗi user
  unreadCount?: number;
  lastMessagePreview?: string;
  participants?: ParticipantInfo[];
  lastMessage?: MessageInfo;

  // ✅ NEW: Quyền gửi tin nhắn
  messagePermission?: MessagePermission;
}

/**
 * ParticipantInfo - thông tin cơ bản của participant trong ConversationResponse
 * Dùng cho danh sách chat preview (không cần role/status chi tiết)
 */
export interface ParticipantInfo {
  accountId: number;
  username: string;
  avatarUrl?: string;
  isAdmin: boolean;
  roleInConversation?: ConversationRole;
  chatStatus?: ChatStatus;
}

/**
 * MessageInfo - thông tin tóm tắt tin nhắn cuối
 */
export interface MessageInfo {
  id: number;
  content: string;
  messageType: MessageType;
  createdAt: string;
}

/**
 * Message - tin nhắn đầy đủ trong conversation
 */
export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  senderAvatarUrl?: string;
  messageType: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  fileFormat?: string;
  replyToMessageId?: number;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Participant - thông tin participant đầy đủ
 * Dùng cho state management (khi fetch từ API getParticipants)
 */
export interface Participant {
  id: number;
  conversationId: number;
  accountId: number;
  username: string;
  avatarUrl?: string;
  isAdmin: boolean;
  roleInConversation?: ConversationRole;
  chatStatus?: ChatStatus;
  mutedUntil?: string;
  mutedReason?: string;
  banReason?: string;
  lastReadMessageId?: number;
  unreadCount: number;
  lastMessagePreview?: string;
  joinedAt?: string;
  leftAt?: string;
}

// ==================== ✅ SEARCH USER ====================

/**
 * Kết quả tìm kiếm user cho chat (email / phone / username)
 */
export interface UserSearchResult {
  accountId: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  /** Đã có private conversation với user hiện tại chưa */
  hasPrivateConversation?: boolean;
  /** ID conversation cũ nếu đã từng chat */
  existingConversationId?: number;
}

// ==================== REQUEST TYPES ====================

export interface CreateConversationRequest {
  conversationType: ConversationType;
  name?: string;
  courseId?: number;
  accountId?: number;
  participantIds?: number[];
}

export interface SendMessageRequest {
  conversationId?: number;
  senderId?: number;
  messageType?: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  fileFormat?: string;
  replyToMessageId?: number;
}

export interface AddParticipantRequest {
  conversationId?: number;
  accountIds: number[];
}

// ✅ NEW: Request đổi quyền gửi tin nhắn
export interface UpdateMessagePermissionRequest {
  permission: MessagePermission;
}

// ==================== PHÂN QUYỀN REQUEST TYPES ====================

export interface GrantRoleRequest {
  role: ConversationRole;
}

export interface MuteMemberRequest {
  mutedUntil?: string | null; // null = vĩnh viễn, string = có thời hạn
  reason?: string;
}

export interface BanMemberRequest {
  reason?: string;
}

// ==================== RESPONSE TYPES ====================

/**
 * ConversationResponse - response từ API getMyConversations, getConversationById
 */
export interface ConversationResponse {
  id: number;
  conversationType: ConversationType;
  name?: string;
  courseId?: number;
  createdBy: number;
  lastMessageId?: number;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
  unreadCount?: number;
  lastMessagePreview?: string;
  participants?: ParticipantInfo[];
  lastMessage?: MessageInfo;

  // ✅ NEW
  messagePermission?: MessagePermission;
}

/**
 * MessageResponse - response từ API getMessages, sendMessage, editMessage
 */
export interface MessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  senderAvatarUrl?: string;
  messageType: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  fileFormat?: string;
  replyToMessageId?: number;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * ParticipantResponse - response từ API getParticipants
 * Có đầy đủ roleInConversation và chatStatus (required)
 */
export interface ParticipantResponse {
  id: number;
  conversationId: number;
  accountId: number;
  username: string;
  avatarUrl?: string;
  isAdmin: boolean;
  roleInConversation: ConversationRole;
  chatStatus: ChatStatus;
  mutedUntil?: string;
  mutedReason?: string;
  banReason?: string;
  lastReadMessageId?: number;
  unreadCount: number;
  lastMessagePreview?: string;
  joinedAt?: string;
  leftAt?: string;
}