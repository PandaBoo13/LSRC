import { useState } from 'react';
import { 
  FaChevronRight, 
  FaChevronDown, 
  FaEdit, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff, 
  FaPlus,
  FaFolder,
  FaFolderOpen,
  FaFile
} from 'react-icons/fa';
import type { Category } from '../../../types/category.types';

type Props = {
  category: Category;
  depth?: number;
  isLast?: boolean;
  parentIsLast?: boolean[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggle: (category: Category) => void;
  onAddChild: (category: Category) => void;
};

export function CategoryTreeItem({ 
  category, 
  depth = 0, 
  isLast = true,
  parentIsLast = [],
  onEdit, 
  onDelete, 
  onToggle, 
  onAddChild 
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const categoryId = category.id || category.idCategory || '';

  return (
    <div className="select-none">
      {/* Row */}
      <div 
        className="group relative flex items-center gap-3 py-2.5 rounded-lg transition-colors hover:bg-slate-50/80"
        style={{ paddingLeft: `${depth * 28 + 12}px` }}
      >
        {/* ==================== TREE LINES ==================== */}
        {Array.from({ length: depth }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ left: `${i * 28 + 18}px` }}
          >
            {!parentIsLast[i] && (
              <div className="h-full w-px bg-slate-200 group-hover:bg-slate-300 transition-colors" />
            )}
          </div>
        ))}

        {/* Đường ngang nối */}
        {depth > 0 && (
          <div
            className="absolute pointer-events-none"
            style={{ left: `${depth * 28 + 6}px`, top: '50%' }}
          >
            <svg width="16" height="16" className="text-slate-300 group-hover:text-slate-400 transition-colors">
              {isLast ? (
                <path d="M0 0 V8 H16" stroke="currentColor" strokeWidth="1.5" fill="none" />
              ) : (
                <path d="M0 0 V16 M0 8 H16" stroke="currentColor" strokeWidth="1.5" fill="none" />
              )}
            </svg>
          </div>
        )}

        {/* ==================== EXPAND BUTTON ==================== */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`relative z-10 flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-all ${
            !hasChildren ? 'invisible' : ''
          }`}
        >
          {expanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
        </button>

        {/* ==================== ICON FOLDER/FILE ==================== */}
        <div className="relative z-10 flex-shrink-0">
          {hasChildren ? (
            expanded ? (
              <FaFolderOpen size={18} className="text-amber-500 transition-transform group-hover:scale-105" />
            ) : (
              <FaFolder size={18} className="text-amber-400 transition-transform group-hover:scale-105" />
            )
          ) : (
            <FaFile size={15} className="ml-0.5 text-slate-400 transition-colors group-hover:text-slate-500" />
          )}
        </div>

        {/* ==================== THÔNG TIN ==================== */}
        <div className="relative z-10 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium text-sm truncate transition-colors ${
              category.isActive ? 'text-slate-800 group-hover:text-indigo-950' : 'text-slate-400 line-through'
            }`}>
              {category.name}
            </h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                category.isActive
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-rose-50 text-rose-500 border border-rose-200'
              }`}
            >
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-[11px]">/{category.slug}</span>
            {hasChildren && (
              <>
                <span>•</span>
                <span className="text-[11px]">
                  {category.children!.length} {category.children!.length === 1 ? 'danh mục con' : 'danh mục con'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ==================== ACTIONS (Pure Tailwind Hover) ==================== */}
        <div className="relative z-10 flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddChild(category); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Thêm danh mục con"
          >
            <FaPlus size={12} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Sửa danh mục"
          >
            <FaEdit size={12} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(category); }}
            className={`p-1.5 rounded-md transition-colors ${
              category.isActive
                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={category.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          >
            {category.isActive ? <FaToggleOn size={15} /> : <FaToggleOff size={15} />}
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(category); }}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Xóa danh mục"
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>

      {/* ==================== CHILDREN ==================== */}
      {hasChildren && expanded && (
        <div>
          {category.children!.map((child, index) => (
            <CategoryTreeItem
              key={child.id || child.idCategory || index}
              category={child}
              depth={depth + 1}
              isLast={index === category.children!.length - 1}
              parentIsLast={[...parentIsLast, isLast]}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}