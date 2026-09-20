// src/pages/elearning/InstructorPages/StudentHeader.tsx
import { ProgressBar } from '../../../components/elearning/progress/ProgressBar';
import { StatusBadge } from '../../../components/elearning/progress/StatusBadge';
import type { CourseProgressResponse } from '../../../service/progress/progress.types';

type Props = { student: CourseProgressResponse | null; totalLessons: number; };

function StatBox({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return <div className="bg-slate-50 rounded-xl p-3"><span className="text-xs text-slate-500">{label}</span>{children || <p className="text-lg font-bold">{value}</p>}</div>;
}

export function StudentHeader({ student, totalLessons }: Props) {
  const formatTime = (s: number) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };
  return (
    <div className="bg-white rounded-2xl border p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow">{student?.username?.charAt(0).toUpperCase() || '?'}</div>
        <div><h1 className="text-xl font-bold text-slate-900">{student?.username || 'Unknown'}</h1><StatusBadge status={student?.status || 'NOT_STARTED'} /></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox label="Bài hoàn thành" value={`${student?.completedLessons || 0}/${student?.totalLessons || totalLessons}`} />
        <StatBox label="Tiến độ"><ProgressBar value={student?.progressPercentage || 0} /></StatBox>
        <StatBox label="Thời gian học" value={formatTime(student?.totalTimeSpent || 0)} />
        <StatBox label="Bắt đầu" value={student?.startedAt ? new Date(student.startedAt).toLocaleDateString('vi-VN') : '—'} />
      </div>
    </div>
  );
}