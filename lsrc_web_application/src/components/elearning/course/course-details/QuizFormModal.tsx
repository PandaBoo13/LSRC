// ============================================
// QuizFormModal.tsx - SINGLE FORM LMS REFACTOR
// ============================================
import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaSpinner,
  FaClipboardCheck,
  FaClock,
  FaPercent,
  FaRedo,
  FaQuestionCircle,
  FaRandom,
  FaPlus,
  FaMinus,
  FaInfoCircle,
  FaPen,
  FaSlidersH,
  FaCheckCircle,
  FaEyeSlash,
  FaFileAlt,
} from 'react-icons/fa';

interface CourseResource {
  id: number;
  title?: string;
  description?: string;
  status?: string;
  maxAttempts?: number;
  passingScore?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
  totalQuestions?: number;
  [key: string]: any;
}

interface QuizFormModalProps {
  quiz?: CourseResource | null;
  courseId: number;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

// ✅ Các trạng thái cho phép của Quiz — khớp với BE enum
type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

const STATUS_OPTIONS: Array<{
  value: QuizStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = [
  {
    value: 'DRAFT',
    label: 'Nháp',
    description: 'Chỉ bạn thấy — chưa cho học viên làm',
    icon: <FaFileAlt size={12} />,
    color: 'amber',
  },
  {
    value: 'PUBLISHED',
    label: 'Xuất bản',
    description: 'Học viên đã mua có thể làm bài',
    icon: <FaCheckCircle size={12} />,
    color: 'emerald',
  },
  {
    value: 'HIDDEN',
    label: 'Ẩn',
    description: 'Đã phát hành nhưng tạm ẩn khỏi học viên',
    icon: <FaEyeSlash size={12} />,
    color: 'slate',
  },
];

export const QuizFormModal: React.FC<QuizFormModalProps> = ({
  quiz,
  courseId,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<QuizStatus>('DRAFT');
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [passingScore, setPassingScore] = useState<number>(80);
  const [timeLimit, setTimeLimit] = useState<number | undefined>();
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title || '');
      setDescription(quiz.description || '');
      // ✅ Đọc status từ quiz — default DRAFT nếu không có
      setStatus((quiz.status as QuizStatus) || 'DRAFT');
      setMaxAttempts(quiz.maxAttempts || 1);
      setPassingScore(quiz.passingScore || 80);
      setTimeLimit(quiz.timeLimit || undefined);
      setShuffleQuestions(Boolean(quiz.shuffleQuestions));
      setTotalQuestions(quiz.totalQuestions || undefined);
    } else {
      // Reset khi tạo mới
      setTitle('');
      setDescription('');
      setStatus('DRAFT');
      setMaxAttempts(1);
      setPassingScore(80);
      setTimeLimit(undefined);
      setShuffleQuestions(false);
      setTotalQuestions(undefined);
    }
  }, [quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description,
        status,                    // ✅ Gửi status lên BE
        maxAttempts,
        passingScore,
        timeLimit,
        shuffleQuestions,
        totalQuestions,
        resourceType: 'QUIZ',
      });
      onClose();
    } catch (err) {
      // Lỗi xử lý ở parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-b from-amber-50/60 to-white border-b border-slate-100 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-500/25 ring-4 ring-amber-50">
              <FaClipboardCheck size={19} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug">
                {quiz ? 'Cập Nhật Bài Quiz' : 'Tạo Bài Quiz Mới'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Thiết lập thông tin và quy chế cho bài kiểm tra</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

            {/* KHỐI 1: THÔNG TIN CHUNG */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <FaPen className="text-amber-500" size={12} />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông tin chung</span>
              </div>

              {/* Title + Status (2 cột) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Title — chiếm 2/3 */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Tiêu đề Quiz <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-slate-200 px-4 text-xs font-bold text-slate-800 bg-slate-50/50 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="VD: Kiểm tra kiến thức Chuỗi & Mảng..."
                    required
                  />
                </div>

                {/* ✅ Status dropdown — chiếm 1/3 */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as QuizStatus)}
                    className="w-full h-11 rounded-2xl border border-slate-200 px-3 text-xs font-bold text-slate-800 bg-slate-50/50 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status description hint */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                {STATUS_OPTIONS.find(o => o.value === status)?.icon}
                <span>{STATUS_OPTIONS.find(o => o.value === status)?.description}</span>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Hướng dẫn & Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 font-medium bg-slate-50/50 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none placeholder:text-slate-400 placeholder:font-normal leading-relaxed"
                  rows={3}
                  placeholder="Ghi rõ yêu cầu, chuẩn bị kiến thức hoặc lưu ý trước khi làm bài..."
                />
              </div>
            </div>

            {/* KHỐI 2: CẤU HÌNH LÀM BÀI */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <FaSlidersH className="text-amber-500" size={12} />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cấu hình quy chế</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

                {/* Time Limit Widget */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <FaClock className="text-cyan-500" size={12} /> Thời gian làm bài
                    </label>
                    <span className="text-[10px] font-extrabold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                      {timeLimit ? `${timeLimit} phút` : 'Không giới hạn'}
                    </span>
                  </div>

                  <input
                    type="number"
                    value={timeLimit || ''}
                    onChange={e => setTimeLimit(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-amber-500 transition"
                    placeholder="Nhập phút..."
                    min={0}
                  />

                  <div className="flex gap-1.5 pt-1">
                    {[15, 30, 45, 60].map(mins => (
                      <button
                        type="button"
                        key={mins}
                        onClick={() => setTimeLimit(mins)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                          timeLimit === mins
                            ? 'bg-cyan-500 text-white border-cyan-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {mins}p
                      </button>
                    ))}
                  </div>
                </div>

                {/* Passing Score Widget */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <FaPercent className="text-emerald-500" size={11} /> Điểm cần đạt
                    </label>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {passingScore}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPassingScore(prev => Math.max(10, prev - 5))}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition"
                    >
                      <FaMinus size={9} />
                    </button>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={e => setPassingScore(Number(e.target.value))}
                      className="flex-1 h-9 text-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
                      min={10}
                      max={100}
                    />
                    <button
                      type="button"
                      onClick={() => setPassingScore(prev => Math.min(100, prev + 5))}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition"
                    >
                      <FaPlus size={9} />
                    </button>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    {[50, 70, 80, 100].map(score => (
                      <button
                        type="button"
                        key={score}
                        onClick={() => setPassingScore(score)}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                          passingScore === score
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {score}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Attempts Widget */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <FaRedo className="text-amber-500" size={11} /> Số lần làm bài tối đa
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMaxAttempts(prev => Math.max(1, prev - 1))}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition"
                    >
                      <FaMinus size={9} />
                    </button>
                    <input
                      type="number"
                      value={maxAttempts}
                      onChange={e => setMaxAttempts(Number(e.target.value))}
                      className="flex-1 h-9 text-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
                      min={1}
                    />
                    <button
                      type="button"
                      onClick={() => setMaxAttempts(prev => prev + 1)}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition"
                    >
                      <FaPlus size={9} />
                    </button>
                  </div>
                </div>

                {/* Total Questions Widget */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <FaQuestionCircle className="text-violet-500" size={11} /> Số câu hỏi mỗi đề
                  </label>
                  <input
                    type="number"
                    value={totalQuestions || ''}
                    onChange={e => setTotalQuestions(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-amber-500 transition placeholder:font-normal placeholder:text-slate-400"
                    min={1}
                    placeholder="Lấy tất cả câu hỏi"
                  />
                </div>

              </div>

              {/* Shuffle Question Toggle Card */}
              <div
                onClick={() => setShuffleQuestions(!shuffleQuestions)}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition cursor-pointer select-none shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    shuffleQuestions ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <FaRandom size={13} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-snug">Trộn ngẫu nhiên câu hỏi</span>
                    <span className="text-[11px] text-slate-400 font-medium">Mỗi lượt làm bài sẽ có thứ tự câu hỏi khác nhau</span>
                  </div>
                </div>

                <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  shuffleQuestions ? 'bg-amber-500' : 'bg-slate-200'
                }`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    shuffleQuestions ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Summary Info Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/50 flex items-start gap-3">
                <FaInfoCircle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                <p className="text-[11px] text-amber-900 font-medium leading-tight">
                  Sau khi khởi tạo Quiz, bạn có thể gán nhanh bài kiểm tra này vào các chương bằng cách kéo thả trong giao diện quản lý.
                </p>
              </div>

            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Tất cả thay đổi sẽ được cập nhật khi nhấn lưu
            </span>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" size={13} /> Đang lưu...
                  </>
                ) : (
                  quiz ? 'Cập nhật Quiz' : 'Tạo Quiz Mới'
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};