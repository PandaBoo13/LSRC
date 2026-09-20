// ============================================
// QuestionFormModal.tsx - PURE UI REFACTOR (LOGIC 100% UNTOUCHED)
// ============================================
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaSpinner, 
  FaPlus, 
  FaTrash, 
  FaCheckCircle, 
  FaBook, 
  FaQuestionCircle, 
  FaRegLightbulb, 
  FaCheck 
} from 'react-icons/fa';

// ✅ Imports & Types giữ nguyên 100%
import type { Question, CreateQuestionRequest } from '../../../../service/quiz/quiz.types';
import type { CourseResource } from '../../../../types/courseResource.types';
import type { Chapter } from '../../../../types/chapter.types';
import { getChaptersByCourse } from '../../../../service/chapterService';
import { getResourcesByCourse } from '../../../../service/courseResourceService';

interface QuestionFormModalProps {
  question?: Question | null;
  courseId: number;
  selectedLessonId?: number | null;
  selectedLessonTitle?: string;
  onClose: () => void;
  onSave: (data: CreateQuestionRequest) => Promise<void>;
  onSelectLesson?: () => void;
}

interface OptionItem {
  label: string;
  content: string;
}

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({ 
  question, 
  courseId, 
  selectedLessonId,
  selectedLessonTitle,
  onClose, 
  onSave,
  onSelectLesson,
}) => {
  // ✅ State giữ nguyên 100%
  const [content, setContent] = useState('');
  const [questionType, setQuestionType] = useState<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'>('SINGLE_CHOICE');
  const [options, setOptions] = useState<OptionItem[]>([
    { label: 'A', content: '' }, { label: 'B', content: '' },
    { label: 'C', content: '' }, { label: 'D', content: '' },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [currentLessonTitle, setCurrentLessonTitle] = useState<string>('');

  // ✅ Effect 1 giữ nguyên 100%
  useEffect(() => {
    if (question) {
      setContent(question.content);
      setQuestionType(question.questionType);
      setPoints(question.points || 1);
      
      try {
        const opts = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
        if (Array.isArray(opts) && opts.length > 0) setOptions(opts);
      } catch (e) {}
      
      try {
        const correct = typeof question.correctAnswer === 'string' ? JSON.parse(question.correctAnswer) : question.correctAnswer;
        if (Array.isArray(correct)) setCorrectAnswer(correct);
      } catch (e) {}
      
      setExplanation(question.explanation || '');
      setCurrentLessonId(question.lessonId || null);
      setCurrentLessonTitle(question.lessonTitle || '');
    }
  }, [question]);

  // ✅ Effect 2 giữ nguyên 100%
  useEffect(() => {
    if (selectedLessonId !== undefined) {
      setCurrentLessonId(selectedLessonId);
    }
    if (selectedLessonTitle !== undefined) {
      setCurrentLessonTitle(selectedLessonTitle);
    }
  }, [selectedLessonId, selectedLessonTitle]);

  // ✅ Form Submit Logic giữ nguyên 100%
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (questionType !== 'SHORT_ANSWER' && correctAnswer.length === 0) return;

    setSaving(true);
    try {
      const data: CreateQuestionRequest = {
        courseId,
        lessonId: currentLessonId ?? undefined,
        content: content.trim(),
        questionType,
        options: questionType === 'SHORT_ANSWER' ? '[]' : JSON.stringify(options),
        correctAnswer: JSON.stringify(correctAnswer),
        explanation: explanation.trim(),
        points,
      };
      
      await onSave(data);
      onClose();
    } catch (err) {
      // Lỗi đã xử lý ở parent
    } finally {
      setSaving(false);
    }
  };

  // ✅ Handlers giữ nguyên 100%
  const handleOptionChange = (index: number, value: string) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, content: value } : opt));
  };

  const handleAddOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length);
    setOptions(prev => [...prev, { label: nextLabel, content: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter((_, i) => i !== index));
    setCorrectAnswer(prev => prev.filter(ans => ans !== options[index].label));
  };

  const toggleCorrectAnswer = (label: string) => {
    if (questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE') {
      setCorrectAnswer([label]);
    } else {
      setCorrectAnswer(prev => 
        prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
      );
    }
  };

  const TYPE_OPTIONS = [
    { value: 'SINGLE_CHOICE', label: '1 Đáp án', desc: 'Chọn 1 đáp án đúng' },
    { value: 'MULTIPLE_CHOICE', label: 'Nhiều đáp án', desc: 'Chọn nhiều đáp án' },
    { value: 'TRUE_FALSE', label: 'Đúng / Sai', desc: 'Chọn True hoặc False' },
    { value: 'SHORT_ANSWER', label: 'Tự luận', desc: 'Nhập câu trả lời ngắn' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
              <FaQuestionCircle size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-tight">
                {question ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Thiết lập nội dung và đáp án cho bài kiểm tra</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <FaTimes size={15} />
          </button>
        </div>

        {/* Form bao bọc toàn bộ nội dung và nút bấm để giữ nguyên cơ chế HTML Submit */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Question Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Loại câu hỏi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TYPE_OPTIONS.map(type => {
                  const isActive = questionType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setQuestionType(type.value as any);
                        setCorrectAnswer([]);
                        if (type.value === 'TRUE_FALSE') {
                          setOptions([{ label: 'True', content: 'Đúng' }, { label: 'False', content: 'Sai' }]);
                        } else if (type.value !== 'SHORT_ANSWER' && options.length <= 2) {
                          setOptions([
                            { label: 'A', content: '' }, { label: 'B', content: '' },
                            { label: 'C', content: '' }, { label: 'D', content: '' },
                          ]);
                        }
                      }}
                      className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between relative ${
                        isActive
                          ? 'border-cyan-500 bg-cyan-500/5 text-cyan-900 shadow-sm ring-2 ring-cyan-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-xs font-bold ${isActive ? 'text-cyan-700' : 'text-slate-700'}`}>
                          {type.label}
                        </span>
                        {isActive && <FaCheck className="text-cyan-600 text-[10px]" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal leading-tight">{type.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Nội dung câu hỏi <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 bg-slate-50/30 outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all resize-none placeholder:text-slate-400"
                rows={3}
                placeholder="Nhập nội dung câu hỏi..."
                required
              />
            </div>

            {/* Points & Lesson Link */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Điểm</label>
                <input
                  type="number"
                  value={points}
                  onChange={e => setPoints(Number(e.target.value))}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                  min={1}
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Thuộc bài học</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={onSelectLesson}
                    className="w-full h-11 flex items-center justify-between px-3.5 rounded-xl border border-slate-200 hover:border-cyan-400 bg-white hover:bg-cyan-50/30 transition-all text-left"
                  >
                    {currentLessonTitle ? (
                      <span className="flex items-center gap-2 text-xs font-medium text-slate-800 truncate pr-6">
                        <FaBook size={13} className="text-cyan-500 shrink-0" />
                        <span className="truncate">{currentLessonTitle}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 flex items-center gap-2">
                        <FaBook size={13} className="shrink-0" /> Chọn bài học...
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md shrink-0">
                      {currentLessonTitle ? 'Đổi' : 'Chọn'}
                    </span>
                  </button>

                  {currentLessonId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentLessonId(null);
                        setCurrentLessonTitle('');
                      }}
                      className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 rounded-md transition"
                    >
                      <FaTimes size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Options */}
            {questionType !== 'SHORT_ANSWER' && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Đáp án <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[10px] text-slate-400 font-medium">Bấm vào ô ký tự để chọn làm đáp án đúng</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddOption} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 text-[11px] font-bold transition"
                  >
                    <FaPlus size={9} /> Thêm đáp án
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, i) => {
                    const isSelected = correctAnswer.includes(opt.label);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCorrectAnswer(opt.label)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all border shadow-sm ${
                            isSelected
                              ? 'bg-emerald-500 text-white border-emerald-500 ring-2 ring-emerald-500/20'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                          }`}
                        >
                          {isSelected ? <FaCheckCircle size={14} /> : opt.label}
                        </button>

                        <input
                          type="text"
                          value={opt.content}
                          onChange={e => handleOptionChange(i, e.target.value)}
                          className={`flex-1 h-9 rounded-xl border px-3 text-xs outline-none transition-all ${
                            isSelected 
                              ? 'border-emerald-200 bg-emerald-50/20 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10' 
                              : 'border-slate-200 bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10'
                          }`}
                          placeholder={`Đáp án ${opt.label}`}
                        />

                        {options.length > 2 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveOption(i)} 
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <FaRegLightbulb className="text-amber-500" size={12} /> Giải thích
              </label>
              <textarea
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 bg-slate-50/30 outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all resize-none placeholder:text-slate-400"
                rows={2}
                placeholder="Giải thích đáp án..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || !content.trim() || (questionType !== 'SHORT_ANSWER' && correctAnswer.length === 0)}
              className="flex-1 rounded-xl bg-cyan-500 text-white py-2.5 text-xs font-bold hover:bg-cyan-600 active:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" size={13} /> Đang lưu...
                </>
              ) : (
                question ? 'Cập nhật' : 'Thêm câu hỏi'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};