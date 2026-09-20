// src/components/rbac/ui/StatusPill.tsx
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  tone?: 'default' | 'green' | 'red' | 'yellow' | 'blue' | 'purple';
  className?: string;
};

const tones = {
  default: 'bg-slate-100 text-slate-700',
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-rose-100 text-rose-700',
  yellow: 'bg-amber-100 text-amber-700',
  blue: 'bg-sky-100 text-sky-700',
  purple: 'bg-violet-100 text-violet-700',
};

export function StatusPill({ children, tone = 'default', className = '' }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}