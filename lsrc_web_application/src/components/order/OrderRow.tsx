// src/components/elearning/order/OrderRow.tsx
import { 
  FaShoppingBag, 
  FaUser, 
  FaCalendarAlt, 
  FaChevronRight,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBan,
  FaQuestionCircle,
  FaCreditCard
} from "react-icons/fa";
import type { OrderResponse } from "../../types/order.types";

type Props = {
  order: OrderResponse;
  onClick: () => void;
};

export function OrderRow({ order, onClick }: Props) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // Lấy trạng thái thanh toán
  const getPaymentStatus = () => {
    if (order.status === 'PAID') return order.status;
    if (order.paymentMethod && !order.paidAt) return 'PENDING';
    return order.status;
  };

  return (
    <div 
      className="group relative p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs hover:shadow-md hover:border-cyan-200 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Section: Icon & Order Meta */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-[#49BBBD] group-hover:bg-[#49BBBD] group-hover:text-white transition-colors duration-200">
            <FaShoppingBag size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#2F327D] text-sm sm:text-base group-hover:text-[#49BBBD] transition-colors">
                Đơn hàng #{order.id}
              </span>
              {/* Status Badge - Mobile View */}
              <span className="sm:hidden">
                <StatusBadge status={getPaymentStatus()} />
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 font-medium mt-0.5">
              <span className="flex items-center gap-1 text-slate-600 truncate">
                <FaUser size={10} className="text-slate-300 flex-shrink-0" />
                {order.username || 'Khách hàng'}
              </span>
              <span>•</span>
              <span className="text-slate-500 font-semibold">
                {order.items?.length || 0} khóa học
              </span>
              {order.createdAt && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:flex items-center gap-1 text-slate-400">
                    <FaCalendarAlt size={10} className="text-slate-300" />
                    {formatDate(order.createdAt)}
                  </span>
                </>
              )}
            </div>

            {/* Payment Method - Hiển thị nếu có */}
            {order.paymentMethod && (
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                <FaCreditCard size={9} className="text-slate-300" />
                <span>{order.paymentMethod}</span>
                {order.paidAt && (
                  <span className="text-emerald-500 flex items-center gap-1">
                    • <FaCheckCircle size={9} /> Đã thanh toán
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Price, Status (Desktop View) & Arrow */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100/80">
          <div className="text-left sm:text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider sm:hidden">Thành tiền</p>
            <p className="font-black text-[#49BBBD] text-base sm:text-lg tracking-tight">
              {formatCurrency(order.finalAmount)}
            </p>
            {/* Hiển thị giá gốc nếu có giảm giá */}
            {order.discountAmount > 0 && (
              <p className="text-[10px] text-slate-400 line-through sm:text-right">
                {formatCurrency(order.totalAmount)}
              </p>
            )}
          </div>

          {/* Status Badge - Desktop View */}
          <div className="hidden sm:block">
            <StatusBadge status={getPaymentStatus()} />
          </div>

          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-cyan-50 group-hover:text-[#49BBBD] group-hover:translate-x-0.5 transition-all">
            <FaChevronRight size={12} />
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-component: Status Badge
function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    PAID: { 
      label: 'Đã thanh toán', 
      className: 'bg-emerald-50 text-emerald-600 border-emerald-200', 
      icon: <FaCheckCircle size={10} /> 
    },
    SUCCESS: { 
      label: 'Thành công', 
      className: 'bg-emerald-50 text-emerald-600 border-emerald-200', 
      icon: <FaCheckCircle size={10} /> 
    },
    PENDING: { 
      label: 'Chờ xử lý', 
      className: 'bg-amber-50 text-amber-600 border-amber-200', 
      icon: <FaClock size={10} /> 
    },
    FAILED: { 
      label: 'Thất bại', 
      className: 'bg-rose-50 text-rose-600 border-rose-200', 
      icon: <FaTimesCircle size={10} /> 
    },
    CANCELLED: { 
      label: 'Đã hủy', 
      className: 'bg-slate-100 text-slate-500 border-slate-200', 
      icon: <FaBan size={10} /> 
    },
  };

  const config = configs[status] || { 
    label: status, 
    className: 'bg-slate-100 text-slate-500 border-slate-200', 
    icon: <FaQuestionCircle size={10} /> 
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}