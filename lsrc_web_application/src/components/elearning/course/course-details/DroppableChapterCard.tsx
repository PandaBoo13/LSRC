import React from 'react';
import {
  FaLayerGroup,
  FaEdit,
  FaTrash,
  FaChevronRight,
  FaChevronDown,
} from 'react-icons/fa';
import { useDroppable } from '@dnd-kit/core';

import type { Chapter } from '../../../../types/chapter.types';
import type { Lesson } from '../../../../types/lesson.types';
import { SortableLessonItem } from '../course-details/SortableLessonItem';

type Props = {
  chapter: Chapter;
  lessons: Lesson[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (chapter: Chapter) => void;
  onDelete: (chapter: Chapter) => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
};

export const DroppableChapterCard: React.FC<Props> = ({
  chapter,
  lessons,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onEditLesson,
  onDeleteLesson,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${chapter.idChapter}`,
    data: {
      type: 'chapter',
      chapter,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 transition-all ${
        isExpanded
          ? 'border-cyan-400 bg-cyan-50/30'
          : 'border-slate-200 bg-white'
      } ${
        isOver
          ? 'ring-2 ring-cyan-400 bg-cyan-50/50'
          : ''
      }`}
    >
      {/* HEADER */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 rounded-t-2xl select-none"
      >
        <div className="flex items-center gap-2.5">
          <FaLayerGroup
            className="text-cyan-500 shrink-0"
            size={14}
          />

          <div>
            <h4 className="text-sm font-bold text-slate-800">
              {chapter.title}
            </h4>

            <p className="text-[10px] text-slate-400">
              {lessons.length} bài học
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(chapter);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-500"
          >
            <FaEdit size={11} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chapter);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-500"
          >
            <FaTrash size={11} />
          </button>

          {isExpanded ? (
            <FaChevronDown
              size={12}
              className="text-slate-400"
            />
          ) : (
            <FaChevronRight
              size={12}
              className="text-slate-300"
            />
          )}
        </div>
      </div>

      {/* CONTENT */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-1.5 max-h-[300px] overflow-y-auto">
          {lessons.length === 0 ? (
            <p className="text-[10px] text-slate-400 text-center py-4">
              Kéo thả bài học vào đây
            </p>
          ) : (
            lessons.map((lesson) => (
              <SortableLessonItem
                key={`lesson-${lesson.idLesson}`}
                lesson={lesson}
                onEdit={onEditLesson}
                onDelete={onDeleteLesson}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};