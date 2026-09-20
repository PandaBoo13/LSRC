// src/components/progress/CourseProgressCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CourseProgressCardProps } from '../../../service/progress/progress.types';

// src/components/progress/CourseProgressCard.tsx
export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({ progress, onClick, className = '' }) => {
  const navigate = useNavigate();
  const handleClick = () => { if (onClick) onClick(); else navigate(`/student/progress/${progress.courseId}`); };

  return (
    <div onClick={handleClick}
      className={`group flex flex-col bg-white rounded-[24px] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.09)] transition-all duration-300 cursor-pointer border border-slate-100/80 w-full aspect-[1.12/1] ${className}`}>
      
      {/* Thumbnail - cách viền nhờ p-3 của cha + bo góc riêng */}
      <div className="relative w-full h-[60%] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
        {progress.courseThumbnail ? (
          <img src={progress.courseThumbnail} alt={progress.courseTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-2xl font-bold">
            {progress.courseTitle?.charAt(0).toUpperCase() || 'C'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 px-1 pt-3">
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-1 group-hover:text-cyan-600 transition-colors">{progress.courseTitle}</h3>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${progress.username || 'Lina'}`} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-medium text-slate-500">{progress.username || 'Lina'}</span>
          </div>
        </div>
        <div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div className="bg-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, progress.progressPercentage || 0))}%` }} />
          </div>
          <div className="text-right"><span className="text-[11px] font-medium text-slate-400">Lesson {progress.completedLessons || 0} of {progress.totalLessons || 0}</span></div>
        </div>
      </div>
    </div>
  );
};