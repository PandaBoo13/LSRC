// src/components/elearning/chat/ChatMessageList.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { MessageBubble } from './MessageBubble';
import type { Message, Participant } from '../../../types/chat.types';

interface ChatMessageListProps {
  messages: Message[];
  typingUsers: Set<number>;
  currentUserId?: number;
  participants: Participant[];
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  onLoadOlderMessages?: () => void;
  onDelete?: (messageId: number) => void;                  // ✅ THÊM
  onEdit?: (messageId: number, content: string) => void;   // ✅ THÊM
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  typingUsers,
  currentUserId,
  participants,
  isLoadingMore,
  hasMoreMessages,
  onLoadOlderMessages,
  onDelete,      // ✅ THÊM
  onEdit,        // ✅ THÊM
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    setTimeout(scrollToBottom, 150);
  }, [messages, typingUsers, scrollToBottom]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop < 50 && hasMoreMessages && !isLoadingMore) {
      onLoadOlderMessages?.();
    }
  };

  const typingUsernames = Array.from(typingUsers)
    .filter(id => id !== currentUserId)
    .map(id => participants.find(p => p.accountId === id)?.username || `User ${id}`);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50 chat-scrollbar"
    >
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <FaSpinner className="animate-spin text-[#49BBBD]" size={16} />
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isMine={message.senderId === currentUserId}
          onDelete={onDelete}      
          onEdit={onEdit}        
        />
      ))}

      {typingUsernames.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 pl-1 animate-pulse">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
          </div>
          <span>{typingUsernames.join(', ')} đang gõ...</span>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
};