// src/components/elearning/lesson/AllLessonsTable.tsx
import { FaEdit, FaTrash, FaUpload, FaEye, FaListAlt, FaInbox, FaLock, FaGlobeAmericas, FaFileAlt  } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Panel } from '../ui/Panel';
import type { Lesson } from '../../../types/lesson.types';

type Props = {
  lessons: Lesson[];
  onEdit?: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  onStatusChange: (lesson: Lesson, status: string) => void;
  onUploadResource?: (lesson: Lesson) => void;
  onViewResources?: (lesson: Lesson) => void;
};

export function AllLessonsTable({
  lessons,
  onEdit,
  onDelete,
  onStatusChange,
  onUploadResource,
  onViewResources,
}: Props) {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
      PUBLISHED: {
        label: 'Đã xuất bản',
        icon: <FaGlobeAmericas size={10} />,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      },
      DRAFT: {
        label: 'Bản nháp',
        icon: <FaFileAlt  size={10} />,
        className: 'bg-amber-50 text-amber-700 border-amber-200/60',
      },
      HIDDEN: {
        label: 'Đã ẩn',
        icon: <FaLock size={10} />,
        className: 'bg-rose-50 text-rose-700 border-rose-200/60',
      },
    };

    const item = config[status] || {
      label: status,
      icon: null,
      className: 'bg-slate-50 text-slate-700 border-slate-200',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${item.className}`}>
        {item.icon}
        {item.label}
      </span>
    );
  };

  return (
    <Panel className="overflow-hidden !p-0 border border-slate-200/80 shadow-sm rounded-2xl bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3.5 w-12 text-center">STT</th>
              <th className="px-4 py-3.5">Bài học</th>
              <th className="px-4 py-3.5 hidden md:table-cell">Khóa học</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell w-20">Thứ tự</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5 text-center hidden lg:table-cell">Free Preview</th>
              <th className="px-4 py-3.5 text-center w-52">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                      <FaInbox size={22} />
                    </div>
                    <p className="font-medium text-slate-600 text-sm">Chưa có bài học nào</p>
                    <p className="text-xs text-slate-400">Hãy thêm bài học đầu tiên vào hệ thống.</p>
                  </div>
                </td>
              </tr>
            ) : (
              lessons.map((lesson, index) => (
                <tr key={lesson.idLesson} className="group hover:bg-cyan-50/30 transition-colors">
                  <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-cyan-600 transition-colors">
                      {lesson.title}
                    </p>
                    {lesson.slug && (
                      <p className="text-[11px] font-mono text-slate-400 truncate max-w-[220px]">
                        /{lesson.slug}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <button
                      onClick={() => navigate(`/instructor/courses/${lesson.courseId}/lessons`)}
                      className="text-slate-600 hover:text-cyan-600 hover:underline text-xs font-medium max-w-[180px] truncate block"
                    >
                      {lesson.courseTitle || `Khóa học #${lesson.courseId}`}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-center text-slate-600 font-semibold text-xs hidden sm:table-cell">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      #{lesson.orderIndex}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">{getStatusBadge(lesson.status)}</td>
                  <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                    {lesson.isFreePreview ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Miễn phí
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Select Status */}
                      <select
                        value={lesson.status}
                        onChange={(e) => onStatusChange(lesson, e.target.value)}
                        className="px-2 py-1 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-cyan-500/20 outline-none transition cursor-pointer shadow-2xs"
                      >
                        <option value="DRAFT">Nháp</option>
                        <option value="PUBLISHED">Xuất bản</option>
                        <option value="HIDDEN">Ẩn</option>
                      </select>

                      <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

                      {/* Action group */}
                      <div className="flex items-center gap-0.5">
                        {onViewResources && (
                          <button
                            onClick={() => onViewResources(lesson)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Xem tài nguyên"
                          >
                            <FaListAlt size={13} />
                          </button>
                        )}

                        {onUploadResource && (
                          <button
                            onClick={() => onUploadResource(lesson)}
                            className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                            title="Tải tài nguyên lên"
                          >
                            <FaUpload size={13} />
                          </button>
                        )}

                        {onEdit && (
                          <button
                            onClick={() => onEdit(lesson)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Chỉnh sửa bài học"
                          >
                            <FaEdit size={13} />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/instructor/courses/${lesson.courseId}/lessons`)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Xem chi tiết bài học"
                        >
                          <FaEye size={13} />
                        </button>

                        <button
                          onClick={() => onDelete(lesson)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa bài học"
                        >
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}