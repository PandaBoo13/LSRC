// src/components/elearning/course/course-details/ResourceUploadModal.tsx
import React, { useState, useRef } from 'react';
import { FaSpinner, FaTimes, FaUpload } from 'react-icons/fa';

interface ResourceUploadModalProps {
  onClose: () => void;
  onUpload: (data: { title: string; resourceType: string; file: File }) => Promise<void>;
}

export const ResourceUploadModal: React.FC<ResourceUploadModalProps> = ({ onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('DOCUMENT');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file && !title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
    
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (ext === 'pdf') setResourceType('PDF');
      else if (['mp3', 'wav', 'ogg'].includes(ext)) setResourceType('AUDIO');
      else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) setResourceType('IMAGE');
      else if (['ppt', 'pptx', 'key'].includes(ext)) setResourceType('SLIDE');
      else if (['doc', 'docx', 'txt'].includes(ext)) setResourceType('DOCUMENT');
      else setResourceType('OTHER');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await onUpload({
        title: title || selectedFile.name,
        resourceType,
        file: selectedFile,
      });
    } catch (err) {
      // Lỗi đã xử lý ở parent
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-slate-800">Upload tài nguyên mới</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <FaTimes size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chọn file <span className="text-rose-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-[#49BBBD]/10 file:text-[#49BBBD] file:font-bold hover:file:bg-[#49BBBD]/20 file:cursor-pointer cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#49BBBD]"
              placeholder="Nhập tiêu đề tài nguyên..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Loại tài nguyên</label>
            <select
              value={resourceType}
              onChange={e => setResourceType(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#49BBBD]"
            >
              <option value="PDF">PDF</option>
              <option value="AUDIO">Audio</option>
              <option value="SLIDE">Slide</option>
              <option value="DOCUMENT">Tài liệu</option>
              <option value="IMAGE">Hình ảnh</option>
              <option value="SCORM">SCORM</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading || !selectedFile}
              className="flex-1 rounded-xl bg-[#49BBBD] text-white py-2.5 text-xs font-bold hover:bg-[#3db0b2] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? <><FaSpinner className="animate-spin" size={12} /> Đang upload...</> : <><FaUpload size={12} /> Upload</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};