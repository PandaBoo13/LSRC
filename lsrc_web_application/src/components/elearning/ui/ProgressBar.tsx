type ProgressBarProps = {
  value: number;
  color?: string;
};

export function ProgressBar({ value, color = 'bg-cyan-500' }: ProgressBarProps) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}
