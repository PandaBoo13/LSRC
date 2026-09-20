// src/components/elearning/lesson/LessonFormModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaSpinner, FaEye, FaAlignLeft, FaClock, 
  FaSortAmountDown, FaVideo, FaUpload, 
  FaPlus, FaTrash, FaFilePdf, FaFileAlt, FaCheckCircle, FaTag
} from 'react-icons/fa';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { Toast, type ToastMessage } from '../ui/Toast';
import type { CourseResource } from '../../../types/courseResource.types';

export type SaveLessonPayload = {
  lessonData: {
    id?: number;
    title: string;
    slug?: string;
    description?: string;
    content?: string;
    duration?: number;
    orderIndex?: number;
    isFreePreview?: boolean;
    isRequired?: boolean;
    status?: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
    resourceType?: string;
    chapterId?: number | null;
    courseId: number;
  };
  primaryVideoFile: File | null;
  newAttachments: { file: File; title: string; resourceType: string }[];
  deletedResourceIds: number[];
};

type Props = {
  lesson?: CourseResource | null;
  courseId: number;
  nextOrderIndex?: number;
  onClose: () => void;
  onSave: (payload: SaveLessonPayload) => Promise<void>;
};

type AttachmentItem = {
  id: string;
  file: File;
  title: string;
  resourceType: 'DOCUMENT' | 'SLIDE' | 'EXERCISE' | 'OTHER';
};

// ==================== HELPER: Đọc duration từ video file ====================
/** Đọc metadata video để lấy duration (giây), không upload file lên server. */
const readVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    const url = URL.createObjectURL(file);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (!isFinite(duration) || duration <= 0) {
        reject(new Error('Không đọc được thời lượng video'));
        return;
      }
      resolve(Math.round(duration));
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Không thể đọc metadata video'));
    };

    // Timeout an toàn — nếu sau 15s không đọc được → reject
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout khi đọc metadata video'));
    }, 15000);

    video.src = url;
  });
};

/** Format duration (giây) cho hiển thị người đọc: "12 phút 30 giây". */
const formatDurationHint = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} giây`;
  if (secs === 0) return `${mins} phút`;
  return `${mins} phút ${secs} giây`;
};

export function LessonFormModal({ lesson, courseId, nextOrderIndex = 1, onClose, onSave }: Props) {
  // ==================== STATES ====================
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'HIDDEN'>('DRAFT');

  const [primaryVideoFile, setPrimaryVideoFile] = useState<File | null>(null);
  const [deletedResourceIds, setDeletedResourceIds] = useState<number[]>([]);
  const [newAttachments, setNewAttachments] = useState<AttachmentItem[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [readingDuration, setReadingDuration] = useState(false);   // ✅ Đang đọc metadata
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showErrorToast = (message: string) => {
    setToast({ message, type: 'error' });
  };

  const showSuccessToast = (message: string) => {
    setToast({ message, type: 'success' });
  };

  // ==================== SYNC STATE KHI LOAD LESSON ====================
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      setSlug(lesson.slug || '');
      setDescription(lesson.description || '');
      setContent(lesson.content || '');
      setDuration(lesson.duration || undefined);
      setOrderIndex(lesson.orderIndex ?? 1);
      setIsFreePreview(lesson.isFreePreview || false);
      setStatus((lesson.status as any) || 'DRAFT');
    } else {
      setTitle('');
      setSlug('');
      setDescription('');
      setContent('');
      setDuration(undefined);
      setOrderIndex(nextOrderIndex);
      setIsFreePreview(false);
      setStatus('DRAFT');
      setPrimaryVideoFile(null);
    }
    setDeletedResourceIds([]);
    setNewAttachments([]);
    setToast(null);
  }, [lesson, nextOrderIndex]);

  // ==================== HELPERS ====================
  const isMp4File = (file: File) => {
    return file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4');
  };

  // ==================== HANDLERS ====================
  /** Chọn video bài giảng — validate + tự động đọc duration từ metadata. */
  const handlePrimaryVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input để có thể chọn lại cùng file
    e.target.value = '';

    if (!isMp4File(file)) {
      showErrorToast('Video bài giảng bắt buộc phải có định dạng .mp4');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      showErrorToast('Dung lượng video vượt quá giới hạn cho phép (Tối đa 500MB)');
      return;
    }

    setToast(null);
    setPrimaryVideoFile(file);

    // ✅ Tự động đọc duration từ metadata
    setReadingDuration(true);
    try {
      const seconds = await readVideoDuration(file);
      setDuration(seconds);
      showSuccessToast(`Đã đọc thời lượng video: ${formatDurationHint(seconds)}`);
    } catch (err) {
      console.warn('Không đọc được duration:', err);
      showErrorToast('Không đọc được thời lượng video. Vui lòng nhập thủ công.');
    } finally {
      setReadingDuration(false);
    }
  };

  /** Hủy chọn video — xóa file + duration đã đọc. */
  const handleCancelVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPrimaryVideoFile(null);
    setDuration(undefined);
    setToast(null);
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newItem: AttachmentItem = {
      id: Math.random().toString(36).substring(2, 9),
      file,
      title: file.name,
      resourceType: file.type.includes('pdf') ? 'DOCUMENT' : 'OTHER'
    };

    setNewAttachments((prev) => [...prev, newItem]);
    e.target.value = '';
  };

  const handleRemoveNewAttachment = (id: string) => {
    setNewAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (!title.trim()) {
      showErrorToast('Vui lòng nhập tiêu đề bài học!');
      return;
    }

    if (!lesson && !primaryVideoFile) {
      showErrorToast('Bài học mới BẮT BUỘC phải đính kèm ít nhất 1 Video bài giảng (.mp4)!');
      return;
    }

    if (readingDuration) {
      showErrorToast('Đang đọc thời lượng video, vui lòng đợi trong giây lát...');
      return;
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');

    const payload: SaveLessonPayload = {
      lessonData: {
        id: lesson?.id,
        title: title.trim(),
        slug: generatedSlug,
        description,
        content,
        duration: duration ? Number(duration) : undefined,
        orderIndex: Number(orderIndex),
        isFreePreview,
        status,
        resourceType: 'VIDEO',
        courseId
      },
      primaryVideoFile,
      newAttachments: newAttachments.map((att) => ({
        file: att.file,
        title: att.title,
        resourceType: att.resourceType
      })),
      deletedResourceIds
    };

    try {
      setSubmitting(true);
      await onSave(payload);
    } catch (err: any) {
      showErrorToast(err?.message || 'Có lỗi xảy ra khi lưu bài học. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">
              {lesson ? 'Quản lý & Chỉnh sửa bài học' : 'Tạo bài học mới & Tải tài nguyên'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nội dung bài học, video MP4 bài giảng và các tài liệu đi kèm
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* SECTION 1: VIDEO BÀI GIẢNG */}
          <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-900 flex items-center gap-2">
                <FaVideo size={14} className="text-cyan-600" /> Video bài giảng chính (MP4)
                <span className="text-rose-500 font-bold">*</span>
              </h4>
              <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-100/80 px-2 py-0.5 rounded-md">
                Định dạng .MP4
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-cyan-200/60">
              <label className="cursor-pointer block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    {readingDuration ? <FaSpinner className="animate-spin" size={14} /> : <FaUpload size={14} />}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {primaryVideoFile 
                        ? primaryVideoFile.name 
                        : (lesson 
                            ? 'Chọn file .MP4 mới nếu muốn thay đổi Video hiện tại' 
                            : 'Nhấn vào đây để tải lên Video bài giảng (.mp4)')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {primaryVideoFile 
                        ? `Dung lượng: ${(primaryVideoFile.size / 1024 / 1024).toFixed(2)} MB` 
                        : 'Hỗ trợ định dạng .mp4, dung lượng tối đa 500MB'}
                    </p>
                  </div>
                  {primaryVideoFile && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <FaCheckCircle size={12} /> Đã chọn
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelVideo}
                        className="text-xs text-rose-500 hover:underline font-semibold ml-2"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={handlePrimaryVideoChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* ✅ Hiển thị kết quả đọc duration */}
            {readingDuration && (
              <p className="text-[11px] text-cyan-700 font-medium flex items-center gap-1.5">
                <FaSpinner className="animate-spin" size={10} />
                Đang đọc thời lượng video từ metadata...
              </p>
            )}
          </div>

          {/* SECTION 2: THÔNG TIN CƠ BẢN */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FaAlignLeft size={12} /> Thông tin bài học
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Tiêu đề bài học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setToast(null); }}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                  placeholder="VD: Bài 1 - Tổng quan về ReactJS"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED' | 'HIDDEN')}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 bg-white"
                >
                  <option value="DRAFT">📝 Nháp</option>
                  <option value="PUBLISHED">✅ Xuất bản</option>
                  <option value="HIDDEN">🙈 Ẩn</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Slug URL</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs font-mono text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 bg-slate-50/50"
                  placeholder="bai-1-tong-quan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FaClock className="text-slate-400" size={11} /> Thời lượng video (giây)
                  {readingDuration && (
                    <span className="text-[10px] text-cyan-600 font-normal ml-1">
                      (đang đọc...)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={duration || ''}
                  onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
                  disabled={readingDuration}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-wait"
                  placeholder={readingDuration ? 'Đang đọc metadata...' : 'VD: 600 (10 phút)'}
                  min="0"
                />
                {/* ✅ Hint hiển thị duration đã đọc được */}
                {duration != null && duration > 0 && !readingDuration && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">
                    ✓ Đã đọc: {formatDurationHint(duration)} ({duration}s)
                  </p>
                )}
                {duration != null && duration > 0 && readingDuration && (
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    (giá trị cũ — sẽ được cập nhật sau khi đọc xong)
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FaSortAmountDown className="text-slate-400" size={11} /> Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={orderIndex ?? ''}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                min="1"
              />
            </div>
          </div>

          {/* SECTION 3: NỘI DUNG & MÔ TẢ */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Mô tả ngắn bài giảng</label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Tóm tắt nội dung chính học viên sẽ học..."
                height={100}
                toolbar="basic"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Nội dung chi tiết / Ghi chú</label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Nhập ghi chú, mã nguồn đính kèm hoặc văn bản chi tiết..."
                height={160}
                toolbar="full"
              />
            </div>
          </div>

          {/* SECTION 4: TÀI NGUYÊN ĐÍNH KÈM */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FaFileAlt size={12} /> Tài liệu đính kèm (Tùy chọn)
              </h4>
              <label className="cursor-pointer text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1.5 bg-cyan-50 hover:bg-cyan-100/80 px-3 py-1.5 rounded-xl transition">
                <FaPlus size={11} /> Thêm tài liệu
                <input type="file" onChange={handleAddAttachment} className="hidden" />
              </label>
            </div>

            {newAttachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-cyan-600 uppercase">Tài liệu chuẩn bị upload:</p>
                {newAttachments.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-cyan-50/40 rounded-xl border border-cyan-100 text-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                      <FaFileAlt className="text-cyan-600" />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewAttachments((prev) => prev.map((a) => a.id === item.id ? { ...a, title: val } : a));
                        }}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-700 flex-1 outline-none focus:border-cyan-500"
                        placeholder="Tên tài liệu..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewAttachment(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 transition"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: CẤU HÌNH XEM THỬ */}
          <div 
            className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between cursor-pointer transition" 
            onClick={() => setIsFreePreview(!isFreePreview)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center flex-shrink-0">
                <FaEye size={15} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Mở học thử miễn phí (Free Preview)</span>
                <p className="text-[11px] text-slate-500">Học viên chưa đăng ký khóa học vẫn có thể xem được bài này</p>
              </div>
            </div>
            <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${isFreePreview ? 'bg-cyan-500' : 'bg-slate-300'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${isFreePreview ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || readingDuration}
              className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting || readingDuration}
              className="flex-1 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white py-3 text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition shadow-md shadow-cyan-500/20 active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" size={13} />
                  <span>Đang tải lên & Lưu dữ liệu...</span>
                </>
              ) : readingDuration ? (
                <>
                  <FaSpinner className="animate-spin" size={13} />
                  <span>Đang đọc thời lượng video...</span>
                </>
              ) : (
                <span>{lesson ? 'Cập nhật Bài học' : 'Lưu bài học & Video MP4'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}