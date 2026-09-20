// src/components/elearning/rbac/RoleCard.tsx
import { FaShieldAlt, FaUsers, FaEdit } from 'react-icons/fa';
import { Panel } from './ui/Panel';
import type { Role } from '../../../types/rbac.types';

type Props = { role: Role; onEdit: (role: Role) => void; };

export function RoleCard({ role, onEdit }: Props) {
  return (
    <Panel className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-slate-200 hover:border-cyan-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-200"><FaShieldAlt className="text-2xl text-white" /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{role.roleName}</h3>
              <div className="mt-1 flex items-center gap-3 text-sm text-slate-500"><span className="flex items-center gap-1"><FaUsers className="text-slate-400" size={14} />{role.accountCount || 0} người dùng</span></div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(role)} className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 transition" title="Sửa vai trò"><FaEdit size={15} /></button>
          </div>
        </div>
      </div>
    </Panel>
  );
}