// src/pages/elearning/InstructorPages/InstructorCoursesPage.tsx
import { useState, useEffect } from "react";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { Panel } from "../../../components/elearning/ui/Panel";
import { CourseFormModal } from "../../../components/elearning/course/CourseFormModal";
import { CourseListItem } from "../../../components/elearning/course/CourseListItem";
import CourseManagementCard from "../../../components/elearning/course/CourseManagementCard";
import { 
  FaPlus, 
  FaSpinner, 
  FaTimes, 
  FaThLarge, 
  FaList, 
  FaGraduationCap, 
  FaCheckCircle, 
  FaExclamationCircle 
} from "react-icons/fa";
import { instructorNav } from "../../../data/elearning";
// ✅ Sửa import
import { getInstructorCourses, createCourse, updateCourse, deleteCourse, updateCourseStatus } from "../../../service/courseService";
import { getCategoryTree } from "../../../service/categoryService";
import { useAuth } from "../../../context/AuthContext";
import { getErrorMessage } from "../../../utils/errorUtils";
import type { Course, CourseRequest } from "../../../types/course.types";
import type { Category } from "../../../types/category.types";

export function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [page]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // ✅ Đổi courseService.getInstructorCourses → getInstructorCourses
      const data = await getInstructorCourses({ page, size: 10 });
      setCourses(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch instructor courses:", error);
      showToast(getErrorMessage(error, 'Failed to load course list'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // ✅ Đổi categoryService.getTree → getCategoryTree
      const data = await getCategoryTree();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showToast('Failed to load categories', 'error');
    }
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleSave = async (data: CourseRequest) => {
    try {
      if (editingCourse) {
        // ✅ Đổi courseService.update → updateCourse
        await updateCourse(editingCourse.id, data);
        showToast('Course updated successfully', 'success');
      } else {
        // ✅ Đổi courseService.create → createCourse
        await createCourse(data);
        showToast('Course created successfully', 'success');
      }
      setShowForm(false);
      fetchCourses();
    } catch (error: any) {
      throw error;
    }
  };

  const handleStatusChange = async (course: Course, newStatus: string) => {
    try {
      // ✅ Đổi courseService.updateStatus → updateCourseStatus
      await updateCourseStatus(course.id, { status: newStatus as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' });
      setCourses(prev => prev.map(c => 
        c.id === course.id ? { ...c, status: newStatus as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' } : c
      ));
      showToast(`Status updated to "${newStatus}"`, 'success');
    } catch (error) {
      console.error("Failed to update status:", error);
      showToast(getErrorMessage(error, 'Failed to update status'), 'error');
    }
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Are you sure you want to delete the course "${course.title}"?`)) return;
    try {
      // ✅ Đổi courseService.delete → deleteCourse
      await deleteCourse(course.id);
      showToast('Course deleted successfully', 'success');
      fetchCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
      showToast(getErrorMessage(error, 'Failed to delete course'), 'error');
    }
  };

  return (
    <DashboardShell
      role="Instructor"
      title="Course Management"
      subtitle="Create, edit, and organize the courses taught by you."
      navItems={instructorNav}
    >
      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 left-5 sm:left-auto z-50 max-w-md animate-slide-down">
          <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-50/95 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50/95 text-rose-800 border-rose-200'
          }`}>
            <span className="flex-shrink-0 text-lg">
              {toast.type === 'success' ? (
                <FaCheckCircle className="text-emerald-500" />
              ) : (
                <FaExclamationCircle className="text-rose-500" />
              )}
            </span>
            <span className="text-xs font-bold flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition"
            >
              <FaTimes size={12} />
            </button>
          </div>
        </div>
      )}

      {/* CONTROL BAR */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">View mode:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-[#2F327D] shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FaThLarge size={12} /> Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'list'
                  ? 'bg-white text-[#2F327D] shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FaList size={12} /> List
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#49BBBD] hover:bg-[#3ca3a5] px-5 py-2.5 text-xs font-bold text-white transition shadow-md shadow-cyan-500/20 active:scale-[0.98]"
        >
          <FaPlus size={11} /> Create New Course
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <FaSpinner className="h-9 w-9 animate-spin text-[#49BBBD]" />
          <span className="text-xs font-bold text-slate-400">Loading course list...</span>
        </div>
      ) : courses.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseManagementCard
                  key={course.id}
                  course={course}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  isAdmin={false}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <CourseListItem
                  key={course.id}
                  course={course}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  isAdmin={false}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:border-[#49BBBD] hover:text-[#49BBBD] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition shadow-2xs"
              >
                ← Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setPage(i)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-2xs ${
                    page === i
                      ? "bg-[#49BBBD] text-white shadow-cyan-500/20"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-[#49BBBD] hover:text-[#49BBBD]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:border-[#49BBBD] hover:text-[#49BBBD] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition shadow-2xs"
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <Panel className="p-12 text-center border border-slate-100 rounded-3xl bg-white shadow-2xs">
          <div className="mx-auto w-16 h-16 bg-cyan-50 text-[#49BBBD] rounded-2xl flex items-center justify-center mb-4">
            <FaGraduationCap size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#2F327D] mb-1">No courses found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Start creating your first course to share knowledge with students.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#49BBBD] hover:bg-[#3ca3a5] px-5 py-2.5 text-xs font-bold text-white transition shadow-md shadow-cyan-500/20 active:scale-[0.98]"
          >
            <FaPlus size={11} /> Create First Course
          </button>
        </Panel>
      )}

      {/* MODAL */}
      {showForm && (
        <CourseFormModal
          course={editingCourse}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          isInstructor={true}
          currentAccountId={user?.idAccount}
          onToast={showToast}
        />
      )}
    </DashboardShell>
  );
}