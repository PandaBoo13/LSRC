// src/components/elearning/order/InvoiceModal.tsx
import { useState, useEffect, useCallback } from "react";
import { 
  FaSpinner, 
  FaTimes, 
  FaPrint, 
  FaCheckCircle, 
  FaReceipt, 
  FaBuilding, 
  FaUserGraduate,
  FaCreditCard,
  FaExclamationTriangle
} from "react-icons/fa";
import { getOrderById } from "../../service/orderService";
import type { OrderResponse } from "../../types/order.types";

type Props = {
  orderId: number;
  onClose: () => void;
};

export function InvoiceModal({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId || isNaN(Number(orderId))) {
      setError("Mã hóa đơn không hợp lệ");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error("Failed to load order:", err);
      setError(err?.message || "Không thể tải hóa đơn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handlePrint = () => {
    window.print();
  };

  // Format helpers
  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('vi-VN');
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn" 
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl border border-slate-100" 
          onClick={e => e.stopPropagation()}
        >
          <FaSpinner className="animate-spin text-[#49BBBD] text-4xl mb-3" />
          <p className="text-slate-600 font-medium text-sm">Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" 
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl border border-slate-100 max-w-md" 
          onClick={e => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl mb-4">
            <FaExclamationTriangle />
          </div>
          <p className="text-slate-700 font-bold text-sm mb-2">Không thể tải hóa đơn</p>
          <p className="text-slate-500 text-xs text-center mb-4">{error}</p>
          <div className="flex gap-2">
            <button 
              onClick={loadOrder} 
              className="px-4 py-2 bg-[#49BBBD] hover:bg-[#3da3a5] text-white font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Thử lại
            </button>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  // Kiểm tra trạng thái thanh toán
  const isPaid = order.status === 'PAID';
  const statusLabel = isPaid ? 'Đã thanh toán' : 
    order.status === 'PENDING' ? 'Chờ thanh toán' : 
    order.status === 'FAILED' ? 'Thanh toán thất bại' : 
    'Đã hủy';

  const statusClassName = isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
    order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
    order.status === 'FAILED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
    'bg-slate-50 text-slate-500 border-slate-100';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto no-print-bg" 
        onClick={onClose}
      >
        {/* Modal Container */}
        <div 
          className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100 my-auto custom-scrollbar" 
          onClick={e => e.stopPropagation()}
        >
          
          {/* Top Control Bar (Hidden on Print) */}
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100 z-20 no-print">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-50 text-[#49BBBD] rounded-xl">
                <FaReceipt size={18} />
              </div>
              <span className="font-bold text-[#2F327D] text-base">Hóa đơn thanh toán</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrint} 
                className="flex items-center gap-2 px-4 py-2 bg-[#49BBBD] hover:bg-[#3da3a5] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <FaPrint size={13} /> In hóa đơn
              </button>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Đóng"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          {/* Printable Invoice Body */}
          <div className="p-6 md:p-8 space-y-6" id="invoice-printable">
            
            {/* Header / Brand & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black tracking-tight text-[#2F327D]">LSRC</span>
                  <span className="text-2xl font-light text-[#49BBBD]">E-Learning</span>
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">HÓA ĐƠN THƯƠNG MẠI DỊCH VỤ</p>
              </div>

              <div className="sm:text-right">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2 ${statusClassName}`}>
                  {isPaid ? <FaCheckCircle size={12} /> : <FaExclamationTriangle size={12} />} 
                  {statusLabel}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Số hóa đơn: <strong className="text-slate-800 font-mono">{order.invoiceNumber || `#${order.id}`}</strong>
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Ngày xuất: <strong className="text-slate-800">{formatDate(order.invoiceIssuedAt)}</strong>
                </p>
              </div>
            </div>

            {/* Seller & Buyer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seller */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100/80 space-y-1.5">
                <div className="flex items-center gap-2 text-[#49BBBD] font-bold text-xs uppercase tracking-wider mb-2">
                  <FaBuilding size={12} /> Bên bán hàng (Seller)
                </div>
                <p className="font-bold text-[#2F327D] text-sm">LSRC E-Learning Platform</p>
                <p className="text-xs text-slate-500">Email: support@lsrc.edu.vn</p>
                <p className="text-xs text-slate-500">Địa chỉ: 123 Nguyễn Văn Linh, Đà Nẵng</p>
              </div>

              {/* Buyer */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100/80 space-y-1.5">
                <div className="flex items-center gap-2 text-[#49BBBD] font-bold text-xs uppercase tracking-wider mb-2">
                  <FaUserGraduate size={13} /> Bên mua hàng (Buyer)
                </div>
                <p className="font-bold text-[#2F327D] text-sm">
                  {order.buyerName || order.username || '—'}
                </p>
                <p className="text-xs text-slate-500">
                  Email: {order.buyerEmail || '—'}
                </p>
                <p className="text-xs text-slate-500">
                  Mã hóa đơn: <strong className="font-mono text-slate-700">{order.invoiceNumber || `#${order.id}`}</strong>
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[#2F327D] font-bold border-b border-slate-100">
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4">Khóa học / Dịch vụ</th>
                    <th className="py-3 px-4 text-center w-16">SL</th>
                    <th className="py-3 px-4 text-right w-28">Đơn giá</th>
                    <th className="py-3 px-4 text-right w-32">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {order.items?.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-center font-medium text-slate-400">{index + 1}</td>
                        <td className="py-3 px-4 font-semibold text-[#2F327D]">{item.courseTitle}</td>
                        <td className="py-3 px-4 text-center">1</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(item.price)}đ</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(item.finalPrice)}đ</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Không có sản phẩm nào trong đơn hàng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
              
              {/* Payment Detail Card */}
              {order.paymentMethod ? (
                <div className="w-full sm:w-auto flex-1 p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100/60 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#49BBBD] font-bold mb-1">
                    <FaCreditCard size={12} /> Thông tin giao dịch
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                    <div>
                      <span>Hình thức:</span>
                      <strong className="ml-1.5 text-slate-800">{order.paymentMethod}</strong>
                    </div>
                    {order.paidAt && (
                      <div>
                        <span>Ngày trả:</span>
                        <strong className="ml-1.5 text-slate-800">
                          {formatDateTime(order.paidAt)}
                        </strong>
                      </div>
                    )}
                    {order.transactionId && (
                      <div className="col-span-2 pt-1 border-t border-cyan-100/80">
                        <span>Mã giao dịch:</span>
                        <strong className="ml-1.5 font-mono text-[11px] text-[#2F327D]">
                          {order.transactionId}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              ) : <div />}

              {/* Price Breakdown */}
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between py-1 px-2 text-slate-500 font-medium">
                  <span>Tạm tính:</span>
                  <span className="text-slate-800 font-semibold">
                    {formatCurrency(order.totalAmount)}đ
                  </span>
                </div>
                <div className="flex justify-between py-1 px-2 text-slate-500 font-medium">
                  <span>Giảm giá:</span>
                  <span className="text-rose-500 font-semibold">
                    -{formatCurrency(order.discountAmount)}đ
                  </span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-2xl bg-[#2F327D] text-white font-bold text-sm shadow-md mt-2">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-[#49BBBD] text-base">
                    {formatCurrency(order.finalAmount)}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-600">Cảm ơn bạn đã tin tưởng và tham gia khóa học tại LSRC! 🎓</p>
              <p>Mọi thắc mắc về hóa đơn xin vui lòng liên hệ support@lsrc.edu.vn</p>
              <p className="text-[10px] text-slate-300">Đây là hóa đơn điện tử được khởi tạo tự động, không cần chữ ký tay.</p>
            </div>

          </div>
        </div>
      </div>

      {/* Print Specific CSS Override */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
          }
          .no-print, .no-print-bg {
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            position: static !important;
          }
          .no-print {
            display: none !important;
          }
          #invoice-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </>
  );
}