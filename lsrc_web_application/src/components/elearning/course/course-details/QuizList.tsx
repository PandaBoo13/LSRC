// ============================================
// 1. QuizList.tsx - PURE UI REFACTOR
// ============================================
import React from 'react';
import { FaClipboardCheck, FaPlus, FaLightbulb } from 'react-icons/fa';
import type { CourseResource } from '../../../../types/courseResource.types';
import { SortableQuizItem } from './SortableQuizItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

type Props = {
  quizzes: CourseResource[];
  expandedQuizId: number | null;
  onToggle: (quizId: number) => void;
  onEdit?: (quiz: CourseResource) => void;
  onDelete?: (quiz: CourseResource) => void;
  onRemoveHashtag?: (quiz: CourseResource, hashtag: string) => void;
  onAddQuiz?: () => void;
};

export const QuizList: React.FC<Props> = ({
  quizzes,
  expandedQuizId,
  onToggle,
  onEdit,
  onDelete,
  onRemoveHashtag,
  onAddQuiz,
}) => {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <FaClipboardCheck size={13} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 leading-tight">
              Danh sách Quiz
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">Tổng số: {quizzes.length} bài kiểm tra</p>
          </div>
        </div>

        {onAddQuiz && (
          <button
            type="button"
            onClick={onAddQuiz}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-sm shadow-amber-500/20 transition shrink-0"
          >
            <FaPlus size={9} /> Thêm quiz
          </button>
        )}
      </div>

      {/* List content */}
      {quizzes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-2.5">
            <FaClipboardCheck size={20} />
          </div>
          <p className="text-xs font-bold text-slate-700">Chưa có bài quiz nào</p>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">Tạo bài kiểm tra để đánh giá mức độ hiểu bài của học viên</p>
          
          {onAddQuiz && (
            <button
              type="button"
              onClick={onAddQuiz}
              className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition"
            >
              <FaPlus size={10} /> Tạo quiz đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          <SortableContext items={quizzes.map(q => `quiz-${q.id}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {quizzes.map(quiz => (
                <SortableQuizItem
                  key={quiz.id}
                  quiz={quiz}
                  isExpanded={expandedQuizId === quiz.id}
                  onToggle={() => onToggle(quiz.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRemoveHashtag={onRemoveHashtag}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
};


