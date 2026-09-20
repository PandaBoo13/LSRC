// src/components/elearning/quiz/QuizSummary.tsx
import { Panel } from '../ui/Panel';

type Props = { totalQuestions: number; answeredCount: number; passingScore: number; submitting: boolean; onSubmit: () => void; };

export function QuizSummary({ totalQuestions, answeredCount, passingScore, submitting, onSubmit }: Props) {
  return (
    <Panel className="self-start">
      <h3 className="text-xl font-bold text-slate-900">Tóm tắt bài kiểm tra</h3>
      <div className="mt-5 space-y-4 text-sm text-slate-500">
        <p className="flex justify-between"><span>Số câu hỏi</span><strong className="text-slate-900">{totalQuestions}</strong></p>
        <p className="flex justify-between"><span>Điểm đạt</span><strong className="text-slate-900">{passingScore}%</strong></p>
        <p className="flex justify-between"><span>Đã trả lời</span><strong className="text-slate-900">{answeredCount}/{totalQuestions}</strong></p>
      </div>
      <button onClick={onSubmit} disabled={submitting || answeredCount === 0} className="mt-8 w-full flex items-center justify-center rounded-full bg-cyan-500 px-5 py-4 font-semibold text-white hover:bg-cyan-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition">
        {submitting ? 'Đang nộp...' : 'Nộp bài'}
      </button>
    </Panel>
  );
}