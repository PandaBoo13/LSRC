// src/components/course-detail/StudentProgressChart.tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { 
  FaChartPie, 
  FaUsers, 
  FaCheckCircle, 
  FaSpinner, 
  FaRegClock,
  FaTrophy,
  FaUserClock
} from 'react-icons/fa';
import './chartSetup';
import type { ProgressResponse } from '../../../../service/progress/progress.types';

interface StudentProgressChartProps {
  data?: ProgressResponse[];
  loading?: boolean;
}

export const StudentProgressChart: React.FC<StudentProgressChartProps> = ({ 
  data = [], 
  loading = false 
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs h-full flex items-center justify-center min-h-[160px] sm:min-h-[240px]">
        <div className="text-center space-y-3">
          <FaSpinner className="animate-spin text-[#49BBBD] text-3xl mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return <EmptyChart title="Trạng thái Học viên" />;
  }

  // Tính toán các chỉ số
  const totalStudents = data.length;
  const completed = data.filter(s => s.status === 'COMPLETED').length;
  const inProgress = data.filter(s => s.status === 'IN_PROGRESS').length;
  const notStarted = data.filter(s => s.status === 'NOT_STARTED').length;
  
  // Tiến độ trung bình
  const avgProgress = totalStudents > 0
    ? Math.round(data.reduce((acc, curr) => acc + (curr.progressPercentage || 0), 0) / totalStudents)
    : 0;

  // Tỷ lệ hoàn thành
  const completionRate = totalStudents > 0 
    ? Math.round((completed / totalStudents) * 100) 
    : 0;

  // Học viên đang học (có tiến độ > 0 nhưng chưa hoàn thành)
  const activeStudents = data.filter(s => 
    s.status === 'IN_PROGRESS' && (s.progressPercentage || 0) > 0
  ).length;

  // Học viên chưa bắt đầu (progress = 0)
  const inactiveStudents = data.filter(s => 
    (s.progressPercentage || 0) === 0 && s.status !== 'COMPLETED'
  ).length;

  // Điểm trung bình (nếu có)
  const studentsWithScore = data.filter(s => s.score !== null && s.score !== undefined);
  const avgScore = studentsWithScore.length > 0
    ? Math.round(studentsWithScore.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentsWithScore.length)
    : null;

  // Tổng thời gian học (giờ)
  const totalTimeSpentHours = Math.round(
    data.reduce((acc, curr) => acc + (curr.totalTimeSpent || 0), 0) / 3600
  );

  // Chart data
  const chartData = {
    labels: ['Hoàn thành', 'Đang học', 'Chưa bắt đầu'],
    datasets: [
      {
        data: [completed, inProgress, notStarted],
        backgroundColor: ['#10B981', '#49BBBD', '#94A3B8'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 8,
          font: { size: 10 },
          padding: 8,
          usePointStyle: true,
          pointStyle: 'circle' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = totalStudents > 0 ? Math.round((value / totalStudents) * 100) : 0;
            return ` ${label}: ${value} học viên (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs h-full flex flex-col">
      {/* Header */}
      <div className="mb-3 sm:mb-4">
        <h4 className="text-xs sm:text-base font-bold text-[#2F327D] flex items-center gap-2">
          <FaChartPie className="text-[#49BBBD] text-sm" />
          Phân bố Tiến độ Học viên
        </h4>
        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
          Trạng thái học tập của toàn bộ học viên
        </p>
      </div>

      {/* Chart */}
      <div className="h-[150px] sm:h-[200px] w-full relative flex-1">
        <Doughnut data={chartData} options={chartOptions} />
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xl sm:text-3xl font-extrabold text-[#2F327D]">{totalStudents}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Học viên</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2">
        {/* Completion Rate */}
        <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <FaTrophy className="text-xs sm:text-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Tỷ lệ hoàn thành</p>
            <p className="text-xs sm:text-sm font-extrabold text-emerald-600">
              {completionRate}%
            </p>
          </div>
        </div>

        {/* Average Progress */}
        <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-cyan-50/50 border border-cyan-100/50">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cyan-100 text-[#49BBBD] flex items-center justify-center shrink-0">
            <FaChartPie className="text-xs sm:text-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Tiến độ TB</p>
            <p className="text-xs sm:text-sm font-extrabold text-[#49BBBD]">
              {avgProgress}%
            </p>
          </div>
        </div>

        {/* Active Students */}
        <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <FaSpinner className="text-xs sm:text-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Đang học</p>
            <p className="text-xs sm:text-sm font-extrabold text-blue-600">
              {activeStudents} <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">học viên</span>
            </p>
          </div>
        </div>

        {/* Average Score */}
        <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <FaCheckCircle className="text-xs sm:text-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Điểm TB</p>
            <p className="text-xs sm:text-sm font-extrabold text-amber-600">
              {avgScore !== null ? `${avgScore} đ` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <FaUserClock className="text-[#49BBBD]" />
          {totalTimeSpentHours > 0 ? `${totalTimeSpentHours} giờ học` : 'Chưa có hoạt động'}
        </span>
        <span className="flex items-center gap-1">
          <FaRegClock className="text-slate-300" />
          Cập nhật: {new Date().toLocaleDateString('vi-VN')}
        </span>
      </div>
    </div>
  );
};

const EmptyChart = ({ title }: { title: string }) => (
  <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs text-center text-slate-400 h-full flex flex-col items-center justify-center min-h-[160px] sm:min-h-[240px]">
    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center text-lg mb-1.5">
      <FaChartPie />
    </div>
    <h4 className="text-xs sm:text-sm font-bold text-slate-700 mb-0.5">{title}</h4>
    <p className="text-[11px] text-slate-400">Chưa có dữ liệu thống kê học viên</p>
    <p className="text-[10px] text-slate-300 mt-2 flex items-center gap-1">
      <FaUsers className="text-[10px]" />
      Dữ liệu sẽ tự động cập nhật khi có học viên đăng ký
    </p>
  </div>
);