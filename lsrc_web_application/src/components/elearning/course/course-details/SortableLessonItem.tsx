// src/components/elearning/course/course-details/SortableLessonItem.tsx
import React from 'react';
import { FaEdit, FaTrash, FaGripVertical } from 'react-icons/fa';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// ✅ THAY ĐỔI: Bỏ Lesson type, dùng CourseResource
import type { CourseResource } from '../../../../types/courseResource.types';

type Props = {
  // ✅ THAY ĐỔI: Lesson → CourseResource
  lesson: CourseResource;
  onEdit: (lesson: CourseResource) => void;
  onDelete: (lesson: CourseResource) => void;
};

export const SortableLessonItem: React.FC<Props> = ({ lesson, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `lesson-${lesson.id}`, // ✅ Dùng id
    data: { type: 'lesson', lesson },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // ✅ THAY ĐỔI: Xử lý title có thể null
  const title = lesson.title || lesson.fileName || 'Không tên';

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-100">
      <button {...listeners} {...attributes} className="p-1 text-slate-300 hover:text-cyan-500 cursor-grab">
        <FaGripVertical size={12} />
      </button>
      <span className="flex-1 text-xs font-bold">{title}</span>
      <button onClick={() => onEdit(lesson)} className="p-1 text-blue-500"><FaEdit size={11} /></button>
      <button onClick={() => onDelete(lesson)} className="p-1 text-rose-500"><FaTrash size={11} /></button>
    </div>
  );
};