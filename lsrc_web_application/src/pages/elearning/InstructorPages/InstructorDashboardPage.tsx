// src/pages/elearning/InstructorPages/InstructorDashboardPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaChartLine, FaUsers, FaWallet, FaSpinner } from 'react-icons/fa';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { Panel } from '../../../components/elearning/ui/Panel';
import { ProgressBar } from '../../../components/elearning/ui/ProgressBar';
import { StatusPill } from '../../../components/elearning/ui/StatusPill';
import { MetricCard } from '../../../components/elearning/ui/MetricCard';
import { instructorNav } from '../../../data/elearning';
// ✅ Sửa import
import { getInstructorCourses } from '../../../service/courseService';
// ✅ THAY ĐỔI: Bỏ courseProgressService, dùng progressService
import { getStudentsProgressByCourse } from '../../../service/progress/progressService';
import type { Course } from '../../../types/course.types';
// ✅ THAY ĐỔI: Dùng ProgressResponse thay vì CourseProgressResponse
import type { ProgressResponse } from '../../../service/progress/progress.types';

export function InstructorDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  // ✅ THAY ĐỔI: CourseProgressResponse → ProgressResponse
  const [allStudents, setAllStudents] = useState<ProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const coursesData = await getInstructorCourses({ size: 50 });
        const courseList = coursesData.content || [];
        setCourses(courseList);
        const allStudentList: ProgressResponse[] = [];
        for (const course of courseList) {
          try { 
            // ✅ THAY ĐỔI: getStudentsCourseProgress → getStudentsProgressByCourse
            const students = await getStudentsProgressByCourse(Number(course.id)); 
            allStudentList.push(...(Array.isArray(students) ? students : [])); 
          } catch (err) {
            // Bỏ qua lỗi nếu khóa học chưa có học viên
          }
        }
        setAllStudents(allStudentList);
      } catch (error) { 
        console.error('Failed to fetch dashboard:', error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchDashboard();
  }, []);

  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED').length;
  const totalStudents = allStudents.length;
  const completedStudents = allStudents.filter(s => s.status === 'COMPLETED').length;
  const avgProgress = allStudents.length > 0 
    ? Math.round(allStudents.reduce((sum, s) => sum + (Number(s.progressPercentage) || 0), 0) / allStudents.length) 
    : 0;

  const topCourses = [...courses]
    .filter(c => c.totalStudents > 0)
    .sort((a, b) => b.totalStudents - a.totalStudents)
    .slice(0, 5);

  if (loading) return (
    <DashboardShell role="Instructor" title="Tổng quan" subtitle="Đang tải..." navItems={instructorNav}>
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell role="Instructor" title="Tổng quan" subtitle="Quản lý khóa học, theo dõi học viên và doanh thu." navItems={instructorNav}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Khóa học đã xuất bản" value={String(publishedCourses)} note={`${courses.length - publishedCourses} bản nháp`} icon={<FaBookOpen />} accent="bg-cyan-50 text-cyan-600" />
        <MetricCard label="Học viên" value={String(totalStudents)} note={`${completedStudents} đã hoàn thành`} icon={<FaUsers />} accent="bg-emerald-50 text-emerald-600" />
        <MetricCard label="Tiến độ TB" value={`${avgProgress}%`} note="Trung bình toàn bộ khóa học" icon={<FaChartLine />} accent="bg-amber-50 text-amber-600" />
        <MetricCard label="Khóa học" value={String(courses.length)} note="Tổng số khóa học" icon={<FaWallet />} accent="bg-violet-50 text-violet-600" />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Khóa học nổi bật</h2>
            <Link to="/instructor/courses" className="text-sm font-semibold text-cyan-600">Quản lý khóa học</Link>
          </div>
          <div className="mt-6 space-y-5">
            {topCourses.length > 0 ? topCourses.map((course) => {
              const courseStudentCount = allStudents.filter(s => s.courseId === course.id).length;
              const studentPercentage = totalStudents > 0 ? Math.round((courseStudentCount / totalStudents) * 100) : 0;
              return (
                <div key={course.id} className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900">{course.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{courseStudentCount} học viên</p>
                    </div>
                    <StatusPill tone={course.status === 'PUBLISHED' ? 'green' : 'amber'}>
                      {course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                    </StatusPill>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Phân bổ học viên</span>
                      <span>{studentPercentage}%</span>
                    </div>
                    <ProgressBar value={studentPercentage} color="bg-cyan-500" />
                  </div>
                </div>
              );
            }) : <p className="text-slate-400 text-center py-8">Chưa có khóa học nào có học viên</p>}
          </div>
        </Panel>
        <Panel>
          <h2 className="text-2xl font-bold text-slate-900">Hoạt động gần đây</h2>
          <div className="mt-6 space-y-4">
            {allStudents.slice(0, 5).map((student, index) => (
              <div key={student.id} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 font-bold text-cyan-600">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700">{student.username}</p>
                  <p className="text-sm text-slate-500">{student.courseTitle} • {Math.round(Number(student.progressPercentage) || 0)}%</p>
                </div>
                <StatusPill tone={student.status === 'COMPLETED' ? 'green' : 'blue'}>
                  {student.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang học'}
                </StatusPill>
              </div>
            ))}
            {allStudents.length === 0 && <p className="text-slate-400 text-center py-8">Chưa có hoạt động nào</p>}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}