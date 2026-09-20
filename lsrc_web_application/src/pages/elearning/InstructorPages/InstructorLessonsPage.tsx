// src/pages/elearning/InstructorPages/InstructorLessonsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { instructorNav } from "../../../data/elearning";
// ✅ THAY ĐỔI: Bỏ lessonService, dùng courseResourceService
import { 
  getResourcesByCourse, 
  uploadResource, 
  updateResource, 
  deleteResource, 
  publishResource, 
  unpublishResource 
} from '../../../service/courseResourceService';
import { getCourseById } from '../../../service/courseService';
import { getErrorMessage } from '../../../utils/errorUtils';
// ✅ THAY ĐỔI: Bỏ Lesson type, dùng CourseResource
import type { CourseResource } from '../../../types/courseResource.types';
import type { Course } from '../../../types/course.types';
import { LessonList } from '../../../components/elearning/lesson/LessonList';
import { LessonFormModal, type SaveLessonPayload } from '../../../components/elearning/lesson/LessonFormModal';
import { LessonResourceViewModal } from '../../../components/elearning/lesson/LessonResourceViewModal';

export function InstructorLessonsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  // ✅ THAY ĐỔI: Lesson[] → CourseResource[]
  const [lessons, setLessons] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // ✅ THAY ĐỔI: Lesson → CourseResource
  const [editingLesson, setEditingLesson] = useState<CourseResource | null>(null);
  
  const [showResourceView, setShowResourceView] = useState(false);
  // ✅ THAY ĐỔI: Lesson → CourseResource
  const [viewingLesson, setViewingLesson] = useState<CourseResource | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const numericCourseId = Number(id);

  const nextOrderIndex = lessons.length > 0 
    ? Math.max(...lessons.map(l => l.orderIndex ?? 0)) + 1 
    : 1;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchData = useCallback(async () => {
    if (!numericCourseId || isNaN(numericCourseId)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const courseData = await getCourseById(numericCourseId);
      setCourse(courseData);
    } catch (err) {
      showToast(getErrorMessage(err, 'Không thể tải thông tin khóa học'), 'error');
      setLoading(false);
      return;
    }
    
    try {
      // ✅ THAY ĐỔI: getLessonsByCourse → getResourcesByCourse
      const resourcesData = await getResourcesByCourse(numericCourseId);
      const allResources = Array.isArray(resourcesData) ? resourcesData : [];
      
      // ✅ Lọc chỉ lấy VIDEO resources làm bài học
      const videoLessons = allResources.filter(r => r.resourceType === 'VIDEO');
      setLessons(videoLessons);
    } catch (err) {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [numericCourseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setEditingLesson(null);
    setShowForm(true);
  };

  // ✅ THAY ĐỔI: Lesson → CourseResource
  const handleEdit = (lesson: CourseResource) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  // ✅ THAY ĐỔI: Lesson → CourseResource
  const handleViewResources = (lesson: CourseResource) => {
    setViewingLesson(lesson);
    setShowResourceView(true);
  };

  const handleSave = async (payload: SaveLessonPayload) => {
    try {
      let targetLessonId: number;

      if (editingLesson) {
        // ✅ THAY ĐỔI: updateLesson → updateResource
        targetLessonId = editingLesson.id;
        await updateResource(numericCourseId, targetLessonId, {
          ...payload.lessonData,
          resourceType: 'VIDEO',
        } as any);
      } else {
        // ✅ THAY ĐỔI: createLesson → uploadResource
        const createdLesson = await uploadResource(numericCourseId, {
          ...payload.lessonData,
          resourceType: 'VIDEO',
        } as any);
        targetLessonId = createdLesson.id || (createdLesson as any).id;
      }

      // ✅ Upload video chính nếu có
      if (payload.primaryVideoFile && targetLessonId) {
        await uploadResource(numericCourseId, {
          resourceType: 'VIDEO',
          title: `Video - ${payload.lessonData.title}`,
          isRequired: true,
          parentId: targetLessonId,
          file: payload.primaryVideoFile,
        } as any);
      }

      // ✅ Upload attachments nếu có
      if (payload.newAttachments && payload.newAttachments.length > 0 && targetLessonId) {
        for (const att of payload.newAttachments) {
          await uploadResource(numericCourseId, {
            resourceType: att.resourceType as any,
            title: att.title || att.file.name,
            parentId: targetLessonId,
            file: att.file,
          } as any);
        }
      }

      // ✅ Xóa resources đã bị gỡ
      if (payload.deletedResourceIds && payload.deletedResourceIds.length > 0) {
        for (const resId of payload.deletedResourceIds) {
          await deleteResource(numericCourseId, resId);
        }
      }

      showToast(
        editingLesson ? 'Cập nhật bài học thành công' : 'Tạo bài học và upload Video MP4 thành công!', 
        'success'
      );
      setShowForm(false);
      fetchData();
    } catch (error: any) {
      showToast(getErrorMessage(error, 'Lưu bài học thất bại'), 'error');
      throw error;
    }
  };

  // ✅ THAY ĐỔI: Lesson → CourseResource
  const handleDelete = async (lesson: CourseResource) => {
    if (!confirm(`Bạn có chắc muốn xóa bài học "${lesson.title}"?`)) return;
    try {
      // ✅ THAY ĐỔI: deleteLesson → deleteResource
      await deleteResource(numericCourseId, lesson.id);
      showToast('Xóa bài học thành công', 'success');
      fetchData();
    } catch (error: any) {
      showToast(getErrorMessage(error, 'Xóa bài học thất bại'), 'error');
    }
  };

  // ✅ THAY ĐỔI: Lesson → CourseResource
  const handleStatusChange = async (lesson: CourseResource, newStatus: string) => {
    try {
      // ✅ THAY ĐỔI: publishLesson/unpublishLesson → publishResource/unpublishResource
      if (newStatus === 'PUBLISHED') {
        await publishResource(lesson.id);
      } else if (newStatus === 'DRAFT' || newStatus === 'HIDDEN') {
        await unpublishResource(lesson.id);
      }
      showToast(`Đã ${newStatus === 'PUBLISHED' ? 'xuất bản' : 'chuyển sang nháp'} bài học`, 'success');
      fetchData();
    } catch (error: any) {
      showToast(getErrorMessage(error, 'Cập nhật trạng thái thất bại'), 'error');
    }
  };

  if (loading) {
    return (
      <DashboardShell role="Instructor" title="Bài học" subtitle="Đang tải..." navItems={instructorNav}>
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="Instructor"
      title="Quản lý bài học"
      subtitle={course ? `Quản lý bài học cho "${course.title}"` : "Quản lý bài học"}
      navItems={instructorNav}
    >
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 max-w-md animate-slide-down">
          <div className={`px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{toast.type === 'success' ? '✅' : '❌'}</span>
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button onClick={() => setToast(null)} className="flex-shrink-0 text-slate-400 hover:text-slate-600">
                <FaTimes size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-3 transition">
          <FaArrowLeft size={12} /> Quay lại danh sách khóa học
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{course?.title || 'Bài học'}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {lessons.length} bài học • {lessons.filter(l => l.status === 'PUBLISHED').length} đã xuất bản
            </p>
          </div>
        </div>
      </div>

      {/* Lesson List */}
      <LessonList
        lessons={lessons}
        courseId={numericCourseId}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onUploadResource={handleEdit}
        onViewResources={handleViewResources}
        onOrderChange={(newOrder) => {
          setLessons(newOrder);
        }}
        onError={(message) => showToast(message, 'error')} 
      />

      {/* Modal */}
      {showForm && (
        <LessonFormModal
          lesson={editingLesson}
          courseId={numericCourseId}
          nextOrderIndex={nextOrderIndex}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {/* Resource View */}
      {showResourceView && viewingLesson && (
        <LessonResourceViewModal
          lesson={viewingLesson}
          courseId={numericCourseId}
          isInstructor={true}
          onClose={() => {
            setShowResourceView(false);
            setViewingLesson(null);
          }}
          onUploadClick={() => {
            const lessonToEdit = viewingLesson;
            setShowResourceView(false);
            setViewingLesson(null);
            handleEdit(lessonToEdit);
          }}
        />
      )}
    </DashboardShell>
  );
}