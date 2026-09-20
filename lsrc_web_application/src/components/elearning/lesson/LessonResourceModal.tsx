// src/components/elearning/lesson/LessonResourceModal.tsx
import { useState } from 'react';
import { FaTimes, FaUpload, FaFile } from 'react-icons/fa';
import type { Lesson } from '../../../types/lesson.types';

type Props = {
  lesson: Lesson;
  onUpload: (file: File, resourceType: string, description?: string, duration?: number) => Promise<void>;
  onClose: () => void;
};

export function LessonResourceModal({ lesson, onUpload, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [resourceType, setResourceType] = useState('VIDEO');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number | undefined>();
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      await onUpload(file, resourceType, description, duration);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-slate-900">
            Upload Resource for "{lesson.title}"
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="VIDEO">Video</option>
              <option value="PDF">PDF</option>
              <option value="AUDIO">Audio</option>
              <option value="SLIDE">Slide</option>
              <option value="DOCUMENT">Document</option>
              <option value="IMAGE">Image</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              File *
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
              required
            />
            {file && (
              <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                <FaFile size={12} /> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {resourceType === 'VIDEO' || resourceType === 'AUDIO' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={duration || ''}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="1800"
              />
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              rows={3}
              placeholder="Resource description"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex-1 bg-cyan-500 text-white py-2 rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaUpload size={14} />
              {uploading ? 'Uploading...' : 'Upload Resource'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}