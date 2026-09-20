// src/components/progress/StudentProgressTable.tsx
import React from 'react';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { TimeSpentDisplay } from './TimeSpentDisplay';
import { formatDate } from '../../../utils/progressUtils';
import type { StudentProgressTableProps } from '../../../service/progress/progress.types';

export const StudentProgressTable: React.FC<StudentProgressTableProps> = ({
  students,
  onStudentClick,
  searchTerm = '',
  onSearchChange,
  sortBy = 'name',
  onSortChange,
  className = '',
}) => {
  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return b.progressPercentage - a.progressPercentage;
      case 'time':
        return b.totalTimeSpent - a.totalTimeSpent;
      case 'name':
      default:
        return a.username.localeCompare(b.username);
    }
  });

  if (students.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg">Chưa có học viên nào đăng ký khóa học này</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Search and Sort Bar */}
      {(onSearchChange || onSortChange) && (
        <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between">
          {onSearchChange && (
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm học viên..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
          
          {onSortChange && (
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="progress">Sắp xếp theo tiến độ</option>
              <option value="time">Sắp xếp theo thời gian học</option>
            </select>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Học viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiến độ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bài học
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian học
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Truy cập gần nhất
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedStudents.map((student) => (
              <tr
                key={student.id}
                onClick={() => onStudentClick?.(student.accountId)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {student.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-32">
                    <ProgressBar percentage={student.progressPercentage} showLabel size="sm" />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.completedLessons}/{student.totalLessons}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TimeSpentDisplay seconds={student.totalTimeSpent} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(student.lastAccessedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy học viên nào
        </div>
      )}
    </div>
  );
};