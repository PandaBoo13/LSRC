// src/components/elearning/lesson/DraggableLessonCard.tsx
import React from 'react';
import { FaGripVertical, FaEdit, FaTrash } from 'react-icons/fa';
import { useDraggable } from '@dnd-kit/core';
import type { Lesson } from '../../../../types/lesson.types';

type Props = {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
};

export const DraggableLessonCard: React.FC<Props> = ({ lesson, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lesson-${lesson.idLesson}`,
    data: { type: 'lesson', lesson },
  });

  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 hover:border-cyan-200 hover:shadow-sm transition group cursor-default"
    >
      <button {...listeners} {...attributes} className="p-1 text-slate-300 hover:text-cyan-500 cursor-grab active:cursor-grabbing">
        <FaGripVertical size={12} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700 truncate">{lesson.title}</p>
        <p className="text-[10px] text-slate-400 truncate">
          {lesson.duration ? `${Math.floor(lesson.duration / 60)} phút` : 'Chưa có thời lượng'}
        </p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
        <button onClick={() => onEdit(lesson)} className="p-1 text-slate-400 hover:text-blue-500">
          <FaEdit size={11} />
        </button>
        <button onClick={() => onDelete(lesson)} className="p-1 text-slate-400 hover:text-rose-500">
          <FaTrash size={11} />
        </button>
      </div>
    </div>
  );
};