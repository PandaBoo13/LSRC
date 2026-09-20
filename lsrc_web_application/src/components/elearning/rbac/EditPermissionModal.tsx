// src/components/rbac/EditPermissionModal.tsx
import { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { Panel } from './ui/Panel';
import { updatePermission } from '../../../service/rbacService';
import type { Permission } from '../../../types/rbac.types';

type Props = {
  permission: Permission | null;
  onClose: () => void;
  onSuccess: () => void;
};

// ✅ Sync với APIURL.RESOURCE_* constants
// ❌ ĐÃ XÓA 'ROLE' — backend không có RESOURCE_ROLE, chỉ có RESOURCE_RBAC
const RESOURCES = [
  'ACCOUNT',
  'USER',
  'PERMISSION',
  'RBAC',
  'CATEGORY',
  'COURSE',
  'CHAPTER',
  'COURSE_RESOURCE',
  'QUIZ',
  'QUESTION',
  'QUIZ_ATTEMPT',
  'PROGRESS',
  'LECTURER_PROFILE',
  'ORDER',
  'PAYMENT',
  'REVIEW',
  'WISHLIST',
  'AUDIT_LOG',
  'CHAT',
  'NOTIFICATION',
];

// ✅ Sync với APIURL.ACTION_* constants
const ACTIONS = [
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'MANAGE',
  'EXPORT',
  'UPLOAD',
  'PUBLISH',
  'SUBMIT',
];

export function EditPermissionModal({ permission, onClose, onSuccess }: Props) {
  const [permissionName, setPermissionName] = useState('');
  const [resource, setResource] = useState('ACCOUNT');
  const [action, setAction] = useState('READ');
  const [descriptionItems, setDescriptionItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (permission) {
      setPermissionName(permission.permissionName);
      setResource(permission.resource);
      setAction(permission.action);
      // ✅ FIX TS7006: thêm `: string` cho tham số `s`
      setDescriptionItems(
        permission.description
          ? permission.description.split(',').map((s: string) => s.trim()).filter(Boolean)
          : []
      );
      setIsDefault(permission.isDefault || false);
    }
  }, [permission]);

  // ✅ Early return TRƯỚC handleSubmit để TS narrow type (không cần `permission!`)
  if (!permission) return null;

  const addItem = () => {
    if (newItem.trim()) {
      setDescriptionItems([...descriptionItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    setDescriptionItems(descriptionItems.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const handleSubmit = async () => {
    if (!permissionName.trim()) {
      setError('Tên quyền không được để trống');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // ✅ Không cần `!` — TS đã biết permission không null nhờ early return
      await updatePermission(permission.idPermission, {
        permissionName: permissionName.trim().toUpperCase(),
        resource,
        action,
        description: descriptionItems.join(', '),
        isDefault,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Panel className="w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Sửa quyền</h3>
            <p className="text-sm text-slate-500">
              ID:{' '}
              <span className="font-semibold text-cyan-600">
                #{permission.idPermission}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tên quyền <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. USER_CREATE"
              value={permissionName}
              onChange={(e) => setPermissionName(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resource <span className="text-red-500">*</span>
              </label>
              <select
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
              >
                {RESOURCES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Action <span className="text-red-500">*</span>
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
              >
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mô tả (danh sách hành động)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Thêm hành động..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-cyan-400"
              />
              <button
                onClick={addItem}
                className="px-3 py-2 rounded-xl bg-cyan-500 text-white text-sm hover:bg-cyan-600 transition"
              >
                <FaPlus size={12} />
              </button>
            </div>
            {descriptionItems.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {descriptionItems.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-xs text-cyan-700"
                  >
                    {item}
                    <button
                      onClick={() => removeItem(i)}
                      className="text-cyan-400 hover:text-red-500 transition"
                    >
                      <FaTrash size={10} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Chưa có hành động nào</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-slate-600">Đặt làm quyền mặc định</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 p-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-50 transition"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật quyền'}
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