// src/components/elearning/course/course-details/QuestionPoolFormModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaDatabase } from 'react-icons/fa';
import { Panel } from '../../ui/Panel';
import type { QuestionPool, QuestionPoolRequest } from '../../../../types/exam.types';
import { getErrorMessage } from '../../../../utils/errorUtils';

type Props = {
  pool?: QuestionPool | null;
  courseId: number;
  onClose: () => void;
  onSave: (data: QuestionPoolRequest) => Promise<void>;
  onToast?: (message: string, type: 'success' | 'error') => void;
};

export function QuestionPoolFormModal({
  pool,
  courseId,
  onClose,
  onSave,
  onToast,
}: Props) {
  const [title, setTitle] = useState(pool?.title || '');
  const [description, setDescription] = useState(pool?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      onToast?.('Tên ngân hàng câu hỏi không được để trống', 'error');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        courseId,
      });
      onToast?.(
        pool ? 'Cập nhật ngân hàng câu hỏi thành công' : 'Tạo ngân hàng câu hỏi thành công',
        'success'
      );
      onClose();
    } catch (error: any) {
      onToast?.(getErrorMessage(error, 'Lưu ngân hàng câu hỏi thất bại'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Panel className="w-full max-w-lg flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-gradient-to-r from-violet-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <FaDatabase size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {pool ? 'Sửa ngân hàng câu hỏi' : 'Tạo ngân hàng câu hỏi mới'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {pool ? 'Cập nhật thông tin kho câu hỏi' : 'Tạo kho chứa câu hỏi cho khóa học'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 space-y-4 flex-1">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên ngân hàng câu hỏi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-xs sm:text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                placeholder="VD: Câu hỏi kiểm tra Kiến thức React Cơ bản"
                autoFocus
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs sm:text-sm outline-none resize-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                placeholder="Nhập mô tả ngắn cho ngân hàng câu hỏi này..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 border-t border-slate-100 p-5 bg-slate-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl bg-white border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-violet-500/20 transition active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={14} />
                  <span>Đang lưu...</span>
                </>
              ) : pool ? (
                'Cập nhật'
              ) : (
                'Tạo mới'
              )}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}