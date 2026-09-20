// src/components/course-detail/LessonCompletionChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { FaChartBar, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import './chartSetup';
import type { ProgressResponse } from '../../../../service/progress/progress.types';

interface Props {
  studentsProgress?: ProgressResponse[];
  loading?: boolean;
}

export const LessonCompletionChart: React.FC<Props> = ({ 
  studentsProgress = [],
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
  if (!studentsProgress || studentsProgress.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs text-center text-slate-400 h-full flex flex-col items-center justify-center min-h-[160px] sm:min-h-[240px]">
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center text-lg mb-1.5">
          <FaChartBar />
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-700 mb-0.5">Phân bố tiến độ học tập</h4>
        <p className="text-[11px] text-slate-400">Chưa có dữ liệu học viên</p>
      </div>
    );
  }

  // ========== TÍNH TOÁN PHÂN BỐ THEO MỨC TIẾN ĐỘ ==========
  const ranges = [
    { label: '0%', min: 0, max: 0, color: '#94A3B8', hoverColor: '#64748B' },
    { label: '1-25%', min: 1, max: 25, color: '#F59E0B', hoverColor: '#D97706' },
    { label: '26-50%', min: 26, max: 50, color: '#F97316', hoverColor: '#EA580C' },
    { label: '51-75%', min: 51, max: 75, color: '#49BBBD', hoverColor: '#3CA3A5' },
    { label: '76-99%', min: 76, max: 99, color: '#3B82F6', hoverColor: '#2563EB' },
    { label: '100%', min: 100, max: 100, color: '#10B981', hoverColor: '#059669' },
  ];

  const distributionData = ranges.map(range => {
    return studentsProgress.filter(sp => {
      const progress = Math.min(100, Math.max(0, Number(sp.progressPercentage) || 0));
      return progress >= range.min && progress <= range.max;
    }).length;
  });

  // Kiểm tra nếu tất cả = 0
  const totalCount = distributionData.reduce((acc, curr) => acc + curr, 0);
  if (totalCount === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs h-full flex flex-col">
        <div className="mb-2 sm:mb-4">
          <h4 className="text-xs sm:text-base font-bold text-[#2F327D] flex items-center gap-2">
            <FaChartBar className="text-[#49BBBD] text-sm" />
            Phân bố tiến độ học tập
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Số lượng học viên theo từng mức tiến độ</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl mb-3">
            <FaExclamationTriangle />
          </div>
          <p className="text-sm font-bold text-slate-700">Chưa có dữ liệu tiến độ</p>
          <p className="text-xs text-slate-400 mt-1 text-center max-w-sm">
            Dữ liệu sẽ hiển thị khi học viên bắt đầu học khóa học
          </p>
        </div>
      </div>
    );
  }

  // Tìm mức có nhiều học viên nhất
  const maxIndex = distributionData.indexOf(Math.max(...distributionData));
  const maxRange = ranges[maxIndex];
  const maxCount = distributionData[maxIndex];

  // Tổng số học viên hoàn thành (100%)
  const completedCount = distributionData[distributionData.length - 1];
  const completionRate = Math.round((completedCount / studentsProgress.length) * 100);

  const chartData = {
    labels: ranges.map(r => r.label),
    datasets: [
      {
        label: 'Số học viên',
        data: distributionData,
        backgroundColor: ranges.map(r => r.color),
        hoverBackgroundColor: ranges.map(r => r.hoverColor),
        borderRadius: 6,
        maxBarThickness: 60,
      },
    ],
  };

  // ✅ FIX: Khai báo type ChartOptions<'bar'> và sửa vị trí grid
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y || 0;
            const percentage = studentsProgress.length > 0 
              ? Math.round((value / studentsProgress.length) * 100) 
              : 0;
            return ` ${value} học viên (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          stepSize: 1, 
          font: { size: 9 },
          callback: function(value: any) {
            if (Number.isInteger(value)) return value;
            return '';
          }
        },
        grid: { color: '#f1f5f9' }
      },
      x: {
        ticks: { 
          font: { size: 10, weight: 'bold' as const },
        },
        grid: { display: false }  // ✅ FIX: grid nằm ngoài ticks
      }
    }
  };

  return (
    <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs h-full flex flex-col">
      {/* Header */}
      <div className="mb-2 sm:mb-4">
        <h4 className="text-xs sm:text-base font-bold text-[#2F327D] flex items-center gap-2">
          <FaChartBar className="text-[#49BBBD] text-sm" />
          Phân bố tiến độ học tập
        </h4>
        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
          Số lượng học viên theo từng mức tiến độ
        </p>
      </div>

      {/* Stats Summary */}
      <div className="mb-3 sm:mb-4 grid grid-cols-3 gap-2">
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50 text-center">
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Hoàn thành</p>
          <p className="text-base sm:text-xl font-extrabold text-emerald-600">{completedCount}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400">{completionRate}% học viên</p>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-cyan-50/50 border border-cyan-100/50 text-center">
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Tổng học viên</p>
          <p className="text-base sm:text-xl font-extrabold text-[#49BBBD]">{studentsProgress.length}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400">đã đăng ký</p>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50/50 border border-amber-100/50 text-center">
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Nhiều nhất</p>
          <p className="text-base sm:text-xl font-extrabold text-amber-600">{maxCount}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">{maxRange?.label}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[150px] sm:h-[220px] w-full relative flex-1">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};