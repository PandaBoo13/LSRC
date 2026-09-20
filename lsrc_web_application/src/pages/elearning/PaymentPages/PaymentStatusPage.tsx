// src/pages/elearning/StudentPages/PaymentStatusPage.tsx
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaPrint, FaBookOpen, FaReceipt } from "react-icons/fa";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getOrderById } from "../../../service/orderService";
import { useCurrency } from "../../../context/CurrencyContext";
import type { OrderResponse } from "../../../types/order.types";

export function PaymentStatusPage({ status }: { status: 'success' | 'failed' }) {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  // ✅ Dùng currency context
  const { convertFormatted } = useCurrency();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(status === 'success' && !!orderId);
  const [error, setError] = useState<string | null>(null);

  const isSuccess = status === 'success';

  useEffect(() => {
    if (isSuccess) {
      localStorage.removeItem('cartSelectedIds');
      if (orderId) {
        fetchOrder(Number(orderId));
      }
    }
  }, [isSuccess, orderId]);

  const fetchOrder = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      console.error("Failed to fetch order:", err);
      setError("Không thể tải thông tin hóa đơn. Vui lòng kiểm tra lại trong lịch sử mua hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Format helpers
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50/50 text-slate-800 flex flex-col justify-between">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-14 w-full flex-1">
        
        {/* STATUS BANNER CARD */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] text-center mb-8">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl mb-4 ${
              isSuccess ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
            }`}
          >
            {isSuccess ? <FaCheckCircle /> : <FaTimesCircle />}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>

          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            {isSuccess
              ? 'Cảm ơn bạn đã đăng ký khóa học! Dưới đây là thông tin chi tiết hóa đơn thanh toán của bạn.'
              : 'Giao dịch không thành công hoặc đã bị hủy. Các sản phẩm vẫn được giữ trong giỏ hàng của bạn.'}
          </p>

          {/* Navigation Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={isSuccess ? '/student/dashboard' : '/cart'}
              className="px-6 py-3 rounded-2xl bg-[#49BBBD] hover:bg-teal-600 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
            >
              <FaBookOpen className="text-xs" />
              {isSuccess ? 'Vào bảng điều khiển học tập' : 'Quay lại giỏ hàng'}
            </Link>

            {isSuccess && order && (
              <button
                onClick={handlePrint}
                className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <FaPrint className="text-xs text-slate-500" />
                In hóa đơn
              </button>
            )}

            <Link
              to="/courses"
              className="px-6 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
            >
              Khám phá thêm khóa học
            </Link>
          </div>
        </div>

        {/* INVOICE DETAILS SECTION (IF SUCCESS) */}
        {isSuccess && (
          <>
            {loading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                <FaSpinner className="h-8 w-8 animate-spin text-[#49BBBD] mb-3" />
                <p className="text-sm text-slate-500">Đang tải hóa đơn thanh toán...</p>
              </div>
            ) : order ? (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] print:shadow-none print:border-none print:p-0">
                
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 mb-6 gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#49BBBD] tracking-wider uppercase flex items-center gap-1.5">
                      <FaReceipt size={12} />
                      HÓA ĐƠN THANH TOÁN
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                      {order.invoiceNumber || `Đơn hàng #${order.id}`}
                    </h2>
                  </div>
                  <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
                    <p>
                      <span className="font-semibold text-slate-700">Ngày phát hành:</span>{" "}
                      {formatDate(order.invoiceIssuedAt)}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Mã đơn hàng:</span> #{order.id}
                    </p>
                  </div>
                </div>

                {/* Customer & Payment Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#EEF5FA] rounded-2xl p-6 mb-8 text-xs sm:text-sm">
                  <div>
                    <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2">Thông tin người mua</h3>
                    <p className="font-semibold text-slate-800">{order.buyerName || order.username || '—'}</p>
                    <p className="text-slate-500 mt-0.5">{order.buyerEmail || '—'}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2">Phương thức thanh toán</h3>
                    <p className="font-semibold text-slate-800">{order.paymentMethod || 'Chuyển khoản / Thẻ'}</p>
                    {order.transactionId && (
                      <p className="text-slate-500 mt-0.5">
                        Mã giao dịch: <span className="font-mono">{order.transactionId}</span>
                      </p>
                    )}
                    {order.paidAt && (
                      <p className="text-slate-500 mt-0.5">
                        Thời gian: {formatDateTime(order.paidAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto mb-8">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-medium">
                        <th className="pb-3 font-semibold">Khóa học</th>
                        <th className="pb-3 text-center font-semibold">Số lượng</th>
                        <th className="pb-3 text-right font-semibold">Đơn giá</th>
                        <th className="pb-3 text-right font-semibold">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items?.map((item, idx) => (
                        <tr key={item.id || idx} className="text-slate-700">
                          <td className="py-4 font-semibold text-slate-800 pr-4">{item.courseTitle}</td>
                          <td className="py-4 text-center">1</td>
                          <td className="py-4 text-right text-slate-500">{convertFormatted(item.price)}</td>
                          <td className="py-4 text-right font-bold text-slate-800">{convertFormatted(item.finalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Summary */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-72 space-y-2.5 text-xs sm:text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Tạm tính:</span>
                      <span className="font-semibold text-slate-800">{convertFormatted(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Giảm giá:</span>
                      <span className="font-semibold text-slate-800">-{convertFormatted(order.discountAmount)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-bold text-slate-900">
                      <span>Tổng thanh toán:</span>
                      <span className="text-[#49BBBD]">{convertFormatted(order.finalAmount)}</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : error ? (
              <div className="bg-amber-50 text-amber-700 rounded-2xl p-4 text-center text-sm border border-amber-200">
                {error}
              </div>
            ) : null}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}