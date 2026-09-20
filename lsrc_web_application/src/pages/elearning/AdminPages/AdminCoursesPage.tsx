// src/pages/elearning/AdminPages/AdminCoursesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaPlus, FaFilter, FaTimes, FaSpinner, FaSortAmountDown, FaThLarge, FaList, FaGraduationCap, FaExchangeAlt } from 'react-icons/fa';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { Panel } from '../../../components/elearning/ui/Panel';
import { CourseListItem } from '../../../components/elearning/course/CourseListItem';
import CourseManagementCard from '../../../components/elearning/course/CourseManagementCard';
import { CourseFormModal } from '../../../components/elearning/course/CourseFormModal';
import { Toast } from '../../../components/elearning/ui/Toast';
import type { ToastMessage } from '../../../components/elearning/ui/Toast';
import { adminNav } from '../../../data/elearning';
import { getAllCourses, createCourse, updateCourse, deleteCourse, updateCourseStatus } from '../../../service/courseService';
import { getCategoryTree } from '../../../service/categoryService';
import { getErrorMessage } from '../../../utils/errorUtils';
import { useCurrency } from '../../../context/CurrencyContext';
import type { Category } from '../../../types/category.types';
import type { Course, CourseRequest } from '../../../types/course.types';

const SORT_OPTIONS = [
  { key: 'createdAt', label: 'Mới nhất', icon: '🕐', defaultDir: 'DESC' as const },
  { key: 'students', label: 'Phổ biến nhất', icon: '👥', defaultDir: 'DESC' as const },
  { key: 'rating', label: 'Đánh giá cao', icon: '⭐', defaultDir: 'DESC' as const },
  { key: 'price', label: 'Giá', icon: '💰', defaultDir: 'ASC' as const },
  { key: 'title', label: 'Tên A-Z', icon: '🔤', defaultDir: 'ASC' as const },
];

const CURRENCIES = [
  { code: 'VND', label: 'VND (Việt Nam Đồng)' },
  { code: 'USD', label: 'USD (US Dollar)' },
  { code: 'EUR', label: 'EUR (Euro)' },
  { code: 'GBP', label: 'GBP (British Pound)' },
  { code: 'AUD', label: 'AUD (Australian Dollar)' },
];

export function AdminCoursesPage() {
  const { t } = useTranslation();

  const { 
    targetCurrency, 
    rate, 
    loading: rateLoading, 
    setTargetCurrency,
    formatAmount 
  } = useCurrency();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterIsFree, setFilterIsFree] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const fetchCourses = useCallback(async (showLoading = true) => {
    if (showLoading) { setLoading(true); } else { setRefreshing(true); }
    try {
      const data = await getAllCourses({ 
        page, size: 10, keyword: search || undefined,
        categoryId: filterCategory || undefined, status: filterStatus || undefined,
        level: filterLevel || undefined,
        isFree: filterIsFree !== '' ? filterIsFree === 'true' : undefined,
        sortBy, sortDirection,
      });
      console.log('🔍 totalPages:', data.totalPages);
      setCourses(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      showToast(getErrorMessage(error, t('admin.courses.loadFailed')), 'error');
    } finally { setLoading(false); setRefreshing(false); }
  }, [page, search, filterCategory, filterStatus, filterLevel, filterIsFree, sortBy, sortDirection, t]);

  const fetchCategories = async () => {
    try {
      const data = await getCategoryTree();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) { console.error('Failed to fetch categories:', error); }
  };

  useEffect(() => { fetchCourses(); fetchCategories(); }, [page, filterCategory, filterStatus, filterLevel, filterIsFree, sortBy, sortDirection]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(0); fetchCourses(false); }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = () => { setEditingCourse(null); setShowForm(true); };
  const handleEdit = (course: Course) => { setEditingCourse(course); setShowForm(true); };

  const handleSave = async (data: CourseRequest) => {
    try {
      if (editingCourse) { 
        await updateCourse(editingCourse.id, data); 
        showToast(t('admin.courses.updateSuccess'), 'success'); 
      }
      else { 
        await createCourse(data); 
        showToast(t('admin.courses.createSuccess'), 'success'); 
      }
      setShowForm(false);
      fetchCourses(false);
    } catch (error: any) { throw error; }
  };

  const handleDelete = async (course: Course) => {
    if (course.status !== 'DRAFT') { 
      showToast(t('admin.courses.onlyDraftCanDelete'), 'error'); 
      return; 
    }
    if (!confirm(t('admin.courses.confirmDelete', { title: course.title }))) return;
    try { 
      await deleteCourse(course.id); 
      showToast(t('admin.courses.deleteSuccess'), 'success'); 
      fetchCourses(false); 
    }
    catch (error: any) { 
      showToast(getErrorMessage(error, t('admin.courses.deleteFailed')), 'error'); 
    }
  };

  const handleStatusChange = async (course: Course, newStatus: string) => {
    try { 
      await updateCourseStatus(course.id, { status: newStatus as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }); 
      showToast(t('admin.courses.statusUpdateSuccess'), 'success'); 
      fetchCourses(false); 
    }
    catch (error: any) { 
      showToast(getErrorMessage(error, t('admin.courses.statusUpdateFailed')), 'error'); 
    }
  };

  const handleClearFilters = () => {
    setFilterCategory(''); setFilterStatus(''); setFilterLevel(''); setFilterIsFree('');
    setSearch(''); setSortBy('createdAt'); setSortDirection('DESC'); setPage(0); setShowFilters(false);
  };

  const hasActiveFilters = filterCategory || filterStatus || filterLevel || filterIsFree !== '';
  const filterCount = (filterCategory ? 1 : 0) + (filterStatus ? 1 : 0) + (filterLevel ? 1 : 0) + (filterIsFree !== '' ? 1 : 0);

  const flattenCategories = (cats: Category[]): Category[] => {
    let result: Category[] = [];
    for (const cat of cats) { result.push(cat); if (cat.children && cat.children.length > 0) result.push(...flattenCategories(cat.children)); }
    return result;
  };
  const allCategories = flattenCategories(categories);

  return (
    <DashboardShell 
      role="Admin" 
      title={t('admin.courses.title')} 
      subtitle={t('admin.courses.subtitle')} 
      navItems={adminNav}
    >
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* CURRENCY SELECTOR */}
      <div className="mb-6 flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <FaExchangeAlt className="text-[#49BBBD]" size={14} />
        <span className="text-xs font-bold text-slate-600">{t('admin.courses.displayCurrency')}</span>
        <select
          value={targetCurrency}
          onChange={(e) => setTargetCurrency(e.target.value)}
          className="h-8 rounded-xl border border-slate-200 px-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400">
          1 SGD = {rateLoading ? '...' : `${formatAmount(rate)} ${targetCurrency}`}
        </span>
      </div>

      {/* CONTROL BAR */}
      <div className="mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input 
            type="text" 
            placeholder={t('admin.courses.searchPlaceholder')} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium outline-none transition focus:bg-white focus:border-[#49BBBD] focus:ring-4 focus:ring-cyan-50" 
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${viewMode === 'grid' ? 'bg-white text-[#2F327D]' : 'text-slate-400'}`}
            >
              <FaThLarge size={12} /> {t('admin.courses.viewGrid')}
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${viewMode === 'list' ? 'bg-white text-[#2F327D]' : 'text-slate-400'}`}
            >
              <FaList size={12} /> {t('admin.courses.viewList')}
            </button>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition ${showFilters || hasActiveFilters ? 'border-cyan-300 bg-cyan-50 text-[#49BBBD]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <FaFilter size={11} /> {t('admin.courses.filter')}
            {filterCount > 0 && (
              <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#49BBBD] text-[10px] text-white font-bold">
                {filterCount}
              </span>
            )}
          </button>
          <button 
            onClick={handleCreate} 
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#49BBBD] hover:bg-[#3ca3a5] px-5 py-2.5 text-xs font-bold text-white transition shadow-md shadow-cyan-500/20 active:scale-[0.98]"
          >
            <FaPlus size={11} /> {t('admin.courses.addCourse')}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="mb-6 p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select 
              value={filterCategory} 
              onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }} 
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="">{t('admin.courses.allCategories')}</option>
              {allCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {'— '.repeat(cat.level || 0)}{cat.name}
                </option>
              ))}
            </select>
            <select 
              value={filterStatus} 
              onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }} 
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="">{t('admin.courses.allStatuses')}</option>
              <option value="DRAFT">📝 {t('admin.courses.statusDraft')}</option>
              <option value="PUBLISHED">✅ {t('admin.courses.statusPublished')}</option>
              <option value="ARCHIVED">📦 {t('admin.courses.statusArchived')}</option>
            </select>
            <select 
              value={filterLevel} 
              onChange={(e) => { setFilterLevel(e.target.value); setPage(0); }} 
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="">{t('admin.courses.allLevels')}</option>
              <option value="BEGINNER">🔰 {t('admin.courses.levelBeginner')}</option>
              <option value="INTERMEDIATE">⭐ {t('admin.courses.levelIntermediate')}</option>
              <option value="ADVANCED">🚀 {t('admin.courses.levelAdvanced')}</option>
              <option value="ALL_LEVELS">📊 {t('admin.courses.levelAll')}</option>
            </select>
            <select 
              value={filterIsFree} 
              onChange={(e) => { setFilterIsFree(e.target.value); setPage(0); }} 
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="">{t('admin.courses.all')}</option>
              <option value="true">🆓 {t('admin.courses.free')}</option>
              <option value="false">💰 {t('admin.courses.paid')}</option>
            </select>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <FaSpinner className="h-9 w-9 animate-spin text-[#49BBBD]" />
          <span className="text-xs font-bold text-slate-400">{t('admin.courses.loadingCourses')}</span>
        </div>
      ) : courses.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseManagementCard 
                  key={course.id} 
                  course={course} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                  onStatusChange={handleStatusChange} 
                  isAdmin={true} 
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <CourseListItem 
                  key={course.id} 
                  course={course} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                  onStatusChange={handleStatusChange} 
                  isAdmin={true} 
                />
              ))}
            </div>
          )}

          {/* PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
              <button 
                onClick={() => setPage(Math.max(0, page - 1))} 
                disabled={page === 0}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:border-[#49BBBD] disabled:opacity-40"
              >
                ← {t('admin.courses.previous')}
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${page === i ? 'bg-[#49BBBD] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))} 
                disabled={page === totalPages - 1}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:border-[#49BBBD] disabled:opacity-40"
              >
                {t('admin.courses.next')} →
              </button>
            </div>
          )}
        </>
      ) : (
        <Panel className="p-12 text-center border border-slate-100 rounded-3xl bg-white">
          <div className="mx-auto w-16 h-16 bg-cyan-50 text-[#49BBBD] rounded-2xl flex items-center justify-center mb-4">
            <FaGraduationCap size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#2F327D] mb-1">
            {search || hasActiveFilters ? t('admin.courses.noResults') : t('admin.courses.noCourses')}
          </h3>
          <button 
            onClick={handleCreate} 
            className="inline-flex items-center gap-2 rounded-2xl bg-[#49BBBD] px-5 py-2.5 text-xs font-bold text-white"
          >
            <FaPlus size={11} /> {t('admin.courses.createFirst')}
          </button>
        </Panel>
      )}

      {/* COURSE FORM MODAL */}
      {showForm && (
        <CourseFormModal 
          course={editingCourse} 
          categories={categories} 
          onClose={() => setShowForm(false)} 
          onSave={handleSave} 
          isInstructor={false} 
          onToast={showToast} 
        />
      )}
    </DashboardShell>
  );
}