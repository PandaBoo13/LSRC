// src/components/elearning/rbac/CreateRolePanel.tsx
import { useState } from 'react';
import { Panel } from './ui/Panel';
import { FaTimes } from 'react-icons/fa';

type Props = {
  onCreate: (roleName: string) => void;
  onCancel: () => void;
};

export function CreateRolePanel({ onCreate, onCancel }: Props) {
  const [roleName, setRoleName] = useState('');

  const handleSubmit = () => {
    if (!roleName.trim()) return;
    onCreate(roleName.trim().toUpperCase());
    setRoleName('');
  };

  return (
    <Panel className="mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Tạo vai trò mới</h3>
          <p className="text-xs text-slate-500">Thêm một vai trò mới vào hệ thống</p>
        </div>
        <button
          onClick={onCancel}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-white/50 hover:text-slate-600"
        >
          <FaTimes size={16} />
        </button>
      </div>

      <div className="p-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Tên vai trò (VD: MODERATOR)"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!roleName.trim()}
            className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            Tạo
          </button>
          <button
            onClick={onCancel}
            className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            Hủy
          </button>
        </div>
      </div>
    </Panel>
  );
}