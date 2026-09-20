// // src/pages/elearning/InstructorPages/InstructorAllLessonsPage.tsx
// import { useState, useEffect, useCallback } from 'react';
// import { FaSpinner, FaTimes, FaSearch, FaFilter, FaBookOpen } from 'react-icons/fa';
// import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
// import { instructorNav } from '../../../data/elearning';
// // ✅ Sửa import - Bỏ updateLessonStatus, thêm publishLesson, unpublishLesson
// import { deleteLesson, publishLesson, unpublishLesson } from '../../../service/lessonService';
// import { getErrorMessage } from '../../../utils/errorUtils';
// import { useAuth } from '../../../context/AuthContext';
// import { AllLessonsTable } from '../../../components/elearning/lesson/AllLessonsTable';
// import type { Lesson } from '../../../types/lesson.types';

// export function InstructorAllLessonsPage() {
//   const { user } = useAuth();
//   const [lessons, setLessons] = useState<Lesson[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState<string>('all');
//   const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

//   const showToast = (message: string, type: 'success' | 'error') => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 5000);
//   };

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     try {
//       // ✅ User type không có accountId, dùng idAccount
//       const accountId = user?.idAccount;
//       if (!accountId) { setLessons([]); return; }
//       // Tạm thời set rỗng vì backend không có endpoint getByInstructor
//       setLessons([]);
//     } catch (err) {
//       showToast(getErrorMessage(err, 'Không thể tải dữ liệu'), 'error');
//       setLessons([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [user?.idAccount]); // ✅ Chỉ dùng idAccount

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const handleDelete = async (lesson: Lesson) => {
//     if (!confirm(`Bạn có chắc muốn xóa bài học "${lesson.title}"?`)) return;
//     try {
//       await deleteLesson(lesson.idLesson);
//       showToast('Xóa bài học thành công', 'success');
//       fetchData();
//     } catch (error: any) {
//       showToast(getErrorMessage(error, 'Xóa bài học thất bại'), 'error');
//     }
//   };

//   const handleStatusChange = async (lesson: Lesson, newStatus: string) => {
//     try {
//       if (newStatus === 'PUBLISHED') {
//         await publishLesson(lesson.idLesson); // ✅ Đã import
//       } else if (newStatus === 'DRAFT') {
//         await unpublishLesson(lesson.idLesson); // ✅ Đã import
//       } else if (newStatus === 'HIDDEN') {
//         await unpublishLesson(lesson.idLesson); // HIDDEN cũng dùng unpublish
//       }
//       showToast(`Đã cập nhật trạng thái bài học`, 'success');
//       fetchData();
//     } catch (error: any) {
//       showToast(getErrorMessage(error, 'Cập nhật trạng thái thất bại'), 'error');
//     }
//   };

//   const filteredLessons = lessons.filter((lesson) => {
//     if (searchTerm) {
//       const keyword = searchTerm.toLowerCase();
//       const matchTitle = lesson.title?.toLowerCase().includes(keyword);
//       const matchCourse = lesson.courseTitle?.toLowerCase().includes(keyword);
//       if (!matchTitle && !matchCourse) return false;
//     }
//     if (filterStatus !== 'all' && lesson.status !== filterStatus) return false;
//     return true;
//   });

//   const totalLessons = lessons.length;
//   const publishedCount = lessons.filter((l) => l.status === 'PUBLISHED').length;
//   const draftCount = lessons.filter((l) => l.status === 'DRAFT').length;

//   if (loading) {
//     return (
//       <DashboardShell role="Instructor" title="Bài học của tôi" subtitle="Đang tải..." navItems={instructorNav}>
//         <div className="flex items-center justify-center py-20">
//           <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
//         </div>
//       </DashboardShell>
//     );
//   }

//   return (
//     <DashboardShell role="Instructor" title="Bài học của tôi" subtitle={`Quản lý ${totalLessons} bài học`} navItems={instructorNav}>
//       {toast && (
//         <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 max-w-md animate-slide-down">
//           <div className={`px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
//             <div className="flex items-start gap-3">
//               <span className="text-lg flex-shrink-0">{toast.type === 'success' ? '✅' : '❌'}</span>
//               <span className="text-sm font-medium flex-1">{toast.message}</span>
//               <button onClick={() => setToast(null)} className="flex-shrink-0 text-slate-400 hover:text-slate-600">
//                 <FaTimes size={14} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* STATS CARDS */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//         <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
//           <p className="text-sm text-slate-500">Tổng số bài học</p>
//           <p className="mt-1 text-3xl font-bold text-slate-900">{totalLessons}</p>
//         </div>
//         <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
//           <p className="text-sm text-slate-500">Đã xuất bản</p>
//           <p className="mt-1 text-3xl font-bold text-green-600">{publishedCount}</p>
//         </div>
//         <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
//           <p className="text-sm text-slate-500">Nháp</p>
//           <p className="mt-1 text-3xl font-bold text-yellow-600">{draftCount}</p>
//         </div>
//       </div>

//       {/* FILTER BAR */}
//       <div className="mb-6 flex flex-col sm:flex-row gap-3">
//         <div className="relative flex-1">
//           <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text" placeholder="Tìm kiếm bài học..." value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
//           />
//         </div>
//         <div className="relative">
//           <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//           <select
//             value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
//             className="rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-8 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 appearance-none cursor-pointer"
//           >
//             <option value="all">Tất cả trạng thái</option>
//             <option value="PUBLISHED">Đã xuất bản</option>
//             <option value="DRAFT">Nháp</option>
//             <option value="HIDDEN">Đã ẩn</option>
//           </select>
//         </div>
//       </div>

//       {/* LESSONS TABLE */}
//       {filteredLessons.length === 0 ? (
//         <div className="rounded-2xl bg-white p-10 text-center shadow-sm border border-slate-100">
//           <FaBookOpen className="mx-auto h-12 w-12 text-slate-300" />
//           <p className="mt-3 text-slate-500">Không tìm thấy bài học nào</p>
//         </div>
//       ) : (
//         <AllLessonsTable lessons={filteredLessons} onDelete={handleDelete} onStatusChange={handleStatusChange} />
//       )}
//     </DashboardShell>
//   );
// }