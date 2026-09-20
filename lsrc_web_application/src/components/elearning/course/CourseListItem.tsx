import { Link } from 'react-router-dom';
import { 
  FaEdit, 
  FaTrash, 
  FaBook, 
  FaUsers, 
  FaEye, 
  FaClock, 
  FaQuestionCircle, 
  FaVideo, 
  FaGraduationCap 
} from 'react-icons/fa';
import type { Course } from '../../../types/course.types';
import { getImageUrl } from '../../../utils/imageHelper';

type CourseListItemProps = {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onStatusChange?: (course: Course, status: string) => void;
  isAdmin?: boolean;
};

export function CourseListItem({
  course,
  onEdit,
  onDelete,
  onStatusChange,
  isAdmin = false,
}: CourseListItemProps) {
  const basePath = isAdmin ? '/admin' : '/instructor';

  const thumbnail =
    getImageUrl(course.thumbnailUrl) ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500';

  return (
    <div className="group flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 rounded-3xl bg-white p-4 sm:p-5 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      {/* Left Section: Thumbnail & Main Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative h-24 w-32 sm:h-28 sm:w-40 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
          <img
            src={thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500';
            }}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Status & Type Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusPill status={course.status} />
            {course.courseType === 'LIVE' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 border border-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                <FaVideo size={10} /> Live
              </span>
            )}
            {course.courseType === 'SELF_PACED' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                <FaGraduationCap size={10} /> Self-paced
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-lg font-bold text-[#2F327D] truncate group-hover:text-[#49BBBD] transition-colors">
            {course.title}
          </h2>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <FaBook size={11} className="text-[#49BBBD]" />
              <strong className="text-slate-700">{course.totalLessons || 0}</strong> lessons
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaUsers size={11} className="text-[#49BBBD]" />
              <strong className="text-slate-700">{course.totalStudents || 0}</strong> students
            </span>
            {course.duration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FaClock size={11} /> {course.duration}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Actions & Dropdown */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
        {/* Status Dropdown */}
        <select
          value={course.status}
          onChange={(e) => onStatusChange?.(course, e.target.value)}
          className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 hover:border-slate-300 outline-none focus:ring-2 focus:ring-[#49BBBD]/20 cursor-pointer"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {/* Management Links */}
        <div className="flex items-center gap-1.5">
          <Link
            to={`${basePath}/courses/${course.id}/lessons`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-50 border border-cyan-100 px-3 py-2 text-xs font-bold text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white transition"
          >
            <FaBook size={11} />
            <span>Lessons</span>
          </Link>
          <Link
            to={`${basePath}/courses/${course.id}/quizzes`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-100 px-3 py-2 text-xs font-bold text-purple-600 hover:bg-purple-600 hover:text-white transition"
          >
            <FaQuestionCircle size={11} />
            <span>Quizzes</span>
          </Link>
          <Link
            to={`${basePath}/courses/${course.id}/students`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition"
          >
            <FaUsers size={11} />
            <span>Students</span>
          </Link>
        </div>

        {/* Edit / View / Delete Controls */}
        <div className="flex items-center gap-1 pl-1 border-l border-slate-100 ml-auto md:ml-0">
          <Link
            to={`/courses/${course.slug}`}
            target="_blank"
            className="p-2 rounded-xl text-slate-400 hover:text-[#49BBBD] hover:bg-slate-50 transition"
            title="View public page"
          >
            <FaEye size={13} />
          </Link>
          <button
            type="button"
            onClick={() => onEdit?.(course)}
            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
            title="Edit course"
          >
            <FaEdit size={13} />
          </button>
          {course.status === 'DRAFT' && (
            <button
              type="button"
              onClick={() => onDelete?.(course)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Delete course"
            >
              <FaTrash size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    PUBLISHED: { label: 'Published', className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
    DRAFT: { label: 'Draft', className: 'bg-amber-50 text-amber-700 border-amber-200/60' },
    ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const config = configs[status] || configs.DRAFT;

  return (
    <span className={`inline-flex items-center border px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}