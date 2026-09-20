// src/components/progress/TimeSpentDisplay.tsx
import React from 'react';
import type { TimeSpentDisplayProps } from '../../../service/progress/progress.types';
import { formatTimeSpent } from '../../../utils/progressUtils';

export const TimeSpentDisplay: React.FC<TimeSpentDisplayProps> = ({
  seconds,
  showIcon = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 text-gray-600 ${className}`}>
      {showIcon && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      <span className="text-sm font-medium">{formatTimeSpent(seconds)}</span>
    </div>
  );
};