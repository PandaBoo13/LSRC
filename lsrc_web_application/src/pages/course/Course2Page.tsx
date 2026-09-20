// src/pages/course/Course2.tsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CourseCard from '../../components/course/CourseCard';
import { getAllCourses } from '../../service/courseService';
import { getCategoryTree } from '../../service/categoryService';
import { getImageUrl } from '../../utils/imageHelper';
import type { Course } from '../../types/course.types';
import type { Category } from '../../types/category.types';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';

const FILTER_STORAGE_KEY = 'course2_saved_filters';

const findCategoryIdBySlug = (cats: Category[], slug: string): string | null => {
  for (const cat of cats) { 
    if (cat.slug === slug) return cat.id || (cat as any).idCategory || null; 
    if (cat.children?.length) { 
      const f = findCategoryIdBySlug(cat.children, slug); 
      if (f) return f; 
    } 
  } 
  return null;
};

const getStoredFilters = () => {
  try {
    const saved = sessionStorage.getItem(FILTER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export default function Course2Page() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categorySlug = searchParams.get('category') || '';

  const initialFilters = getStoredFilters();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchKeyword, setSearchKeyword] = useState<string>(initialFilters.searchKeyword || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters.selectedCategory || '');
  const [selectedLevel, setSelectedLevel] = useState<string>(initialFilters.selectedLevel || '');
  const [selectedPrice, setSelectedPrice] = useState<string>(initialFilters.selectedPrice || '');
  const [selectedType, setSelectedType] = useState<string>(initialFilters.selectedType || '');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const cats = await getCategoryTree();
        const catList = Array.isArray(cats) ? cats : [];
        setCategories(catList);

        if (categorySlug) {
          const id = findCategoryIdBySlug(catList, categorySlug);
          if (id) setSelectedCategory(id);
        }
      } catch {}
      finally { setReady(true); }
    };
    init();
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify({
          searchKeyword,
          selectedCategory,
          selectedLevel,
          selectedPrice,
          selectedType,
        })
      );
    } catch (e) {
      console.error('Failed to save filter state to sessionStorage:', e);
    }
  }, [ready, searchKeyword, selectedCategory, selectedLevel, selectedPrice, selectedType]);

  useEffect(() => { if (ready) fetchData(); }, [ready, selectedCategory, selectedLevel, selectedPrice, selectedType]);
  useEffect(() => { if (!ready) return; const t = setTimeout(() => fetchData(), 500); return () => clearTimeout(t); }, [searchKeyword]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { status: 'PUBLISHED', size: 50, sortBy: 'publishedAt', sortDirection: 'DESC' };
      if (searchKeyword) params.keyword = searchKeyword;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;
      if (selectedPrice === 'free') params.isFree = true;
      if (selectedPrice === 'paid') params.isFree = false;

      // Backend hiện chưa hỗ trợ filter courseType qua Specification
      // → vẫn gửi param nhưng sẽ filter lại ở client bên dưới
      if (selectedType) params.courseType = selectedType;

      const res = await getAllCourses(params);
      let list = res.content || [];

      // ✅ Fallback client-side filter cho courseType (backend chưa support)
      if (selectedType === 'LIVE') {
        list = list.filter(c => c.courseType === 'LIVE');
      } else if (selectedType === 'SELF_PACED') {
        list = list.filter(c => c.courseType === 'SELF_PACED' || !c.courseType);
      }

      // ✅ Fallback client-side filter cho isFree (trường hợp backend bỏ sót dữ liệu không nhất quán)
      if (selectedPrice === 'free') {
        list = list.filter(c => c.isFree === true || c.price === 0);
      } else if (selectedPrice === 'paid') {
        list = list.filter(c => c.isFree !== true && (c.price ?? 0) > 0);
      }

      setCourses(list);
    } catch { 
      setError('Failed to load data.'); 
    } finally { 
      setLoading(false); 
    }
  }, [searchKeyword, selectedCategory, selectedLevel, selectedPrice, selectedType]);

  const handleCategoryChange = (v: string) => {
    setSelectedCategory(v);
    if (v) {
      const cat = categories.find(c => (c.id || (c as any).idCategory) === v);
      if (cat?.slug) {
        const params = new URLSearchParams(searchParams);
        params.set('category', cat.slug);
        navigate(`/courses2?${params.toString()}`, { replace: true });
      }
    } else {
      navigate('/courses2', { replace: true });
    }
  };

  const mapToCardCourse = (c: Course) => ({
    id: String(c.id), 
    slug: c.slug, 
    title: c.title, 
    description: c.description,
    thumbnailUrl: getImageUrl(c.thumbnailUrl),
    image: getImageUrl(c.thumbnailUrl),
    category: c.category?.name || 'General',
    duration: c.duration || 'N/A', 
    price: c.price || 0, 
    oldPrice: c.oldPrice,
    isFree: c.isFree,                     // ✅ THÊM: để CourseCard hiển thị badge "Miễn phí"
    courseType: c.courseType,             // ✅ THÊM: để CourseCard hiển thị badge "Live" / "Self-paced"
    instructor: { 
      firstName: c.instructor?.firstName, 
      lastName: c.instructor?.lastName, 
      name: c.instructor?.firstName ? `${c.instructor.firstName} ${c.instructor.lastName || ''}` : undefined 
    },
  });

  const activeCategoryName = selectedCategory
    ? categories.find(c => (c.id || (c as any).idCategory) === selectedCategory)?.name || ''
    : 'All Courses';

  return (
    <div className="min-h-screen font-sans bg-white">
      <Header />
      <section className="bg-white py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate('/courses')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 cursor-pointer">
            <FaArrowLeft size={12} /> Back to courses
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">{activeCategoryName}</h1>
          <p className="text-slate-500 mb-8">Explore quality courses from LSRC</p>

          <div className="flex flex-wrap gap-3 mb-10 items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div className="relative flex-1 min-w-[240px]">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={searchKeyword} 
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50" 
              />
            </div>

            <select 
              value={selectedCategory} 
              onChange={e => handleCategoryChange(e.target.value)}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm cursor-pointer outline-none focus:border-teal-400"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id || (cat as any).idCategory} value={cat.id || (cat as any).idCategory}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select 
              value={selectedLevel} 
              onChange={e => setSelectedLevel(e.target.value)}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm cursor-pointer outline-none focus:border-teal-400"
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="ALL_LEVELS">All Levels</option>
            </select>

            <select 
              value={selectedPrice} 
              onChange={e => setSelectedPrice(e.target.value)}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm cursor-pointer outline-none focus:border-teal-400"
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>

            <select 
              value={selectedType} 
              onChange={e => setSelectedType(e.target.value)}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm cursor-pointer outline-none focus:border-teal-400 font-medium"
            >
              <option value="">All Formats</option>
              <option value="SELF_PACED">📚 Self-Paced</option>
              <option value="LIVE">🎥 Live Stream</option>
            </select>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12 bg-rose-50 rounded-2xl border border-rose-100">
              <p className="text-rose-600 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={mapToCardCourse(course)} />
              ))}
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500 text-base font-medium">No matching courses found</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}