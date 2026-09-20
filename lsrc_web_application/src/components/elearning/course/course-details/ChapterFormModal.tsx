// src/components/elearning/chapter/ChapterFormModal.tsx
import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import type { Chapter } from '../../../../types/chapter.types';

type Props = {
  chapter: Chapter | null;
  onClose: () => void;
  onSave: (title: string, description: string) => Promise<void>;
};

export const ChapterFormModal: React.FC<Props> = ({ chapter, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title);
      setDescription(chapter.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [chapter]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave(title.trim(), description.trim());
      onClose();
    } catch (err) {
      // Lỗi xử lý ở parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-base font-bold text-slate-800">
            {chapter ? 'Sửa chương' : 'Thêm chương mới'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên chương <span className="text-rose-500">*</span></label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-violet-500"
              placeholder="VD: Chương 1: Giới thiệu"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-violet-500 resize-none" rows={2}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button
              onClick={handleSubmit}
              disabled={saving || !title.trim()}
              className="flex-1 rounded-xl bg-violet-500 text-white py-2.5 text-xs font-bold hover:bg-violet-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <FaSpinner className="animate-spin" size={12} /> : (chapter ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};