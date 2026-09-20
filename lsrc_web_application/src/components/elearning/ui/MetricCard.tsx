import type { ReactNode } from 'react';

import { Panel } from './Panel';

type MetricCardProps = {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  accent: string;
};

export function MetricCard({
  label,
  value,
  note,
  icon,
  accent,
}: MetricCardProps) {
  return (
    <Panel className="h-full">
      <div className="flex h-full items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <h3 className="mt-3 truncate text-3xl font-bold text-slate-900">
            {value}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
            {note}
          </p>
        </div>

        <div
          className={`
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-2xl
            shadow-sm
            ${accent}
          `}
        >
          <div className="text-xl">
            {icon}
          </div>
        </div>
      </div>
    </Panel>
  );
}