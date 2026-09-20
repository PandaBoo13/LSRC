// src/pages/elearning/AdminPages/rbac/AdminRolesPage.tsx
import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import { DashboardShell } from '../../../../components/elearning/layout/DashboardShell';
import { RoleCard } from '../../../../components/elearning/rbac/RoleCard';
import { CreateRolePanel } from '../../../../components/elearning/rbac/CreateRolePanel';
import { Panel } from '../../../../components/elearning/rbac/ui/Panel';
// ✅ Sửa import
import { getAllRoles, createRole } from '../../../../service/rbacService';
import { adminNav } from '../../../../data/elearning';
import type { Role } from '../../../../types/rbac.types';

export function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoles = async (showLoading = true) => {
    if (showLoading) setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      const res = await getAllRoles(); // ✅ Đổi rbacService.getAllRoles → getAllRoles
      if (res.data.status === 'success') setRoles(res.data.data || []); 
      else setError('Không thể tải danh sách vai trò');
    } catch (error) { 
      setError('Đã xảy ra lỗi khi tải dữ liệu'); 
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const filteredRoles = roles.filter(r => r.roleName.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (roleName: string) => {
    try { 
      await createRole({ roleName }); // ✅ Đổi rbacService.createRole → createRole
      await fetchRoles(false); 
      setShowCreate(false); 
    } catch (error) { 
      setError('Không thể tạo vai trò mới'); 
    }
  };

  if (loading) return (
    <DashboardShell role="Admin" title="Quản lý vai trò" subtitle="Đang tải..." navItems={adminNav}>
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell role="Admin" title="Quản lý vai trò" subtitle="Tạo và quản lý vai trò người dùng" navItems={adminNav}>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchRoles(false)} className="text-red-700 font-medium hover:text-red-900">Thử lại</button>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng vai trò</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{roles.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đang hiển thị</p>
          <p className="text-2xl font-bold text-cyan-600 mt-1">{filteredRoles.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Người dùng</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{roles.reduce((sum, r) => sum + (r.accountCount || 0), 0)}</p>
        </div>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm vai trò..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50" 
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowCreate(true)} 
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-200 hover:bg-cyan-600 transition"
          >
            <FaPlus size={12} />Thêm vai trò
          </button>
          {refreshing && <FaSpinner className="h-4 w-4 animate-spin text-cyan-500" />}
        </div>
      </div>
      {showCreate && <CreateRolePanel onCreate={handleCreate} onCancel={() => setShowCreate(false)} />}
      {filteredRoles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredRoles.map(role => <RoleCard key={role.idRole} role={role} onEdit={() => {}} />)}
        </div>
      ) : (
        <Panel className="p-12 text-center border border-slate-200 rounded-xl">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FaShieldAlt size={28} />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">
              {search ? 'Không tìm thấy vai trò' : 'Chưa có vai trò nào'}
            </p>
            {!search && (
              <button 
                onClick={() => setShowCreate(true)} 
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600 transition"
              >
                <FaPlus size={12} />Tạo vai trò đầu tiên
              </button>
            )}
          </div>
        </Panel>
      )}
    </DashboardShell>
  );
}