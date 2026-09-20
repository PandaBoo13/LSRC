// src/pages/elearning/AdminPages/rbac/AdminPermissionsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaSpinner, FaTimes, FaShieldAlt } from 'react-icons/fa';
import { DashboardShell } from '../../../../components/elearning/layout/DashboardShell';
import { PermissionCard } from '../../../../components/elearning/rbac/PermissionCard';
import { CreatePermissionPanel } from '../../../../components/elearning/rbac/CreatePermissionPanel';
import { EditPermissionModal } from '../../../../components/elearning/rbac/EditPermissionModal';
import { Panel } from '../../../../components/elearning/rbac/ui/Panel';
// ✅ Sửa import
import { getAllPermissions, createPermission } from '../../../../service/rbacService';
import { adminNav } from '../../../../data/elearning';
import type { Permission } from '../../../../types/rbac.types';

export function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('Tất cả');
  const [showCreate, setShowCreate] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPermissions = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      const res = await getAllPermissions(); // ✅ Đổi rbacService.getAllPermissions → getAllPermissions
      if (res.data?.status === 'success') setPermissions(res.data.data || []); 
      else setError('Không thể tải danh sách quyền');
    } catch (error) { 
      setError('Đã xảy ra lỗi khi tải dữ liệu.'); 
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const resources = ['Tất cả', ...new Set(permissions.map(p => p.resource))];
  const filteredPermissions = permissions.filter(p => {
    const matchesSearch = p.permissionName.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (resourceFilter === 'Tất cả' || p.resource === resourceFilter);
  });

  const handleCreate = async (data: { permissionName: string; resource: string; action: string; description: string; isDefault?: boolean }) => {
    try { 
      await createPermission(data); // ✅ Đổi rbacService.createPermission → createPermission
      await fetchPermissions(false); 
      setShowCreate(false); 
    } catch (error) { 
      setError('Không thể tạo quyền mới'); 
    }
  };

  if (loading) return (
    <DashboardShell role="Admin" title="Quản lý quyền" subtitle="Đang tải..." navItems={adminNav}>
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell role="Admin" title="Quản lý quyền" subtitle="Quản lý tất cả quyền trong hệ thống" navItems={adminNav}>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => fetchPermissions(false)} className="text-red-700 font-medium hover:text-red-900">Thử lại</button>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng quyền</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{permissions.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đang hiển thị</p>
          <p className="text-2xl font-bold text-cyan-600 mt-1">{filteredPermissions.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mặc định</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{permissions.filter(p => p.isDefault).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resource</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{resources.length - 1}</p>
        </div>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm quyền..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50" 
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <FaTimes size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={resourceFilter} 
            onChange={(e) => setResourceFilter(e.target.value)} 
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-cyan-400"
          >
            {resources.map(r => <option key={r} value={r}>{r === 'Tất cả' ? '📦 Tất cả' : r}</option>)}
          </select>
          {(search || resourceFilter !== 'Tất cả') && (
            <button 
              onClick={() => { setSearch(''); setResourceFilter('Tất cả'); }} 
              className="text-sm text-red-500 hover:text-red-700 whitespace-nowrap"
            >
              Xóa bộ lọc
            </button>
          )}
          <button 
            onClick={() => setShowCreate(true)} 
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-200 hover:bg-cyan-600 transition"
          >
            <FaPlus size={12} />Thêm quyền
          </button>
          {refreshing && <FaSpinner className="h-4 w-4 animate-spin text-cyan-500" />}
        </div>
      </div>
      {showCreate && (
        <CreatePermissionPanel 
          onClose={() => setShowCreate(false)} 
          onCreate={handleCreate} 
        />
      )}
      {filteredPermissions.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {filteredPermissions.map(permission => (
            <PermissionCard 
              key={permission.idPermission} 
              permission={permission} 
              onEdit={setEditingPermission} 
            />
          ))}
        </div>
      ) : (
        <Panel className="p-12 text-center border border-slate-200 rounded-xl">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FaShieldAlt size={28} />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">
              {search || resourceFilter !== 'Tất cả' ? 'Không tìm thấy quyền phù hợp' : 'Chưa có quyền nào'}
            </p>
            {!search && resourceFilter === 'Tất cả' && (
              <button 
                onClick={() => setShowCreate(true)} 
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600 transition"
              >
                <FaPlus size={12} />Tạo quyền đầu tiên
              </button>
            )}
          </div>
        </Panel>
      )}
      {editingPermission && (
        <EditPermissionModal 
          permission={editingPermission} 
          onClose={() => setEditingPermission(null)} 
          onSuccess={() => { fetchPermissions(false); setEditingPermission(null); }} 
        />
      )}
    </DashboardShell>
  );
}