// src/pages/elearning/AdminPages/AdminOrdersPage.tsx
import { useState, useEffect, useCallback } from "react";
import { 
  FaSpinner, 
  FaSearch, 
  FaDollarSign, 
  FaShoppingBag, 
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBan,
  FaReceipt
} from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { Panel } from "../../../components/elearning/ui/Panel";
import { adminNav } from "../../../data/elearning";
import { getAllOrders } from "../../../service/orderService";
import { OrderRow } from "../../../components/order/OrderRow";
import { InvoiceModal } from "../../../components/order/InvoiceModal";
import type { OrderResponse } from "../../../types/order.types";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    cancelledOrders: 0,
  });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllOrders({ page, size: 10, sortBy: 'createdAt', sortDirection: 'DESC' });
      const allOrders = data.content || [];
      setOrders(allOrders);
      setTotalPages(data.totalPages || 0);
      setTotalOrders(data.totalElements || 0);

      // Tính toán thống kê
      const paid = allOrders.filter(o => o.status === 'PAID');
      const pending = allOrders.filter(o => o.status === 'PENDING');
      const failed = allOrders.filter(o => o.status === 'FAILED');
      const cancelled = allOrders.filter(o => o.status === 'CANCELLED');
      
      setStats({
        totalRevenue: paid.reduce((sum, o) => sum + (o.finalAmount || 0), 0),
        totalOrders: allOrders.length,
        paidOrders: paid.length,
        pendingOrders: pending.length,
        failedOrders: failed.length,
        cancelledOrders: cancelled.length,
      });
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = search
    ? orders.filter(o =>
        o.id.toString().includes(search) ||
        o.username?.toLowerCase().includes(search.toLowerCase()) ||
        o.status?.toLowerCase().includes(search.toLowerCase()) ||
        o.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const formatCurrency = (amount: number) => {
    if (!amount) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  if (loading) {
    return (
      <DashboardShell role="Admin" title="Quản lý đơn hàng" subtitle="Đang tải..." navItems={adminNav}>
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell 
      role="Admin" 
      title="Quản lý đơn hàng" 
      subtitle={`${totalOrders} đơn hàng trong hệ thống`} 
      navItems={adminNav}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Doanh thu */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-50 shrink-0">
              <FaDollarSign className="text-emerald-500" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Doanh thu</p>
              <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        {/* Tổng đơn */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-cyan-50 shrink-0">
              <FaShoppingBag className="text-[#49BBBD]" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Tổng đơn</p>
              <p className="text-base sm:text-lg font-bold text-slate-900">{totalOrders}</p>
            </div>
          </div>
        </div>

        {/* Đã thanh toán */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-green-50 shrink-0">
              <FaCheckCircle className="text-green-500" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Đã thanh toán</p>
              <p className="text-base sm:text-lg font-bold text-green-600">{stats.paidOrders}</p>
            </div>
          </div>
        </div>

        {/* Chờ xử lý */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-amber-50 shrink-0">
              <FaClock className="text-amber-500" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-medium">Chờ xử lý</p>
              <p className="text-base sm:text-lg font-bold text-amber-600">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã đơn, khách hàng, trạng thái, số hóa đơn..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-[#49BBBD] focus:ring-2 focus:ring-cyan-100 transition" 
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Panel className="text-center py-16">
          <FaShoppingBag className="text-5xl text-slate-300 mx-auto" />
          <p className="mt-4 text-slate-500 font-medium">Không có đơn hàng nào</p>
          <p className="text-xs text-slate-400 mt-1">
            {search ? 'Không tìm thấy đơn hàng phù hợp với tìm kiếm' : 'Đơn hàng sẽ hiển thị tại đây'}
          </p>
        </Panel>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.map(order => (
            <OrderRow 
              key={order.id} 
              order={order} 
              onClick={() => setSelectedOrderId(order.id)} 
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
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
                page === i ? 'bg-[#49BBBD] text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200'
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