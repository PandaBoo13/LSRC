// src/components/elearning/rbac/UserListTable.tsx
import { FaSearch, FaUser, FaKey, FaUserCog, FaSpinner, FaUsers, FaTimes } from 'react-icons/fa';
import { Panel } from './ui/Panel';
import { StatusPill } from './ui/StatusPill';
import type { Account } from '../../../types/rbac.types';

type Props = { accounts: Account[]; loading: boolean; search: string; onSearchChange: (v: string) => void; onSelectAccount: (a: Account) => void; onManagePermissions: (a: Account) => void; };

export function UserListTable({ accounts, loading, search, onSearchChange, onSelectAccount, onManagePermissions }: Props) {
  const filteredAccounts = accounts.filter(a => a.username?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase()));
  const getRoleTone = (role: string) => { switch (role?.toUpperCase()) { case 'ADMIN': return 'purple' as const; case 'INSTRUCTOR': case 'TEACHER': return 'blue' as const; case 'STUDENT': return 'green' as const; default: return 'default' as const; } };
  const getRoleLabel = (role: string) => { switch (role?.toUpperCase()) { case 'ADMIN': return 'Quản trị viên'; case 'INSTRUCTOR': case 'TEACHER': return 'Giảng viên'; case 'STUDENT': return 'Học viên'; default: return role || 'Chưa có'; } };

  if (loading) return <div className="flex items-center justify-center py-20"><FaSpinner className="h-10 w-10 animate-spin text-cyan-500" /></div>;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="relative flex-1"><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" placeholder="Tìm kiếm người dùng..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50" />{search && <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><FaTimes size={14} /></button>}</div>
        <div className="flex items-center gap-4 text-sm text-slate-500 whitespace-nowrap"><span className="flex items-center gap-1.5"><FaUsers size={14} className="text-slate-400" /><span className="font-semibold text-slate-700">{filteredAccounts.length}</span>người dùng</span></div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-cyan-50 rounded-xl px-4 py-2.5 border border-cyan-100"><p className="text-xs font-medium text-cyan-600">Quản trị viên</p><p className="text-lg font-bold text-cyan-700">{accounts.filter(a => a.role?.toUpperCase() === 'ADMIN').length}</p></div>
        <div className="bg-blue-50 rounded-xl px-4 py-2.5 border border-blue-100"><p className="text-xs font-medium text-blue-600">Giảng viên</p><p className="text-lg font-bold text-blue-700">{accounts.filter(a => a.role?.toUpperCase() === 'TEACHER' || a.role?.toUpperCase() === 'INSTRUCTOR').length}</p></div>
        <div className="bg-emerald-50 rounded-xl px-4 py-2.5 border border-emerald-100"><p className="text-xs font-medium text-emerald-600">Học viên</p><p className="text-lg font-bold text-emerald-700">{accounts.filter(a => a.role?.toUpperCase() === 'STUDENT').length}</p></div>
      </div>
      <Panel className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="border-b border-slate-200 bg-slate-50/80"><th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 lg:px-6">Người dùng</th><th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:table-cell lg:px-6">Email</th><th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 lg:px-6">Vai trò</th><th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 lg:px-6">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map(account => (
                <tr key={account.idAccount} className="transition hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 lg:px-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white"><FaUser size={16} /></div><div className="min-w-0"><p className="text-sm font-semibold text-slate-900 truncate">{account.username}</p><p className="text-xs text-slate-400 sm:hidden truncate">{account.email}</p></div></div></td>
                  <td className="hidden px-4 py-3.5 text-sm text-slate-600 sm:table-cell lg:px-6 truncate">{account.email}</td>
                  <td className="px-4 py-3.5 lg:px-6"><StatusPill tone={getRoleTone(account.role)}>{getRoleLabel(account.role)}</StatusPill></td>
                  <td className="px-4 py-3.5 lg:px-6"><div className="flex items-center justify-end gap-2">
                    <button onClick={() => onManagePermissions(account)} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-100 transition"><FaKey size={13} /><span className="hidden sm:inline">Quyền</span></button>
                    <button onClick={() => onSelectAccount(account)} className="flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3.5 py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-100 transition"><FaUserCog size={13} /><span className="hidden sm:inline">Vai trò</span></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAccounts.length === 0 && <div className="flex flex-col items-center justify-center py-16 px-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400"><FaUsers size={28} /></div><p className="mt-4 text-sm font-medium text-slate-600">{search ? 'Không tìm thấy' : 'Chưa có người dùng nào'}</p></div>}
      </Panel>
    </>
  );
}