// src/components/elearning/chat/ChatMessageInput.tsx
import React, { useState } from 'react';
import { FaPaperPlane, FaLock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface ChatMessageInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;              // ✅ NEW
  disabledReason?: string;         // ✅ NEW
}

export const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  onSend,
  onTyping,
  disabled = false,
  disabledReason,
}) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;               // ✅ Chặn submit
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    setInput(e.target.value);
    onTyping();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 py-2.5 border-t border-slate-200 shrink-0 bg-white"
    >
      {/* ✅ Cảnh báo khi bị disable */}
      {disabled && disabledReason && (
        <div className="mb-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-center gap-2">
          <FaLock size={10} />
          <span>{disabledReason}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={handleChange}
          disabled={disabled}
          placeholder={disabled ? t('chat.inputDisabled') : t('chat.sendMessage')}
          className={`flex-1 h-9 rounded-xl border px-3 text-sm outline-none transition ${
            disabled
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'border-slate-200 focus:border-[#49BBBD] focus:ring-1 focus:ring-[#49BBBD]'
          }`}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="w-9 h-9 rounded-xl bg-[#49BBBD] hover:bg-[#3da4a6] text-white disabled:opacity-40 flex items-center justify-center transition shrink-0"
        >
          <FaPaperPlane size={12} />
        </button>
      </div>
    </form>
  );
};