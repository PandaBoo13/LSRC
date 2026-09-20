// src/components/elearning/rbac/AssignPermissionModal.tsx
import { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaToggleOn, FaToggleOff, FaSpinner, FaPlus, FaCheck, FaShieldAlt, FaKey, FaUserCog } from 'react-icons/fa';
import { Panel } from './ui/Panel';
import { Badge } from './ui/Badge';
import { StatusPill } from './ui/StatusPill';
// ✅ Sửa import
import { getAllPermissions, getAccountCustomPermissions, assignPermissionToAccount, deactivatePermission, activatePermission } from '../../../service/rbacService';
import type { Permission } from '../../../types/rbac.types';

type Props = { accountId: number; accountName: string; onClose: () => void; onSuccess: () => void; };
interface AssignedPermission extends Permission { isActive: boolean; idAccountPermission: number; }

export function AssignPermissionModal({ accountId, accountName, onClose, onSuccess }: Props) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [assignedPermissions, setAssignedPermissions] = useState<AssignedPermission[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, [accountId]);

  const fetchData = async () => {
    setFetching(true); 
    setError(null); 
    setSuccessMessage(null);
    try {
      // ✅ Đổi rbacService.getAllPermissions → getAllPermissions
      // ✅ Đổi rbacService.getAccountCustomPermissions → getAccountCustomPermissions
      const [permissionsRes, accountPermsRes] = await Promise.all([
        getAllPermissions(),
        getAccountCustomPermissions(accountId),
      ]);
      if (permissionsRes.data.status === 'success') setAllPermissions(permissionsRes.data.data || []);
      if (accountPermsRes.data.status === 'success') {
        setAssignedPermissions((accountPermsRes.data.data || []).map((item: any) => ({ 
          ...item, 
          isActive: item.isActive, 
          idAccountPermission: item.idAccountPermission 
        })));
      }
    } catch (error) { 
      setError('Không thể tải quyền.'); 
    } finally { 
      setFetching(false); 
    }
  };

  const isAssigned = (id: number) => assignedPermissions.find(p => p.idPermission === id) || null;
  const filteredPermissions = allPermissions.filter(p => 
    p.permissionName?.toLowerCase().includes(search.toLowerCase()) || 
    p.resource?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async (permissionId: number) => {
    setLoading(true); 
    setError(null);
    try { 
      // ✅ Đổi rbacService.assignPermissionToAccount → assignPermissionToAccount
      await assignPermissionToAccount(accountId, permissionId); 
      setSuccessMessage('Đã gán quyền'); 
      await fetchData(); 
    } catch (err: any) { 
      setError(err.response?.data?.message || 'Gán thất bại'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleToggle = async (permissionId: number, active: boolean) => {
    setActionLoading(permissionId); 
    setError(null);
    try { 
      if (active) {
        // ✅ Đổi rbacService.deactivatePermission → deactivatePermission
        await deactivatePermission(accountId, permissionId); 
      } else {
        // ✅ Đổi rbacService.activatePermission → activatePermission
        await activatePermission(accountId, permissionId); 
      }
      setSuccessMessage(active ? 'Đã tắt' : 'Đã bật'); 
      await fetchData(); 
    } catch (err: any) { 
      setError(err.response?.data?.message || 'Thất bại'); 
    } finally { 
      setActionLoading(null); 
    }
  };

  const assignedCount = assignedPermissions.length;
  const activeCount = assignedPermissions.filter(p => p.isActive).length;
  const inactiveCount = assignedCount - activeCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Panel className="w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/80 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-200">
              <FaUserCog className="text-xl text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Quản lý quyền</h3>
              <p className="text-sm text-slate-600">Tài khoản: <span className="font-semibold text-cyan-700">{accountName}</span></p>
            </div>
          </div>
          <button onClick={() => { onSuccess(); onClose(); }} className="rounded-xl p-2 text-slate-400 hover:bg-white/50 hover:text-slate-600 transition">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="border-b border-slate-200/60 px-6 py-3 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-emerald-700">{activeCount}</span>
              <span className="text-slate-500">hoạt động</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
              <span className="font-medium text-slate-600">{inactiveCount}</span>
              <span className="text-slate-500">đã tắt</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              <span className="font-medium text-slate-700">{assignedCount}</span>/{allPermissions.length} đã gán
            </span>
          </div>
          {successMessage && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <FaCheck size={14} />
              <span>{successMessage}</span>
            </div>
          )}
        </div>
        {error && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 flex items-center gap-2 flex-shrink-0">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}
        <div className="relative mx-6 mt-4 flex-shrink-0">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm quyền..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50/60" 
          />
        </div>
        {fetching ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <FaSpinner className="h-10 w-10 animate-spin text-cyan-500" />
            <p className="text-sm text-slate-400 mt-3">Đang tải quyền...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredPermissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FaKey className="text-5xl mb-3 opacity-30" />
                <p className="text-sm">{search ? 'Không tìm thấy' : 'Không có quyền nào'}</p>
              </div>
            ) : filteredPermissions.map((perm) => {
              const assigned = isAssigned(perm.idPermission);
              const active = assigned?.isActive ?? false;
              const hasAssigned = assigned !== null;
              return (
                <div key={perm.idPermission} className={`group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
                  hasAssigned 
                    ? (active ? 'border-cyan-200 bg-cyan-50/60 hover:bg-cyan-50' : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50') 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    hasAssigned ? (active ? 'bg-cyan-200 text-cyan-700' : 'bg-slate-200 text-slate-500') : 'bg-slate-100 text-slate-400'
                  }`}>
                    <FaShieldAlt size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold truncate ${
                        hasAssigned ? (active ? 'text-cyan-800' : 'text-slate-500') : 'text-slate-800'
                      }`}>{perm.permissionName}</p>
                      {hasAssigned && (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                        }`}>{active ? 'Đang hoạt động' : 'Đã tắt'}</span>
                      )}
                      {!hasAssigned && (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-500">Chưa gán</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{perm.description}</p>
                    <div className="flex gap-1.5 mt-1">
                      <Badge variant="info" className="text-xs">{perm.resource}</Badge>
                      <StatusPill tone="yellow" className="text-xs">{perm.action}</StatusPill>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {hasAssigned ? (
                      <button 
                        onClick={() => handleToggle(perm.idPermission, active)} 
                        disabled={actionLoading === perm.idPermission} 
                        className={`rounded-lg p-2.5 transition ${
                          active ? 'text-emerald-600 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-200'
                        } disabled:opacity-50`}
                      >
                        {actionLoading === perm.idPermission ? <FaSpinner className="animate-spin" size={18} /> : active ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAssign(perm.idPermission)} 
                        disabled={loading} 
                        className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50 shadow-sm shadow-cyan-200"
                      >
                        <FaPlus size={12} /> Gán
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="border-t border-slate-200/60 p-4 bg-slate-50/50 flex-shrink-0">
          <button 
            onClick={() => { onSuccess(); onClose(); }} 
            className="w-full rounded-xl bg-white border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Đóng
          </button>
        </div>
      </Panel>
    </div>
  );
}