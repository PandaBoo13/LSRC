// src/context/ChatContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

interface ChatContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  // ✅ THÊM
  totalUnread: number;
  setTotalUnread: (count: number) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);       // ✅ THÊM

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(v => !v),
        totalUnread,          // ✅ THÊM
        setTotalUnread,       // ✅ THÊM
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatWidget() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatWidget must be used within ChatProvider');
  return ctx;
}