// ============================================
// QuestionList.tsx - PURE UI REFACTOR
// ============================================
import React from 'react';
import { 
  FaPlus, 
  FaDatabase, 
  FaSpinner, 
  FaEdit, 
  FaTrash, 
  FaChevronLeft, 
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle
} from 'react-icons/fa';
import type { CourseResource } from '../../../../types/courseResource.types';
import type { Question } from '../../../../service/quiz/quiz.types';

interface QuestionListProps {
  selectedLesson: CourseResource | null;
  questions: Question[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onAddQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: number) => void;
  onToggleStatus: (question: Question) => void;
  onPageChange: (page: number) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  selectedLesson,
  questions,
  loading,
  currentPage,
  totalPages,
  totalElements,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onToggleStatus,
  onPageChange,
}) => {
  // Empty State - Chưa chọn bài học
  if (!selectedLesson) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center text-2xl mb-3 shadow-sm">
          <FaDatabase />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Chưa chọn bài học</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          Vui lòng chọn một bài học ở danh sách bên trái để xem và quản lý câu hỏi.
        </p>
      </div>
    );
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'SINGLE_CHOICE': return '1 đáp án';
      case 'MULTIPLE_CHOICE': return 'Nhiều đáp án';
      case 'TRUE_FALSE': return 'Đúng / Sai';
      default: return 'Tự luận';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 shrink-0">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
            Bài học đang chọn
          </span>
          <h3 className="text-sm font-bold text-slate-800 truncate mt-0.5">
            {selectedLesson.title || selectedLesson.fileName || 'Không tên'}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            Tổng số: <strong className="text-slate-700 font-bold">{totalElements}</strong> câu hỏi
          </p>
        </div>
        
        <button
          onClick={onAddQuestion}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-white hover:bg-cyan-600 active:bg-cyan-700 shadow-sm shadow-cyan-500/20 transition shrink-0"
        >
          <FaPlus size={11} /> Thêm câu hỏi
        </button>
      </div>

      {/* Questions List Content */}
      <div className="flex-1 relative overflow-y-auto pr-1">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-2xl transition-all">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-100">
              <FaSpinner className="animate-spin text-cyan-500" size={16} />
              <span className="text-xs font-bold text-slate-600">Đang tải câu hỏi...</span>
            </div>
          </div>
        )}

        {/* Empty State - Chưa có câu hỏi trong bài học */}
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200 my-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
              <FaQuestionCircle size={22} />
            </div>
            <p className="text-xs font-bold text-slate-700">Chưa có câu hỏi nào</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Bắt đầu bằng cách bấm nút "Thêm câu hỏi" ở trên</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {questions.map((question: Question) => {
              const isActive = question.status === 'ACTIVE';
              return (
                <div
                  key={question.id}
                  className="group relative flex items-start justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/5 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Content */}
                    <div
                      className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: question.content }}
                    />
                    
                    {/* Meta Badges */}
                    <div className="flex items-center flex-wrap gap-1.5">
                      {/* Type Badge */}
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] border border-slate-200/60">
                        {getQuestionTypeLabel(question.questionType)}
                      </span>

                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {isActive ? 'Hoạt động' : 'Ẩn'}
                      </span>

                      {/* Points Badge */}
                      <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 font-bold text-[10px] border border-cyan-100">
                        {question.points || 1} điểm
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1 shrink-0 bg-slate-50 group-hover:bg-slate-100/80 p-1 rounded-xl transition-colors">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(question)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
                        isActive 
                          ? 'text-emerald-600 hover:bg-emerald-100/60' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/60'
                      }`}
                      title={isActive ? 'Vô hiệu hóa câu hỏi' : 'Kích hoạt câu hỏi'}
                    >
                      {isActive ? <FaCheckCircle size={13} /> : <FaTimesCircle size={13} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditQuestion(question)}
                      className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-cyan-600 hover:bg-cyan-100/60 rounded-lg transition"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <FaEdit size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(question.id)}
                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 rounded-lg transition"
                      title="Xóa câu hỏi"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 shrink-0">
          <p className="text-[11px] text-slate-500 font-medium">
            Trang <strong className="text-slate-800">{currentPage + 1}</strong> / {totalPages}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-xs border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <FaChevronLeft size={10} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPageChange(i)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                  currentPage === i 
                    ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20' 
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-xs border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};