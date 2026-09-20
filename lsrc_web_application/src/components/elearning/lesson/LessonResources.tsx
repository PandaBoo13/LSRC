// src/components/elearning/learning/LessonResources.tsx
import { FaChevronRight, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import type { LessonResource } from '../../../types/lesson.types';

type Props = {
  resources: LessonResource[];
};

export function LessonResources({ resources }: Props) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return '🎬';
      case 'PDF': return '📄';
      case 'AUDIO': return '🎵';
      case 'SLIDE': return '📊';
      case 'LINK': return '🔗';
      case 'DOCUMENT': return '📃';
      case 'IMAGE': return '🖼️';
      default: return '📁';
    }
  };

  const getFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (resources.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-6 text-slate-900">
        <h3 className="text-2xl font-bold mb-4">📁 Tài nguyên</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-400 italic">Chưa có tài nguyên cho bài học này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 text-slate-900">
      <h3 className="text-2xl font-bold mb-4">
        📁 Tài nguyên
        <span className="ml-2 text-sm font-normal text-slate-400">({resources.length})</span>
      </h3>
      
      <div className="space-y-2">
        {resources.map((resource) => (
          <a
            key={resource.idResource}
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition group"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="text-xl flex-shrink-0">{getResourceIcon(resource.resourceType)}</span>
              <span className="flex-1 min-w-0">
                <span className="block truncate">{resource.title || resource.fileName || 'Tài nguyên'}</span>
                <span className="text-xs text-slate-400 font-normal">
                  {resource.resourceType}
                  {resource.fileSize && ` • ${getFileSize(resource.fileSize)}`}
                  {resource.duration && resource.duration > 0 && ` • ${resource.duration}p`}
                </span>
              </span>
              {resource.isRequired && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                  Bắt buộc
                </span>
              )}
            </span>
            <span className="flex-shrink-0 ml-3 text-slate-400 group-hover:text-cyan-500 transition">
              {resource.resourceType === 'LINK' ? <FaExternalLinkAlt size={12} /> : <FaDownload size={12} />}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}