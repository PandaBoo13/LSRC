// src/components/elearning/lesson/LessonList.tsx
import { useState, useEffect } from 'react';
import { FaPlus, FaBook, FaList } from 'react-icons/fa';
import { Panel } from '../ui/Panel';
import { LessonItem } from './LessonItem';
import type { Lesson } from '../../../types/lesson.types';
// ✅ Sửa import - Bỏ lessonService vì không còn updateOrderBatch
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableLessonItemWrapper({
  lesson,
  index,
  onEdit,
  onDelete,
  onStatusChange,
  onUploadResource,
  onViewResources,
}: {
  lesson: Lesson;
  index: number;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  onStatusChange: (lesson: Lesson, status: string) => void;
  onUploadResource: (lesson: Lesson) => void;
  onViewResources?: (lesson: Lesson) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.idLesson });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <LessonItem
        lesson={lesson}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onUploadResource={onUploadResource}
        onViewResources={onViewResources}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

type Props = {
  lessons: Lesson[];
  courseId?: number;
  onCreate: () => void;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  onStatusChange: (lesson: Lesson, status: string) => void;
  onUploadResource: (lesson: Lesson) => void;
  onViewResources?: (lesson: Lesson) => void;
  onOrderChange?: (lessons: Lesson[]) => void;
  onError?: (message: string) => void;
};

export function LessonList({ 
  lessons: initialLessons,
  courseId,
  onCreate, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onUploadResource,
  onViewResources,
  onOrderChange,
  onError,
}: Props) {
  const [lessons, setLessons] = useState(initialLessons);

  useEffect(() => {
    setLessons(initialLessons);
  }, [initialLessons]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((item) => item.idLesson === active.id);
    const newIndex = lessons.findIndex((item) => item.idLesson === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedLessons = arrayMove(lessons, oldIndex, newIndex);
    
    const updatedLessons = reorderedLessons.map((lesson, index) => ({
      ...lesson,
      orderIndex: index,
    }));
    
    setLessons(updatedLessons);
    onOrderChange?.(updatedLessons);

    // ✅ Backend không có API updateOrderBatch, chỉ gọi onOrderChange local
    // TODO: Nếu cần lưu thứ tự, gọi updateLesson cho từng lesson
    console.log('Order changed locally:', updatedLessons.map(l => ({ id: l.idLesson, order: l.orderIndex })));
  };

  if (lessons.length === 0) {
    return (
      <Panel className="p-6 sm:p-14 text-center border border-slate-200/80 shadow-2xs rounded-2xl sm:rounded-3xl bg-white">
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-[#49BBBD]">
          <FaBook className="text-xl sm:text-2xl" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Chưa có bài học nào</h3>
        <p className="text-xs text-slate-400 mb-5 max-w-sm mx-auto">
          Bắt đầu xây dựng nội dung khóa học bằng cách thêm bài học đầu tiên.
        </p>
        <button 
          onClick={onCreate} 
          className="inline-flex items-center gap-1.5 rounded-xl sm:rounded-2xl bg-[#49BBBD] hover:bg-[#3ca3a5] px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold text-white transition shadow-md shadow-cyan-500/20 active:scale-[0.98]"
        >
          <FaPlus size={11} /> Tạo bài học đầu tiên
        </button>
      </Panel>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <FaList size={12} className="sm:text-sm" />
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1.5 truncate">
            Danh sách bài học
            <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200/60 rounded-full text-[10px] sm:text-xs font-semibold shrink-0">
              {lessons.length}
            </span>
          </h2>
        </div>

        <button 
          onClick={onCreate} 
          className="inline-flex items-center gap-1.5 rounded-xl sm:rounded-2xl bg-[#49BBBD] hover:bg-[#3ca3a5] px-3 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-bold text-white transition shadow-md shadow-cyan-500/20 active:scale-[0.98] shrink-0"
        >
          <FaPlus size={10} /> <span className="hidden sm:inline">Thêm bài học</span><span className="sm:hidden">Thêm</span>
        </button>
      </div>

      {/* List with Drag & Drop */}
      <div className="p-1.5 sm:p-2 bg-slate-50/60 rounded-2xl sm:rounded-3xl border border-slate-200/80">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lessons.map((l) => l.idLesson)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5 sm:space-y-2">
              {lessons.map((lesson, index) => (
                <SortableLessonItemWrapper
                  key={lesson.idLesson}
                  lesson={lesson}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onUploadResource={onUploadResource}
                  onViewResources={onViewResources}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}