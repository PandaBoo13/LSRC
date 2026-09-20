// src/service/websocketService.ts
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import { API_HOST } from '../api/axiosConfig';
import type { NotificationResponse } from '../types/notification.types';
import type { Message } from '../types/chat.types';

// ==================== WEBSOCKET URL ====================
/** WebSocket endpoint — tách riêng để dễ đổi sau này */
const WS_URL = `${API_HOST}/ws`;

type NotificationCallback = (data: NotificationResponse) => void;
type MessageCallback = (message: Message) => void;
type TypingCallback = (data: any) => void;
type ReadCallback = (data: any) => void;
type DeleteCallback = (data: any) => void;
type EditCallback = (data: any) => void;
type PermissionCallback = (data?: any) => void;
type UserConversationsCallback = () => void;

type ErrorCallback = (error: {
  message: string;
  status?: number;
  type?: string;
  timestamp?: number;
}) => void;

class WebSocketService {
  private stompClient: Client | null = null;
  private connected: boolean = false;
  private connecting: boolean = false;

  // Chat subscriptions
  private subscriptions: Map<number, StompSubscription> = new Map();
  private pendingSubscriptions: Map<number, MessageCallback[]> = new Map();

  // Typing subscriptions
  private typingSubscriptions: Map<number, StompSubscription> = new Map();
  private pendingTypingSubscriptions: Map<number, TypingCallback[]> = new Map();

  // Read subscriptions
  private readSubscriptions: Map<number, StompSubscription> = new Map();
  private pendingReadSubscriptions: Map<number, ReadCallback[]> = new Map();

  // Delete subscriptions
  private deleteSubscriptions: Map<number, StompSubscription> = new Map();
  private pendingDeleteSubscriptions: Map<number, DeleteCallback[]> = new Map();

  // Edit subscriptions
  private editSubscriptions: Map<number, StompSubscription> = new Map();
  private pendingEditSubscriptions: Map<number, EditCallback[]> = new Map();

  // Permission subscriptions
  private permissionSubscriptions: Map<number, StompSubscription> = new Map();
  private pendingPermissionSubscriptions: Map<number, PermissionCallback[]> = new Map();

  // User conversations subscription
  private userConversationsSubscription: StompSubscription | null = null;
  private userConversationsCallback: UserConversationsCallback | null = null;
  private pendingUserConversationsAccountId: number | null = null;

  // Error subscription
  private errorSubscription: StompSubscription | null = null;
  private errorListeners: ErrorCallback[] = [];

  // Notification
  private notificationSubscription: StompSubscription | null = null;
  private notificationListeners: NotificationCallback[] = [];

  // Chống trùng message ID
  private processedMessageIds: Set<number> = new Set();
  private readonly MAX_PROCESSED_IDS = 1000;

  // ==================== ACCESS TOKEN ====================

  private getAccessToken(): string {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access_token') {
        return value;
      }
    }
    return '';
  }

  // ==================== CONNECT ====================

  connect() {
    if (this.connected && this.stompClient?.connected) {
      console.log('✅ [WebSocket] Đã connected, bỏ qua connect()');
      return;
    }

    if (this.connecting) {
      console.log('⏳ [WebSocket] Đang connecting, bỏ qua');
      return;
    }

    if (this.stompClient && !this.connected) {
      console.log('⚠️ [WebSocket] Client cũ tồn tại, deactivate...');
      try {
        this.stompClient.deactivate();
      } catch (e) {
        console.warn('Lỗi deactivate:', e);
      }
      this.stompClient = null;
    }

    console.log('🔌 [WebSocket] Đang kết nối tới:', WS_URL);
    this.connecting = true;

    const token = this.getAccessToken();

    this.stompClient = new Client({
      // ✅ Dùng biến WS_URL chung với API_HOST
      webSocketFactory: () => new SockJS(WS_URL),

      connectHeaders: token ? {
        Authorization: `Bearer ${token}`,
      } : {},

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        this.connected = true;
        this.connecting = false;
        console.log('✅ [WebSocket] Connected');

        this.subscribeToNotificationsInternal();
        this.subscribeToErrorsInternal();

        // Nếu có pending user conversations subscription → subscribe lại
        if (this.pendingUserConversationsAccountId !== null && this.userConversationsCallback) {
          const accId = this.pendingUserConversationsAccountId;
          const cb = this.userConversationsCallback;
          this.pendingUserConversationsAccountId = null;
          this.userConversationsSubscription = null;
          setTimeout(() => {
            this.doSubscribeToUserConversations(accId, cb);
          }, 300);
        }

        setTimeout(() => {
          this.processPendingSubscriptions();
        }, 500);
      },

      onDisconnect: () => {
        this.connected = false;
        this.connecting = false;
        this.notificationSubscription = null;
        this.userConversationsSubscription = null;
        this.errorSubscription = null;
        console.log('❌ [WebSocket] Disconnected');
      },

      onStompError: (frame) => {
        this.connecting = false;
        console.error('❌ [WebSocket] STOMP error:', frame.headers['message']);
      },

      onWebSocketClose: () => {
        this.connected = false;
        this.connecting = false;
        this.userConversationsSubscription = null;
        this.errorSubscription = null;
        console.log('❌ [WebSocket] WebSocket closed');
      },
    });

    this.stompClient.activate();
  }

  // ==================== PROCESS PENDING ====================

  private processPendingSubscriptions() {
    this.pendingSubscriptions.forEach((callbacks, conversationId) => {
      if (callbacks.length > 0) {
        this.doSubscribeToConversation(conversationId, callbacks[0]);
      }
    });
    this.pendingSubscriptions.clear();

    this.pendingTypingSubscriptions.forEach((callbacks, conversationId) => {
      if (callbacks.length > 0) {
        this.doSubscribeToTyping(conversationId, callbacks[0]);
      }
    });
    this.pendingTypingSubscriptions.clear();

    this.pendingReadSubscriptions.forEach((callbacks, conversationId) => {
      if (callbacks.length > 0) {
        this.doSubscribeToRead(conversationId, callbacks[0]);
      }
    });
    this.pendingReadSubscriptions.clear();

    this.pendingDeleteSubscriptions.forEach((callbacks, conversationId) => {
      if (callbacks.length > 0) {
        this.doSubscribeToDelete(conversationId, callbacks[0]);
      }
    });
    this.pendingDeleteSubscriptions.clear();

    this.pendingEditSubscriptions.forEach((callbacks, conversationId) => {
      if (callbacks.length > 0) {
        this.doSubscribeToEdit(conversationId, callbacks[0]);
      }
    });
    this.pendingEditSubscriptions.clear();

    this.pendingPermissionSubscriptions.forEach((callbacks, conversationId) => {
      if (callbacks.length > 0) {
        this.doSubscribeToPermission(conversationId, callbacks[0]);
      }
    });
    this.pendingPermissionSubscriptions.clear();
  }

  // ==================== ERROR SUBSCRIPTION ====================

  private subscribeToErrorsInternal() {
    if (!this.stompClient?.connected) return;
    if (this.errorSubscription) return;

    try {
      this.errorSubscription = this.stompClient.subscribe(
        '/user/queue/errors',
        (message) => {
          try {
            const error = JSON.parse(message.body);
            console.log('❌ [WS Error] Nhận error:', error);

            this.errorListeners.forEach(cb => {
              try {
                cb(error);
              } catch (err) {
                console.error('❌ [WS Error] Listener error:', err);
              }
            });
          } catch (err) {
            console.error('❌ [WS Error] Parse error:', err);
          }
        }
      );
      console.log('✅ [WS Error] Subscribed to /user/queue/errors');
    } catch (error) {
      console.error('❌ [WS Error] Subscribe error:', error);
    }
  }

  subscribeToErrors(callback: ErrorCallback): () => void {
    console.log('📡 [WS Error] Đăng ký listener');
    this.errorListeners.push(callback);

    if (this.stompClient?.connected && !this.errorSubscription) {
      this.subscribeToErrorsInternal();
    }

    return () => {
      this.errorListeners = this.errorListeners.filter(cb => cb !== callback);
    };
  }

  // ==================== NOTIFICATION ====================

  subscribeToNotifications(callback: NotificationCallback): () => void {
    console.log('📡 [Notification] Đăng ký listener mới');
    this.notificationListeners.push(callback);
    console.log('📡 [Notification] Tổng listeners:', this.notificationListeners.length);

    if (this.stompClient?.connected) {
      this.subscribeToNotificationsInternal();
    } else {
      this.connect();
    }

    return () => {
      this.notificationListeners = this.notificationListeners.filter(cb => cb !== callback);
      console.log('📡 [Notification] Đã xóa listener, còn:', this.notificationListeners.length);
    };
  }

  private subscribeToNotificationsInternal() {
    if (!this.stompClient?.connected) return;
    if (this.notificationSubscription) return;

    try {
      this.notificationSubscription = this.stompClient.subscribe(
        '/user/queue/notifications',
        (message) => {
          try {
            const notification = JSON.parse(message.body);
            const actualNotification = notification.notification || notification;

            if (!actualNotification.title) {
              console.warn('⚠️ [Notification] title bị undefined');
              return;
            }

            this.notificationListeners.forEach(cb => {
              try {
                cb(actualNotification);
              } catch (error) {
                console.error('❌ [Notification] Listener error:', error);
              }
            });
          } catch (error) {
            console.error('❌ [Notification] Parse error:', error);
          }
        }
      );
      console.log('✅ [Notification] Đã subscribe thành công');
    } catch (error) {
      console.error('❌ [Notification] Subscribe error:', error);
    }
  }

  // ==================== USER CONVERSATIONS ====================

  subscribeToUserConversations(accountId: number, callback: UserConversationsCallback) {
    this.userConversationsCallback = callback;
    this.doSubscribeToUserConversations(accountId, callback);
  }

  private doSubscribeToUserConversations(accountId: number, callback: UserConversationsCallback) {
    if (this.userConversationsSubscription) {
      console.log(`⚠️ [UserConv] Đã subscribe, bỏ qua`);
      return;
    }

    if (!this.stompClient?.connected) {
      console.log(`⏳ [UserConv] Chưa connect, lưu pending cho user ${accountId}`);
      this.pendingUserConversationsAccountId = accountId;
      return;
    }

    try {
      this.userConversationsSubscription = this.stompClient.subscribe(
        `/topic/user/${accountId}/conversations`,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log(`📡 [UserConv] Nhận event:`, data);
          } catch {
            console.log(`📡 [UserConv] Nhận event (raw)`);
          }
          callback();
        }
      );
      console.log(`✅ [UserConv] Subscribed cho user ${accountId}`);
    } catch (error) {
      console.error('❌ [UserConv] Subscribe error:', error);
    }
  }

  // ==================== CHAT: CONVERSATION ====================

  private doSubscribeToConversation(conversationId: number, callback: MessageCallback) {
    if (this.subscriptions.has(conversationId)) {
      console.log(`⚠️ [Chat] Đã subscribe conv ${conversationId}, bỏ qua`);
      return;
    }

    if (!this.stompClient?.connected) {
      if (!this.pendingSubscriptions.has(conversationId)) {
        this.pendingSubscriptions.set(conversationId, []);
      }
      const existing = this.pendingSubscriptions.get(conversationId)!;
      if (!existing.includes(callback)) {
        existing.push(callback);
      }
      return;
    }

    try {
      const subscription = this.stompClient.subscribe(
        `/topic/conversation/${conversationId}`,
        (message) => {
          const data = JSON.parse(message.body);

          if (this.processedMessageIds.has(data.id)) {
            console.log(`⚠️ [WS] Message ${data.id} đã xử lý, bỏ qua`);
            return;
          }
          this.processedMessageIds.add(data.id);

          if (this.processedMessageIds.size > this.MAX_PROCESSED_IDS) {
            const first = this.processedMessageIds.values().next().value;
            if (first !== undefined) {
              this.processedMessageIds.delete(first);
            }
          }

          callback(data);
        }
      );
      this.subscriptions.set(conversationId, subscription);
      console.log(`✅ [Chat] Subscribed to conversation ${conversationId}`);
    } catch (error) {
      console.error('❌ [Chat] Subscribe error:', error);
    }
  }

  subscribeToConversation(conversationId: number, callback: MessageCallback) {
    this.doSubscribeToConversation(conversationId, callback);
  }

  // ==================== CHAT: TYPING ====================

  private doSubscribeToTyping(conversationId: number, callback: TypingCallback) {
    if (this.typingSubscriptions.has(conversationId)) return;

    if (!this.stompClient?.connected) {
      if (!this.pendingTypingSubscriptions.has(conversationId)) {
        this.pendingTypingSubscriptions.set(conversationId, []);
      }
      this.pendingTypingSubscriptions.get(conversationId)?.push(callback);
      return;
    }

    try {
      const subscription = this.stompClient.subscribe(
        `/topic/conversation/${conversationId}/typing`,
        (message) => {
          const data = JSON.parse(message.body);
          callback(data);
        }
      );
      this.typingSubscriptions.set(conversationId, subscription);
      console.log(`✅ [Typing] Subscribed conv ${conversationId}`);
    } catch (error) {
      console.error('❌ [Typing] Subscribe error:', error);
    }
  }

  subscribeToTyping(conversationId: number, callback: TypingCallback) {
    this.doSubscribeToTyping(conversationId, callback);
  }

  // ==================== CHAT: READ ====================

  private doSubscribeToRead(conversationId: number, callback: ReadCallback) {
    if (this.readSubscriptions.has(conversationId)) return;

    if (!this.stompClient?.connected) {
      if (!this.pendingReadSubscriptions.has(conversationId)) {
        this.pendingReadSubscriptions.set(conversationId, []);
      }
      this.pendingReadSubscriptions.get(conversationId)?.push(callback);
      return;
    }

    try {
      const subscription = this.stompClient.subscribe(
        `/topic/conversation/${conversationId}/read`,
        (message) => {
          const data = JSON.parse(message.body);
          callback(data);
        }
      );
      this.readSubscriptions.set(conversationId, subscription);
      console.log(`✅ [Read] Subscribed conv ${conversationId}`);
    } catch (error) {
      console.error('❌ [Read] Subscribe error:', error);
    }
  }

  subscribeToRead(conversationId: number, callback: ReadCallback) {
    this.doSubscribeToRead(conversationId, callback);
  }

  // ==================== CHAT: DELETE ====================

  private doSubscribeToDelete(conversationId: number, callback: DeleteCallback) {
    if (this.deleteSubscriptions.has(conversationId)) return;

    if (!this.stompClient?.connected) {
      if (!this.pendingDeleteSubscriptions.has(conversationId)) {
        this.pendingDeleteSubscriptions.set(conversationId, []);
      }
      this.pendingDeleteSubscriptions.get(conversationId)?.push(callback);
      return;
    }

    try {
      const subscription = this.stompClient.subscribe(
        `/topic/conversation/${conversationId}/message-deleted`,
        (message) => {
          const data = JSON.parse(message.body);
          callback(data);
        }
      );
      this.deleteSubscriptions.set(conversationId, subscription);
      console.log(`✅ [Delete] Subscribed conv ${conversationId}`);
    } catch (error) {
      console.error('❌ [Delete] Subscribe error:', error);
    }
  }

  subscribeToDelete(conversationId: number, callback: DeleteCallback) {
    this.doSubscribeToDelete(conversationId, callback);
  }

  // ==================== CHAT: EDIT ====================

  private doSubscribeToEdit(conversationId: number, callback: EditCallback) {
    if (this.editSubscriptions.has(conversationId)) return;

    if (!this.stompClient?.connected) {
      if (!this.pendingEditSubscriptions.has(conversationId)) {
        this.pendingEditSubscriptions.set(conversationId, []);
      }
      this.pendingEditSubscriptions.get(conversationId)?.push(callback);
      return;
    }

    try {
      const subscription = this.stompClient.subscribe(
        `/topic/conversation/${conversationId}/message-edited`,
        (message) => {
          const data = JSON.parse(message.body);
          callback(data);
        }
      );
      this.editSubscriptions.set(conversationId, subscription);
      console.log(`✅ [Edit] Subscribed conv ${conversationId}`);
    } catch (error) {
      console.error('❌ [Edit] Subscribe error:', error);
    }
  }

  subscribeToEdit(conversationId: number, callback: EditCallback) {
    this.doSubscribeToEdit(conversationId, callback);
  }

  // ==================== CHAT: PERMISSION ====================

  private doSubscribeToPermission(conversationId: number, callback: PermissionCallback) {
    if (this.permissionSubscriptions.has(conversationId)) {
      console.log(`⚠️ [Permission] Đã subscribe conv ${conversationId}, bỏ qua`);
      return;
    }

    if (!this.stompClient?.connected) {
      if (!this.pendingPermissionSubscriptions.has(conversationId)) {
        this.pendingPermissionSubscriptions.set(conversationId, []);
      }
      const existing = this.pendingPermissionSubscriptions.get(conversationId)!;
      if (!existing.includes(callback)) {
        existing.push(callback);
      }
      return;
    }

    try {
      const subscription = this.stompClient.subscribe(
        `/topic/conversation/${conversationId}/permission`,
        (message) => {
          let data: any = {};
          try {
            data = JSON.parse(message.body);
            console.log(`📡 [Permission] Nhận update conv ${conversationId}:`, data);
          } catch {
            console.log(`📡 [Permission] Nhận update conv ${conversationId} (raw)`);
          }
          callback(data);
        }
      );
      this.permissionSubscriptions.set(conversationId, subscription);
      console.log(`✅ [Permission] Subscribed conv ${conversationId}`);
    } catch (error) {
      console.error('❌ [Permission] Subscribe error:', error);
    }
  }

  subscribeToPermission(conversationId: number, callback: PermissionCallback) {
    this.doSubscribeToPermission(conversationId, callback);
  }

  // ==================== SEND METHODS ====================

  sendMessage(conversationId: number, content: string) {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ [Chat] Chưa kết nối WebSocket');
      return;
    }

    this.stompClient.publish({
      destination: `/app/conversation/${conversationId}/send`,
      body: JSON.stringify({ content }),
    });
  }

  sendTyping(conversationId: number) {
    if (!this.stompClient?.connected) return;

    this.stompClient.publish({
      destination: `/app/conversation/${conversationId}/typing`,
      body: JSON.stringify({}),
    });
  }

  sendRead(conversationId: number, lastReadMessageId: number) {
    if (!this.stompClient?.connected) return;

    this.stompClient.publish({
      destination: `/app/conversation/${conversationId}/read`,
      body: JSON.stringify({ lastReadMessageId }),
    });
  }

  sendDelete(conversationId: number, messageId: number) {
    if (!this.stompClient?.connected) return;

    this.stompClient.publish({
      destination: `/app/conversation/${conversationId}/message/${messageId}/delete`,
      body: JSON.stringify({}),
    });
  }

  sendEdit(conversationId: number, messageId: number, content: string) {
    if (!this.stompClient?.connected) return;

    this.stompClient.publish({
      destination: `/app/conversation/${conversationId}/message/${messageId}/edit`,
      body: JSON.stringify({ content }),
    });
  }

  // ==================== DISCONNECT ====================

  disconnect() {
    console.log('🔌 [WebSocket] Disconnect called');

    this.stompClient?.deactivate();
    this.connected = false;
    this.connecting = false;

    this.subscriptions.clear();
    this.pendingSubscriptions.clear();
    this.typingSubscriptions.clear();
    this.pendingTypingSubscriptions.clear();
    this.readSubscriptions.clear();
    this.pendingReadSubscriptions.clear();
    this.deleteSubscriptions.clear();
    this.pendingDeleteSubscriptions.clear();
    this.editSubscriptions.clear();
    this.pendingEditSubscriptions.clear();
    this.permissionSubscriptions.clear();
    this.pendingPermissionSubscriptions.clear();

    this.userConversationsSubscription = null;
    this.userConversationsCallback = null;
    this.pendingUserConversationsAccountId = null;

    this.errorSubscription = null;
    this.errorListeners = [];

    this.notificationSubscription = null;
    this.notificationListeners = [];

    this.processedMessageIds.clear();

    console.log('🔌 [WebSocket] Đã disconnect');
  }

  isConnected(): boolean {
    return this.connected && (this.stompClient?.connected ?? false);
  }
}

export const websocketService = new WebSocketService();