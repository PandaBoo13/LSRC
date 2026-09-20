// src/components/elearning/course/CourseInfoCard.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  FaEdit, FaPalette, FaSpinner, 
  FaGlobe, FaTag, FaClock, FaCertificate, FaLayerGroup,
  FaLink, FaExchangeAlt, FaBookOpen, FaSearch, FaPlus,
  FaTimes, FaCheck, FaListUl
} from 'react-icons/fa';
import type { Course, CourseRequest } from '../../../types/course.types';
import type { Category } from '../../../types/category.types';
import { updateCourse, setPrerequisite, removePrerequisite, getAllCourses } from '../../../service/courseService';
import { getErrorMessage } from '../../../utils/errorUtils';
import { getBackgroundStyle, getImageUrl } from '../../../utils/imageHelper';
import { RichTextDisplay } from '../../ui/RichTextEditor/RichTextDisplay';
import { RichTextEditor } from '../../ui/RichTextEditor/RichTextEditor';

// CONSTANTS
const LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'ALL_LEVELS', label: 'All Levels' },
];

const LANGUAGES = [
  { value: 'vi', label: '🇻🇳 Tiếng Việt' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'ja', label: '🇯🇵 日本語' },
  { value: 'ko', label: '🇰🇷 한국어' },
  { value: 'zh', label: '🇨🇳 中文' },
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'de', label: '🇩🇪 Deutsch' },
  { value: 'es', label: '🇪🇸 Español' },
];

const COURSE_TYPES = [
  { value: 'SELF_PACED', label: '📚 Tự học' },
  { value: 'LIVE', label: '🎥 Live Online' },
];

const PROGRESS_TYPES = [
  { value: 'COMPLETION_BASED', label: 'Theo hoàn thành' },
  { value: 'WEIGHTED_GRADE', label: 'Theo trọng số điểm' },
];

const ACCESS_PERIODS = [
  { value: 'Lifetime', label: 'Trọn đời' },
  { value: '1 year', label: '1 năm' },
  { value: '6 months', label: '6 tháng' },
  { value: '3 months', label: '3 tháng' },
];

const BACKGROUND_GRADIENTS = [
  { value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Purple' },
  { value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Pink' },
  { value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Blue' },
  { value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Green' },
  { value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Orange' },
  { value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', label: 'Dark Blue' },
];

const BACKGROUND_SOLIDS = [
  { value: '#49BBBD', label: 'Cyan' },
  { value: '#667eea', label: 'Indigo' },
  { value: '#f5576c', label: 'Red' },
  { value: '#43e97b', label: 'Green' },
  { value: '#fa709a', label: 'Pink' },
  { value: '#30cfd0', label: 'Teal' },
];

interface CourseInfoCardProps {
  course: Course;
  categories?: Category[];
  onUpdate?: (updatedCourse: Course) => void;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

type EditableField = 
  | 'title' 
  | 'description' 
  | 'level' 
  | 'language' 
  | 'price' 
  | 'oldPrice' 
  | 'duration'
  | 'isFree'
  | 'hasCertificate'
  | 'backgroundType'
  | 'backgroundThumbnail'
  | 'courseType'
  | 'progressType'
  | 'accessPeriod'
  | 'outcomes'
  | 'categoryId'
  | null;

type InputType = 'text' | 'select' | 'textarea' | 'number' | 'richtext';

const getOptionLabel = (options: { value: string; label: string }[], value?: string, fallback = '—') => {
  if (!value) return fallback;
  return options.find(o => o.value === value)?.label || value;
};

// ==================== OUTCOMES HELPERS ====================
/**
 * Parse outcomes từ DB.
 * - Ưu tiên JSON array: ["Mục 1", "Mục 2"]
 * - Fallback: tách theo dòng, strip HTML nếu dữ liệu cũ dạng HTML
 */
const parseOutcomes = (text?: string | null): string[] => {
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map(s => s.trim()).filter(Boolean);
    }
  } catch {
    // ignore
  }
  // Fallback: dữ liệu cũ dạng text/HTML
  return text
    .replace(/<[^>]*>/g, '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
};

export const CourseInfoCard: React.FC<CourseInfoCardProps> = ({ 
  course, 
  onUpdate, 
  onToast 
}) => {
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const editContainerRef = useRef<HTMLDivElement>(null);

  // ✅ State riêng cho Outcomes dạng danh sách khung
  const [outcomesList, setOutcomesList] = useState<string[]>([]);
  const [newOutcomeInput, setNewOutcomeInput] = useState('');

  // Prerequisite states
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [prereqSearch, setPrereqSearch] = useState('');
  const [selectedPrereqId, setSelectedPrereqId] = useState<number | null>(course.prerequisite?.id || null);
  const [savingPrereq, setSavingPrereq] = useState(false);

  useEffect(() => {
    setSelectedPrereqId(course.prerequisite?.id || null);
  }, [course.prerequisite]);

  useEffect(() => {
    if (!editingField) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (editContainerRef.current && !editContainerRef.current.contains(e.target as Node)) {
        cancelEdit();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [editingField]);

  useEffect(() => {
    if (showPrerequisiteModal) {
      loadAvailableCourses();
    }
  }, [showPrerequisiteModal]);

  const loadAvailableCourses = async () => {
    setLoadingCourses(true);
    try {
      const data = await getAllCourses({ status: 'PUBLISHED', size: 100 });
      const filtered = (data.content || []).filter(c => c.id !== course.id);
      setAvailableCourses(filtered);
    } catch (err) {
      console.error('Lỗi tải danh sách khóa học:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSavePrerequisite = async () => {
    setSavingPrereq(true);
    try {
      if (selectedPrereqId) {
        await setPrerequisite(course.id, selectedPrereqId, course);
        
        const selectedCourse = availableCourses.find(c => c.id === selectedPrereqId);
        if (selectedCourse) {
          onUpdate?.({
            ...course,
            prerequisite: {
              id: selectedCourse.id,
              title: selectedCourse.title,
              slug: selectedCourse.slug,
              isRequired: true,
            },
          });
        }
        onToast?.('Đã chọn khóa học tiên quyết', 'success');
      }
      setShowPrerequisiteModal(false);
    } catch (err) {
      onToast?.(getErrorMessage(err, 'Cập nhật thất bại'), 'error');
    } finally {
      setSavingPrereq(false);
    }
  };

  const handleRemovePrerequisite = async () => {
    if (!confirm('Xóa khóa học tiên quyết?')) return;
    try {
      await removePrerequisite(course.id, course);
      onUpdate?.({ ...course, prerequisite: undefined });
      onToast?.('Đã xóa khóa học tiên quyết', 'success');
    } catch (err) {
      onToast?.(getErrorMessage(err, 'Xóa thất bại'), 'error');
    }
  };

  const startEdit = (field: EditableField, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue('');
    setNewOutcomeInput('');
  }, []);

  // ==================== SAVE EDIT (thường) ====================
  const saveEdit = useCallback(async () => {
    if (!editingField || saving) return;
    // Outcomes có handler riêng
    if (editingField === 'outcomes') return;

    setSaving(true);
    try {
      const payload: CourseRequest = {
        title: course.title,
        description: course.description || '',
        level: course.level,
        language: course.language || 'vi',
        price: course.price ?? 0,
        oldPrice: course.oldPrice,
        duration: course.duration || '',
        isFree: course.isFree ?? false,
        hasCertificate: course.hasCertificate ?? false,
        backgroundType: course.backgroundType,
        backgroundThumbnail: course.backgroundThumbnail,
        courseType: course.courseType,
        progressType: course.progressType,
        accessPeriod: course.accessPeriod,
        outcomes: course.outcomes,
      };
      
      switch (editingField) {
        case 'title': payload.title = editValue.trim(); break;
        case 'description': payload.description = editValue; break;
        case 'level': payload.level = editValue; break;
        case 'language': payload.language = editValue; break;
        case 'price': payload.price = parseFloat(editValue) || 0; break;
        case 'oldPrice': payload.oldPrice = editValue ? parseFloat(editValue) : undefined; break;
        case 'duration': payload.duration = editValue.trim(); break;
        case 'isFree': payload.isFree = editValue === 'true'; break;
        case 'hasCertificate': payload.hasCertificate = editValue === 'true'; break;
        case 'backgroundType': payload.backgroundType = editValue; break;
        case 'backgroundThumbnail': payload.backgroundThumbnail = editValue; break;
        case 'courseType': payload.courseType = editValue as Course['courseType']; break;
        case 'progressType': payload.progressType = editValue as Course['progressType']; break;
        case 'accessPeriod': payload.accessPeriod = editValue; break;
        case 'categoryId': payload.categoryId = editValue || undefined; break;
      }
      
      await updateCourse(course.id, payload);
      onUpdate?.({ ...course, ...payload });
      onToast?.('Cập nhật thành công', 'success');
      setEditingField(null);
    } catch (err) {
      onToast?.(getErrorMessage(err, 'Cập nhật thất bại'), 'error');
    } finally {
      setSaving(false);
    }
  }, [editingField, editValue, saving, course, onUpdate, onToast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && editingField !== 'description') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const quickUpdateBackground = async (type: string, value: string) => {
    try {
      const payload: CourseRequest = {
        title: course.title,
        description: course.description || '',
        level: course.level,
        language: course.language || 'vi',
        price: course.price ?? 0,
        isFree: course.isFree ?? false,
        hasCertificate: course.hasCertificate ?? false,
        duration: course.duration || '',
        backgroundType: type,
        backgroundThumbnail: value,
      };
      await updateCourse(course.id, payload);
      onUpdate?.({ ...course, backgroundType: type as Course['backgroundType'], backgroundThumbnail: value });
      onToast?.('Đã cập nhật background', 'success');
    } catch (err) {
      onToast?.(getErrorMessage(err, 'Cập nhật thất bại'), 'error');
    }
  };

  // ==================== OUTCOMES HANDLERS ====================
  const handleStartEditOutcomes = () => {
    setEditingField('outcomes');
    setOutcomesList(parseOutcomes(course.outcomes));
    setNewOutcomeInput('');
  };

  const handleAddOutcomeCard = () => {
    const val = newOutcomeInput.trim();
    if (!val) return;
    setOutcomesList(prev => [...prev, val]);
    setNewOutcomeInput('');
  };

  const handleRemoveOutcomeCard = (index: number) => {
    setOutcomesList(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateOutcomeCard = (index: number, value: string) => {
    setOutcomesList(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSaveOutcomes = async () => {
    setSaving(true);
    try {
      const cleanedList = outcomesList.map(item => item.trim()).filter(Boolean);
      const jsonString = JSON.stringify(cleanedList);

      const payload: CourseRequest = {
        title: course.title,
        description: course.description || '',
        level: course.level,
        language: course.language || 'vi',
        price: course.price ?? 0,
        oldPrice: course.oldPrice,
        duration: course.duration || '',
        isFree: course.isFree ?? false,
        hasCertificate: course.hasCertificate ?? false,
        backgroundType: course.backgroundType,
        backgroundThumbnail: course.backgroundThumbnail,
        courseType: course.courseType,
        progressType: course.progressType,
        accessPeriod: course.accessPeriod,
        outcomes: jsonString,
      };

      await updateCourse(course.id, payload);
      onUpdate?.({ ...course, outcomes: jsonString });
      onToast?.('Cập nhật mục tiêu thành công', 'success');
      setEditingField(null);
    } catch (err) {
      onToast?.(getErrorMessage(err, 'Cập nhật thất bại'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // ==================== DERIVED ====================
  const filteredPrerequisites = useMemo(() => {
    if (!prereqSearch.trim()) return availableCourses;
    return availableCourses.filter(c =>
      c.title.toLowerCase().includes(prereqSearch.toLowerCase())
    );
  }, [availableCourses, prereqSearch]);

  const outcomeItems = useMemo(() => parseOutcomes(course.outcomes), [course.outcomes]);

  // ==================== RENDER FIELD ====================
  const renderEditableField = (
    field: EditableField,
    value: string,
    displayValue?: React.ReactNode,
    inputType: InputType = 'text',
    options?: { value: string; label: string }[]
  ) => {
    const isEditing = editingField === field;

    if (isEditing) {
      if (inputType === 'richtext') {
        return (
          <div ref={editContainerRef} className="w-full space-y-2 mt-1">
            <RichTextEditor
              value={editValue}
              onChange={setEditValue}
              toolbar="full"
              height={260}
              placeholder="Nhập nội dung..."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 transition"
              >
                {saving && <FaSpinner className="animate-spin" size={11} />}
                Lưu
              </button>
            </div>
          </div>
        );
      }

      return (
        <div ref={editContainerRef} className="flex items-center gap-2 w-full mt-0.5">
          {inputType === 'select' && options ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-8 px-2.5 text-sm font-medium rounded-lg border border-indigo-500 bg-white outline-none focus:ring-2 focus:ring-indigo-100"
              autoFocus
              disabled={saving}
            >
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={inputType}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-8 px-2.5 text-sm font-medium rounded-lg border border-indigo-500 bg-white outline-none"
              autoFocus
              disabled={saving}
            />
          )}
          {saving && (
            <div className="p-1 shrink-0 text-indigo-600">
              <FaSpinner className="animate-spin" size={12} />
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        className="group flex items-start justify-between gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 -mx-2 rounded-lg transition"
        onDoubleClick={() => startEdit(field, value)}
        title="Nhấp đôi để chỉnh sửa"
      >
        <div className="flex-1 min-w-0 text-sm text-slate-800 font-semibold">
          {displayValue || value || '—'}
        </div>
        <FaEdit size={12} className="text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition shrink-0 mt-1" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Banner Header */}
      <div 
        className="relative h-28 sm:h-36 flex items-end p-5 transition-all"
        style={getBackgroundStyle(course.backgroundType, course.backgroundThumbnail)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent" />
        <div className="relative z-10 flex items-center gap-4 w-full">
          <img 
            src={getImageUrl(course.thumbnailUrl) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500'} 
            alt={course.title}
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white/90 shadow-lg shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-xs text-white font-bold">ID #{course.id}</span>
              {course.isFree && <span className="px-2.5 py-0.5 rounded-md bg-emerald-500 text-xs text-white font-bold">Miễn phí</span>}
              {course.courseType && <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-xs text-white font-bold">{course.courseType === 'LIVE' ? '🎥 Live' : '📚 Self-paced'}</span>}
            </div>
            <h3 className="text-white font-bold text-base sm:text-lg truncate">{course.title}</h3>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-4">
        {/* Title + Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Tiêu đề khóa học</label>
            {renderEditableField('title', course.title)}
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Mô tả ngắn</label>
            {renderEditableField(
              'description',
              course.description || '',
              <div className="line-clamp-2 [&_*]:inline [&_*]:m-0 [&_*]:p-0 text-slate-700">
                <RichTextDisplay
                  content={course.description || ''}
                  prose={false}
                  fallback="Chưa có mô tả"
                />
              </div>,
              'richtext'
            )}
          </div>
        </div>

        {/* Dynamic Grid Thông số */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1"><FaLayerGroup size={11} className="text-indigo-500" /> Cấp độ</span>
            {renderEditableField('level', course.level, getOptionLabel(LEVELS, course.level), 'select', LEVELS)}
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1"><FaGlobe size={11} className="text-indigo-500" /> Ngôn ngữ</span>
            {renderEditableField('language', course.language || 'vi', getOptionLabel(LANGUAGES, course.language), 'select', LANGUAGES)}
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1"><FaTag size={11} className="text-indigo-500" /> Học phí</span>
            {renderEditableField('price', course.price?.toString() || '0', course.isFree ? 'Miễn phí' : `${course.price?.toLocaleString('vi-VN')} đ`, 'number')}
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1"><FaClock size={11} className="text-indigo-500" /> Thời lượng</span>
            {renderEditableField('duration', course.duration || '', course.duration || '—')}
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-500 block mb-1">Chế độ giá</span>
            {renderEditableField('isFree', course.isFree ? 'true' : 'false', <span className={`font-bold ${course.isFree ? 'text-emerald-600' : 'text-slate-800'}`}>{course.isFree ? 'Miễn phí' : 'Tính phí'}</span>, 'select', [{ value: 'true', label: 'Miễn phí' }, { value: 'false', label: 'Tính phí' }])}
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1"><FaCertificate size={11} className="text-indigo-500" /> Chứng chỉ</span>
            {renderEditableField('hasCertificate', course.hasCertificate ? 'true' : 'false', <span className={`font-bold ${course.hasCertificate ? 'text-indigo-600' : 'text-slate-500'}`}>{course.hasCertificate ? 'Có' : 'Không'}</span>, 'select', [{ value: 'true', label: 'Có' }, { value: 'false', label: 'Không' }])}
          </div>
        </div>

        {/* Cấu hình hình thức */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1"><FaBookOpen size={11} className="text-indigo-500" /> Hình thức học</span>
            {renderEditableField('courseType', course.courseType || 'SELF_PACED', getOptionLabel(COURSE_TYPES, course.courseType, 'Tự học'), 'select', COURSE_TYPES)}
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1"><FaExchangeAlt size={11} className="text-indigo-500" /> Đánh giá tiến độ</span>
            {renderEditableField('progressType', course.progressType || 'COMPLETION_BASED', getOptionLabel(PROGRESS_TYPES, course.progressType, 'Theo hoàn thành'), 'select', PROGRESS_TYPES)}
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1"><FaClock size={11} className="text-indigo-500" /> Thời hạn truy cập</span>
            {renderEditableField('accessPeriod', course.accessPeriod || 'Lifetime', getOptionLabel(ACCESS_PERIODS, course.accessPeriod, 'Trọn đời'), 'select', ACCESS_PERIODS)}
          </div>
        </div>

        {/* ==================== MỤC TIÊU ĐẠT ĐƯỢC (DẠNG KHUNG/CARD) ==================== */}
        <div className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FaListUl size={11} className="text-indigo-500" /> Mục tiêu đạt được
            </label>
            {editingField !== 'outcomes' && (
              <button
                type="button"
                onClick={handleStartEditOutcomes}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <FaEdit size={11} /> Chỉnh sửa khung
              </button>
            )}
          </div>

          {editingField === 'outcomes' ? (
            /* ============ CHẾ ĐỘ CHỈNH SỬA TỪNG KHUNG ============ */
            <div ref={editContainerRef} className="space-y-3 p-3 bg-slate-50/80 rounded-2xl border border-indigo-200">
              {/* Danh sách khung hiện có */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {outcomesList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-2">
                    Chưa có khung mục tiêu nào. Hãy thêm khung đầu tiên bên dưới.
                  </p>
                ) : (
                  outcomesList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm group"
                    >
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateOutcomeCard(idx, e.target.value)}
                        className="flex-1 text-sm font-semibold text-slate-700 bg-transparent outline-none border-b border-transparent focus:border-indigo-500 transition px-1"
                        placeholder="Nhập nội dung mục tiêu..."
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOutcomeCard(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                        title="Xóa khung này"
                      >
                        <FaTimes size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Ô nhập để thêm khung mới */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <input
                  type="text"
                  value={newOutcomeInput}
                  onChange={(e) => setNewOutcomeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOutcomeCard();
                    }
                  }}
                  placeholder="Nhập nội dung mục tiêu mới rồi bấm Enter..."
                  className="flex-1 h-9 px-3 text-sm font-medium bg-white rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={handleAddOutcomeCard}
                  className="h-9 px-3.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0"
                >
                  <FaPlus size={10} /> Thêm khung
                </button>
              </div>

              {/* Nút Hủy / Lưu */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveOutcomes}
                  disabled={saving}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 transition"
                >
                  {saving && <FaSpinner className="animate-spin" size={11} />}
                  Lưu tất cả khung
                </button>
              </div>
            </div>
          ) : (
            /* ============ CHẾ ĐỘ HIỂN THỊ DẠNG GRID KHUNG ============ */
            <div
              onDoubleClick={handleStartEditOutcomes}
              className="group cursor-pointer min-h-[42px] p-1 rounded-xl hover:bg-slate-50 transition"
              title="Nhấp đôi để chỉnh sửa khung"
            >
              {outcomeItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {outcomeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 bg-slate-50/80 border border-slate-200/80 p-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/30 transition"
                    >
                      <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-slate-400 italic block py-1">
                  Chưa có mục tiêu (Nhấp đôi để thêm khung)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Khóa học tiên quyết */}
        <div className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FaLink size={11} className="text-indigo-500" /> Khóa học tiên quyết
            </label>
            <button 
              onClick={() => setShowPrerequisiteModal(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <FaPlus size={10} /> {course.prerequisite ? 'Thay đổi' : 'Chọn môn'}
            </button>
          </div>
          
          {course.prerequisite ? (
            <div className="mt-2 flex items-center justify-between bg-indigo-50/80 border border-indigo-100 p-2.5 rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <FaLink size={12} className="text-indigo-600 shrink-0" />
                <span className="text-sm text-slate-800 font-semibold truncate">{course.prerequisite.title}</span>
              </div>
              <button 
                onClick={handleRemovePrerequisite}
                className="text-xs text-rose-600 hover:underline font-bold shrink-0 ml-2 cursor-pointer"
              >
                Xóa bỏ
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic mt-1">Chưa thiết lập khóa học tiên quyết</p>
          )}
        </div>

        {/* Banner Quick Picker */}
        <div className="pt-1 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <FaPalette size={12} className="text-indigo-600" /> Giao diện Banner:
            </span>
            <div className="w-32">
              {renderEditableField('backgroundType', course.backgroundType || '', course.backgroundType || 'Mặc định', 'select', [
                { value: '', label: 'Mặc định' },
                { value: 'GRADIENT', label: 'Gradient' },
                { value: 'SOLID', label: 'Màu đơn' },
                { value: 'IMAGE', label: 'Hình ảnh' },
              ])}
            </div>
          </div>

          {course.backgroundType === 'GRADIENT' && (
            <div className="flex items-center gap-2 flex-wrap">
              {BACKGROUND_GRADIENTS.map((bg, idx) => (
                <button key={idx} onClick={() => quickUpdateBackground('GRADIENT', bg.value)}
                  className={`w-6 h-6 rounded-full cursor-pointer transition transform hover:scale-110 ${course.backgroundThumbnail === bg.value ? 'ring-2 ring-offset-2 ring-indigo-600' : 'opacity-80'}`}
                  style={{ background: bg.value }} title={bg.label} />
              ))}
            </div>
          )}

          {course.backgroundType === 'SOLID' && (
            <div className="flex items-center gap-2 flex-wrap">
              {BACKGROUND_SOLIDS.map((bg, idx) => (
                <button key={idx} onClick={() => quickUpdateBackground('SOLID', bg.value)}
                  className={`w-6 h-6 rounded-full cursor-pointer transition transform hover:scale-110 ${course.backgroundThumbnail === bg.value ? 'ring-2 ring-offset-2 ring-indigo-600' : 'opacity-80'}`}
                  style={{ backgroundColor: bg.value }} title={bg.label} />
              ))}
            </div>
          )}

          {course.backgroundType === 'IMAGE' && (
            <div className="flex-1 min-w-[200px]">
              {renderEditableField('backgroundThumbnail', course.backgroundThumbnail || '', <span className="line-clamp-1">{course.backgroundThumbnail || 'Nhập URL ảnh'}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* MODAL CHỌN KHÓA HỌC TIÊN QUYẾT */}
      {showPrerequisiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800">Chọn khóa học tiên quyết</h3>
              <button onClick={() => setShowPrerequisiteModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                <FaTimes size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={prereqSearch}
                  onChange={(e) => setPrereqSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tên khóa học..."
                  className="w-full h-10 pl-9 pr-3 text-sm font-medium rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {loadingCourses ? (
                  <div className="flex justify-center py-8">
                    <FaSpinner className="animate-spin text-indigo-600" size={24} />
                  </div>
                ) : filteredPrerequisites.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Không tìm thấy khóa học phù hợp</p>
                ) : (
                  filteredPrerequisites.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedPrereqId(c.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition text-left ${
                        selectedPrereqId === c.id 
                          ? 'bg-indigo-50 border-2 border-indigo-500' 
                          : 'hover:bg-slate-50 border border-slate-100'
                      }`}
                    >
                      <img 
                        src={getImageUrl(c.thumbnailUrl) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=100'} 
                        alt={c.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <span className="flex-1 text-sm text-slate-800 font-semibold truncate">{c.title}</span>
                      {selectedPrereqId === c.id && <FaCheck size={14} className="text-indigo-600 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 border-t flex gap-3 bg-slate-50">
              <button 
                onClick={() => setShowPrerequisiteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleSavePrerequisite}
                disabled={savingPrereq}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {savingPrereq ? <FaSpinner className="animate-spin" size={14} /> : <FaCheck size={14} />}
                Lưu lựa chọn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};