// src/components/elearning/course/EnrolledCourseListItem.tsx
import { Link } from 'react-router-dom';
import { FaChevronRight, FaClock, FaVideo, FaCheckCircle } from 'react-icons/fa';
import { Panel } from '../ui/Panel';
import { StatusPill } from '../ui/StatusPill';
import type { Enrollment } from '../../../types/enrollment.types';

type Props = {
  enrollment: Enrollment;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function EnrolledCourseListItem({ enrollment }: Props) {
  const getImageUrl = (url: string | undefined) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/${url}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { tone: 'green' as const, label: '✅ Completed' };
      case 'ACTIVE': return { tone: 'amber' as const, label: '🔄 Learning' };
      case 'DROPPED': return { tone: 'slate' as const, label: '📦 Dropped' };
      case 'ARCHIVED': return { tone: 'slate' as const, label: '📁 Archived' };
      default: return { tone: 'slate' as const, label: status };
    }
  };

  const statusConfig = getStatusConfig(enrollment.status);

  return (
    <Panel className="group overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img
          src={getImageUrl(enrollment.courseThumbnail)}
          alt={enrollment.courseTitle}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.jpg';
          }}
        />
        <div className="absolute left-4 top-4">
          <StatusPill tone={statusConfig.tone}>{statusConfig.label}</StatusPill>
        </div>
      </div>

      <div className="flex flex-col p-6">
        <h3 className="line-clamp-2 text-lg font-bold leading-tight text-slate-900">
          {enrollment.courseTitle}
        </h3>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600 font-medium">Progress</span>
            <span className="font-semibold text-cyan-600">{enrollment.progress}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${enrollment.progress}%` }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <FaVideo className="text-cyan-500" />
            {enrollment.totalLessons || 'N/A'} lessons
          </span>
          <span className="flex items-center gap-2">
            <FaClock className="text-cyan-500" />
            {new Date(enrollment.enrolledAt).toLocaleDateString()}
          </span>
          {enrollment.status === 'COMPLETED' && enrollment.completedAt && (
            <span className="col-span-2 flex items-center gap-2 text-green-600">
              <FaCheckCircle />
              Completed: {new Date(enrollment.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <Link
            to={`/learn/${enrollment.courseSlug}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
            <FaChevronRight size={12} />
          </Link>
        </div>
      </div>
    </Panel>
  );
}