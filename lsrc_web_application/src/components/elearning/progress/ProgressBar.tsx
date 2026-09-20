// src/components/progress/ProgressBar.tsx
import React from 'react';
import type { ProgressBarProps } from '../../../service/progress/progress.types';
import { getProgressColor } from '../../../utils/progressUtils';

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showLabel = false,
  size = 'md',
  color,
  className = '',
  animated = false,
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2">
        <div
          className={`flex-grow bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}
          role="progressbar"
          aria-valuenow={clampedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Tiến độ ${Math.round(clampedPercentage)}%`}
        >
          <div
            className={`
              ${sizeClasses[size]} rounded-full transition-[width] duration-500 ease-out
              ${color || getProgressColor(clampedPercentage)}
              ${animated ? 'animate-pulse' : ''}
            `}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
        {showLabel && (
          <span className={`font-medium text-gray-700 ${textSizes[size]}`}>
            {Math.round(clampedPercentage)}%
          </span>
        )}
      </div>
    </div>
  );
};