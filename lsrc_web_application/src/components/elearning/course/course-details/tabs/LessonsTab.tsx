// ============================================
// LessonsTab.tsx - FIXED HASHTAG + FILE UPLOAD
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaSpinner, FaClipboardCheck } from 'react-icons/fa';
import type { CourseResource } from '../../../../../types/courseResource.types';
import type { Chapter } from '../../../../../types/chapter.types';
import { 
  uploadResource, 
  updateResource, 
  deleteResource,
  getResourcesByCourse 
} from '../../../../../service/courseResourceService';
import { getChaptersByCourse, createChapter, updateChapter, deleteChapter, updateChapterOrderBatch } from '../../../../../service/chapterService';
import { LessonFormModal, type SaveLessonPayload } from '../../../../elearning/lesson/LessonFormModal';
import { ChapterFormModal } from '../../../../elearning/course/course-details/ChapterFormModal';
import { ChapterList } from '../../../../elearning/course/course-details/ChapterList';
import { QuizList } from '../../../../elearning/course/course-details/QuizList';
import { QuizFormModal } from '../../../../elearning/course/course-details/QuizFormModal';
import { Toast, type ToastMessage } from '../../../../elearning/ui/Toast';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragOverlay, type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

type Props = { 
  courseId?: number;
  lessons?: CourseResource[];
  onLessonsChange?: (lessons: CourseResource[]) => void;
};

export const LessonsTab: React.FC<Props> = ({ courseId, lessons = [], onLessonsChange }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [quizzes, setQuizzes] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [expandedChapterId, setExpandedChapterId] = useState<number | null>(null);
  const [expandedQuizId, setExpandedQuizId] = useState<number | null>(null);
  const [activeDrag, setActiveDrag] = useState<{ type: string; data: any } | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CourseResource | null>(null);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  
  // Quiz form state
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<CourseResource | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getChapterResources = (chapter: Chapter): CourseResource[] => {
    return (chapter as any).resources || (chapter as any).lessons || [];
  };

  const fetchData = useCallback(async () => {
    if (!courseId || isNaN(Number(courseId))) return;
    setLoading(true);
    try {
      const [chaptersData, resourcesData] = await Promise.all([
        getChaptersByCourse(courseId),
        getResourcesByCourse(courseId).catch(() => []),
      ]);

      if (Array.isArray(chaptersData)) {
        setChapters(chaptersData);
      } else {
        setChapters((chaptersData as any)?.content || []);
      }

      const allResources = Array.isArray(resourcesData) ? resourcesData : [];
      const quizResources = allResources.filter(r => r.resourceType === 'QUIZ');
      setQuizzes(quizResources);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // ==================== QUIZ HANDLERS ====================

  const handleAddQuiz = () => {
    setEditingQuiz(null);
    setShowQuizForm(true);
  };

  const handleEditQuiz = (quiz: CourseResource) => {
    setEditingQuiz(quiz);
    setShowQuizForm(true);
  };

  const handleDeleteQuiz = async (quiz: CourseResource) => {
    if (!confirm(`Xóa quiz "${quiz.title}"?`)) return;
    try {
      await deleteResource(courseId!, quiz.id);
      showToast('Xóa quiz thành công!');
      await fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Lỗi xóa quiz', 'error');
    }
  };

  const handleSaveQuiz = async (quizData: any) => {
    try {
      const dataWithType = { ...quizData, resourceType: 'QUIZ' };
      
      if (editingQuiz) {
        await updateResource(courseId!, editingQuiz.id, dataWithType as any);
      } else {
        await uploadResource(courseId!, dataWithType as any);
      }
      
      showToast(editingQuiz ? 'Cập nhật quiz thành công!' : 'Thêm quiz thành công!');
      await fetchData();
      setShowQuizForm(false);
      setEditingQuiz(null);
    } catch (err: any) {
      showToast(err?.message || 'Lỗi lưu quiz', 'error');
      throw err;
    }
  };

  // ==================== DRAG HANDLERS ====================

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDrag({ type: event.active.data.current?.type || '', data: event.active.data.current });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over) return;
    const activeData = active.data.current;
    const overData = over.data.current;

    // ==================== SẮP XẾP CHAPTER ====================
    if (activeData?.type === 'chapter' && overData?.type === 'chapter') {
      const oldIdx = chapters.findIndex(c => c.id === activeData.chapter.id);
      const newIdx = chapters.findIndex(c => c.id === overData.chapter.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(chapters, oldIdx, newIdx);
        const updatedWithNewOrder = reordered.map((ch, idx) => ({ ...ch, orderIndex: idx }));
        setChapters(updatedWithNewOrder);
        const updates = updatedWithNewOrder.map(ch => ({ idChapter: ch.id, orderIndex: ch.orderIndex }));
        try {
          await updateChapterOrderBatch(updates);
          showToast('Đã cập nhật thứ tự chương!');
        } catch {
          showToast('Lỗi cập nhật thứ tự', 'error');
        }
      }
      return;
    }

    // ==================== KÉO LESSON VÀO CHAPTER ====================
    if (activeData?.type === 'lesson' && overData?.type === 'chapter') {
      const lesson = activeData.lesson as CourseResource;
      const targetChapter = overData.chapter as Chapter;
      if (lesson.chapterId === targetChapter.id) return;
      
      setChapters(prev => prev.map(ch => {
        if (ch.id === targetChapter.id) {
          const currentResources = getChapterResources(ch);
          return { ...ch, resources: [...currentResources, { ...lesson, chapterId: targetChapter.id }] };
        }
        if (ch.id === lesson.chapterId) {
          const currentResources = getChapterResources(ch);
          return { ...ch, resources: currentResources.filter(r => r.id !== lesson.id) };
        }
        return ch;
      }));
      
      try {
        await updateResource(courseId!, lesson.id, { ...lesson, chapterId: targetChapter.id } as any);
        showToast(`Đã chuyển "${lesson.title}" vào "${targetChapter.title}"`);
      } catch {
        showToast('Lỗi chuyển bài học', 'error');
      }
      return;
    }

    // ==================== SẮP XẾP LESSON ====================
    if (activeData?.type === 'lesson' && overData?.type === 'lesson') {
      const activeLesson = activeData.lesson as CourseResource;
      const overLesson = overData.lesson as CourseResource;
      if (activeLesson.chapterId !== overLesson.chapterId) return;
      
      const chapter = chapters.find(c => c.id === activeLesson.chapterId);
      if (!chapter) return;
      const resourcesInCh = getChapterResources(chapter);
      const oldIdx = resourcesInCh.findIndex(r => r.id === activeLesson.id);
      const newIdx = resourcesInCh.findIndex(r => r.id === overLesson.id);
      
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(resourcesInCh, oldIdx, newIdx);
        setChapters(prev => prev.map(ch => ch.id === chapter.id ? { ...ch, resources: reordered } : ch));
        for (const [idx, r] of reordered.entries()) {
          try { await updateResource(courseId!, r.id, { ...r, orderIndex: idx } as any); } catch {}
        }
        showToast('Đã cập nhật thứ tự bài học!');
      }
      return;
    }

    // ==================== ✅ KÉO LESSON VÀO QUIZ ====================
    if (activeData?.type === 'lesson' && overData?.type === 'quiz') {
      const lesson = activeData.lesson as CourseResource;
      const quiz = overData.quiz as CourseResource;
      
      const hashtag = `#lesson-${lesson.id}`;
      
      const currentHashtags = quiz.hashtagFilter 
        ? quiz.hashtagFilter.split(',').map(h => h.trim()).filter(h => h) 
        : [];
      
      if (currentHashtags.includes(hashtag)) {
        showToast(`Hashtag "${hashtag}" đã tồn tại trong quiz`, 'error');
        return;
      }
      
      const newHashtags = [...currentHashtags, hashtag];
      const newHashtagFilter = newHashtags.join(', ');
      
      setQuizzes(prev => prev.map(q => 
        q.id === quiz.id ? { ...q, hashtagFilter: newHashtagFilter } : q
      ));
      
      try {
        await updateResource(courseId!, quiz.id, { hashtagFilter: newHashtagFilter } as any);
        showToast(`Đã thêm hashtag "${hashtag}" vào "${quiz.title}"`);
      } catch {
        showToast('Lỗi thêm hashtag', 'error');
      }
      return;
    }
  };

  const handleToggleChapter = (chapterId: number) => {
    setExpandedChapterId(prev => prev === chapterId ? null : chapterId);
  };

  const handleToggleQuiz = (quizId: number) => {
    setExpandedQuizId(prev => prev === quizId ? null : quizId);
  };

  const handleCreateChapter = () => { setEditingChapter(null); setShowChapterForm(true); };
  const handleEditChapter = (chapter: Chapter) => { setEditingChapter(chapter); setShowChapterForm(true); };

  const handleSaveChapter = async (title: string, description: string) => {
    if (!courseId) return;
    if (editingChapter) { await updateChapter(editingChapter.id, { title, description }); }
    else { await createChapter(courseId, { title, description }); }
    setShowChapterForm(false);
    await fetchData();
    showToast('Lưu chương thành công!');
  };

  const handleDeleteChapter = async (chapter: Chapter) => {
    if (!confirm(`Xóa chương "${chapter.title}"?`)) return;
    await deleteChapter(chapter.id);
    await fetchData();
    showToast('Xóa chương thành công!');
  };

  const handleCreateLesson = () => { setEditingLesson(null); setIsFormModalOpen(true); };
  const handleEditLesson = (lesson: CourseResource) => { setEditingLesson(lesson); setIsFormModalOpen(true); };

  // ==================== ✅ FIXED: handleSaveLesson ====================
  const handleSaveLesson = useCallback(async (payload: SaveLessonPayload) => {
    setLoading(true);
    try {
      // ✅ 1. Xóa các resource đã đánh dấu xóa (nếu có)
      if (payload.deletedResourceIds && payload.deletedResourceIds.length > 0) {
        await Promise.all(
          payload.deletedResourceIds.map(id =>
            deleteResource(courseId!, id).catch((err) => {
              console.error(`Lỗi xóa resource ${id}:`, err);
              return null;
            })
          )
        );
      }

      // ✅ 2. Merge primaryVideoFile vào lessonData để gửi lên BE
      const dataToSend = {
        ...payload.lessonData,
        file: payload.primaryVideoFile || undefined,   // ← KEY FIX
      };

      let savedLesson: CourseResource;

      if (editingLesson) {
        // UPDATE
        savedLesson = await updateResource(courseId!, editingLesson.id, dataToSend as any);
      } else {
        // CREATE
        savedLesson = await uploadResource(courseId!, dataToSend as any);
      }

      // ✅ 3. Upload các attachments mới (nếu có) — thuộc lesson vừa tạo
      if (payload.newAttachments && payload.newAttachments.length > 0) {
        await Promise.all(
          payload.newAttachments.map(att =>
            uploadResource(courseId!, {
              title: att.title,
              resourceType: att.resourceType,
              parentId: savedLesson.id,        // attachment thuộc lesson
              courseId,
              file: att.file,
            } as any).catch((err) => {
              console.error(`Lỗi upload attachment "${att.title}":`, err);
              return null;
            })
          )
        );
      }

      showToast('Lưu bài học thành công!');
      await fetchData();
      setIsFormModalOpen(false);
      setEditingLesson(null);
    } catch (err: any) {
      showToast(err?.message || 'Lỗi lưu bài học', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [editingLesson, fetchData, courseId]);

  const handleDeleteLesson = async (lesson: CourseResource) => {
    if (!confirm(`Xóa bài học "${lesson.title}"?`)) return;
    await deleteResource(courseId!, lesson.id);
    showToast('Xóa bài học thành công!');
    await fetchData();
  };

  const handleRemoveHashtag = async (quiz: CourseResource, hashtagToRemove: string) => {
    const currentHashtags = quiz.hashtagFilter ? quiz.hashtagFilter.split(',').map(h => h.trim()).filter(h => h) : [];
    const newHashtags = currentHashtags.filter(h => h !== hashtagToRemove);
    const newHashtagFilter = newHashtags.join(', ');
    
    setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, hashtagFilter: newHashtagFilter } : q));
    
    try {
      await updateResource(courseId!, quiz.id, { hashtagFilter: newHashtagFilter } as any);
      showToast(`Đã xóa hashtag "${hashtagToRemove}"`);
    } catch {
      showToast('Lỗi xóa hashtag', 'error');
    }
  };

  const totalLessons = chapters.reduce((sum, ch) => sum + getChapterResources(ch).length, 0);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="w-full space-y-4">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {loading && (
          <div className="flex items-center justify-center py-10">
            <FaSpinner className="animate-spin text-cyan-500" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-800">Bài học ({totalLessons})</h3>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500">{chapters.length} chương</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-amber-600 font-bold">{quizzes.length} quiz</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCreateChapter} className="px-3 py-2 rounded-xl text-xs font-bold bg-violet-50 text-violet-600 hover:bg-violet-100 transition cursor-pointer">
              <FaPlus size={11} className="inline mr-1" /> Thêm chương
            </button>
            <button onClick={handleCreateLesson} className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-white hover:bg-cyan-600 transition cursor-pointer">
              <FaPlus size={11} className="inline mr-1" /> Thêm bài học
            </button>
          </div>
        </div>

        {/* 2 CỘT BẰNG NHAU */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* LEFT: CHAPTERS */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col min-h-[500px] h-full">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Chương & Bài học
              </h3>
              <span className="text-[10px] text-slate-400">{totalLessons} bài</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ChapterList
                chapters={chapters}
                expandedChapterId={expandedChapterId}
                onToggle={handleToggleChapter}
                onEdit={handleEditChapter}
                onDelete={handleDeleteChapter}
                onEditLesson={handleEditLesson}
                onDeleteLesson={handleDeleteLesson}
              />
            </div>
          </div>

          {/* RIGHT: QUIZZES */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col min-h-[500px] h-full">
            <QuizList
              quizzes={quizzes}
              expandedQuizId={expandedQuizId}
              onToggle={handleToggleQuiz}
              onEdit={handleEditQuiz}
              onDelete={handleDeleteQuiz}
              onRemoveHashtag={handleRemoveHashtag}
              onAddQuiz={handleAddQuiz}
            />
          </div>
        </div>

        <DragOverlay>
          {activeDrag?.type === 'chapter' ? (
            <div className="p-3 bg-white border-2 border-cyan-400 rounded-xl shadow-lg">
              {activeDrag.data.chapter.title}
            </div>
          ) : activeDrag?.type === 'lesson' ? (
            <div className="p-2 bg-white border-2 border-cyan-400 rounded-lg shadow-lg text-xs">
              {activeDrag.data.lesson.title}
            </div>
          ) : null}
        </DragOverlay>

        {showChapterForm && (
          <ChapterFormModal chapter={editingChapter} onClose={() => setShowChapterForm(false)} onSave={handleSaveChapter} />
        )}

        {isFormModalOpen && (
          <LessonFormModal
            lesson={editingLesson}
            courseId={courseId || 0}
            nextOrderIndex={totalLessons + 1}
            onClose={() => { setIsFormModalOpen(false); setEditingLesson(null); }}
            onSave={handleSaveLesson}
          />
        )}

        {/* QUIZ MODAL */}
        {showQuizForm && (
          <QuizFormModal
            quiz={editingQuiz}
            courseId={courseId || 0}
            onClose={() => { setShowQuizForm(false); setEditingQuiz(null); }}
            onSave={handleSaveQuiz}
          />
        )}
      </div>
    </DndContext>
  );
};