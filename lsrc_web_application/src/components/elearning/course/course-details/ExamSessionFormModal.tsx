// src/components/elearning/exam/ExamSessionFormModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import type { ExamSession, ExamSessionRequest, QuestionPool } from '../../../../types/exam.types';
import { examService } from '../../../../service/examService';

interface ExamSessionFormModalProps {
  session?: ExamSession | null;
  courseId: number;
  onClose: () => void;
  onSave: (data: ExamSessionRequest) => Promise<void>;
}

export const ExamSessionFormModal: React.FC<ExamSessionFormModalProps> = ({
  session,
  courseId,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(session?.title || '');
  const [description, setDescription] = useState(session?.description || '');
  const [poolId, setPoolId] = useState<number | undefined>(session?.poolId);
  const [totalQuestions, setTotalQuestions] = useState(session?.totalQuestions || 10);
  const [passingScore, setPassingScore] = useState(session?.passingScore || 50);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(session?.timeLimit);
  const [maxAttempts, setMaxAttempts] = useState(session?.maxAttempts || 1);
  const [saveHistory, setSaveHistory] = useState(session?.saveHistory ?? true);
  const [hashtagFilter, setHashtagFilter] = useState(session?.hashtagFilter || '');
  const [saving, setSaving] = useState(false);

  // Danh sách pool để chọn
  const [pools, setPools] = useState<QuestionPool[]>([]);
  const [loadingPools, setLoadingPools] = useState(false);

  useEffect(() => {
    // Kiểm tra courseId hợp lệ trước khi gọi API
    if (!courseId || isNaN(courseId)) {
      console.warn('ExamSessionFormModal: courseId không hợp lệ:', courseId);
      return;
    }

    setLoadingPools(true);
    console.log('Fetching pools for courseId:', courseId);
    
    examService.getPoolsByCourse(courseId)
      .then((res: any) => {
        console.log('Pools raw response:', res);
        
        // BÓC TÁCH RESPONSE AN TOÀN (Unwrap data flexilbly)
        let list: QuestionPool[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (Array.isArray(res?.data)) {
          list = res.data;
        } else if (Array.isArray(res?.result)) {
          list = res.result;
        } else if (Array.isArray(res?.content)) {
          list = res.content;
        }

        setPools(list);
      })
      .catch(err => {
        console.error('Lỗi tải pools:', err);
        setPools([]);
      })
      .finally(() => {
        setLoadingPools(false);
      });
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || totalQuestions < 1) return;

    if (!courseId || isNaN(courseId)) {
      console.error('courseId không hợp lệ:', courseId);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        courseId,
        poolId: poolId || undefined,
        title: title.trim(),
        description: description.trim(),
        totalQuestions,
        passingScore,
        timeLimit: timeLimit || undefined,
        maxAttempts,
        showResultImmediately: true,
        saveHistory,
        hashtagFilter: hashtagFilter.trim() || undefined,
      });
      onClose();
    } catch (err) {
      // Lỗi đã xử lý ở parent
    } finally {
      setSaving(false);
    }
  };

  // Guard-rail đảm bảo safePools luôn là Array
  const safePools = Array.isArray(pools) ? pools : [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-slate-800">
            {session ? 'Sửa Bài kiểm tra' : 'Tạo Bài kiểm tra mới'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <FaTimes size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tên */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên bài kiểm tra <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-amber-500"
              placeholder="VD: Kiểm tra 15 phút Chương 1"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-amber-500 resize-none"
              rows={2}
              placeholder="Hướng dẫn trước khi làm bài..."
            />
          </div>

          {/* Chọn Pool + Hashtag Filter */}
          <div className="grid grid-cols-2 gap-3">
            {/* Chọn ngân hàng câu hỏi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngân hàng câu hỏi {loadingPools && <FaSpinner className="inline animate-spin text-amber-500 ml-1" size={10} />}
              </label>
              <select
                value={poolId || ''}
                onChange={e => setPoolId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-amber-500 bg-white"
              >
                <option value="">Tất cả ngân hàng</option>
                {safePools.map(p => (
                  <option key={p.idPool} value={p.idPool}>
                    {p.title} {p.status?.toUpperCase() !== 'PUBLISHED' ? `(${p.status})` : ''}
                  </option>
                ))}
              </select>
              {safePools.length === 0 && !loadingPools && (
                <p className="text-[10px] text-amber-600 mt-1">Chưa có ngân hàng câu hỏi nào</p>
              )}
            </div>

            {/* Lọc hashtag */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lọc hashtag</label>
              <input
                type="text"
                value={hashtagFilter}
                onChange={e => setHashtagFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-amber-500"
                placeholder="#lesson1, #lesson2"
              />
              <p className="text-[10px] text-slate-400 mt-1">Để trống nếu lấy tất cả</p>
            </div>
          </div>

          {/* Grid thông số */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số câu hỏi <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={totalQuestions}
                onChange={e => setTotalQuestions(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-amber-500"
                min={1}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Điểm đỗ (%)</label>
              <input
                type="number"
                value={passingScore}
                onChange={e => setPassingScore(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-amber-500"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian (phút)</label>
              <input
                type="number"
                value={timeLimit || ''}
                onChange={e => setTimeLimit(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-amber-500"
                placeholder="Không giới hạn"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số lần làm</label>
              <input
                type="number"
                value={maxAttempts}
                onChange={e => setMaxAttempts(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-amber-500"
                min={1}
              />
            </div>
          </div>

          {/* Lưu lịch sử */}
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={saveHistory}
              onChange={e => setSaveHistory(e.target.checked)}
              className="w-4 h-4 rounded accent-amber-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-700">Lưu lịch sử làm bài</span>
              <p className="text-[10px] text-slate-400">Bật để lưu kết quả, tắt nếu chỉ làm thử</p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || totalQuestions < 1}
              className="flex-1 rounded-xl bg-amber-500 text-white py-2.5 text-xs font-bold hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><FaSpinner className="animate-spin" size={12} /> Đang lưu...</>
              ) : (
                session ? 'Cập nhật' : 'Tạo Bài kiểm tra'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};