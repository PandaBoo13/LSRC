// ============================================
// QuestionsTab.tsx - Bổ sung nút Import Excel
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaFileExcel } from 'react-icons/fa'; // ✅ Thêm FaFileExcel
import type { Question, CreateQuestionRequest } from '../../../../../service/quiz/quiz.types';
import type { Chapter } from '../../../../../types/chapter.types';
import type { CourseResource } from '../../../../../types/courseResource.types';
import { 
  getQuestionsByLessonPaginated, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion 
} from '../../../../../service/quiz/quizService';
import { getChaptersByCourse } from '../../../../../service/chapterService';
import { getResourcesByCourse } from '../../../../../service/courseResourceService';
import { Toast, type ToastMessage } from '../../../../elearning/ui/Toast';
import { QuestionFormModal } from '../../../../elearning/course/course-details/QuestionFormModal';
import { QuestionLessonList } from '../../../../elearning/course/course-details/QuestionLessonList';
import { QuestionList } from '../../../../elearning/course/course-details/QuestionList';
import { ImportQuestionsModal } from '../../../../elearning/course/course-details/ImportQuestionsModal'; // ✅ NEW

interface QuestionsTabProps {
  courseId: number;
}

export const QuestionsTab: React.FC<QuestionsTabProps> = ({ courseId }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  const [selectedLesson, setSelectedLesson] = useState<CourseResource | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;
  
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showImportModal, setShowImportModal] = useState(false); // ✅ NEW

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchChaptersAndLessons = useCallback(async () => {
    if (!courseId || isNaN(Number(courseId))) return;
    setLoading(true);
    try {
      const [chaptersData, resourcesData] = await Promise.all([
        getChaptersByCourse(courseId),
        getResourcesByCourse(courseId).catch(() => []),
      ]);

      let chapterList: Chapter[] = [];
      if (Array.isArray(chaptersData)) {
        chapterList = chaptersData as Chapter[];
      } else {
        chapterList = ((chaptersData as any)?.content || []) as Chapter[];
      }
      setChapters(chapterList);

      const allResources = (Array.isArray(resourcesData) ? resourcesData : []) as CourseResource[];
      const videoLessons = allResources.filter((r: CourseResource) => 
        r.resourceType === 'VIDEO' || r.resourceType === 'QUIZ' || r.resourceType === 'DOCUMENT'
      );
      setLessons(videoLessons);

      setExpandedChapters(new Set(chapterList.map((c: Chapter) => c.id)));
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchChaptersAndLessons();
  }, [fetchChaptersAndLessons]);

  const fetchQuestionsByLesson = useCallback(async (lessonId: number, page: number) => {
    if (!lessonId) return;
    setQuestionLoading(true);
    try {
      const data = await getQuestionsByLessonPaginated(lessonId, page, pageSize);
      setQuestions(data?.content || []);
      setTotalElements(data?.totalElements || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (err: any) {
      console.error('Lỗi tải câu hỏi:', err);
      setQuestions([]);
      setTotalElements(0);
      setTotalPages(0);
      if (err?.response?.status !== 404) {
        showToast('Lỗi tải câu hỏi', 'error');
      }
    } finally {
      setQuestionLoading(false);
    }
  }, [pageSize]);

  const handleSelectLesson = (lesson: CourseResource) => {
    setSelectedLesson(lesson);
    setCurrentPage(0);
    fetchQuestionsByLesson(lesson.id, 0);
  };

  const handlePageChange = (newPage: number) => {
    if (selectedLesson && newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchQuestionsByLesson(selectedLesson.id, newPage);
    }
  };

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async (data: CreateQuestionRequest) => {
    try {
      const dataWithLesson: CreateQuestionRequest = {
        ...data,
        lessonId: selectedLesson?.id || null,
        courseId: courseId,
      };

      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, dataWithLesson);
        showToast('Cập nhật câu hỏi thành công!');
      } else {
        await createQuestion(dataWithLesson);
        showToast('Tạo câu hỏi mới thành công!');
      }
      
      setShowQuestionForm(false);
      setEditingQuestion(null);
      
      if (selectedLesson) {
        await fetchQuestionsByLesson(selectedLesson.id, currentPage);
      }
    } catch (err: any) {
      console.error('Lỗi lưu câu hỏi:', err);
      showToast(err?.message || 'Lỗi lưu câu hỏi', 'error');
      throw err;
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try {
      await deleteQuestion(questionId);
      if (selectedLesson) {
        await fetchQuestionsByLesson(selectedLesson.id, currentPage);
      }
      showToast('Xóa câu hỏi thành công!');
    } catch (err) {
      console.error('Lỗi xóa câu hỏi:', err);
      showToast('Lỗi xóa câu hỏi', 'error');
    }
  };

  const handleToggleStatus = async (question: Question) => {
    try {
      const newStatus = question.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateQuestion(question.id, { ...question, status: newStatus } as any);
      if (selectedLesson) {
        await fetchQuestionsByLesson(selectedLesson.id, currentPage);
      }
      showToast('Cập nhật trạng thái thành công!');
    } catch (err) {
      showToast('Lỗi cập nhật trạng thái', 'error');
    }
  };

  // ✅ NEW: Mở modal import (yêu cầu đã chọn lesson)
  const handleOpenImport = () => {
    if (!selectedLesson) {
      showToast('Vui lòng chọn bài học trước khi import', 'error');
      return;
    }
    setShowImportModal(true);
  };

  // ✅ NEW: Callback sau khi import thành công
  const handleImportSuccess = async (result: any) => {
    showToast(
      `Import thành công ${result.successCount} câu hỏi!`,
      'success'
    );
    setShowImportModal(false);
    // Reload danh sách câu hỏi
    if (selectedLesson) {
      await fetchQuestionsByLesson(selectedLesson.id, 0);
      setCurrentPage(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <FaSpinner className="animate-spin text-[#49BBBD]" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* 2 CỘT BẰNG NHAU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* LEFT: Chapter + Lessons */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col min-h-[500px] h-full">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 flex-shrink-0">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Chương & Bài học
            </h3>
            <span className="text-[10px] text-slate-400">{lessons.length} bài</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <QuestionLessonList
              chapters={chapters}
              lessons={lessons}
              selectedLessonId={selectedLesson?.id || null}
              expandedChapters={expandedChapters}
              onToggleChapter={toggleChapter}
              onSelectLesson={handleSelectLesson}
            />
          </div>
        </div>

        {/* RIGHT: Questions */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col min-h-[500px] h-full">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 flex-shrink-0 gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 truncate flex-1">
              {selectedLesson 
                ? `Câu hỏi: ${selectedLesson.title || selectedLesson.fileName}` 
                : 'Chọn bài học để xem câu hỏi'}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-slate-400">{totalElements} câu</span>

              {/* ✅ NEW: Nút Import Excel */}
              <button
                onClick={handleOpenImport}
                disabled={!selectedLesson}
                title={!selectedLesson ? 'Chọn bài học trước' : 'Import câu hỏi từ Excel'}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-bold hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FaFileExcel size={10} />
                Import Excel
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <QuestionList
              selectedLesson={selectedLesson}
              questions={questions}
              loading={questionLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              onAddQuestion={handleAddQuestion}
              onEditQuestion={handleEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onToggleStatus={handleToggleStatus}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showQuestionForm && selectedLesson && (
        <QuestionFormModal
          question={editingQuestion}
          courseId={courseId}
          selectedLessonId={selectedLesson.id}
          selectedLessonTitle={selectedLesson.title || ''}
          onClose={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
          onSave={handleSaveQuestion}
        />
      )}

      {/* ✅ NEW: Modal Import Excel */}
      {showImportModal && selectedLesson && (
        <ImportQuestionsModal
          courseId={courseId}
          lessonId={selectedLesson.id}
          lessonTitle={selectedLesson.title || selectedLesson.fileName || ''}
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
};