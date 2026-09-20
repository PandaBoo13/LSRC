// src/pages/elearning/InstructorPages/InstructorAllStudentsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner, FaChevronRight, FaUsers, FaChartBar } from 'react-icons/fa';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { Panel } from '../../../components/elearning/ui/Panel';
import { ProgressBar } from '../../../components/elearning/ui/ProgressBar';
import { StatusPill } from '../../../components/elearning/ui/StatusPill';
import { StudentProgressTable } from '../../../components/elearning/progress/StudentProgressTable';
import { instructorNav } from '../../../data/elearning';
// ✅ Sửa import
import { getInstructorCourses } from '../../../service/courseService';
import { getStudentsProgressByCourse } from '../../../service/progress/progressService'; // ✅ Đổi courseProgressService → progressService
import type { Course } from '../../../types/course.types';
import type { ProgressResponse } from '../../../service/progress/progress.types'; // ✅ Đổi CourseProgressResponse → ProgressResponse

type CourseWithStudents = {
  course: Course;
  students: ProgressResponse[]; // ✅ Đổi type
};

export function InstructorAllStudentsPage() {
  const [coursesWithStudents, setCoursesWithStudents] = useState<CourseWithStudents[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'time'>('name');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coursesData = await getInstructorCourses({ size: 50 });
        const courses = coursesData.content || [];

        const result: CourseWithStudents[] = [];
        for (const course of courses) {
          try {
            const students = await getStudentsProgressByCourse(Number(course.id)); // ✅ Đổi function
            result.push({ course, students: Array.isArray(students) ? students : [] });
          } catch (err) {
            result.push({ course, students: [] });
          }
        }

        setCoursesWithStudents(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc theo searchTerm
  const filteredCourses = searchTerm.trim()
    ? coursesWithStudents.filter(c => 
        c.course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.students.some(s => s.username?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : coursesWithStudents;

  const totalStudents = filteredCourses.reduce((sum, c) => sum + c.students.length, 0);
  const totalCompleted = filteredCourses.reduce(
    (sum, c) => sum + c.students.filter(s => s.status === 'COMPLETED').length, 0
  );
  const totalInProgress = filteredCourses.reduce(
    (sum, c) => sum + c.students.filter(s => s.status === 'IN_PROGRESS').length, 0
  );

  if (loading) {
    return (
      <DashboardShell role="Instructor" title="Học viên" subtitle="Đang tải..." navItems={instructorNav}>
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="Instructor"
      title="Quản lý học viên"
      subtitle={`${totalStudents} học viên • ${totalCompleted} đã hoàn thành`}
      navItems={instructorNav}
    >
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm khóa học hoặc học viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-4 pr-10 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:border-[#49BBBD] transition placeholder:text-slate-400"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={<FaUsers />} color="blue" value={totalStudents} label="Tổng học viên" />
        <SummaryCard icon="🎓" color="green" value={totalCompleted} label="Đã hoàn thành" />
        <SummaryCard icon="📖" color="amber" value={totalInProgress} label="Đang học" />
        <SummaryCard icon="📚" color="purple" value={filteredCourses.length} label="Khóa học" />
      </div>

      {/* Danh sách courses + students */}
      {filteredCourses.length > 0 ? (
        <div className="space-y-4">
          {filteredCourses.map(({ course, students }) => (
            <CourseStudentPanel
              key={course.id}
              course={course}
              students={students}
              isExpanded={expandedCourseId === Number(course.id)}
              onToggle={() => setExpandedCourseId(
                expandedCourseId === Number(course.id) ? null : Number(course.id)
              )}
              sortBy={sortBy}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-lg">Không tìm thấy kết quả</p>
          <p className="text-sm mt-1">
            {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Tạo khóa học đầu tiên của bạn'}
          </p>
        </div>
      )}
    </DashboardShell>
  );
}

// ==================== SUMMARY CARD ====================
function SummaryCard({ icon, color, value, label }: {
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'amber';
  value: number;
  label: string;
}) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <Panel className="p-5">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </Panel>
  );
}

// ==================== COURSE STUDENT PANEL ====================
function CourseStudentPanel({ course, students, isExpanded, onToggle, sortBy }: {
  course: Course;
  students: ProgressResponse[]; // ✅ Đổi type
  isExpanded: boolean;
  onToggle: () => void;
  sortBy: 'name' | 'progress' | 'time';
}) {
  const completedCount = students.filter(s => s.status === 'COMPLETED').length;
  const inProgressCount = students.filter(s => s.status === 'IN_PROGRESS').length;
  const avgProgress = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (Number(s.progressPercentage) || 0), 0) / students.length)
    : 0;

  // Sort students
  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'name') {
      return (a.username || '').localeCompare(b.username || '');
    } else if (sortBy === 'progress') {
      return (Number(b.progressPercentage) || 0) - (Number(a.progressPercentage) || 0);
    } else {
      return (Number(b.totalTimeSpent) || 0) - (Number(a.totalTimeSpent) || 0);
    }
  });

  return (
    <Panel className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-4">
          <img
            src={course.thumbnailUrl || '/placeholder.jpg'}
            alt={course.title}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="text-left">
            <h3 className="font-semibold text-slate-900">{course.title}</h3>
            <p className="text-sm text-slate-500">
              {students.length > 0
                ? `${students.length} học viên • ${completedCount} hoàn thành • ${inProgressCount} đang học • TB ${avgProgress}%`
                : 'Chưa có học viên'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/instructor/courses/${course.id}/students`}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 text-xs font-medium bg-[#49BBBD]/10 text-[#49BBBD] rounded-lg hover:bg-[#49BBBD]/20 transition flex items-center gap-1"
          >
            <FaChartBar size={12} /> Chi tiết
          </Link>
          <FaChevronRight
            size={14}
            className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

     {isExpanded && students.length > 0 && (
  <div className="border-t border-slate-100 p-5">
    {/* Progress bar cho course */}
    <div className="mb-4 flex items-center gap-3">
      <div className="flex-1">
        <ProgressBar value={avgProgress} color="bg-[#49BBBD]" />
      </div>
      <span className="text-xs text-slate-500 font-medium">
        {completedCount}/{students.length} hoàn thành
      </span>
    </div>

    {/* Student table */}
    <StudentProgressTable students={sortedStudents as any} />
  </div>
)}


      {isExpanded && students.length === 0 && (
        <div className="border-t border-slate-100 p-8 text-center text-slate-400">
          <p>Chưa có học viên nào đăng ký khóa học này</p>
        </div>
      )}
    </Panel>
  );
}