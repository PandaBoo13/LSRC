// src/pages/elearning/InstructorPages/QuizAttemptList.tsx
import { FaGraduationCap } from 'react-icons/fa';

type Props = { attempts: any[]; };

export function QuizAttemptList({ attempts }: Props) {
  return (
    <div className="bg-white rounded-2xl border p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">📝 Bài kiểm tra ({attempts.length})</h2>
      {attempts.length > 0 ? (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {attempts.map((a, i) => (
            <div key={a.idAttempt || i} className="p-3 rounded-xl border border-amber-100 bg-amber-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">{a.quizTitle || `Quiz #${a.quizId}`}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{a.isPassed ? 'Đạt' : 'Chưa đạt'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <span>Điểm: <strong>{a.score}/{a.maxScore}</strong></span>
                <span>Đạt: <strong>{a.passingScore}</strong></span>
                <span>Lần: <strong>#{a.attemptNumber}</strong></span>
                <span>TG: <strong>{Math.floor((a.timeSpent || 0) / 60)}p</strong></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400"><FaGraduationCap className="text-4xl mx-auto mb-2 opacity-30" /><p className="text-sm">Chưa làm bài kiểm tra nào</p></div>
      )}
    </div>
  );
}