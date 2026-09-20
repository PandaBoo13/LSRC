// src/components/elearning/chat/MessageBubble.tsx
import React, { useState } from 'react';
import { FaCheck, FaCheckDouble, FaFile, FaImage, FaPlay, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import type { Message } from '../../../types/chat.types';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  onDelete?: (messageId: number) => void;
  onEdit?: (messageId: number, content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isMine,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const renderContent = () => {
    switch (message.messageType) {
      case 'IMAGE':
        return (
          <div className="max-w-[200px]">
            <img 
              src={message.fileUrl} 
              alt={message.fileName || 'Image'} 
              className="w-full rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            {message.content && <p className="mt-1 break-words">{message.content}</p>}
          </div>
        );

      case 'FILE':
        return (
          <a 
            href={message.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition min-w-[180px]"
          >
            <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center shrink-0">
              <FaFile size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{message.fileName || 'File'}</p>
              <p className="text-[10px] opacity-70">{formatFileSize(message.fileSize)}</p>
            </div>
          </a>
        );

      case 'VIDEO':
        return (
          <div className="max-w-[200px]">
            <video 
              src={message.fileUrl} 
              controls 
              className="w-full rounded-xl"
              poster={undefined}
            >
              Trình duyệt không hỗ trợ video
            </video>
            {message.content && <p className="mt-1 break-words">{message.content}</p>}
          </div>
        );

      case 'AUDIO':
        return (
          <div className="min-w-[180px]">
            <audio src={message.fileUrl} controls className="w-full" />
            {message.content && <p className="mt-1 break-words">{message.content}</p>}
          </div>
        );

      case 'SYSTEM':
        return (
          <div className="text-center py-1">
            <p className="text-[11px] text-slate-400 italic bg-slate-100 rounded-full px-3 py-1 inline-block">
              {message.content}
            </p>
          </div>
        );

      default:
        return <p className="break-words whitespace-pre-wrap">{message.content}</p>;
    }
  };

  // System message hiển thị khác biệt
  if (message.messageType === 'SYSTEM') {
    return (
      <div className="flex w-full justify-center animate-message-in my-2">
        <div className="bg-slate-100 rounded-full px-4 py-1.5">
          <p className="text-[11px] text-slate-500 italic">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} animate-message-in`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[75%] relative group`}>
        {/* Sender name - chỉ hiển thị cho người khác */}
        {!isMine && (
          <p className="text-xs text-slate-400 mb-1 ml-1 flex items-center gap-1">
            {message.senderUsername}
            {message.isEdited && <span className="text-[10px] text-slate-300">(đã sửa)</span>}
          </p>
        )}

        {/* Message bubble */}
        {isEditing ? (
          <div className={`px-2 py-2 rounded-2xl ${isMine ? 'bg-[#49BBBD] text-white' : 'bg-white text-slate-700 border border-slate-100'}`}>
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoFocus
              className="w-full bg-transparent outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <div className="flex justify-end gap-1 mt-1">
              <button onClick={handleEdit} className="text-[10px] font-bold hover:underline">Lưu</button>
              <button onClick={() => setIsEditing(false)} className="text-[10px] font-bold hover:underline">Hủy</button>
            </div>
          </div>
        ) : (
          <div
            className={`px-3 py-2 rounded-2xl text-sm relative ${
              isMine
                ? 'bg-[#49BBBD] text-white rounded-br-sm'
                : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'
            }`}
          >
            {renderContent()}
          </div>
        )}

        {/* Time + Status */}
        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
          <p className="text-xs text-slate-400">
            {formatTime(message.createdAt)}
          </p>
          {isMine && (
            <FaCheckDouble size={11} className="text-[#49BBBD]" />
          )}
          {isMine && message.isEdited && (
            <span className="text-[10px] text-slate-300">(đã sửa)</span>
          )}
        </div>

        {/* Action buttons - hiện khi hover */}
        {isMine && showActions && !isEditing && (
          <div className={`absolute top-0 flex gap-1 ${isMine ? '-left-20' : '-right-20'}`}>
            <button
              onClick={() => {
                setEditContent(message.content || '');
                setIsEditing(true);
              }}
              className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-400 hover:text-blue-500 transition"
              title="Sửa"
            >
              <FaEdit size={11} />
            </button>
            <button
              onClick={() => onDelete?.(message.id)}
              className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-400 hover:text-rose-500 transition"
              title="Xóa"
            >
              <FaTrash size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};