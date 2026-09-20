// src/pages/elearning/AdminPages/rbac/AdminUserPermissionsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { DashboardShell } from '../../../../components/elearning/layout/DashboardShell';
import { AssignRoleModal } from '../../../../components/elearning/rbac/AssignRoleModal';
import { AssignPermissionModal } from '../../../../components/elearning/rbac/AssignPermissionModal';
import { UserListTable } from '../../../../components/elearning/rbac/UserListTable';
// ✅ Sửa import
import { getAllRoles, getAllAccounts } from '../../../../service/rbacService';
import { adminNav } from '../../../../data/elearning';
import type { Account, Role } from '../../../../types/rbac.types';

export function AdminUserPermissionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedAccountForPermissions, setSelectedAccountForPermissions] = useState<Account | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      // ✅ Đổi rbacService → getAllRoles, getAllAccounts
      const [rolesRes, accountsRes] = await Promise.all([
        getAllRoles(),
        getAllAccounts(),
      ]);
      if (rolesRes.data?.status === 'success') setRoles(rolesRes.data.data || []); 
      else setError('Không thể tải danh sách vai trò');
      if (accountsRes.data?.status === 'success') setAccounts(accountsRes.data.data || []); 
      else setError('Không thể tải danh sách người dùng');
    } catch (error) { 
      setError('Đã xảy ra lỗi khi tải dữ liệu.'); 
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalUsers = accounts.length;
  const adminCount = accounts.filter(a => a.role?.toUpperCase() === 'ADMIN').length;
  const teacherCount = accounts.filter(a => a.role?.toUpperCase() === 'TEACHER' || a.role?.toUpperCase() === 'INSTRUCTOR').length;
  const studentCount = accounts.filter(a => a.role?.toUpperCase() === 'STUDENT').length;

  if (loading) return (
    <DashboardShell role="Admin" title="Quản lý người dùng" subtitle="Đang tải..." navItems={adminNav}>
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell role="Admin" title="Quản lý người dùng" subtitle="Quản lý vai trò và quyền của người dùng" navItems={adminNav}>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => fetchData(false)} className="text-red-700 font-medium hover:text-red-900">Thử lại</button>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng người dùng</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Quản trị viên</p>
          <p className="text-2xl font-bold text-cyan-600 mt-1">{adminCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Giảng viên</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{teacherCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Học viên</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{studentCount}</p>
        </div>
      </div>
      <div className="flex justify-end mb-3">
        <button 
          onClick={() => fetchData(false)} 
          disabled={refreshing} 
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition disabled:opacity-50"
        >
          {refreshing ? (
            <><FaSpinner className="h-4 w-4 animate-spin" />Đang làm mới...</>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </>
          )}
        </button>
      </div>
      <UserListTable 
        accounts={accounts} 
        loading={loading} 
        search={search} 
        onSearchChange={setSearch} 
        onSelectAccount={setSelectedAccount} 
        onManagePermissions={setSelectedAccountForPermissions} 
      />
      {selectedAccount && (
        <AssignRoleModal 
          account={selectedAccount} 
          roles={roles} 
          onClose={() => setSelectedAccount(null)} 
          onSuccess={() => { fetchData(false); setSelectedAccount(null); }} 
        />
      )}
      {selectedAccountForPermissions && (
        <AssignPermissionModal 
          accountId={selectedAccountForPermissions.idAccount} 
          accountName={selectedAccountForPermissions.username} 
          onClose={() => setSelectedAccountForPermissions(null)} 
          onSuccess={() => { fetchData(false); setSelectedAccountForPermissions(null); }} 
        />
      )}
    </DashboardShell>
  );
}