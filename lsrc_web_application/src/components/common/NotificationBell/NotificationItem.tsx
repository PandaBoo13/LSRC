// src/components/common/NotificationBell/NotificationItem.tsx
import { FaBell, FaTimes } from 'react-icons/fa';
import type { NotificationItem as NotificationItemType } from './types';

type Props = {
  item: NotificationItemType;
  onClick?: (item: NotificationItemType) => void;
  onDelete?: (item: NotificationItemType) => void;
};

const formatTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return d.toLocaleDateString('vi-VN');
};

export function NotificationItem({ item, onClick, onDelete }: Props) {
  const isUnread = !item.read;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Không trigger onClick
    onDelete?.(item);
  };

  return (
    <div
      onClick={() => onClick?.(item)}
      className={`group relative px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer ${
        isUnread ? 'bg-cyan-50/40' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
          <FaBell size={12} />
        </div>

        <div className="flex-1 min-w-0 pr-5">
          <div className="flex items-start gap-2">
            <p
              className={`text-sm truncate flex-1 ${
                isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
              }`}
            >
              {item.title}
            </p>
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 mt-1.5" />
            )}
          </div>

          {item.content && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {item.content}
            </p>
          )}

          <p className="text-[10px] text-slate-400 mt-1">
            {formatTime(item.createdAt)}
          </p>
        </div>
      </div>

      {/* ✅ Nút xóa - hiện khi hover */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition
                     text-slate-400 hover:text-red-500 hover:bg-red-50"
          title="Xóa"
        >
          <FaTimes size={10} />
        </button>
      )}
    </div>
  );
}