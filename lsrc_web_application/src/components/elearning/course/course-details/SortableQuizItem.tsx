// src/components/elearning/course/course-details/SortableQuizItem.tsx
import React from 'react';
import { 
  FaClipboardCheck, FaEdit, FaTrash, FaChevronDown, FaChevronRight, 
  FaGripVertical, FaHashtag, FaTimes 
} from 'react-icons/fa';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CourseResource } from '../../../../types/courseResource.types';

type Props = {
  quiz: CourseResource;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit?: (quiz: CourseResource) => void;
  onDelete?: (quiz: CourseResource) => void;
  onRemoveHashtag?: (quiz: CourseResource, hashtag: string) => void;
};

export const SortableQuizItem: React.FC<Props> = ({
  quiz,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onRemoveHashtag,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `quiz-${quiz.id}`,
    data: { type: 'quiz', quiz },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hashtags = quiz.hashtagFilter 
    ? quiz.hashtagFilter.split(',').map(h => h.trim()).filter(h => h) 
    : [];

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`rounded-2xl border-2 transition ${
        isExpanded ? 'border-amber-400 bg-amber-50/30' : 'border-amber-200 bg-white hover:border-amber-300'
      }`}
    >
      {/* Quiz Header */}
      <div className="flex items-center p-3.5">
        <button {...listeners} {...attributes} className="p-1.5 text-slate-300 hover:text-amber-500 cursor-grab active:cursor-grabbing">
          <FaGripVertical size={14} />
        </button>
        
        <div onClick={onToggle} className="flex-1 flex items-center justify-between cursor-pointer select-none min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <FaClipboardCheck size={12} className="text-amber-600" />
            </div>
            <span className="text-sm font-bold text-slate-700 truncate">{quiz.title}</span>
            <span className="text-xs text-slate-400 shrink-0">({hashtags.length} tags)</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(quiz); }} 
                className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                title="Sửa quiz"
              >
                <FaEdit size={11} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(quiz); }} 
                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                title="Xóa quiz"
              >
                <FaTrash size={11} />
              </button>
            )}
            {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          </div>
        </div>
      </div>

      {/* Quiz Meta */}
      <div className="px-3.5 pb-2 flex items-center gap-3 text-[10px] text-slate-400">
        <span>{quiz.totalQuestions || 0} câu hỏi</span>
        <span>•</span>
        <span>Đỗ: {quiz.passingScore}%</span>
        {quiz.timeLimit && (
          <>
            <span>•</span>
            <span>{quiz.timeLimit} phút</span>
          </>
        )}
      </div>

      {/* Hashtags - Drop zone */}
      {isExpanded && (
        <div 
          className="px-3 pb-3 space-y-1.5 border-t border-amber-100 pt-2"
          onDragOver={(e) => e.preventDefault()}
        >
          {hashtags.length === 0 ? (
            <p className="text-[10px] text-slate-400 italic text-center py-3 bg-amber-50/50 rounded-lg border border-dashed border-amber-200">
              Kéo bài học vào đây để thêm hashtag
            </p>
          ) : (
            hashtags.map(tag => (
              <div key={tag} className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-white border border-amber-100">
                <span className="text-[11px] font-mono text-amber-700 flex items-center gap-1.5 truncate">
                  <FaHashtag size={9} className="shrink-0" /> {tag}
                </span>
                {onRemoveHashtag && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHashtag(quiz, tag);
                    }}
                    className="p-0.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                    title="Xóa hashtag"
                  >
                    <FaTimes size={9} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};