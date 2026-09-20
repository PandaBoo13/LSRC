// src/components/elearning/lesson/ResourceUploadModal.tsx
import { useState, useRef } from 'react';
import { 
  FaTimes, FaUpload, FaFile, FaSpinner, FaCloudUploadAlt, 
  FaTrash, FaLink, FaToggleOn, FaToggleOff 
} from 'react-icons/fa';
import type { Lesson } from '../../../types/lesson.types';

type Props = {
  lesson: Lesson;
  onUpload: (
    file: File,
    options?: {
      resourceType?: string;
      title?: string;
      description?: string;
      duration?: number;
      isRequired?: boolean;
    }
  ) => Promise<void>;
  onClose: () => void;
};

const RESOURCE_TYPES = [
  { value: 'VIDEO', label: '🎬 Video', extensions: '.mp4,.webm,.mov,.avi' },
  { value: 'PDF', label: '📄 PDF', extensions: '.pdf' },
  { value: 'AUDIO', label: '🎵 Audio', extensions: '.mp3,.wav,.ogg,.aac' },
  { value: 'SLIDE', label: '📊 Slide', extensions: '.ppt,.pptx,.pdf' },
  { value: 'SCORM', label: '📦 SCORM', extensions: '.zip' },
  { value: 'DOCUMENT', label: '📝 Tài liệu', extensions: '.doc,.docx,.xls,.xlsx,.txt' },
  { value: 'IMAGE', label: '🖼 Hình ảnh', extensions: '.jpg,.jpeg,.png,.gif,.svg,.webp' },
  { value: 'OTHER', label: '📎 Khác', extensions: '*' },
];

export function ResourceUploadModal({ lesson, onUpload, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [resourceType, setResourceType] = useState('VIDEO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number | undefined>();
  const [isRequired, setIsRequired] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tự động detect resource type từ file extension
  const detectResourceType = (fileName: string): string => {
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();
    for (const type of RESOURCE_TYPES) {
      if (type.extensions === '*') continue;
      if (type.extensions.split(',').includes(ext)) {
        return type.value;
      }
    }
    return 'OTHER';
  };

  const handleFileSelect = (selectedFile: File) => {
    // Kiểm tra kích thước (500MB)
    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('File không được vượt quá 500MB');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Tự động detect resource type
    const detectedType = detectResourceType(selectedFile.name);
    setResourceType(detectedType);

    // Tự động set title = tên file (bỏ extension)
    const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
    if (!title) {
      setTitle(nameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn file để tải lên');
      return;
    }
    try {
      setUploading(true);
      setError('');
      await onUpload(file, {
        resourceType,
        title: title || undefined,
        description: description || undefined,
        duration: duration || undefined,
        isRequired,
      });
    } catch (err) {
      setError('Tải lên thất bại, vui lòng thử lại');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const selectedType = RESOURCE_TYPES.find(t => t.value === resourceType);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-white sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Tải lên tài nguyên</h3>
            <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[280px]">
              Cho bài học: <span className="font-medium text-slate-700">{lesson.title}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            disabled={uploading}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <span className="text-red-500 text-lg flex-shrink-0">✕</span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              File tài nguyên <span className="text-red-500">*</span>
            </label>
            
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  dragOver 
                    ? 'border-cyan-400 bg-cyan-50' 
                    : 'border-slate-300 hover:border-cyan-400 hover:bg-slate-50'
                }`}
              >
                <FaCloudUploadAlt className="mx-auto text-5xl text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">
                  Kéo thả file vào đây hoặc <span className="text-cyan-500 font-semibold">chọn file</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Hỗ trợ tất cả định dạng, tối đa 500MB
                </p>
                {selectedType && (
                  <p className="text-xs text-cyan-500 mt-2 font-medium">
                    {selectedType.label}: {selectedType.extensions}
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileSelect(selectedFile);
                  }}
                  className="hidden"
                  accept={RESOURCE_TYPES.map(t => t.extensions).join(',')}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 flex-shrink-0">
                  <FaFile size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)} • {file.type || 'unknown type'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setTitle('');
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                  disabled={uploading}
                >
                  <FaTrash size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Resource Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại tài nguyên</label>
            <div className="grid grid-cols-4 gap-2">
              {RESOURCE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setResourceType(type.value)}
                  className={`p-2 rounded-lg text-xs font-medium transition border ${
                    resourceType === type.value
                      ? 'border-cyan-400 bg-cyan-50 text-cyan-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
              placeholder="Tên hiển thị cho tài nguyên (mặc định là tên file)"
            />
          </div>

          {/* Duration for Video/Audio */}
          {(resourceType === 'VIDEO' || resourceType === 'AUDIO') && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Thời lượng (giây)
              </label>
              <input
                type="number"
                value={duration || ''}
                onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                placeholder="VD: 1800 (30 phút)"
                min="0"
              />
              {duration && (
                <p className="text-xs text-slate-400 mt-1">
                  ≈ {Math.floor(duration / 60)} phút {duration % 60} giây
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mô tả <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 resize-none"
              rows={2}
              placeholder="Mô tả ngắn về tài nguyên này..."
            />
          </div>

          {/* Is Required Toggle */}
          <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
            <div>
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                {isRequired ? (
                  <FaToggleOn size={20} className="text-cyan-500" />
                ) : (
                  <FaToggleOff size={20} className="text-slate-300" />
                )}
                Bắt buộc hoàn thành
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Học viên phải xem/hoàn thành tài nguyên này để qua bài tiếp theo
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsRequired(!isRequired)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                isRequired ? 'bg-cyan-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isRequired ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          {/* Footer */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex-1 rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-200/50"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <FaUpload size={14} />
                  Tải lên tài nguyên
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 rounded-xl bg-white border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}