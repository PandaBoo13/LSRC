// src/components/elearning/chat/views/ChatView.tsx
import React from 'react';
import { ChatMessageList } from '../ChatMessageList';
import { ChatMessageInput } from '../ChatMessageInput';
import type { Message, Participant } from '../../../../types/chat.types';

interface ChatViewProps {
  messages: Message[];
  typingUsers: Set<number>;
  currentUserId?: number;
  participants: Participant[];
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  onLoadOlderMessages?: () => void;
  onSend: (content: string) => void;
  onTyping: () => void;
  // ✅ Props cho disabled input
  inputDisabled?: boolean;
  inputDisabledReason?: string;
  // ✅ NEW: Edit/Delete message
  onDeleteMessage?: (messageId: number) => void;
  onEditMessage?: (messageId: number, content: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  typingUsers,
  currentUserId,
  participants,
  isLoadingMore,
  hasMoreMessages,
  onLoadOlderMessages,
  onSend,
  onTyping,
  inputDisabled = false,
  inputDisabledReason,
  onDeleteMessage,      // ✅ NEW
  onEditMessage,        // ✅ NEW
}) => {
  return (
    <>
      {/* Danh sách tin nhắn */}
      <ChatMessageList
        messages={messages}
        typingUsers={typingUsers}
        currentUserId={currentUserId}
        participants={participants}
        isLoadingMore={isLoadingMore}
        hasMoreMessages={hasMoreMessages}
        onLoadOlderMessages={onLoadOlderMessages}
        onDelete={onDeleteMessage}      // ✅ NEW
        onEdit={onEditMessage}          // ✅ NEW
      />

      {/* Input gửi tin nhắn */}
      <ChatMessageInput
        onSend={onSend}
        onTyping={onTyping}
        disabled={inputDisabled}
        disabledReason={inputDisabledReason}
      />
    </>
  );
};