import { useEffect, useRef } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export type ToastType = 'success' | 'error';
export interface ToastMessage { message: string; type: ToastType; }
interface ToastProps { toast: ToastMessage | null; onClose: () => void; duration?: number; }

export function Toast({ toast, onClose, duration = 5000 }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!toast) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onCloseRef.current(), duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast, duration]);

  if (!toast) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md ${
        toast.type === 'success' ? 'bg-white/95 border-emerald-200' : 'bg-white/95 border-rose-200'
      }`}>
        <span className="flex-shrink-0">
          {toast.type === 'success' 
            ? <FaCheckCircle className="text-emerald-500 text-lg" /> 
            : <FaExclamationCircle className="text-rose-500 text-lg" />}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-700">{toast.message}</span>
        <button onClick={onClose} className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition">
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
}