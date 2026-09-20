import { useState, useEffect } from 'react';
import { Panel } from '../ui/Panel';
import type { Category, CategoryRequest } from '../../../types/category.types';
import { getErrorMessage } from '../../../utils/errorUtils';

type Props = {
  category?: Category | null;
  parentId?: string | null;
  categories?: Category[];
  onClose: () => void;
  onSave: (data: CategoryRequest) => Promise<void>;
};

export function CategoryFormModal({ category, parentId, categories = [], onClose, onSave }: Props) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [selectedParentId, setSelectedParentId] = useState(category?.parentId || parentId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const flattenCategories = (cats: Category[]): Category[] => {
    let result: Category[] = [];
    for (const cat of cats) {
      result.push(cat);
      if (cat.children?.length) result.push(...flattenCategories(cat.children));
    }
    return result;
  };

  const parentOptions = flattenCategories(categories);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Tên danh mục không được để trống');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: selectedParentId || null,
      });
      onClose();
    } catch (error: any) {
      setError(getErrorMessage(error, 'Lưu danh mục thất bại'));
      console.error('Failed to save category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Panel className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900">
            {category ? 'Sửa danh mục' : parentId ? 'Thêm danh mục con' : 'Thêm danh mục mới'}
          </h3>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Danh mục cha
            </label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400"
              disabled={!!parentId && !category} // Disable khi tạo subcategory từ nút Add Child
            >
              <option value="">Không (Danh mục gốc)</option>
              {parentOptions.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                  disabled={cat.id === category?.id} // Không cho chọn chính nó làm cha
                >
                  {'— '.repeat(cat.level || 0)}{cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tên danh mục *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(''); // Clear error khi user gõ
              }}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400"
              placeholder="Nhập tên danh mục"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-400"
              placeholder="Mô tả (không bắt buộc)"
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 p-6">
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : category ? 'Cập nhật' : 'Tạo mới'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </Panel>
    </div>
  );
}