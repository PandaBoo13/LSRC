// src/components/elearning/enrollment/EnrollmentDetailModal.tsx
import { Link } from 'react-router-dom';
import { FaTimes, FaClock, FaVideo, FaCheckCircle, FaMoneyBillWave, FaCreditCard, FaCalendarAlt, FaPlay } from 'react-icons/fa';
import { StatusPill } from '../ui/StatusPill';
import { getImageUrl } from '../../../utils/imageHelper';
import type { Enrollment } from '../../../types/enrollment.types';

type Props = {
  enrollment: Enrollment;
  onClose: () => void;
};

export function EnrollmentDetailModal({ enrollment, onClose }: Props) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { tone: 'green' as const, label: '✅ Completed' };
      case 'ACTIVE': return { tone: 'amber' as const, label: '🔄 Learning' };
      case 'DROPPED': return { tone: 'slate' as const, label: '📦 Dropped' };
      case 'ARCHIVED': return { tone: 'slate' as const, label: '📁 Archived' };
      default: return { tone: 'slate' as const, label: status };
    }
  };

  const getPaymentConfig = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PAID': return { tone: 'green' as const, label: '💰 Paid' };
      case 'FREE': return { tone: 'blue' as const, label: '🆓 Free' };
      case 'PENDING': return { tone: 'amber' as const, label: '⏳ Pending' };
      case 'FAILED': return { tone: 'red' as const, label: '❌ Failed' };
      case 'REFUNDED': return { tone: 'slate' as const, label: '↩️ Refunded' };
      default: return { tone: 'slate' as const, label: paymentStatus };
    }
  };

  const statusConfig = getStatusConfig(enrollment.status);
  const paymentConfig = getPaymentConfig(enrollment.paymentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          <img
            src={getImageUrl(enrollment.courseThumbnail)}
            alt={enrollment.courseTitle}
            className="h-48 w-full object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
          >
            <FaTimes size={16} />
          </button>
          <div className="absolute left-4 top-4 flex gap-2">
            <StatusPill tone={statusConfig.tone}>{statusConfig.label}</StatusPill>
            <StatusPill tone={paymentConfig.tone}>{paymentConfig.label}</StatusPill>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900">{enrollment.courseTitle}</h2>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 font-medium">Progress</span>
              <span className="font-semibold text-cyan-600">{enrollment.progress}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
          </div>

          {/* Info Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <FaVideo className="text-cyan-500 flex-shrink-0" />
              <span>{enrollment.totalLessons || 'N/A'} lessons</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <FaCalendarAlt className="text-cyan-500 flex-shrink-0" />
              <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')}</span>
            </div>

            {enrollment.status === 'COMPLETED' && enrollment.completedAt && (
              <div className="flex items-center gap-2 text-green-600">
                <FaCheckCircle className="flex-shrink-0" />
                <span>Completed: {new Date(enrollment.completedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            )}

            {/* Payment Details */}
            {enrollment.paymentStatus === 'PAID' && (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <FaMoneyBillWave className="flex-shrink-0" />
                  <span>{enrollment.paymentAmount?.toLocaleString()}đ</span>
                </div>
                {enrollment.paymentMethod && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <FaCreditCard className="flex-shrink-0" />
                    <span>{enrollment.paymentMethod}</span>
                  </div>
                )}
                {enrollment.paymentDate && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <FaCalendarAlt className="flex-shrink-0" />
                    <span>Paid: {new Date(enrollment.paymentDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
                {enrollment.transactionId && (
                  <div className="col-span-2 text-xs text-slate-400 truncate">
                    Transaction ID: {enrollment.transactionId}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Dates */}
          <div className="mt-6 space-y-2 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Enrolled</span>
              <span className="text-slate-700 font-medium">
                {new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
            {enrollment.completedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Completed</span>
                <span className="text-slate-700 font-medium">
                  {new Date(enrollment.completedAt).toLocaleDateString('vi-VN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <Link
              to={`/learn/${enrollment.courseSlug}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              <FaPlay size={14} />
              {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}