// src/components/elearning/course/course-details/ChapterList.tsx
import React from 'react';
import { FaLayerGroup } from 'react-icons/fa';
import type { Chapter } from '../../../../types/chapter.types';
import type { CourseResource } from '../../../../types/courseResource.types';
import { SortableChapterItem } from './SortableChapterItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

type Props = {
  chapters: Chapter[];
  expandedChapterId: number | null;
  onToggle: (chapterId: number) => void;
  onEdit: (chapter: Chapter) => void;
  onDelete: (chapter: Chapter) => void;
  onEditLesson: (lesson: CourseResource) => void;
  onDeleteLesson: (lesson: CourseResource) => void;
};

export const ChapterList: React.FC<Props> = ({
  chapters,
  expandedChapterId,
  onToggle,
  onEdit,
  onDelete,
  onEditLesson,
  onDeleteLesson,
}) => {
  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <FaLayerGroup className="text-3xl text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Chưa có chương nào</p>
      </div>
    );
  }

  return (
    <SortableContext items={chapters.map(c => `chapter-${c.id}`)} strategy={verticalListSortingStrategy}>
      <div className="space-y-3">
        {chapters.map(chapter => (
          <SortableChapterItem
            key={chapter.id}
            chapter={chapter}
            isExpanded={expandedChapterId === chapter.id}
            onToggle={() => onToggle(chapter.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onEditLesson={onEditLesson}
            onDeleteLesson={onDeleteLesson}
          />
        ))}
      </div>
    </SortableContext>
  );
};