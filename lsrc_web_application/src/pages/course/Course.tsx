// src/pages/course/Course.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { CategoryCard } from '../../components/course/CategoryCard';
import { CourseProgressCard } from '../../components/elearning/progress/CourseProgressCard';
// ✅ Sửa import
import { getCategoryTree } from '../../service/categoryService';
import { getMyProgress } from '../../service/progress/progressService'; // ✅ Đổi courseProgressService → progressService
import type { Category } from '../../types/category.types';
import type { ProgressResponse } from '../../service/progress/progress.types'; // ✅ Đổi CourseProgressResponse → ProgressResponse
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PROGRESS_PER_PAGE = 3;
const CATEGORY_PER_PAGE = 8;

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

const flattenCategories = (cats: Category[]): Category[] => {
  let result: Category[] = [];
  for (const cat of cats) { 
    result.push(cat); 
    if (cat.children?.length) result.push(...flattenCategories(cat.children)); 
  }
  return result;
};

export default function CoursePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categorySlug = searchParams.get('category') || '';
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [progressList, setProgressList] = useState<ProgressResponse[]>([]); // ✅ Đổi type
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressPage, setProgressPage] = useState(0);
  const [categoryPage, setCategoryPage] = useState(0);

  useEffect(() => {
    (async () => {
      try { 
        setProgressLoading(true); 
        const data = await getMyProgress(); // ✅ Đổi function
        setProgressList(Array.isArray(data) ? data : []); 
      } catch {} 
      finally { 
        setProgressLoading(false); 
      }
    })();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const cats = await getCategoryTree();
        const flat = Array.isArray(cats) ? (cats[0]?.children ? flattenCategories(cats) : cats) : [];
        setAllCategories(flat);
      } catch {}
    };
    init();
  }, []);

  const handleCategoryChange = (v: string) => {
    if (v) {
      const cat = allCategories.find(c => (c.id || (c as any).idCategory) === v);
      if (cat?.slug) navigate(`/courses2?category=${cat.slug}`);
    } else {
      navigate('/courses2');
    }
  };

  const totalProgressPages = Math.ceil(progressList.length / PROGRESS_PER_PAGE);
  const pagedProgress = progressList.slice(progressPage * PROGRESS_PER_PAGE, (progressPage + 1) * PROGRESS_PER_PAGE);

  const totalCategoryPages = Math.ceil(allCategories.length / CATEGORY_PER_PAGE);
  const pagedCategories = allCategories.slice(categoryPage * CATEGORY_PER_PAGE, (categoryPage + 1) * CATEGORY_PER_PAGE);

  return (
    <div className="min-h-screen font-sans bg-white">
      <Header />
      
      {/* Welcome Back + Progress */}
      <section className="bg-[#EEF5FA] pt-10 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Welcome back, ready for your next lesson?</h1>
              <p className="mt-1 text-sm text-slate-500">Tiếp tục hành trình học tập và hoàn thành các khóa học của bạn.</p>
            </div>
            <button onClick={() => navigate('/my-courses')} className="text-[#49BBBD] hover:text-[#3db0b2] text-sm font-semibold transition-colors cursor-pointer">
              View history
            </button>
          </div>
          {progressLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {[1,2,3].map(n => <div key={n} className="h-64 bg-white/60 animate-pulse rounded-3xl" />)}
            </div>
          ) : progressList.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {pagedProgress.map(p => (
                  <CourseProgressCard 
                    key={p.id || p.courseId} 
                    progress={p as any} 
                    onClick={() => navigate(`/my-progress/${p.courseId}`)} 
                  />
                ))}
              </div>
              {totalProgressPages > 1 && (
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={() => setProgressPage(Math.max(0, progressPage - 1))} 
                    disabled={progressPage === 0}
                    className="w-10 h-10 rounded-lg bg-[#49BBBD]/10 hover:bg-[#49BBBD]/20 text-[#49BBBD] flex items-center justify-center disabled:opacity-40"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  <button 
                    onClick={() => setProgressPage(Math.min(totalProgressPages - 1, progressPage + 1))} 
                    disabled={progressPage === totalProgressPages - 1}
                    className="w-10 h-10 rounded-lg bg-[#49BBBD] hover:bg-[#3db0b2] text-white flex items-center justify-center shadow-md disabled:opacity-40"
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Chưa có khóa học nào đang học</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">Choice favourite course from top category</h2>
            <button onClick={() => navigate('/courses2')} className="text-[#49BBBD] hover:text-[#3db0b2] text-sm font-semibold transition-colors">
              Xem tất cả →
            </button>
          </div>

          {allCategories.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                {pagedCategories.map(cat => (
                  <CategoryCard 
                    key={cat.id || (cat as any).idCategory} 
                    category={cat} 
                    onClick={(c) => handleCategoryChange(c.id || (c as any).idCategory || '')} 
                  />
                ))}
              </div>
              {totalCategoryPages > 1 && (
                <div className="flex justify-center gap-3 pt-2">
                  <button 
                    onClick={() => setCategoryPage(Math.max(0, categoryPage - 1))} 
                    disabled={categoryPage === 0}
                    className="w-10 h-10 rounded-lg bg-[#49BBBD]/10 hover:bg-[#49BBBD]/20 text-[#49BBBD] flex items-center justify-center disabled:opacity-40"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  <span className="flex items-center text-sm text-slate-500">
                    {categoryPage + 1} / {totalCategoryPages}
                  </span>
                  <button 
                    onClick={() => setCategoryPage(Math.min(totalCategoryPages - 1, categoryPage + 1))} 
                    disabled={categoryPage === totalCategoryPages - 1}
                    className="w-10 h-10 rounded-lg bg-[#49BBBD] hover:bg-[#3db0b2] text-white flex items-center justify-center shadow-md disabled:opacity-40"
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}