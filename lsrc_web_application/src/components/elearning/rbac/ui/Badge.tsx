// src/components/rbac/ui/Badge.tsx
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
};

const variants = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-100 text-emerald-600',
  danger: 'bg-red-100 text-red-600',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-sky-100 text-sky-600',
};

export function Badge({ children, variant = 'default', className = '' }: Props) {
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}