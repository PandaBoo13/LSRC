// src/pages/elearning/StudentPages/components/CourseDetail/CourseOverviewTab.tsx
import type { Course } from '../../../types/course.types';
// FIXED [CRITICAL]: dùng RichTextDisplay thay vì dangerouslySetInnerHTML.
import { RichTextDisplay } from '../../../components/ui/RichTextEditor/RichTextDisplay';

interface CourseOverviewTabProps {
  course: Course;
}

export function CourseOverviewTab({ course }: CourseOverviewTabProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {course.category && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#49BBBD]/10 text-[#49BBBD]">
            {course.category.name}
          </span>
        )}
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
          {course.level || 'All Levels'}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
          {course.courseType === 'SELF_PACED' ? 'Self-Paced' : 'Live Online'}
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
        {course.title}
      </h1>

      {course.description ? (
        // FIXED [CRITICAL]: dùng RichTextDisplay (DOMPurify).
        <RichTextDisplay
          content={course.description}
          prose={false}
          className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed"
        />
      ) : (
        <p className="text-slate-400 italic text-sm">
          No detailed description available for this course.
        </p>
      )}
    </div>
  );
}