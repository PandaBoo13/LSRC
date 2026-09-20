// src/components/elearning/course/course-details/SortableChapterItem.tsx
import React from 'react';
import { FaLayerGroup, FaEdit, FaTrash, FaChevronDown, FaChevronRight, FaGripVertical } from 'react-icons/fa';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Chapter } from '../../../../types/chapter.types';
import type { CourseResource } from '../../../../types/courseResource.types';
import { SortableLessonItem } from './SortableLessonItem';

type Props = {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (chapter: Chapter) => void;
  onDelete: (chapter: Chapter) => void;
  onEditLesson: (lesson: CourseResource) => void;
  onDeleteLesson: (lesson: CourseResource) => void;
};

export const SortableChapterItem: React.FC<Props> = ({
  chapter, isExpanded, onToggle, onEdit, onDelete,
  onEditLesson, onDeleteLesson,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `chapter-${chapter.id}`,
    data: { type: 'chapter', chapter },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // ✅ THAY ĐỔI: lessons → resources
  const chapterResources = chapter.resources || [];

  return (
    <div ref={setNodeRef} style={style} className={`rounded-2xl border-2 ${isExpanded ? 'border-cyan-400 bg-cyan-50/30' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center p-3.5">
        <button {...listeners} {...attributes} className="p-1.5 text-slate-300 hover:text-cyan-500 cursor-grab active:cursor-grabbing">
          <FaGripVertical size={14} />
        </button>
        <div onClick={onToggle} className="flex-1 flex items-center justify-between cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <FaLayerGroup size={14} className="text-cyan-500" />
            <span className="text-sm font-bold">{chapter.title}</span>
            <span className="text-xs text-slate-400">({chapterResources.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); onEdit(chapter); }} className="p-1 text-blue-500"><FaEdit size={11} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(chapter); }} className="p-1 text-rose-500"><FaTrash size={11} /></button>
            {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-1.5">
          {chapterResources.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">Kéo bài học vào đây</p>
          ) : (
            <SortableContext items={chapterResources.map(r => `lesson-${r.id}`)} strategy={verticalListSortingStrategy}>
              {chapterResources.map(resource => (
                <SortableLessonItem
                  key={resource.id}
                  lesson={resource}
                  onEdit={onEditLesson}
                  onDelete={onDeleteLesson}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
};