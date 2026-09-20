// src/components/elearning/rbac/CreatePermissionPanel.tsx
import { useState, useEffect } from 'react';
import { FaTimes, FaShieldAlt, FaCheck, FaPlus, FaTrash } from 'react-icons/fa';
import { Panel } from './ui/Panel';

type Props = {
  onClose: () => void;
  onCreate: (data: {
    permissionName: string;
    resource: string;
    action: string;
    description: string;
    isDefault?: boolean;
  }) => void;
};

// ✅ ĐÃ SYNC 100% với APIURL.RESOURCE_* (backend)
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

// ✅ ĐÃ SYNC 100% với APIURL.ACTION_* (backend)
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

export function CreatePermissionPanel({ onClose, onCreate }: Props) {
  const [permissionName, setPermissionName] = useState('');
  // ✅ Đổi default resource từ 'EXAM' (không tồn tại) → 'COURSE'
  const [resource, setResource] = useState('COURSE');
  const [action, setAction] = useState('READ');
  const [descriptionItems, setDescriptionItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(false);

  useEffect(() => {
    if (!isManualEdit) setPermissionName(`${resource}_${action}`);
  }, [resource, action, isManualEdit]);

  const addItem = () => {
    if (newItem.trim()) {
      setDescriptionItems([...descriptionItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (i: number) =>
    setDescriptionItems(descriptionItems.filter((_, idx) => idx !== i));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const handleSubmit = () => {
    if (!permissionName.trim()) return;
    onCreate({
      permissionName: permissionName.trim().toUpperCase(),
      resource,
      action,
      description: descriptionItems.join(', '),
      isDefault,
    });
    setPermissionName('');
    setDescriptionItems([]);
    setIsDefault(false);
    setIsManualEdit(false);
  };

  return (
    <Panel className="mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
            <FaShieldAlt size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Tạo quyền mới</h3>
            <p className="text-xs text-slate-500">Thêm một quyền mới vào hệ thống</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 hover:bg-white/50 hover:text-slate-600 transition"
        >
          <FaTimes size={16} />
        </button>
      </div>

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Resource Selector */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Resource <span className="text-red-500">*</span>
            </label>
            <select
              value={resource}
              onChange={(e) => {
                setResource(e.target.value);
                setIsManualEdit(false);
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
            >
              {RESOURCES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Action Selector */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Action <span className="text-red-500">*</span>
            </label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setIsManualEdit(false);
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Permission Name Input */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Tên quyền <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={permissionName}
              onChange={(e) => {
                setIsManualEdit(true);
                setPermissionName(e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className={`h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-4 ${
                isManualEdit
                  ? 'border-amber-300 bg-amber-50 focus:border-amber-400 focus:ring-amber-50'
                  : 'border-cyan-200 bg-cyan-50 focus:border-cyan-400 focus:ring-cyan-50'
              }`}
            />
          </div>

          {/* Description Items List */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Mô tả (danh sách hành động)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Thêm hành động..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400"
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

          {/* Default Permission Checkbox */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">
                  Đặt làm quyền mặc định
                </span>
                <p className="text-xs text-slate-400">
                  Quyền sẽ tự động được gán cho tất cả tài khoản
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            📋 Xem trước
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-bold ${
                permissionName ? 'text-slate-800' : 'text-slate-400'
              }`}
            >
              {permissionName || 'TÊN_QUYỀN'}
            </span>
            <span className="inline-flex items-center rounded-lg bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-600">
              {resource}
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {action}
            </span>
            {isDefault && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <FaCheck size={10} className="mr-1" /> Mặc định
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!permissionName.trim()}
            className="flex-1 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-50 transition"
          >
            Tạo quyền
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Hủy
          </button>
        </div>
      </div>
    </Panel>
  );
}