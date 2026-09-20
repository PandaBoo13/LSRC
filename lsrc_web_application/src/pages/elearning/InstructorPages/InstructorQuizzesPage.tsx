// src/pages/elearning/InstructorPages/InstructorQuizzesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaSpinner, FaTimes, FaPlus, FaClipboardCheck 
} from 'react-icons/fa';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { instructorNav } from '../../../data/elearning';
import { 
  getResourcesByCourse, 
  uploadResource, 
  updateResource, 
  deleteResource, 
  publishResource, 
  unpublishResource 
} from '../../../service/courseResourceService'; // ✅ Sử dụng courseResourceService
import { getCourseById } from '../../../service/courseService';
import { getErrorMessage } from '../../../utils/errorUtils';
import type { Course } from '../../../types/course.types';
import type { CourseResource, CourseResourceRequest } from '../../../types/courseResource.types';

// ==================== TOAST COMPONENT ====================
const Toast = ({ toast, onClose }: { toast: { message: string; type: 'success' | 'error' } | null; onClose: () => void }) => {
  if (!toast) return null;
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 max-w-md animate-slide-down">
      <div className={`px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 ${
        toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        <span className="text-lg flex-shrink-0">{toast.type === 'success' ? '✅' : '❌'}</span>
        <span className="text-sm font-medium flex-1">{toast.message}</span>
        <button onClick={onClose} className="flex-shrink-0 text-slate-400 hover:text-slate-600"><FaTimes size={14} /></button>
      </div>
    </div>
  );
};

// ==================== MODAL: Quiz Form ====================
const QuizFormModal = ({ 
  quiz, courseId, onClose, onSave 
}: { 
  quiz: CourseResource | null; courseId: number; onClose: () => void; onSave: (data: CourseResourceRequest) => Promise<void>;
}) => {
  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [totalQuestions, setTotalQuestions] = useState(quiz?.totalQuestions || 10);
  const [passingScore, setPassingScore] = useState(quiz?.passingScore || 50);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(quiz?.timeLimit);
  const [maxAttempts, setMaxAttempts] = useState(quiz?.maxAttempts || 1);
  const [shuffleQuestions, setShuffleQuestions] = useState(quiz?.shuffleQuestions ?? false);
  const [hashtagFilter, setHashtagFilter] = useState(quiz?.hashtagFilter || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || totalQuestions < 1) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        resourceType: 'QUIZ',
        totalQuestions,
        passingScore,
        timeLimit: timeLimit || undefined,
        maxAttempts,
        shuffleQuestions,
        hashtagFilter: hashtagFilter.trim() || undefined,
      });
      onClose();
    } catch (err) { 
      /* Lỗi đã xử lý ở parent */ 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-slate-800">{quiz ? 'Sửa Quiz' : 'Tạo Quiz'}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><FaTimes size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên Quiz <span className="text-rose-500">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-cyan-500"
              placeholder="VD: Quiz Chương 1" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-cyan-500 resize-none" rows={2}
              placeholder="Hướng dẫn trước khi làm bài..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lọc câu hỏi theo hashtag</label>
            <input type="text" value={hashtagFilter} onChange={e => setHashtagFilter(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-cyan-500"
              placeholder="#lesson1, #lesson2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số câu hỏi <span className="text-rose-500">*</span></label>
              <input type="number" value={totalQuestions} onChange={e => setTotalQuestions(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-cyan-500" min={1} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Điểm đỗ (%)</label>
              <input type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-cyan-500" min={0} max={100} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian (phút)</label>
              <input type="number" value={timeLimit || ''} onChange={e => setTimeLimit(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-cyan-500" placeholder="Không giới hạn" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số lần làm</label>
              <input type="number" value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-cyan-500" min={1} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="shuffleQuestions" checked={shuffleQuestions} onChange={e => setShuffleQuestions(e.target.checked)}
              className="w-4 h-4 rounded accent-cyan-500" />
            <label htmlFor="shuffleQuestions" className="text-xs font-bold text-slate-700">Xáo trộn câu hỏi</label>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" disabled={saving || !title.trim() || totalQuestions < 1}
              className="flex-1 rounded-xl bg-cyan-500 text-white py-2.5 text-xs font-bold hover:bg-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><FaSpinner className="animate-spin" size={12} /> Đang lưu...</> : (quiz ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================
export function InstructorQuizzesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericCourseId = id ? Number(id) : null;

  const [course, setCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<CourseResource[]>([]); // ✅ CourseResource type
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Quiz modal
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<CourseResource | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchData = useCallback(async () => {
    if (!numericCourseId) return;
    setLoading(true);
    try {
      const [courseData, resourcesData] = await Promise.all([
        getCourseById(numericCourseId),
        getResourcesByCourse(numericCourseId),
      ]);
      setCourse(courseData);
      // ✅ Lọc chỉ lấy resource type QUIZ
      const quizResources = Array.isArray(resourcesData) 
        ? resourcesData.filter(r => r.resourceType === 'QUIZ') 
        : [];
      setQuizzes(quizResources);
    } catch (err) {
      showToast('Không thể tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  }, [numericCourseId]);

  useEffect(() => {
    if (numericCourseId && !isNaN(numericCourseId)) fetchData();
  }, [fetchData]);

  // ==================== QUIZ HANDLERS ====================
  const handleCreateQuiz = () => { 
    setEditingQuiz(null); 
    setShowQuizForm(true); 
  };
  
  const handleEditQuiz = (quiz: CourseResource) => { 
    setEditingQuiz(quiz); 
    setShowQuizForm(true); 
  };

  const handleSaveQuiz = async (data: CourseResourceRequest) => {
    try {
      if (editingQuiz) {
        await updateResource(numericCourseId!, editingQuiz.id, data);
        showToast('Cập nhật Quiz thành công', 'success');
      } else {
        await uploadResource(numericCourseId!, data);
        showToast('Tạo Quiz thành công', 'success');
      }
      setShowQuizForm(false);
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err, 'Lưu thất bại'), 'error');
    }
  };

  const handleDeleteQuiz = async (quiz: CourseResource) => {
    if (!confirm(`Xóa Quiz "${quiz.title}"?`)) return;
    try {
      await deleteResource(numericCourseId!, quiz.id);
      showToast('Xóa thành công', 'success');
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err, 'Xóa thất bại'), 'error');
    }
  };

  const handleToggleQuizStatus = async (quiz: CourseResource) => {
    try {
      if (quiz.status === 'PUBLISHED') {
        await unpublishResource(quiz.id);
        showToast('Đã chuyển về nháp', 'success');
      } else {
        await publishResource(quiz.id);
        showToast('Đã xuất bản', 'success');
      }
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err, 'Cập nhật thất bại'), 'error');
    }
  };

  // ==================== RENDER ====================
  if (!numericCourseId || isNaN(numericCourseId)) {
    return (
      <DashboardShell role="Instructor" title="Quản lý Quiz" navItems={instructorNav}>
        <div className="text-center py-20 text-slate-400">Không tìm thấy khóa học</div>
      </DashboardShell>
    );
  }

  if (loading) {
    return (
      <DashboardShell role="Instructor" title="Quản lý Quiz" subtitle="Đang tải..." navItems={instructorNav}>
        <div className="flex items-center justify-center py-20"><FaSpinner className="h-10 w-10 animate-spin text-cyan-500" /></div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Instructor" title="Quản lý Quiz" subtitle={course ? `Quiz cho "${course.title}"` : ''} navItems={instructorNav}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <FaArrowLeft size={12} /> Quay lại
        </button>
        <button 
          onClick={handleCreateQuiz}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600 transition"
        >
          <FaPlus size={12} /> Tạo Quiz
        </button>
      </div>

      {/* Quiz List */}
      <div className="space-y-3">
        {quizzes.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <FaClipboardCheck className="mx-auto mb-3 text-4xl text-slate-300" />
            Chưa có quiz nào. Hãy tạo quiz đầu tiên!
          </div>
        ) : (
          quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{quiz.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{quiz.description || 'Không có mô tả'}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 flex-wrap">
                    <span>📝 {quiz.totalQuestions || 0} câu</span>
                    <span>🎯 Đỗ: {quiz.passingScore}%</span>
                    {quiz.timeLimit && <span>⏱ {quiz.timeLimit} phút</span>}
                    <span>🔄 {quiz.maxAttempts || 1} lần</span>
                    {quiz.shuffleQuestions && <span>🔀 Xáo trộn</span>}
                    {quiz.hashtagFilter && <span>🏷 {quiz.hashtagFilter}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    quiz.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {quiz.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
                  </span>
                  <button onClick={() => handleToggleQuizStatus(quiz)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50"
                    title={quiz.status === 'PUBLISHED' ? 'Chuyển về nháp' : 'Xuất bản'}>
                    {quiz.status === 'PUBLISHED' ? 'Về nháp' : 'Xuất bản'}
                  </button>
                  <button onClick={() => handleEditQuiz(quiz)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200">
                    Sửa
                  </button>
                  <button onClick={() => handleDeleteQuiz(quiz)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showQuizForm && (
        <QuizFormModal 
          quiz={editingQuiz} 
          courseId={numericCourseId} 
          onClose={() => setShowQuizForm(false)} 
          onSave={handleSaveQuiz} 
        />
      )}
    </DashboardShell>
  );
}