// src/components/homepage/Courses.tsx
import { useEffect, useState } from 'react';
import {
  FaArrowRight,
  FaStar,
  FaGlobe,
  FaUser,
  FaPalette,
  FaBookOpen,
  FaUsers,
  FaTrophy,
  FaGift,
  FaTag,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getHomePageCourses } from '../../service/courseService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/elearning';
import type { HomePageResponse, Course as CourseType } from '../../types/course.types';

const pillGradients = [
  'from-[#f97316] to-[#ea580c]',
  'from-[#f43f5e] to-[#e11d48]',
  'from-[#883b13] to-[#6b2e0e]',
  'from-[#eab308] to-[#ca8a04]',
  'from-[#a855f7] to-[#9333ea]',
  'from-[#3b82f6] to-[#2563eb]',
  'from-[#14b8a6] to-[#0d9488]',
];

const pillRotations = [
  '-rotate-3',
  'rotate-2',
  '-rotate-2',
  'rotate-3',
  '-rotate-1',
  'rotate-2',
  '-rotate-3',
  'rotate-1',
];

const rowBorderColors = ['border-[#53c7d6]', 'border-[#f45d81]', 'border-[#53c7d6]'];

type TabKey = 'newest' | 'popular' | 'topRated' | 'free' | 'discounted';

export default function Course() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<HomePageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('newest');
  const [selectedTabCourseId, setSelectedTabCourseId] = useState<string>('');
  const [selectedCategoryCourses, setSelectedCategoryCourses] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homeData = await getHomePageCourses();
        setData(homeData);

        if (homeData?.newestCourses?.length) {
          setSelectedTabCourseId(String(homeData.newestCourses[homeData.newestCourses.length - 1].id));
        }

        if (homeData?.coursesByCategory?.length) {
          const initialCategorySelected: Record<string, string> = {};
          homeData.coursesByCategory.forEach((cat, catIdx) => {
            if (cat.courses && cat.courses.length > 0) {
              const targetIndex =
                catIdx === 0
                  ? cat.courses.length - 1
                  : catIdx === 1
                  ? Math.floor(cat.courses.length / 2)
                  : 0;
              initialCategorySelected[cat.categoryId] = String(cat.courses[targetIndex]?.id || cat.courses[0].id);
            }
          });
          setSelectedCategoryCourses(initialCategorySelected);
        }
      } catch (error) {
        console.error('Lỗi load course homepage:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    const courses = getCoursesByTab(key);
    if (courses.length > 0) {
      setSelectedTabCourseId(String(courses[courses.length - 1]?.id || courses[0].id));
    }
  };

  const handleCourseClick = (slug: string) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/courses/${slug}?from=homepage`);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/courses?category=${categorySlug}`);
    }
  };

  const getCoursesByTab = (tab: TabKey): CourseType[] => {
    if (!data) return [];
    switch (tab) {
      case 'newest': return data.newestCourses || [];
      case 'popular': return data.mostPopularCourses || [];
      case 'topRated': return data.topRatedCourses || [];
      case 'free': return data.freeCourses || [];
      case 'discounted': return data.discountedCourses || [];
      default: return [];
    }
  };

  if (loading) {
    return (
      <section className="bg-white py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#49BBBD] mx-auto"></div>
        <p className="mt-4 text-slate-500 text-sm">Đang tải khóa học...</p>
      </section>
    );
  }

  if (!data) return null;

  const currentTabCourses = getCoursesByTab(activeTab);
  const icons = [<FaGlobe key="1" />, <FaPalette key="2" />, <FaUser key="3" />];

  const renderCourseShelf = (
    courses: CourseType[],
    selectedId: string,
    onSelectCourse: (courseId: string) => void,
    borderColorClass: string
  ) => {
    if (!courses || courses.length === 0) {
      return <p className="text-sm text-slate-400 py-4">Chưa có khóa học nào trong danh sách này.</p>;
    }

    return (
      <div className="relative pt-3 pb-6 px-2 overflow-x-auto">
        {/* ✅ KỆ GỖ - Dùng gradient màu gỗ */}
        <div 
          className="absolute bottom-2 left-0 right-0 h-11 rounded-full -z-0"
          style={{
            background: 'linear-gradient(180deg, #DEB887 0%, #D2A56E 30%, #C8955C 60%, #B8844F 100%)',
            boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 4px 8px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.15)',
            borderBottom: '3px solid #8B6914',
          }}
        />

        {/* Vân gỗ phụ */}
        <div 
          className="absolute bottom-2 left-0 right-0 h-11 rounded-full -z-0 opacity-30 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 20px,
              rgba(139, 105, 20, 0.3) 20px,
              rgba(139, 105, 20, 0.3) 22px,
              transparent 22px,
              transparent 40px,
              rgba(160, 120, 40, 0.2) 40px,
              rgba(160, 120, 40, 0.2) 43px,
              transparent 43px,
              transparent 60px
            )`,
          }}
        />

        <div className="relative z-10 flex items-center gap-3 min-w-max">
          {courses.map((course, courseIdx) => {
            const isSelected = String(course.id) === selectedId;
            const gradient = pillGradients[courseIdx % pillGradients.length];
            const rotationClass = pillRotations[courseIdx % pillRotations.length];

            if (isSelected) {
              return (
                <div
                  key={course.id}
                  className={`flex-shrink-0 w-[410px] sm:w-[450px] bg-white rounded-[28px] p-4 shadow-xl border-2 ${borderColorClass} flex gap-4 items-center transition-all duration-300 z-20 my-1`}
                >
                  <div className="w-[140px] h-[140px] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                    <img
                      src={
                        course.thumbnailUrl ||
                        'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-[140px] py-0.5">
                    <div>
                      <h4 className="font-bold text-[#2D3142] text-sm sm:text-base leading-snug line-clamp-2 break-words">
                        {course.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed break-words">
                        {course.description || 'Khám phá khóa học chất lượng cao.'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex text-amber-400 text-xs gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < Math.round(course.averageRating || 5)
                                  ? 'text-amber-400'
                                  : 'text-slate-200'
                              }
                            />
                          ))}
                        </div>
                        <span className="font-black text-[#2D3142] text-xs sm:text-sm">
                          {course.isFree ? (
                            <span className="text-green-500 font-bold">FREE</span>
                          ) : (
                            formatCurrency(course.price || 0)
                          )}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCourseClick(course.slug)}
                        className="w-full py-1.5 border border-[#49BBBD] text-[#49BBBD] hover:bg-[#49BBBD] hover:text-white rounded-xl text-[11px] font-extrabold transition-all text-center uppercase tracking-wider block cursor-pointer"
                      >
                        EXPLORE
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={course.id}
                onClick={() => onSelectCourse(String(course.id))}
                className={`flex-shrink-0 group relative w-[54px] sm:w-[60px] h-[210px] sm:h-[225px] rounded-[26px] p-1.5 bg-[#E5F9EB] border border-[#C5F3D1] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden ${rotationClass}`}
              >
                <div
                  className={`w-full h-full rounded-[18px] bg-gradient-to-b ${gradient} flex items-center justify-center p-1 text-white shadow-inner overflow-hidden`}
                >
                  <span
                    className="max-h-[170px] line-clamp-1 break-all font-bold text-[11px] sm:text-xs tracking-wide opacity-95 group-hover:opacity-100 transition text-ellipsis overflow-hidden"
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    {course.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3142] tracking-tight">
            Explore Course
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Khám phá các khóa học chất lượng cao.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { key: 'newest' as TabKey, label: 'Mới nhất', icon: <FaBookOpen /> },
              { key: 'popular' as TabKey, label: 'Phổ biến nhất', icon: <FaUsers /> },
              { key: 'topRated' as TabKey, label: 'Đánh giá cao', icon: <FaTrophy /> },
              { key: 'free' as TabKey, label: 'Miễn phí', icon: <FaGift /> },
              { key: 'discounted' as TabKey, label: 'Giảm giá hot', icon: <FaTag /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#49BBBD] text-white shadow-md shadow-[#49BBBD]/30 scale-105'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {renderCourseShelf(
            currentTabCourses,
            selectedTabCourseId,
            (id) => setSelectedTabCourseId(id),
            'border-[#53c7d6]'
          )}
        </div>

        <hr className="border-slate-200/80" />

        {data.coursesByCategory && data.coursesByCategory.length > 0 && (
          <div className="space-y-12">
            <h3 className="text-xl font-extrabold text-[#2D3142]">
              Khóa học theo danh mục
            </h3>

            {data.coursesByCategory.map((cat, catIdx) => {
              const selectedId =
                selectedCategoryCourses[cat.categoryId] || String(cat.courses[0]?.id || '');
              const borderColor = rowBorderColors[catIdx % rowBorderColors.length];
              const catIcon = icons[catIdx % icons.length];

              return (
                <div key={cat.categoryId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-extrabold text-[#2D3142] text-sm sm:text-base">
                      <span className="text-slate-600">{catIcon}</span>
                      <span>{cat.categoryName}</span>
                    </div>

                    <button
                      onClick={() => handleCategoryClick(cat.categorySlug)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#49BBBD] hover:underline uppercase tracking-wider cursor-pointer"
                    >
                      SEE ALL <FaArrowRight size={10} />
                    </button>
                  </div>

                  {renderCourseShelf(
                    cat.courses,
                    selectedId,
                    (id) =>
                      setSelectedCategoryCourses((prev) => ({
                        ...prev,
                        [cat.categoryId]: id,
                      })),
                    borderColor
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}