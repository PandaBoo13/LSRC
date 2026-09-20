// src/components/elearning/quiz/QuestionFormModal.tsx
import { useState } from 'react';
import { FaTimes, FaSpinner, FaInfoCircle, FaPlus, FaTrash } from 'react-icons/fa';
import { Panel } from '../ui/Panel';
import { RichTextEditor } from '../../ui/RichTextEditor';
import type { Question, QuestionRequest } from '../../../types/quiz.types';

const QUESTION_TYPES = [
  { value: 'SINGLE_CHOICE', label: 'Một đáp án' },
  { value: 'MULTIPLE_CHOICE', label: 'Nhiều đáp án' },
  { value: 'TRUE_FALSE', label: 'Đúng/Sai' },
  { value: 'SHORT_ANSWER', label: 'Trả lời ngắn' },
];

type Props = {
  question?: Question | null;
  quizId: number;
  onClose: () => void;
  onSave: (data: QuestionRequest) => Promise<void>;
  onToast?: (message: string, type: 'success' | 'error') => void;
};

export function QuestionFormModal({ question, quizId, onClose, onSave, onToast }: Props) {
  const [content, setContent] = useState(question?.content || '');
  const [questionType, setQuestionType] = useState(question?.questionType || 'SINGLE_CHOICE');
  const [points, setPoints] = useState(question?.points?.toString() || '1');
  const [explanation, setExplanation] = useState(question?.explanation || '');
  const [loading, setLoading] = useState(false);

  // Parse options & correct answer
  const parseJSON = (str: string | undefined, fallback: any) => { try { return str ? JSON.parse(str) : fallback; } catch { return fallback; } };
  const [optionsList, setOptionsList] = useState<string[]>(() => parseJSON(question?.options, ['', '', '', '']));
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(() => parseJSON(question?.correctAnswer, []));

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...optionsList]; newOptions[index] = value; setOptionsList(newOptions);
  };

  const toggleCorrect = (opt: string) => {
    if (questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE') { setCorrectAnswers([opt]); } 
    else { setCorrectAnswers(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]); }
  };

  const handleSubmit = async () => {
    if (!content.trim()) { onToast?.('Nội dung câu hỏi không được để trống', 'error'); return; }
    setLoading(true);
    try {
      const filteredOptions = optionsList.filter(o => o.trim());
      await onSave({ quizId, content: content.trim(), questionType, options: filteredOptions.length > 0 ? JSON.stringify(filteredOptions) : undefined, correctAnswer: JSON.stringify(correctAnswers), points: Number(points), explanation: explanation || undefined });
      onClose();
    } catch (err: any) { onToast?.(err?.response?.data?.error || 'Lưu câu hỏi thất bại', 'error'); } 
    finally { setLoading(false); }
  };

  const needsOptions = questionType !== 'SHORT_ANSWER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Panel className="w-full max-w-2xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between border-b p-6 bg-gradient-to-r from-cyan-50 to-white flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{question ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
            <p className="text-sm text-slate-500 mt-0.5">Nhập đầy đủ thông tin câu hỏi</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><FaTimes size={18} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại câu hỏi</label>
              <select value={questionType} onChange={(e) => { setQuestionType(e.target.value); setCorrectAnswers([]); }} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-cyan-400">
                {QUESTION_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Điểm</label>
              <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50" placeholder="1" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nội dung câu hỏi <span className="text-red-500">*</span></label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Nhập nội dung câu hỏi..." height={120} toolbar="full" />
          </div>

          {needsOptions && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Đáp án lựa chọn</label>
              <div className="space-y-2">
                {optionsList.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button onClick={() => toggleCorrect(opt)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border-2 transition flex-shrink-0 ${correctAnswers.includes(opt) ? 'bg-cyan-500 text-white border-cyan-500' : 'border-slate-200 text-slate-400 hover:border-cyan-300'}`}>
                      {String.fromCharCode(65 + i)}
                    </button>
                    <input type="text" value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400" placeholder={`Đáp án ${String.fromCharCode(65 + i)}`} />
                    {optionsList.length > 2 && (
                      <button onClick={() => { setOptionsList(optionsList.filter((_, idx) => idx !== i)); setCorrectAnswers(correctAnswers.filter(a => a !== opt)); }} className="p-2 text-slate-400 hover:text-red-500"><FaTrash size={12} /></button>
                    )}
                  </div>
                ))}
                {optionsList.length < 6 && (
                  <button onClick={() => setOptionsList([...optionsList, ''])} className="flex items-center gap-2 text-sm text-cyan-500 hover:text-cyan-600 font-medium mt-1"><FaPlus size={12} /> Thêm lựa chọn</button>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center gap-1"><FaInfoCircle size={10} /> Click vào chữ cái (A,B,C...) để chọn đáp án đúng</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giải thích đáp án</label>
            <RichTextEditor value={explanation} onChange={setExplanation} placeholder="Giải thích tại sao đáp án này đúng..." height={100} toolbar="basic" />
          </div>
        </div>

        <div className="flex gap-3 border-t p-6 bg-slate-50 flex-shrink-0">
          <button onClick={handleSubmit} disabled={loading || !content.trim()} className="flex-1 rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><FaSpinner className="animate-spin" size={16} /> Đang lưu...</> : (question ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi mới')}
          </button>
          <button onClick={onClose} disabled={loading} className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Hủy bỏ</button>
        </div>
      </Panel>
    </div>
  );
}