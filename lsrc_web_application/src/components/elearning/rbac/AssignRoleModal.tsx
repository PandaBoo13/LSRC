// src/components/rbac/AssignRoleModal.tsx
import { useState } from 'react';
import { FaTimes, FaCheck, FaShieldAlt } from 'react-icons/fa';
import { Panel } from './ui/Panel';
// ✅ Sửa import
import { assignRoleToUser } from '../../../service/rbacService';
import type { Account, Role } from '../../../types/rbac.types';
import { roleBadgeColors } from '../../../data/rbac';

type Props = { account: Account; roles: Role[]; onClose: () => void; onSuccess: () => void; };

export function AssignRoleModal({ account, roles, onClose, onSuccess }: Props) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(
    roles.find(r => r.roleName === account.role)?.idRole || null
  );
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (selectedRoleId === null) return;
    const currentRole = roles.find(r => r.roleName === account.role);
    if (currentRole?.idRole === selectedRoleId) { onClose(); return; }
    setLoading(true);
    try { 
      // ✅ Đổi rbacService.assignRoleToUser → assignRoleToUser
      await assignRoleToUser(account.idAccount, selectedRoleId); 
      onSuccess(); 
      onClose(); 
    } catch (error) { 
      console.error('Failed to assign role:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  const getRoleBadge = (roleName: string) => roleBadgeColors[roleName] || 'bg-slate-100 text-slate-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Panel className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Phân quyền</h3>
            <p className="text-sm text-slate-500">User: <span className="font-semibold text-slate-700">{account.username}</span></p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <FaTimes size={18} />
          </button>
        </div>
        <div className="p-6 space-y-2">
          {roles.map((role) => (
            <button 
              key={role.idRole} 
              onClick={() => setSelectedRoleId(role.idRole)} 
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                selectedRoleId === role.idRole 
                  ? 'border-cyan-500 bg-cyan-50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${getRoleBadge(role.roleName)}`}>
                <FaShieldAlt size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{role.roleName}</p>
                <p className="text-xs text-slate-500">{role.accountCount || 0} người dùng</p>
              </div>
              {selectedRoleId === role.idRole && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500">
                  <FaCheck size={12} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-3 border-t border-slate-100 p-6">
          <button 
            onClick={handleAssign} 
            disabled={loading} 
            className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-50 transition"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Hủy
          </button>
        </div>
      </Panel>
    </div>
  );
}