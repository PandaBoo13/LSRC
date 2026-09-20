// src/pages/elearning/StudentPages/components/CourseDetail/CourseOutcomesTab.tsx
import { FaGraduationCap, FaCheck } from 'react-icons/fa';

interface CourseOutcomesTabProps {
  outcomes: string[];
}

export function CourseOutcomesTab({ outcomes }: CourseOutcomesTabProps) {
  if (!outcomes || outcomes.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <FaGraduationCap className="text-[#49BBBD]" /> What you will learn
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {outcomes.map((item: string, i: number) => (
          <div key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
              <FaCheck size={10} />
            </span>
            <span className="leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}