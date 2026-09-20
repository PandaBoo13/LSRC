// src/components/progress/ProgressStats.tsx
import React from 'react';
import { ProgressCircle } from './ProgressCircle';
import { TimeSpentDisplay } from './TimeSpentDisplay';
import type { ProgressStatsProps } from '../../../service/progress/progress.types';

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  totalStudents,
  completedStudents,
  averageProgress,
  totalTimeSpent,
  totalCourses,
  completedCourses,
  inProgressCourses,
}) => {
  // Student view
  if (totalCourses !== undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Tổng khóa học"
          value={totalCourses}
          icon="📚"
        />
        <StatCard
          title="Đã hoàn thành"
          value={completedCourses || 0}
          icon="✅"
          color="text-green-600"
        />
        <StatCard
          title="Đang học"
          value={inProgressCourses || 0}
          icon="▶️"
          color="text-blue-600"
        />
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm text-gray-500 mb-2">Tiến độ trung bình</h3>
          <ProgressCircle
            percentage={averageProgress || 0}
            size={80}
            strokeWidth={6}
          />
        </div>
      </div>
    );
  }

  // Instructor view
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Tổng học viên"
        value={totalStudents || 0}
        icon="👥"
      />
      <StatCard
        title="Đã hoàn thành"
        value={completedStudents || 0}
        icon="🎓"
        color="text-green-600"
      />
      <StatCard
        title="Tiến độ TB"
        value={`${Math.round(averageProgress || 0)}%`}
        icon="📊"
        color="text-blue-600"
      />
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm text-gray-500 mb-2">Tổng thời gian</h3>
        <TimeSpentDisplay seconds={totalTimeSpent || 0} />
      </div>
    </div>
  );
};

// Helper component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}> = ({ title, value, icon, color = 'text-gray-700' }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  </div>
);