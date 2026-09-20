// src/pages/elearning/StudentPages/BillingPage.tsx
import { useState, useEffect, useCallback } from "react";
import { 
  FaSpinner, 
  FaFileInvoiceDollar, 
  FaEye, 
  FaReceipt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBan,
  FaShoppingBag
} from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { Panel } from "../../../components/elearning/ui/Panel";
import { studentNav } from "../../../data/elearning";
import { getMyOrders } from "../../../service/orderService";
import { InvoiceModal } from "../../../components/order/InvoiceModal";
import type { OrderResponse } from "../../../types/order.types";

export function BillingPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyOrders({ page, size: 10, sortBy: 'createdAt', sortDirection: 'DESC' });
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalOrders(data.totalElements || 0);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return { 
          label: 'Đã thanh toán', 
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <FaCheckCircle size={10} />
        };
      case 'PENDING':
        return { 
          label: 'Chờ thanh toán', 
          className: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <FaClock size={10} />
        };
      case 'FAILED':
        return { 
          label: 'Thất bại', 
          className: 'bg-red-50 text-red-700 border-red-200',
          icon: <FaTimesCircle size={10} />
        };
      case 'CANCELLED':
        return { 
          label: 'Đã hủy', 
          className: 'bg-slate-50 text-slate-500 border-slate-200',
          icon: <FaBan size={10} />
        };
      default:
        return { 
          label: status, 
          className: 'bg-slate-50 text-slate-500 border-slate-200',
          icon: <FaClock size={10} />
        };
    }
  };

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

  // Tính tổng tiền đã thanh toán
  const totalPaid = orders
    .filter(o => o.status === 'PAID')
    .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  if (loading) {
    return (
      <DashboardShell role="Student" title="Lịch sử giao dịch" subtitle="Đang tải..." navItems={studentNav}>
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="Student"
      title="Lịch sử giao dịch"
      subtitle="Lịch sử giao dịch và hóa đơn của bạn."
      navItems={studentNav}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#49BBBD] flex items-center justify-center">
                <FaShoppingBag size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Tổng đơn hàng</p>
                <p className="text-xl font-extrabold text-[#2F327D]">{totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FaCheckCircle size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Đã thanh toán</p>
                <p className="text-xl font-extrabold text-emerald-600">
                  {orders.filter(o => o.status === 'PAID').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FaFileInvoiceDollar size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Tổng chi tiêu</p>
                <p className="text-xl font-extrabold text-indigo-600">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Panel */}
        <Panel>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Lịch sử giao dịch</h2>
              <p className="mt-1 text-sm text-slate-500">
                {totalOrders} đơn hàng • Trang {page + 1}/{totalPages || 1}
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16">
              <FaFileInvoiceDollar className="text-5xl text-slate-300 mx-auto" />
              <p className="mt-4 text-slate-500 font-medium">Chưa có giao dịch nào</p>
              <p className="text-xs text-slate-400 mt-1">
                Khi bạn đăng ký khóa học, lịch sử giao dịch sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="mt-6 overflow-x-auto hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="pb-3 font-semibold text-slate-500">Đơn hàng</th>
                      <th className="pb-3 font-semibold text-slate-500">Khóa học</th>
                      <th className="pb-3 font-semibold text-slate-500 text-right">Tổng tiền</th>
                      <th className="pb-3 font-semibold text-slate-500 text-center">Trạng thái</th>
                      <th className="pb-3 font-semibold text-slate-500 text-right">Ngày tạo</th>
                      <th className="pb-3 font-semibold text-slate-500 text-center">Hóa đơn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const statusConfig = getStatusConfig(order.status);
                      return (
                        <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 font-bold text-[#2F327D]">#{order.id}</td>
                          <td className="py-4 text-slate-600">
                            <span className="font-medium">{order.items?.length || 0} khóa học</span>
                          </td>
                          <td className="py-4 text-right font-semibold text-slate-900">
                            {formatCurrency(order.finalAmount)}
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.className}`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="py-4 text-right text-slate-500">{formatDate(order.createdAt)}</td>
                          <td className="py-4 text-center">
                            <button 
                              onClick={() => setSelectedOrderId(order.id)}
                              className="p-2 text-slate-400 hover:text-[#49BBBD] hover:bg-cyan-50 rounded-lg transition cursor-pointer"
                              title="Xem hóa đơn"
                            >
                              <FaReceipt size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="mt-4 space-y-3 md:hidden">
                {orders.map(order => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div key={order.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2F327D] text-sm">Đơn hàng #{order.id}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.className}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{order.items?.length || 0} khóa học</span>
                        <span className="font-bold text-slate-800">{formatCurrency(order.finalAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{formatDate(order.createdAt)}</span>
                        <button 
                          onClick={() => setSelectedOrderId(order.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#49BBBD] bg-cyan-50 hover:bg-[#49BBBD] hover:text-white transition cursor-pointer text-[11px] font-bold"
                        >
                          <FaReceipt size={11} /> Xem hóa đơn
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button 
                    onClick={() => setPage(Math.max(0, page - 1))} 
                    disabled={page === 0}
                    className="px-4 py-2 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition cursor-pointer"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setPage(i)}
                      className={`px-3 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
                        page === i ? 'bg-[#49BBBD] text-white' : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))} 
                    disabled={page === totalPages - 1}
                    className="px-4 py-2 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition cursor-pointer"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </Panel>
      </div>

      {/* Invoice Modal */}
      {selectedOrderId && (
        <InvoiceModal 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </DashboardShell>
  );
}