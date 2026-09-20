// ============================================
// CourseFormModal.tsx - FULL (Có Background)
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import { Panel } from '../ui/Panel';
import { FaImage, FaTimes, FaSpinner, FaSearch, FaCheck, FaUserCheck, FaExchangeAlt, FaPalette } from 'react-icons/fa';
import { RichTextEditor } from '../../ui/RichTextEditor';
import type { Category } from '../../../types/category.types';
import type { Course, CourseRequest } from '../../../types/course.types';
import { getErrorMessage } from '../../../utils/errorUtils';
import { getTeachers } from '../../../service/accountService';
import { getAllCourses } from '../../../service/courseService';
import { useCurrency } from '../../../context/CurrencyContext';
import { getImageDimensions, getImageClass, getBackgroundStyle, type ImageDimensions } from '../../../utils/imageHelper';

type Instructor = { id: number; firstName: string; lastName: string; };

type Props = {
  course?: Course | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: CourseRequest) => Promise<void>;
  isInstructor?: boolean;
  currentAccountId?: number;
  onToast?: (message: string, type: 'success' | 'error') => void;
};

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

// ✅ THÊM: Background options
const BACKGROUND_GRADIENTS = [
  { value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Purple' },
  { value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Pink' },
  { value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Blue' },
  { value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Green' },
  { value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Orange' },
  { value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', label: 'Dark Blue' },
  { value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', label: 'Soft Pink' },
  { value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', label: 'Peach' },
  { value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', label: 'Mint' },
  { value: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', label: 'Lime' },
];

const BACKGROUND_SOLIDS = [
  { value: '#49BBBD', label: 'Cyan' },
  { value: '#667eea', label: 'Indigo' },
  { value: '#f5576c', label: 'Red' },
  { value: '#43e97b', label: 'Green' },
  { value: '#fa709a', label: 'Pink' },
  { value: '#30cfd0', label: 'Teal' },
  { value: '#ff9a9e', label: 'Rose' },
  { value: '#ffecd2', label: 'Cream' },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function CourseFormModal({
  course,
  categories,
  onClose,
  onSave,
  isInstructor = false,
  currentAccountId,
  onToast
}: Props) {
  const { targetCurrency, rate, convertFormatted, formatAmount } = useCurrency();

  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnailUrl || '');
  const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS'>(
    course?.level || 'ALL_LEVELS'
  );
  const [courseType, setCourseType] = useState<'SELF_PACED' | 'LIVE'>(course?.courseType || 'SELF_PACED');
  const [duration, setDuration] = useState(course?.duration || '');
  const [price, setPrice] = useState(course?.price?.toString() || '');
  const [oldPrice, setOldPrice] = useState(course?.oldPrice?.toString() || '');
  const [isFree, setIsFree] = useState(course?.isFree || false);
  const [hasCertificate, setHasCertificate] = useState(course?.hasCertificate || false);
  const [accessPeriod, setAccessPeriod] = useState(course?.accessPeriod || 'Lifetime');
  const [categoryId, setCategoryId] = useState(course?.category?.id || '');
  
  // ==================== ✅ BACKGROUND STATE ====================
  const [backgroundType, setBackgroundType] = useState<string>(course?.backgroundType || '');
  const [backgroundThumbnail, setBackgroundThumbnail] = useState<string>(course?.backgroundThumbnail || '');

  // ==================== INSTRUCTOR STATE ====================
  const [instructorId, setInstructorId] = useState<number | undefined>(
    isInstructor ? currentAccountId : (course?.instructor?.id || undefined)
  );
  const [originalInstructorId] = useState<number | undefined>(course?.instructor?.id);
  const [changingInstructor, setChangingInstructor] = useState(false);

  const [language, setLanguage] = useState(course?.language || 'vi');

  const [outcomesText, setOutcomesText] = useState(() => {
    if (course?.outcomes) {
      try {
        const p = JSON.parse(course.outcomes);
        if (Array.isArray(p)) return p.join(', ');
        return course.outcomes;
      } catch {
        return course.outcomes;
      }
    }
    return '';
  });

  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [prerequisiteCourseId, setPrerequisiteCourseId] = useState<number | undefined>(
    course?.prerequisite?.id
  );
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [prereqSearch, setPrereqSearch] = useState('');

  useEffect(() => {
    if (course?.thumbnailUrl) {
      const url = course.thumbnailUrl;
      const fullUrl = url.startsWith('/uploads/') ? `${API_BASE_URL}${url}` : url;
      setThumbnailPreview(fullUrl);
      getImageDimensions(fullUrl)
        .then(setImageDimensions)
        .catch(() => setImageDimensions(null));
    }
  }, [course]);

  useEffect(() => {
    if (thumbnailPreview) {
      getImageDimensions(thumbnailPreview)
        .then(setImageDimensions)
        .catch(() => setImageDimensions(null));
    }
  }, [thumbnailPreview]);

  useEffect(() => {
    if (!isInstructor) {
      (async () => {
        setLoadingInstructors(true);
        try {
          const data = await getTeachers();
          setInstructors(Array.isArray(data) ? data.map(u => ({ id: u.idAccount, firstName: u.firstName, lastName: u.lastName })) : []);
        } catch {
        } finally {
          setLoadingInstructors(false);
        }
      })();
    }
  }, [isInstructor]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllCourses({ status: 'PUBLISHED', size: 100 });
        setAvailableCourses((data.content || []).filter(c => c.id !== course?.id));
      } catch {
      }
    })();
  }, [course]);

  const flattenCategories = (cats: Category[]): Category[] => {
    let r: Category[] = [];
    for (const c of cats) {
      r.push(c);
      if (c.children?.length) r.push(...flattenCategories(c.children));
    }
    return r;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onToast?.('Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onToast?.('Maximum file size is 5MB', 'error');
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleInstructorChange = (newInstructorId: number) => {
    setInstructorId(newInstructorId);
    setChangingInstructor(newInstructorId !== originalInstructorId);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      onToast?.('Title cannot be empty', 'error');
      return;
    }
    setLoading(true);
    try {
      let outcomesJson;
      if (outcomesText.trim()) {
        const items = outcomesText.split(',').map(s => s.trim()).filter(Boolean);
        if (items.length) outcomesJson = JSON.stringify(items);
      }
      
      await onSave({
        title: title.trim(),
        description,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        level,
        courseType,
        duration: duration.trim() || undefined,
        price: isFree ? 0 : (parseFloat(price) || 0),
        oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
        isFree,
        hasCertificate,
        accessPeriod: accessPeriod.trim() || 'Lifetime',
        outcomes: outcomesJson,
        categoryId: categoryId || undefined,
        accountId: isInstructor ? currentAccountId : instructorId,
        prerequisiteCourseId: prerequisiteCourseId || undefined,
        thumbnail: thumbnailFile || undefined,
        language: language || 'vi',
        // ✅ THÊM BACKGROUND
        backgroundThumbnail: backgroundThumbnail || undefined,
        backgroundType: backgroundType || undefined,
      });
      
      onClose();
    } catch (error: any) {
      onToast?.(getErrorMessage(error, 'Failed to save course'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrerequisites = availableCourses.filter(c =>
    c.title.toLowerCase().includes(prereqSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
      <Panel className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl bg-white overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {course ? 'Edit Course' : 'Create New Course'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {course ? 'Update course details and configuration' : 'Fill in the information to publish a new course'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition font-medium text-slate-800 placeholder:text-slate-400"
                  placeholder="e.g., ReactJS & TypeScript Masterclass"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Course Description
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Write a comprehensive description for this course..."
                    height={200}
                    toolbar="full"
                  />
                </div>
              </div>

              {/* Outcomes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Learning Outcomes
                </label>
                <textarea
                  value={outcomesText}
                  onChange={e => setOutcomesText(e.target.value)}
                  rows={2}
                  className="w-full p-3.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-slate-800 placeholder:text-slate-400"
                  placeholder="Enter learning objectives separated by commas (,)..."
                />
              </div>

              {/* Prerequisite */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Prerequisite Course
                </label>
                <select
                  value={prerequisiteCourseId || ''}
                  onChange={e => setPrerequisiteCourseId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="">No prerequisite</option>
                  {availableCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 space-y-5">

              {/* Thumbnail */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Course Thumbnail
                </label>

                {thumbnailPreview ? (
                  <div 
                    className="relative rounded-xl overflow-hidden border border-slate-200 group"
                    style={getBackgroundStyle(backgroundType, backgroundThumbnail)}
                  >
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail Preview" 
                      className={`${getImageClass(imageDimensions?.orientation)} h-40 w-full relative z-10`}
                    />
                    {imageDimensions && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-lg z-20">
                        {imageDimensions.width}×{imageDimensions.height} ({imageDimensions.orientation})
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); setImageDimensions(null); }}
                      className="absolute top-2 right-2 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900 transition z-20"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <label 
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white h-36 hover:border-indigo-500 transition group"
                    style={getBackgroundStyle(backgroundType, backgroundThumbnail)}
                  >
                    <div className="p-3 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 transition mb-1 relative z-10">
                      <FaImage size={20} />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 relative z-10">Upload Image</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 relative z-10">PNG, JPG (Max 5MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}

                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                  placeholder="Or paste image URL..."
                />
              </div>

              {/* ==================== ✅ BACKGROUND SELECTOR ==================== */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <FaPalette size={12} /> Background
                  </label>
                  {backgroundType && (
                    <button
                      type="button"
                      onClick={() => { setBackgroundType(''); setBackgroundThumbnail(''); }}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Type buttons */}
                <div className="flex gap-2 flex-wrap">
                  {['', 'GRADIENT', 'SOLID', 'IMAGE'].map(type => (
                    <button
                      key={type || 'none'}
                      type="button"
                      onClick={() => { setBackgroundType(type); if (type !== backgroundType) setBackgroundThumbnail(''); }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                        backgroundType === type ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {type === '' ? 'None' : type}
                    </button>
                  ))}
                </div>

                {/* Gradient options */}
                {backgroundType === 'GRADIENT' && (
                  <div className="grid grid-cols-5 gap-2">
                    {BACKGROUND_GRADIENTS.map((bg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBackgroundThumbnail(bg.value)}
                        className={`h-10 rounded-lg cursor-pointer border-2 transition ${
                          backgroundThumbnail === bg.value ? 'border-indigo-600 scale-105' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ background: bg.value }}
                        title={bg.label}
                      />
                    ))}
                  </div>
                )}

                {/* Solid options */}
                {backgroundType === 'SOLID' && (
                  <div className="grid grid-cols-8 gap-2">
                    {BACKGROUND_SOLIDS.map((bg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBackgroundThumbnail(bg.value)}
                        className={`h-10 rounded-lg cursor-pointer border-2 transition ${
                          backgroundThumbnail === bg.value ? 'border-indigo-600 scale-105' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: bg.value }}
                        title={bg.label}
                      />
                    ))}
                  </div>
                )}

                {/* Image URL */}
                {backgroundType === 'IMAGE' && (
                  <input
                    type="text"
                    value={backgroundThumbnail}
                    onChange={(e) => setBackgroundThumbnail(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                    placeholder="https://example.com/background.jpg"
                  />
                )}
              </div>

              {/* Category, Level & Language */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:border-indigo-500 outline-none">
                    <option value="">Select</option>
                    {flattenCategories(categories).map(cat => (
                      <option key={cat.id} value={cat.id}>{'— '.repeat(cat.level || 0)}{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Level</label>
                  <select value={level} onChange={e => setLevel(e.target.value as any)} className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:border-indigo-500 outline-none">
                    {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:border-indigo-500 outline-none">
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Type & Instructor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Course Type</label>
                  <select value={courseType} onChange={e => setCourseType(e.target.value as any)} className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:border-indigo-500 outline-none">
                    <option value="SELF_PACED">📚 Self-paced</option>
                    <option value="LIVE">🎥 Live Online</option>
                  </select>
                </div>
                {!isInstructor ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Instructor</label>
                    <select value={instructorId || ''} onChange={e => handleInstructorChange(e.target.value ? +e.target.value : 0)} disabled={loadingInstructors} className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white outline-none disabled:bg-slate-100">
                      <option value="">{loadingInstructors ? 'Loading...' : 'Select instructor'}</option>
                      {instructors.map(i => <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Duration</label>
                    <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none" placeholder="e.g., 12h 30m" />
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Pricing & Settings</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1">Price (SGD)</span>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} disabled={isFree} className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 outline-none disabled:bg-slate-100" placeholder="0" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1">Original Price (SGD)</span>
                    <input type="number" value={oldPrice} onChange={e => setOldPrice(e.target.value)} disabled={isFree} className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 outline-none disabled:bg-slate-100" placeholder="0" />
                  </div>
                </div>
                {!isFree && price && !isNaN(parseFloat(price)) && (
                  <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-200">
                    <FaExchangeAlt className="text-[#49BBBD] text-xs shrink-0" />
                    <span className="text-xs font-bold text-[#2F327D]">{convertFormatted(parseFloat(price))}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">1 SGD = {formatAmount(rate)} {targetCurrency}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                    <span className="text-xs font-medium text-slate-700">Free Course</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={hasCertificate} onChange={e => setHasCertificate(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                    <span className="text-xs font-medium text-slate-700">Certificate</span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={loading || !title.trim()} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition">
            {loading ? (<><FaSpinner className="animate-spin" size={14} /> Processing...</>) : (<><FaCheck size={12} /> {course ? 'Update Course' : 'Create Course'}</>)}
          </button>
        </div>

      </Panel>
    </div>
  );
}