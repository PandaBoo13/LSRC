// src/components/elearning/lesson/LessonResourceList.tsx
import { useState, useEffect } from 'react';
import { 
  FaVideo, FaFilePdf, FaFileAudio, FaFileAlt, FaImage, 
  FaLink, FaCube, FaDownload, FaSpinner, 
  FaTrash, FaCheckCircle, FaTimesCircle, FaClock,
  FaPlay, FaExternalLinkAlt, FaFolderOpen, FaExclamationTriangle
} from 'react-icons/fa';
// ✅ Sửa import - dùng getResourcesByCourse và deleteResource
import { getResourcesByCourse, deleteResource } from '../../../service/courseResourceService';
import type { CourseResource } from '../../../types/courseResource.types';

type Props = {
  lessonId: number;
  courseId: number;
  isInstructor?: boolean;
  onRefresh?: () => void;
};

const RESOURCE_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  VIDEO: { icon: <FaVideo size={14} />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', label: 'Video' },
  PDF: { icon: <FaFilePdf size={14} />, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', label: 'PDF' },
  AUDIO: { icon: <FaFileAudio size={14} />, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', label: 'Audio' },
  SLIDE: { icon: <FaFileAlt size={14} />, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', label: 'Slide' },
  SCORM: { icon: <FaCube size={14} />, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100', label: 'SCORM' },
  DOCUMENT: { icon: <FaFileAlt size={14} />, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', label: 'Tài liệu' },
  IMAGE: { icon: <FaImage size={14} />, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-100', label: 'Hình ảnh' },
  LINK: { icon: <FaLink size={14} />, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100', label: 'Link' },
  OTHER: { icon: <FaFileAlt size={14} />, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100', label: 'Khác' },
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  READY: { icon: <FaCheckCircle size={10} />, color: 'text-emerald-600 bg-emerald-50', label: 'Sẵn sàng' },
  UPLOADING: { icon: <FaSpinner size={10} className="animate-spin" />, color: 'text-blue-600 bg-blue-50', label: 'Đang tải' },
  PROCESSING: { icon: <FaClock size={10} />, color: 'text-amber-600 bg-amber-50', label: 'Đang xử lý' },
  ERROR: { icon: <FaTimesCircle size={10} />, color: 'text-rose-600 bg-rose-50', label: 'Lỗi' },
};

export function LessonResourceList({ lessonId, courseId, isInstructor = false, onRefresh }: Props) {
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');
      // ✅ THAY ĐỔI: getLessonResources → getResourcesByCourse
      const allResources = await getResourcesByCourse(courseId);
      const allResourcesArray = Array.isArray(allResources) ? allResources : [];
      
      // ✅ Lọc resources thuộc lesson hiện tại (parentId === lessonId)
      // Hoặc lọc theo chapter nếu lesson là chapter
      const lessonResources = allResourcesArray.filter(r => 
        r.parentId === lessonId || r.id === lessonId
      );
      
      // Nếu không có resources con, lấy resources cùng chapter
      if (lessonResources.length === 0) {
        const currentResource = allResourcesArray.find(r => r.id === lessonId);
        if (currentResource?.chapterId) {
          setResources(allResourcesArray.filter(r => 
            r.chapterId === currentResource.chapterId && r.id !== lessonId
          ));
        } else {
          setResources([]);
        }
      } else {
        setResources(lessonResources);
      }
    } catch (err) {
      setError('Không thể tải tài nguyên bài học');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [lessonId, courseId]);

  const handleDelete = async (resourceId: number) => {
    if (!confirm('Bạn có chắc muốn xóa tài nguyên này?')) return;
    try {
      // ✅ THAY ĐỔI: unassignResourceFromLesson → deleteResource
      await deleteResource(courseId, resourceId);
      fetchResources();
      onRefresh?.();
    } catch (err) {
      console.error('Error deleting resource:', err);
    }
  };

  const handleView = (resource: CourseResource) => {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    }
  };

  const getDownloadUrl = (resource: CourseResource) => {
    return resource.fileUrl || '';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}:${secs.toString().padStart(2, '0')}`;
    return `${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <FaSpinner className="animate-spin text-[#49BBBD]" size={22} />
        <span className="text-xs font-semibold text-slate-400">Đang tải tài nguyên...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-rose-600">
        <FaExclamationTriangle size={14} />
        <span>{error}</span>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-2">
          <FaFolderOpen size={20} />
        </div>
        <p className="text-xs font-bold text-slate-600">Chưa có tài nguyên nào</p>
        {isInstructor && (
          <p className="text-[11px] text-slate-400 mt-0.5">Sử dụng nút "Tải tài nguyên" để tải lên tài liệu mới.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Tài nguyên bài học ({resources.length})
        </h4>
      </div>
      
      <div className="space-y-2">
        {resources.map((resource) => {
          const config = RESOURCE_ICONS[resource.resourceType] || RESOURCE_ICONS.OTHER;
          const statusConfig = STATUS_CONFIG[resource.status] || STATUS_CONFIG.PROCESSING;
          
          return (
            <div
              key={resource.id}
              className="group flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xs transition cursor-pointer"
              onClick={() => resource.status === 'READY' && handleView(resource)}
            >
              {/* Type Icon */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl border ${config.bg} flex items-center justify-center ${config.color}`}>
                {config.icon}
              </div>

              {/* Resource Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-800 truncate group-hover:text-cyan-600 transition-colors">
                    {resource.title || resource.fileName || 'Không tên'}
                  </h5>
                  {resource.isRequired && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.2 rounded-md font-semibold flex-shrink-0">
                      Bắt buộc
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-400 flex-wrap">
                  <span className="font-semibold text-slate-500">
                    {config.label}
                  </span>

                  {resource.fileSize && (
                    <>
                      <span>•</span>
                      <span>{formatFileSize(resource.fileSize)}</span>
                    </>
                  )}

                  {resource.duration && resource.duration > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FaClock size={9} /> {formatDuration(resource.duration)}
                      </span>
                    </>
                  )}

                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-semibold ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {resource.status === 'READY' && (
                  <button
                    onClick={() => handleView(resource)}
                    className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                    title="Xem nội dung"
                  >
                    {resource.resourceType === 'LINK' ? <FaExternalLinkAlt size={13} /> : <FaPlay size={13} />}
                  </button>
                )}

                {resource.status === 'READY' && resource.resourceType !== 'LINK' && (
                  <a
                    href={getDownloadUrl(resource)}
                    download={resource.fileName}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="Tải xuống"
                  >
                    <FaDownload size={13} />
                  </a>
                )}

                {isInstructor && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(resource.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa tài nguyên"
                  >
                    <FaTrash size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}