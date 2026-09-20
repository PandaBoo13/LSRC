import type { ReactNode } from 'react';

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <section className={`rounded-3xl bg-white p-6 shadow-sm ${className}`}>
      {children}
    </section>
  );
}
