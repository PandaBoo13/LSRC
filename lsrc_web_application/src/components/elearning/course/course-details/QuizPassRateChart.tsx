// src/components/course-detail/QuizPassRateChart.tsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { FaChartPie } from 'react-icons/fa';
import './chartSetup';
import type { QuizAttempt } from '../../../../../types/quizAttempt.types';

interface Props {
  attempts?: QuizAttempt[];
}

export const QuizPassRateChart: React.FC<Props> = ({ attempts = [] }) => {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs text-center h-full flex flex-col items-center justify-center min-h-[160px] sm:min-h-[240px]">
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center text-lg mb-1.5">
          <FaChartPie />
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-700 mb-0.5">Tỷ lệ Đạt / Chưa đạt (Quiz)</h4>
        <p className="text-[11px] text-slate-400">Chưa có lượt làm bài quiz nào</p>
      </div>
    );
  }

  const passedCount = attempts.filter((a) => a.isPassed).length;
  const failedCount = attempts.length - passedCount;

  const chartData = {
    labels: ['Đạt (Passed)', 'Chưa đạt (Failed)'],
    datasets: [
      {
        data: [passedCount, failedCount],
        backgroundColor: ['#10B981', '#F43F5E'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs h-full flex flex-col justify-between">
      <div className="mb-2 sm:mb-4">
        <h4 className="text-xs sm:text-base font-bold text-[#2F327D]">Tỷ lệ Đạt / Chưa đạt (Quiz)</h4>
        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">Tổng số lượt làm bài kiểm tra</p>
      </div>
      <div className="h-[150px] sm:h-[240px] w-full relative">
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 8,
                  font: { size: 10 },
                  padding: 8,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};