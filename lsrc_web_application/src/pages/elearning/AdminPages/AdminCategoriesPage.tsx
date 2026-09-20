// src/pages/elearning/AdminPages/AdminCategoriesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaSitemap, FaTimes } from 'react-icons/fa';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { Panel } from '../../../components/elearning/ui/Panel';
import { CategoryTreeItem } from '../../../components/elearning/category/CategoryTreeItem';
import { CategoryFormModal } from '../../../components/elearning/category/CategoryFormModal';
import { adminNav } from '../../../data/elearning';
// ✅ Sửa import
import { getCategoryTree, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '../../../service/categoryService';
import { getErrorMessage } from '../../../utils/errorUtils';
import type { Category, CategoryRequest } from '../../../types/category.types';

export function AdminCategoriesPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filterTree = useCallback((nodes: Category[], keyword: string, status: 'all' | 'active' | 'inactive'): Category[] => {
    const cleanKeyword = keyword.trim().toLowerCase();

    return nodes.reduce<Category[]>((acc, node) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && node.isActive) ||
        (status === 'inactive' && !node.isActive);

      const matchesSearch =
        !cleanKeyword ||
        node.name.toLowerCase().includes(cleanKeyword) ||
        node.slug.toLowerCase().includes(cleanKeyword);

      const filteredChildren = node.children
        ? filterTree(node.children, keyword, status)
        : [];

      const hasMatchingChildren = filteredChildren.length > 0;

      if ((matchesStatus && matchesSearch) || hasMatchingChildren) {
        acc.push({
          ...node,
          children: filteredChildren,
        });
      }

      return acc;
    }, []);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // ✅ Đổi categoryService.getTree → getCategoryTree
      const data = await getCategoryTree();
      const treeData = Array.isArray(data) ? data : [];
      setAllCategories(treeData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showToast(getErrorMessage(error, 'Không thể tải danh mục'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = filterTree(allCategories, search, filterActive);
    setDisplayedCategories(filtered);
  }, [allCategories, search, filterActive, filterTree]);

  const handleCreate = () => {
    setEditingCategory(null);
    setParentId(null);
    setShowForm(true);
  };

  const handleAddChild = (parentCat: Category) => {
    setEditingCategory(null);
    setParentId(parentCat.id || parentCat.idCategory || '');
    setShowForm(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setParentId(null);
    setShowForm(true);
  };

  const handleSave = async (data: CategoryRequest) => {
    try {
      if (editingCategory) {
        const categoryId = editingCategory.id || editingCategory.idCategory || '';
        // ✅ Đổi categoryService.update → updateCategory
        await updateCategory(categoryId, data);
        showToast('Cập nhật danh mục thành công', 'success');
      } else {
        // ✅ Đổi categoryService.create → createCategory
        await createCategory(data);
        showToast('Tạo danh mục thành công', 'success');
      }
      setShowForm(false);
      await fetchCategories();
    } catch (error: any) {
      showToast(getErrorMessage(error, 'Lưu danh mục thất bại'), 'error');
    }
  };

  const handleToggle = async (cat: Category) => {
    try {
      const categoryId = cat.id || cat.idCategory || '';
      // ✅ Đổi categoryService.toggleStatus → toggleCategoryStatus
      await toggleCategoryStatus(categoryId);
      showToast('Chuyển trạng thái thành công', 'success');
      await fetchCategories();
    } catch (error: any) {
      showToast(getErrorMessage(error, 'Chuyển trạng thái thất bại'), 'error');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) return;
    try {
      const categoryId = cat.id || cat.idCategory || '';
      // ✅ Đổi categoryService.delete → deleteCategory
      await deleteCategory(categoryId);
      showToast('Xóa danh mục thành công', 'success');
      await fetchCategories();
    } catch (error: any) {
      showToast(getErrorMessage(error, 'Xóa danh mục thất bại'), 'error');
    }
  };

  if (loading && allCategories.length === 0) {
    return (
      <DashboardShell role="Admin" title="Danh mục" subtitle="Đang tải..." navItems={adminNav}>
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Admin" title="Danh mục" subtitle="Quản lý cấu trúc danh mục khóa học." navItems={adminNav}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 max-w-md animate-bounce-in">
          <div className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span className="text-base flex-shrink-0">{toast.type === 'success' ? '✅' : '❌'}</span>
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 p-1">
              <FaTimes size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 min-w-[280px] max-w-xl">
          {/* Search Bar */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            />
            {search && (
              <button 
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {[
              { key: 'all' as const, label: 'Tất cả' },
              { key: 'active' as const, label: 'Hoạt động' },
              { key: 'inactive' as const, label: 'Đã ẩn' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilterActive(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterActive === opt.key
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95"
        >
          <FaPlus size={12} /> Thêm danh mục
        </button>
      </div>

      {/* Tree View */}
      {displayedCategories.length > 0 ? (
        <Panel className="p-3 divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          {displayedCategories.map((cat, index) => (
            <CategoryTreeItem
              key={cat.id || cat.idCategory || index}
              category={cat}
              isLast={index === displayedCategories.length - 1}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onAddChild={handleAddChild}
            />
          ))}
        </Panel>
      ) : (
        <Panel className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <FaSitemap className="mx-auto text-4xl text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">Không tìm thấy danh mục phù hợp</p>
          <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái</p>
          {(search || filterActive !== 'all') && (
            <button
              type="button"
              onClick={() => { setSearch(''); setFilterActive('all'); }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Xóa bộ lọc
            </button>
          )}
        </Panel>
      )}

      {/* Modal Form */}
      {showForm && (
        <CategoryFormModal
          category={editingCategory}
          parentId={parentId}
          categories={allCategories}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </DashboardShell>
  );
}