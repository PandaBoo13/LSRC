// src/components/elearning/course/course-details/UnassignedLessonDropZone.tsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Lesson } from '../../../../types/lesson.types';
import { SortableLessonItem } from './SortableLessonItem';

type Props = {
  lessons: Lesson[];
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
};

export const UnassignedLessonDropZone: React.FC<Props> = ({ lessons, onEdit, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned-drop',
    data: { type: 'unassigned' },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] rounded-2xl border-2 border-dashed p-3 transition-all ${
        isOver ? 'border-cyan-400 bg-cyan-50/50' : 'border-slate-200'
      }`}
    >
      {lessons.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">Kéo bài học ra đây</p>
      ) : (
        <SortableContext items={lessons.map(l => `lesson-${l.id}`)} strategy={verticalListSortingStrategy}>
          {lessons.map(lesson => (
            <SortableLessonItem key={lesson.id} lesson={lesson} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
      )}
    </div>
  );
};