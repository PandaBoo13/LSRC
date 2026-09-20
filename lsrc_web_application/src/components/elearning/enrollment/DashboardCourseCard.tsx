// ============================================================
// src/components/elearning/enrollment/DashboardCourseCard.tsx
// ============================================================
import { useState, useEffect } from 'react';
import { FaPlay, FaClock } from 'react-icons/fa';
import { StatusPill } from '../ui/StatusPill';
import { ProgressBar } from '../progress/ProgressBar';
import type { OrderItemResponse } from '../../../types/order.types';
import { getImageUrl, getBackgroundStyle, getImageDimensions, getImageClass, type ImageDimensions } from '../../../utils/imageHelper';

type Props = {
  enrollment: OrderItemResponse;
  onStartLearning?: (e: React.MouseEvent) => void;
};

export function DashboardCourseCard({ enrollment, onStartLearning }: Props) {
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);

  const thumbnail = getImageUrl(enrollment.courseThumbnailUrl);

  // ✅ Background mặc định
  const bgStyle = getBackgroundStyle(
    enrollment.courseBackgroundType || 'GRADIENT',
    enrollment.courseBackgroundThumbnail || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  );

  useEffect(() => {
    if (thumbnail) {
      getImageDimensions(thumbnail)
        .then(setImageDimensions)
        .catch(() => setImageDimensions(null));
    }
  }, [thumbnail]);

  const progressPercentage = Number(enrollment.progress) || 0;
  const isCompleted = enrollment.status === 'COMPLETED';
  const isWaiting = enrollment.enrollmentType === 'WAITING';

  return (
    <div className="group grid gap-5 rounded-3xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_auto]">
      {/* Thumbnail với background */}
      <div 
        className="overflow-hidden rounded-2xl relative aspect-[16/10] md:aspect-auto md:h-full"
        style={bgStyle}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={enrollment.courseTitle}
            className={`${getImageClass(imageDimensions?.orientation)} transition-transform duration-500 group-hover:scale-105 relative z-10`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
            <span className="text-white font-bold text-sm text-center line-clamp-3 drop-shadow-lg">
              {enrollment.courseTitle}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <StatusPill>
          {isWaiting ? 'Chờ khai giảng'
            : isCompleted ? 'Hoàn thành'
            : 'Đang học'}
        </StatusPill>
        <h3 className="mt-3 line-clamp-2 text-xl font-bold text-slate-900">
          {enrollment.courseTitle}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {Math.round(progressPercentage)}% hoàn thành
        </p>
        <div className="mt-6 max-w-lg">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-500">Tiến độ</span>
            <span className="font-semibold text-cyan-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <ProgressBar value={progressPercentage} />
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center md:justify-end">
        <button
          onClick={onStartLearning}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-cyan-600 hover:shadow-lg md:w-auto"
        >
          {progressPercentage > 0 ? 'Tiếp tục' : 'Bắt đầu'} <FaPlay size={11} />
        </button>
      </div>
    </div>
  );
}