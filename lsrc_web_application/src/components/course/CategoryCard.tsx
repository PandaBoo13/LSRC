// src/components/course/CategoryCard.tsx
import React from 'react';
import type { Category } from '../../types/category.types';
import { Palette, Code2, Database, Briefcase, Megaphone, Camera, Film, Folder } from 'lucide-react';

interface CategoryCardProps { category: Category; onClick?: (category: Category) => void; }

const getCategoryStyle = (slugOrName: string = '') => {
  const key = slugOrName.toLowerCase();
  if (key.includes('design')) return { bg: 'bg-teal-100/70', text: 'text-teal-500', icon: Palette };
  if (key.includes('dev') || key.includes('code')) return { bg: 'bg-indigo-100/70', text: 'text-indigo-500', icon: Code2 };
  if (key.includes('database') || key.includes('data')) return { bg: 'bg-blue-100/70', text: 'text-blue-500', icon: Database };
  if (key.includes('business')) return { bg: 'bg-cyan-100/70', text: 'text-cyan-600', icon: Briefcase };
  if (key.includes('market')) return { bg: 'bg-amber-100/70', text: 'text-amber-500', icon: Megaphone };
  if (key.includes('photo')) return { bg: 'bg-rose-100/70', text: 'text-rose-400', icon: Camera };
  if (key.includes('act') || key.includes('film')) return { bg: 'bg-slate-200/70', text: 'text-slate-600', icon: Film };
  return { bg: 'bg-cyan-100/70', text: 'text-cyan-500', icon: Folder };
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const style = getCategoryStyle(category.slug || category.name);
  const IconComponent = style.icon;

  return (
    <div onClick={() => onClick && onClick(category)}
      className="bg-white rounded-[20px] p-5 flex flex-col items-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100/60 w-full aspect-[0.93/1]">
      <div className={`w-12 h-12 ${style.bg} ${style.text} rounded-2xl flex items-center justify-center mb-3 flex-shrink-0`}>
        <IconComponent className="w-6 h-6 stroke-[2]" />
      </div>
      <h3 className="text-slate-800 font-bold text-sm line-clamp-1">{category.name}</h3>
      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mt-1 flex-1">{category.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>
    </div>
  );
};