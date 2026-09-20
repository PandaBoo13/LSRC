// src/hooks/useDraggable.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  /** Kích thước widget (dùng để clamp không cho kéo ra ngoài màn hình) */
  width?: number;
  height?: number;
  /** Vị trí mặc định (khi chưa có trong localStorage) */
  defaultPosition?: Position;
  /** Key lưu vào localStorage (null = không lưu) */
  storageKey?: string | null;
}

export const useDraggable = ({
  width = 400,
  height = 500,
  defaultPosition = { x: 0, y: 0 },
  storageKey = 'chat_widget_position',
}: UseDraggableOptions = {}) => {
  // ── Load vị trí ban đầu từ localStorage ──
  const [position, setPosition] = useState<Position>(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as Position;
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return defaultPosition;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);
  const positionRef = useRef(position);

  // Sync ref với state để dùng trong event listener
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // ── Clamp vị trí trong màn hình ──
  const clampPosition = useCallback((x: number, y: number): Position => {
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;
    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    };
  }, [width, height]);

  // ── Bắt đầu kéo ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Chỉ kéo khi click chuột trái
    if (e.button !== 0) return;

    // Không kéo nếu click vào button/input trong header
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: positionRef.current.x,
      posY: positionRef.current.y,
    };
  }, []);

  // ── Global listeners khi đang kéo ──
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const start = dragStartRef.current;
      if (!start) return;

      const dx = e.clientX - start.mouseX;
      const dy = e.clientY - start.mouseY;

      const newX = start.posX + dx;
      const newY = start.posY + dy;

      setPosition(clampPosition(newX, newY));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;

      // Lưu vào localStorage
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(positionRef.current));
        } catch {
          // ignore
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Thêm class để tránh select text khi kéo
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, clampPosition, storageKey]);

  // ── Reset về vị trí mặc định ──
  const resetPosition = useCallback(() => {
    setPosition(defaultPosition);
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
  }, [defaultPosition, storageKey]);

  // ── Re-clamp khi resize window ──
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => clampPosition(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  return {
    position,
    isDragging,
    handleMouseDown,
    resetPosition,
    setPosition,
  };
};