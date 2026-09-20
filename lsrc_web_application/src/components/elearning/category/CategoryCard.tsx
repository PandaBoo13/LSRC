import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus, FaChevronRight } from 'react-icons/fa';
import { Panel } from '../ui/Panel';
import type { Category } from '../../../types/category.types';

type Props = {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggle: (category: Category) => void;
  onAddChild?: (category: Category) => void;
};

export function CategoryCard({ category, onEdit, onDelete, onToggle, onAddChild }: Props) {
  const categoryId = category.id || category.idCategory || '';

  return (
    <Panel className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {category.parentName && (
              <>
                <span className="text-xs text-slate-400">{category.parentName}</span>
                <FaChevronRight className="text-slate-300" size={10} />
              </>
            )}
            <h3 className="font-bold text-slate-900">{category.name}</h3>
          </div>
          {category.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{category.description}</p>
          )}
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            category.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {category.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <span>Slug: {category.slug}</span>
        {category.level !== undefined && (
          <>
            <span>•</span>
            <span>Level: {category.level}</span>
          </>
        )}
        {category.children && category.children.length > 0 && (
          <>
            <span>•</span>
            <span>{category.children.length} children</span>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(category)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <FaEdit size={12} />
          Edit
        </button>
        {onAddChild && (
          <button
            onClick={() => onAddChild(category)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FaPlus size={12} />
            Add Child
          </button>
        )}
        <button
          onClick={() => onToggle(category)}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            category.isActive
              ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          {category.isActive ? <FaToggleOff size={12} /> : <FaToggleOn size={12} />}
          {category.isActive ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={() => onDelete(category)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 ml-auto transition-colors"
        >
          <FaTrash size={12} />
          Delete
        </button>
      </div>
    </Panel>
  );
}