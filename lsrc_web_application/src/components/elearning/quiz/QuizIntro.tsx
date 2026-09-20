// src/components/elearning/quiz/QuizIntro.tsx
import {
  FaClock,
  FaBullseye,
  FaQuestionCircle,
  FaPlay,
  FaHistory,
  FaInfoCircle,
  FaBan,
  FaArrowLeft,
} from 'react-icons/fa';
import type { Quiz } from '../../../service/quiz/quiz.types';
import { RichTextDisplay } from '../../ui/RichTextEditor/RichTextDisplay';

type Props = {
  quiz: Quiz;
  questionCount: number;
  attemptsUsed?: number;
  onStart: () => void;
  onGoBack: () => void;
};

export function QuizIntro({
  quiz,
  questionCount,
  attemptsUsed = 0,
  onStart,
  onGoBack,
}: Props) {
  const maxAttempts = quiz.maxAttempts || 1;
  const remainingAttempts = Math.max(0, maxAttempts - attemptsUsed);
  const canStart = remainingAttempts > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 rounded-3xl p-6 md:p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/25 ring-8 ring-teal-500/10">
          <FaQuestionCircle size={30} />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-extrabold uppercase tracking-wider mb-2">
          Bài Kiểm Tra Đánh Giá
        </span>

        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
          {quiz.title || 'Bài Kiểm Tra Quiz'}
        </h1>

        {quiz.description && (
          // FIXED [CRITICAL]: dùng RichTextDisplay thay vì dangerouslySetInnerHTML.
          <RichTextDisplay
            content={quiz.description}
            prose={false}
            className="text-xs md:text-sm text-slate-600 mt-3 max-w-xl mx-auto leading-relaxed font-medium prose prose-slate prose-p:m-0"
          />
        )}
      </div>

      {/* Grid Thông Số Quản Lý */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-teal-200 transition-all flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
            <FaQuestionCircle size={16} />
          </div>
          <span className="text-xl font-black text-slate-800">{questionCount}</span>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5">Câu hỏi</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-amber-200 transition-all flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <FaClock size={16} />
          </div>
          <span className="text-xl font-black text-slate-800">
            {quiz.timeLimit ? `${quiz.timeLimit}p` : '∞'}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
            {quiz.timeLimit ? 'Thời gian' : 'Không giới hạn'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 transition-all flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <FaHistory size={16} />
          </div>
          <span className="text-xl font-black text-slate-800">
            {attemptsUsed}/{maxAttempts}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
            Còn {remainingAttempts} lượt
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-all flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <FaBullseye size={16} />
          </div>
          <span className="text-xl font-black text-slate-800">
            {quiz.passingScore || 80}%
          </span>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5">Điểm đạt</span>
        </div>
      </div>

      {/* Hướng Dẫn Làm Bài */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
          <FaInfoCircle className="text-amber-600" size={14} />
          <span>Lưu ý quan trọng trước khi làm bài</span>
        </div>
        <ul className="text-xs font-medium space-y-1.5 pl-6 list-disc text-amber-900/80 leading-relaxed">
          <li>Kiểm tra đường truyền Internet ổn định trước khi bắt đầu.</li>
          <li>Đọc kỹ yêu cầu từng câu (chọn 1 hoặc nhiều đáp án).</li>
          <li>Hệ thống tự động lưu đáp án và nộp bài khi hết giờ.</li>
          <li>
            Cần đạt tối thiểu <strong>{quiz.passingScore || 80}%</strong> tổng điểm
            để vượt qua bài kiểm tra này.
          </li>
        </ul>
      </div>

      {/* Nút Điều Hướng */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onGoBack}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <FaArrowLeft size={12} /> Quay lại
        </button>

        {canStart ? (
          <button
            type="button"
            onClick={onStart}
            className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-teal-500/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaPlay size={12} /> Bắt đầu làm bài ngay
          </button>
        ) : (
          <div className="w-full sm:flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 cursor-not-allowed">
            <FaBan size={13} /> Đã hết số lần làm bài quy định
          </div>
        )}
      </div>
    </div>
  );
}