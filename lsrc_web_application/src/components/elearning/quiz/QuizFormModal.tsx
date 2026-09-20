// src/components/elearning/quiz/QuizFormModal.tsx
import { useState } from 'react';
import { FaTimes, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { Panel } from '../ui/Panel';
import { RichTextEditor } from '../../ui/RichTextEditor';
import type { Quiz, QuizRequest } from '../../../types/quiz.types';

type Props = {
  quiz?: Quiz | null;
  courseId: number;
  onClose: () => void;
  onSave: (data: QuizRequest) => Promise<void>;
  onToast?: (message: string, type: 'success' | 'error') => void;
};

export function QuizFormModal({ quiz, courseId, onClose, onSave, onToast }: Props) {
  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [passingScore, setPassingScore] = useState(quiz?.passingScore?.toString() || '80');
  const [timeLimit, setTimeLimit] = useState(quiz?.timeLimit?.toString() || '');
  const [maxAttempts, setMaxAttempts] = useState(quiz?.maxAttempts?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) { onToast?.('Tiêu đề không được để trống', 'error'); return; }
    setLoading(true);
    try {
      await onSave({
        courseId, title: title.trim(), description,
        passingScore: passingScore ? Number(passingScore) : undefined,
        timeLimit: timeLimit ? Number(timeLimit) : undefined,
        maxAttempts: maxAttempts ? Number(maxAttempts) : undefined,
      });
      onClose();
    } catch (err: any) { onToast?.(err?.response?.data?.error || 'Lưu quiz thất bại', 'error'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Panel className="w-full max-w-2xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between border-b p-6 bg-gradient-to-r from-cyan-50 to-white flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{quiz ? 'Sửa Quiz' : 'Tạo Quiz mới'}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{quiz ? 'Cập nhật thông tin quiz' : 'Tạo quiz mới cho khóa học'}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><FaTimes size={18} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50" placeholder="Nhập tiêu đề quiz" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả</label>
            <RichTextEditor value={description} onChange={setDescription} placeholder="Mô tả về quiz..." height={150} toolbar="full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Điểm đậu (%)</label>
              <input type="number" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50" placeholder="80" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Thời gian (phút)</label>
              <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50" placeholder="Để trống nếu không giới hạn" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số lần làm tối đa</label>
              <input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50" placeholder="Để trống nếu không giới hạn" />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-cyan-50 rounded-xl text-xs text-cyan-600">
            <FaInfoCircle className="mt-0.5 flex-shrink-0" />
            <span>Quiz sẽ được lưu ở trạng thái <strong>Nháp</strong>. Bạn có thể xuất bản sau khi thêm câu hỏi.</span>
          </div>
        </div>

        <div className="flex gap-3 border-t p-6 bg-slate-50 flex-shrink-0">
          <button onClick={handleSubmit} disabled={loading || !title.trim()} className="flex-1 rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><FaSpinner className="animate-spin" size={16} /> Đang lưu...</> : (quiz ? 'Cập nhật quiz' : 'Tạo quiz mới')}
          </button>
          <button onClick={onClose} disabled={loading} className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Hủy bỏ</button>
        </div>
      </Panel>
    </div>
  );
}