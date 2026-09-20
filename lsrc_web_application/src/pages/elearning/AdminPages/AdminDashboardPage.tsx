// src/pages/elearning/AdminPages/AdminDashboardPage.tsx
import { useState, useEffect } from 'react';
import { FaBookOpen, FaChevronRight, FaCreditCard, FaStar, FaUsers, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { Panel } from '../../../components/elearning/ui/Panel';
import { MetricCard } from '../../../components/elearning';
import { adminNav } from '../../../data/elearning';
// ✅ Sửa import
import { getAllCourses } from '../../../service/courseService';
import { getAllAccounts } from '../../../service/rbacService';
import type { Course } from '../../../types/course.types';
import type { Account } from '../../../types/rbac.types';

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [accountsRes, coursesRes] = await Promise.all([
          // ✅ Đổi rbacService.getAllAccounts → getAllAccounts
          getAllAccounts().catch(() => ({ data: { data: [] } })),
          // ✅ Đổi courseService.getAll → getAllCourses
          getAllCourses({ size: 200 }).catch(() => ({ content: [] })),
        ]);
        setAccounts(accountsRes.data?.data || []);
        setCourses(coursesRes.content || []);
      } catch (error) { 
        console.error('Failed to fetch dashboard:', error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchDashboard();
  }, []);

  const totalUsers = accounts.length;
  const studentCount = accounts.filter(a => {
    const roleName = a.role?.toUpperCase()
    return roleName?.toUpperCase() === 'STUDENT';
  }).length;
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED').length;
  const ratedCourses = courses.filter(c => c.averageRating && c.averageRating > 0);
  const avgRating = ratedCourses.length > 0 
    ? Math.round(ratedCourses.reduce((s, c) => s + (c.averageRating || 0), 0) / ratedCourses.length * 10) / 10 
    : 0;

  if (loading) return (
    <DashboardShell role="Admin" title="Tổng quan" subtitle="Đang tải..." navItems={adminNav}>
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell role="Admin" title="Tổng quan" subtitle="Quản lý người dùng, khóa học và nền tảng." navItems={adminNav}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Người dùng" value={String(totalUsers)} note={`${studentCount} học viên`} icon={<FaUsers />} accent="bg-cyan-50 text-cyan-600" />
        <MetricCard label="Khóa học" value={String(totalCourses)} note={`${publishedCourses} đã xuất bản`} icon={<FaBookOpen />} accent="bg-emerald-50 text-emerald-600" />
        <MetricCard label="Đơn hàng" value="—" note="Sắp ra mắt" icon={<FaCreditCard />} accent="bg-amber-50 text-amber-600" />
        <MetricCard label="Đánh giá" value={avgRating > 0 ? String(avgRating) : '—'} note={`${ratedCourses.length} khóa được đánh giá`} icon={<FaStar />} accent="bg-violet-50 text-violet-600" />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <Panel>
          <h2 className="text-2xl font-bold text-slate-900">Khóa học gần đây</h2>
          <div className="mt-6 space-y-4">
            {courses.slice(0, 5).map(course => (
              <div key={course.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div className="min-w-0 flex-1 mr-4">
                  <span className="font-semibold text-slate-700 truncate block">{course.title}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{course.totalStudents || 0} học viên • {course.totalLessons || 0} bài học</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${course.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>
            ))}
            {courses.length === 0 && <p className="text-slate-400 text-center py-4">Chưa có khóa học nào</p>}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-2xl font-bold text-slate-900">Hành động nhanh</h2>
          <div className="mt-6 space-y-4">
            {[
              { label: 'Quản lý người dùng', path: '/admin/users' },
              { label: 'Quản lý khóa học', path: '/admin/courses' },
              { label: 'Quản lý vai trò', path: '/admin/roles' },
              { label: 'Quản lý quyền', path: '/admin/permissions' },
            ].map(item => (
              <Link key={item.label} to={item.path} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 hover:bg-cyan-50 transition">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <FaChevronRight className="text-cyan-500" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}