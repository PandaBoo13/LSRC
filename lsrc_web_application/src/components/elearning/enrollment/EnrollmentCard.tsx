// ============================================================
// EnrollmentCard.tsx - FULL FIXED
// ============================================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaChevronRight, FaClock, FaVideo, FaCheckCircle, 
  FaMoneyBillWave, FaBroadcastTower, FaHourglassHalf,
  FaEye, FaChartLine, FaSpinner
} from 'react-icons/fa';
import { Panel } from '../ui/Panel';
import { StatusPill } from '../ui/StatusPill';
import type { OrderItemResponse } from '../../../types/order.types';
import { getImageUrl, getBackgroundStyle, getImageDimensions, getImageClass, type ImageDimensions } from '../../../utils/imageHelper';

type Props = {
  enrollment: OrderItemResponse;
  onStartLearning?: (e: React.MouseEvent) => void;
  onViewProgress?: (e: React.MouseEvent) => void;
};

export function EnrollmentCard({ enrollment, onStartLearning, onViewProgress }: Props) {
  const isWaiting = enrollment.enrollmentType === 'WAITING';
  const isCompleted = enrollment.status === 'COMPLETED';
  const isDropped = enrollment.status === 'DROPPED';
  const isActive = enrollment.status === 'ACTIVE';

  // ✅ Kiểm tra kích thước ảnh
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);

  const thumbnail = getImageUrl(enrollment.courseThumbnailUrl);

  // ✅ Background mặc định nếu chưa set
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

  const statusConfig = () => {
    if (isCompleted) return { tone: 'green' as const, label: '✅ Hoàn thành' };
    if (isDropped) return { tone: 'rose' as const, label: '🚫 Đã bỏ' };
    if (isWaiting) return { tone: 'amber' as const, label: '⏳ Chờ khai giảng' };
    if (isActive) return { tone: 'blue' as const, label: '📚 Đang học' };
    return { tone: 'slate' as const, label: 'Không xác định' };
  };

  const status = statusConfig();

  const getButtonConfig = () => {
    if (isWaiting) {
      return {
        label: '⏳ Chờ khai giảng',
        disabled: true,
        className: 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none hover:bg-slate-300 hover:shadow-none',
      };
    }
    if (isDropped) {
      return {
        label: '🚫 Đã bỏ khóa học',
        disabled: true,
        className: 'bg-rose-100 text-rose-400 cursor-not-allowed shadow-none hover:bg-rose-100 hover:shadow-none',
      };
    }
    if (isCompleted) {
      return {
        label: '📜 Xem lại khóa học',
        className: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600',
      };
    }
    return {
      label: enrollment.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học',
      className: 'bg-[#49BBBD] text-white shadow-md shadow-[#49BBBD]/20 hover:bg-[#3fa2a4]',
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <Panel className="group overflow-hidden rounded-3xl border border-slate-100 bg-white p-0 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
      {/* ✅ Thumbnail với background phía sau */}
      <div 
        className="relative overflow-hidden aspect-[16/10]"
        style={bgStyle}
      >
        {/* ✅ Nếu có thumbnail → Hiển thị ảnh với class phù hợp orientation */}
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={enrollment.courseTitle}
            className={`${getImageClass(imageDimensions?.orientation)} transition-transform duration-500 group-hover:scale-105 relative z-10`}
            onError={(e) => {
              // ✅ Nếu ảnh lỗi → Ẩn ảnh, hiện title trên background
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          // ✅ KHÔNG có thumbnail → Hiện title trên background
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
            <span className="text-white font-bold text-sm text-center line-clamp-3 drop-shadow-lg">
              {enrollment.courseTitle}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-4 top-4 flex gap-2 flex-wrap z-20">
          {isWaiting && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-400 text-yellow-900">
              <FaHourglassHalf className="text-[10px]" /> Chờ
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-md">
              <FaCheckCircle className="text-[10px]" /> Hoàn thành
            </span>
          )}
          {isActive && !isWaiting && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500 text-white shadow-md">
              <FaSpinner className="text-[10px] animate-spin" /> Đang học
            </span>
          )}
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-col p-6">
        {/* Title + Link */}
        <Link 
          to={`/courses/${enrollment.courseSlug}`}
          onClick={(e) => e.stopPropagation()}
          className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors hover:text-[#49BBBD]"
        >
          {enrollment.courseTitle}
        </Link>

        {/* Progress Bar */}
        {!isWaiting && !isDropped && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-slate-600">Tiến độ</span>
              <span className="font-bold text-[#49BBBD]">{enrollment.progress || 0}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-[#49BBBD]'
                }`}
                style={{ width: `${enrollment.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Waiting Message */}
        {isWaiting && (
          <div className="mt-4 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
            <p className="text-xs text-yellow-700 flex items-center gap-2">
              <FaBroadcastTower className="text-yellow-500" />
              Khóa học sẽ sớm khai giảng. Bạn sẽ được thông báo khi bắt đầu.
            </p>
          </div>
        )}

        {/* Dropped Message */}
        {isDropped && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <p className="text-xs text-rose-600">
              Bạn đã bỏ khóa học này.
            </p>
          </div>
        )}

        {/* Info Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <FaVideo className="flex-shrink-0 text-[#49BBBD]" />
            {enrollment.courseTitle}
          </span>
          <span className="flex items-center gap-2">
            <FaClock className="flex-shrink-0 text-[#49BBBD]" />
            {enrollment.enrollmentType === 'ENROLLED' ? 'Đã ghi danh' : 'Chờ khai giảng'}
          </span>

          {enrollment.price > 0 ? (
            <span className="flex items-center gap-2 font-medium text-emerald-600">
              <FaMoneyBillWave className="flex-shrink-0" />
              {enrollment.price.toLocaleString()}đ
            </span>
          ) : (
            <span className="flex items-center gap-2 font-medium text-sky-600">
              <FaMoneyBillWave className="flex-shrink-0" />
              Miễn phí
            </span>
          )}

          {enrollment.enrollmentType === 'ENROLLED' && (
            <span className="flex items-center gap-2">
              <FaCheckCircle className="flex-shrink-0 text-emerald-500" />
              ENROLLED
            </span>
          )}

          {isCompleted && enrollment.completedAt && (
            <span className="col-span-2 flex items-center gap-2 font-medium text-emerald-600">
              <FaCheckCircle className="flex-shrink-0" />
              Hoàn thành: {new Date(enrollment.completedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>

        {/* Link Details */}
        <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {isWaiting ? 'Trạng thái: Chờ khai giảng' : 'Trạng thái: Đang học'}
          </p>
          <Link
            to={`/courses/${enrollment.courseSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#49BBBD] hover:text-[#3fa2a4] transition"
          >
            <FaEye size={11} /> Chi tiết
          </Link>
        </div>

        {/* HAI NÚT: PROGRESS + CONTINUE */}
        <div className="mt-4 flex gap-2">
          {/* Nút View Progress */}
          <button
            onClick={isWaiting || isDropped ? undefined : onViewProgress}
            disabled={isWaiting || isDropped}
            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
              isWaiting || isDropped
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FaChartLine size={14} />
            Tiến độ
          </button>

          {/* Nút Continue/Start Learning */}
          <button
            onClick={isWaiting || isDropped ? undefined : onStartLearning}
            disabled={isWaiting || isDropped}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] ${buttonConfig.className}`}
          >
            {buttonConfig.label}
            {!isWaiting && !isDropped && <FaChevronRight size={12} />}
          </button>
        </div>
      </div>
    </Panel>
  );
}