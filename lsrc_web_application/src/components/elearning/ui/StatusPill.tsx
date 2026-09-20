import type { ReactNode } from 'react';

// ✅ Thêm 'purple' vào StatusTone
type StatusTone = 'blue' | 'green' | 'amber' | 'rose' | 'slate' | 'purple';

const toneClass: Record<StatusTone, string> = {
  blue: 'bg-sky-50 text-sky-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
  purple: 'bg-purple-50 text-purple-700', // ✅ Thêm purple
};

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusTone;
};

export function StatusPill({ children, tone = 'blue' }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}