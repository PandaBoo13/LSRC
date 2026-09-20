// src/components/elearning/learning/LessonContent.tsx
import { FaBookOpen, FaFileAlt } from 'react-icons/fa';
import type { CourseResource } from '../../../types/courseResource.types';
import { RichTextDisplay } from '../../ui/RichTextEditor/RichTextDisplay';

type Props = {
  lesson: CourseResource;
};

export function LessonContent({ lesson }: Props) {
  const title = lesson.title || lesson.fileName || 'Không tên';

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-[#49BBBD]/10 text-[#49BBBD] flex items-center justify-center flex-shrink-0">
          <FaBookOpen size={18} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Nội dung bài học</h3>
          <p className="text-xs text-slate-400">Xem và học chi tiết bài học bên dưới</p>
        </div>
      </div>

      {lesson.description && (
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
          <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
            "{lesson.description}"
          </p>
        </div>
      )}

      {lesson.content ? (
        // FIXED [CRITICAL]: dùng RichTextDisplay (DOMPurify) thay vì dangerouslySetInnerHTML raw.
        <RichTextDisplay
          content={lesson.content}
          prose={false}
          className="
            prose prose-slate max-w-none 
            prose-headings:text-slate-900 prose-headings:font-bold 
            prose-h1:text-2xl prose-h2:text-xl
            prose-p:text-slate-600 prose-p:leading-relaxed 
            prose-p:text-sm sm:prose-p:text-base
            prose-a:text-[#49BBBD] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900 prose-img:rounded-2xl prose-img:shadow-md
            prose-code:text-cyan-700 prose-code:bg-cyan-50 
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md 
            prose-code:before:content-none prose-code:after:content-none"
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <FaFileAlt size={20} />
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Chưa có nội dung chi tiết</p>
          <p className="text-xs text-slate-400 max-w-xs">
            Bài học này chưa được bổ sung tài liệu học tập.
          </p>
        </div>
      )}
    </div>
  );
}