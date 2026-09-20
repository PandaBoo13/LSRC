// src/components/elearning/rbac/PermissionCard.tsx
import { FaKey, FaEdit, FaCheck } from 'react-icons/fa';
import { Panel } from './ui/Panel';
import { Badge } from './ui/Badge';
import { StatusPill } from './ui/StatusPill';
import { resourceColors } from '../../../data/rbac';
import type { Permission } from '../../../types/rbac.types';

type Props = { permission: Permission; onEdit: (permission: Permission) => void; };

export function PermissionCard({ permission, onEdit }: Props) {
  const getResourceColor = (resource: string) => resourceColors[resource] || 'bg-slate-100 text-slate-600';
  const actions = permission.description ? permission.description.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <Panel className="group flex items-center gap-4 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-slate-200 hover:border-cyan-200">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getResourceColor(permission.resource)} transition group-hover:scale-105`}><FaKey size={18} /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">{permission.permissionName}</p>
          {permission.isDefault && <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700"><FaCheck size={10} className="mr-1" /> Mặc định</span>}
        </div>
        {actions.length > 0 ? <div className="flex flex-wrap gap-1 mt-1">{actions.map((a, i) => <span key={i} className="inline-flex items-center rounded-full bg-cyan-50 border border-cyan-100 px-2 py-0.5 text-xs text-cyan-700">{a}</span>)}</div> : <p className="mt-0.5 text-xs text-slate-400 italic">Chưa có mô tả</p>}
        <div className="flex gap-1.5 mt-1.5"><Badge variant="info" className="text-xs">{permission.resource}</Badge><StatusPill tone="yellow" className="text-xs">{permission.action}</StatusPill></div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => onEdit(permission)} className="rounded-lg p-2 text-slate-400 hover:bg-cyan-50 hover:text-cyan-600 transition" title="Sửa quyền"><FaEdit size={15} /></button>
      </div>
    </Panel>
  );
}