// src/components/elearning/course/course-details/tabs/CourseResourcesTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaFileAlt, FaBook, FaUpload } from 'react-icons/fa';
import type { Chapter } from '../../../../../types/chapter.types';
import type { CourseResource } from '../../../../../types/courseResource.types';
import { 
  getResourcesByCourse, 
  deleteResource, 
  uploadResource,
  updateResourceChapter
} from '../../../../../service/courseResourceService';
import { getChaptersByCourse } from '../../../../../service/chapterService';
import { Toast, type ToastMessage } from '../../../../elearning/ui/Toast';
import { ResourceItem } from '../../../../elearning/course/course-details/ResourceItem';
import { ResourceUploadModal } from '../../../../elearning/course/course-details/ResourceUploadModal';
import { ChapterResourceList } from '../../../../elearning/course/course-details/ChapterResourceList';

type Props = { courseId: number };

export const CourseResourcesTab: React.FC<Props> = ({ courseId }) => {
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const fetchData = useCallback(async (showLoading = true) => {
    if (!courseId || isNaN(Number(courseId))) return;
    if (showLoading) setLoading(true);
    try {
      const [resourcesData, chaptersData] = await Promise.all([
        getResourcesByCourse(courseId),
        getChaptersByCourse(courseId),
      ]);

      setResources(Array.isArray(resourcesData) ? resourcesData : []);
      const chapterList: Chapter[] = Array.isArray(chaptersData) ? chaptersData : [];
      setChapters(chapterList);

      setExpandedChapters(prev => {
        if (Object.keys(prev).length > 0) return prev;
        const initial: Record<number, boolean> = {};
        chapterList.forEach((ch: Chapter) => { initial[ch.id] = true; });
        return initial;
      });
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      showToast('Không thể tải dữ liệu', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchData(true); }, [fetchData]);

  const handleUpload = async (data: { title: string; resourceType: string; file: File }) => {
    try {
      await uploadResource(courseId, {
        title: data.title,
        resourceType: data.resourceType as any,
        file: data.file,
        isRequired: false,
        orderIndex: resources.length,
      } as any);
      
      showToast('Upload tài nguyên thành công!');
      setShowUploadModal(false);
      await fetchData(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi upload tài nguyên';
      showToast(msg, 'error');
      throw err;
    }
  };

  const handleAssignToChapter = async (chapterId: number, resourceId: number) => {
    try {
      await updateResourceChapter(courseId, resourceId, chapterId);
      showToast('Đã gán tài nguyên vào chương');
      await fetchData(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi gán tài nguyên';
      showToast(msg, 'error');
    }
  };

  const handleUnassignFromChapter = async (resourceId: number) => {
    try {
      await updateResourceChapter(courseId, resourceId, null);
      showToast('Đã gỡ tài nguyên khỏi chương');
      await fetchData(false);
    } catch (err) {
      showToast('Lỗi gỡ tài nguyên', 'error');
    }
  };

  const handleDeleteResource = async (resource: CourseResource) => {
    if (!confirm(`Xóa tài nguyên "${resource.title || resource.fileName}" khỏi khóa học?`)) return;
    try {
      await deleteResource(courseId, resource.id);
      showToast('Xóa tài nguyên thành công!');
      await fetchData(false);
    } catch (err) {
      showToast('Lỗi xóa tài nguyên', 'error');
    }
  };

  const handleDragStart = (e: React.DragEvent, resourceId: number) => {
    e.dataTransfer.setData('text/plain', String(resourceId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const documentResources = resources.filter(
    (r: CourseResource) => r.resourceType !== 'VIDEO' && r.resourceType !== 'QUIZ'
  );

  const getChapterTitle = (chapterId?: number | null): string => {
    if (!chapterId) return '';
    return chapters.find((c: Chapter) => c.id === chapterId)?.title || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <FaSpinner className="animate-spin h-8 w-8 text-[#49BBBD]" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 min-w-0">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#2F327D]">Tài nguyên khóa học ({documentResources.length})</h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#49BBBD] text-white hover:bg-[#3db0b2] shadow-md shadow-[#49BBBD]/20 transition cursor-pointer active:scale-95"
        >
          <FaUpload size={12} /> Upload tài nguyên
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <ResourceUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}

      {/* LAYOUT 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* LEFT: TẤT CẢ TÀI NGUYÊN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FaFileAlt size={12} /> Tất cả tài nguyên
            </h4>
            <span className="text-[10px] text-slate-400">{documentResources.length}</span>
          </div>

          {documentResources.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <FaFileAlt className="text-3xl text-slate-300 mb-2" />
              <p className="text-xs text-slate-400">Chưa có tài nguyên nào</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1 flex-1">
              {documentResources.map((resource: CourseResource) => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  isAssigned={!!resource.chapterId}
                  assignedChapterTitle={getChapterTitle(resource.chapterId)}
                  onDelete={handleDeleteResource}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: CHAPTERS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FaBook size={12} /> Chương
            </h4>
            <span className="text-[10px] text-slate-400">{chapters.length}</span>
          </div>
          <ChapterResourceList
            chapters={chapters}
            resources={resources}
            expandedChapters={expandedChapters}
            onToggleChapter={toggleChapter}
            onAssignToChapter={handleAssignToChapter}
            onUnassignFromChapter={handleUnassignFromChapter}
          />
        </div>
      </div>
    </div>
  );
};