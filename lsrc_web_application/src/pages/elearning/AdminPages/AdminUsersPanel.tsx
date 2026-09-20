// src/components/elearning/admin/AdminUsersPanel.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { Panel } from '../../../components/elearning/ui/Panel';
import { StatusPill } from '../../../components/elearning/ui/StatusPill';
// ✅ Sửa import
import { getAllAccounts } from '../../../service/rbacService';
import type { Account } from '../../../types/rbac.types';

export function AdminUsersPanel() {
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // ✅ Đổi rbacService.getAllAccounts → getAllAccounts
        const res = await getAllAccounts();
        setUsers((res.data?.data || []).slice(0, 4));
      } catch (err) { 
        console.error('Failed to fetch users:', err); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, []);

  const getRoleLabel = (role: any) => typeof role === 'string' ? role : role?.roleName || 'Unknown';
  const getRoleTone = (role: any) => {
    const name = getRoleLabel(role)?.toUpperCase();
    if (name === 'ADMIN') return 'purple' as const;
    if (name === 'TEACHER' || name === 'INSTRUCTOR') return 'blue' as const;
    return 'green' as const;
  };

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Người dùng gần đây</h2>
        <Link to="/admin/users" className="text-sm font-semibold text-cyan-600">Xem tất cả</Link>
      </div>
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="h-6 w-6 animate-spin text-cyan-500" />
          </div>
        ) : users.length > 0 ? (
          users.map(user => (
            <div key={user.idAccount} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="font-bold text-slate-900">{user.username}</p>
                <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              </div>
              <StatusPill tone={getRoleTone(user.role)}>{getRoleLabel(user.role)}</StatusPill>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-center py-4">Chưa có người dùng nào</p>
        )}
      </div>
    </Panel>
  );
}