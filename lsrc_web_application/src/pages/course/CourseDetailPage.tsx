// src/pages/elearning/StudentPages/CourseDetailPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

import { PublicLayout } from '../../components/elearning/layout/PublicLayout';
import { Toast, type ToastMessage } from '../../components/elearning/ui/Toast';

import { getCourseBySlug, getAllCourses } from '../../service/courseService';
import { addToWishlist, removeFromWishlist, checkWishlist } from '../../service/wishlistService';
import { getEnrolledCourses, getMyOrders, createOrder } from '../../service/orderService';
import type { Course } from '../../types/course.types';

// Sub-components
import { CourseHeroBanner } from '../../components/course/courseDetail/CourseHeroBanner';
import { CourseTabNav, type CourseTabType } from '../../components/course/courseDetail/CourseTabNav';
import { CourseOverviewTab } from '../../components/course/courseDetail/CourseOverviewTab';
import { CourseOutcomesTab } from '../../components/course/courseDetail/CourseOutcomesTab';
import { CoursePrerequisitesTab } from '../../components/course/courseDetail/CoursePrerequisitesTab';
import { CourseReviewsTab } from '../../components/course/courseDetail/CourseReviewsTab';
import { CourseSidebarCard } from '../../components/course/courseDetail/CourseSidebarCard';
import { RelatedCoursesSection } from '../../components/course/courseDetail/RelatedCoursesSection';
import { ClassroomFeatureSection } from '../../components/course/courseDetail/ClassroomFeatureSection';
import { EducationDealsSection } from '../../components/course/courseDetail/EducationDealsSection';

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // States
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [buyingNow, setBuyingNow] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<CourseTabType>('overview');
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);

  // Enrollment states
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const fromHomepage = searchParams.get('from') === 'homepage';
  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const getErrorMessage = (err: any, fallback: string) => {
    return err?.response?.data?.message || err?.message || fallback;
  };

  /** ✅ Xác định course có phải miễn phí không (dựa trên isFree HOẶC price = 0) */
  const isFreeCourse = useMemo(() => {
    if (!course) return false;
    return course.isFree === true || (course.price ?? 0) === 0;
  }, [course]);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (slug) fetchCourse(slug); }, [slug]);
  
  useEffect(() => { 
    if (course) {
      checkWishlistStatus();
      checkEnrollmentAndCartStatus();
    } 
  }, [course?.id]);

  useEffect(() => {
    if (course?.category?.id) {
      getAllCourses({
        categoryId: course.category.id,
        status: 'PUBLISHED',
        size: 5,
        sortBy: 'publishedAt',
        sortDirection: 'DESC'
      })
      .then(res => {
        const filtered = (res.content || [])
          .filter(c => c.id !== course.id)
          .slice(0, 4);
        setRelatedCourses(filtered);
      })
      .catch(() => {});
    }
  }, [course?.id, course?.category?.id]);

  const fetchCourse = async (slugParam: string) => {
    setLoading(true); 
    setError('');
    try { 
      const data = await getCourseBySlug(slugParam);
      setCourse(data); 
    } catch (err: any) { 
      setError(getErrorMessage(err, 'Course not found')); 
    } finally { 
      setLoading(false); 
    }
  };

  const checkWishlistStatus = async () => {
    if (!course) return;
    try { 
      const result = await checkWishlist(course.id);
      setInWishlist(result); 
    } catch {}
  };

  // ✅ GỘP: Check cả enrollment và cart status
  const checkEnrollmentAndCartStatus = async () => {
    if (!course) return;
    try {
      // 1. Kiểm tra đã đăng ký (PAID — bao gồm cả khóa miễn phí vì đã PAID + ENROLLED)
      const enrolledCourses = await getEnrolledCourses();
      const foundEnrolled = enrolledCourses.find(item => item.courseId === course.id);
      
      if (foundEnrolled) {
        setIsEnrolled(true);
        setIsWaiting(false);
        setIsInCart(false);
        return;
      }

      // 2. Kiểm tra trong order PENDING (giỏ hàng)
      const myOrders = await getMyOrders({ page: 0, size: 10, sortBy: 'createdAt', sortDirection: 'DESC' });
      const cartOrder = (myOrders.content || []).find(o => o.status === 'PENDING');
      
      if (cartOrder && cartOrder.items) {
        const foundInCart = cartOrder.items.some(item => item.courseId === course.id);
        
        if (foundInCart) {
          setIsEnrolled(false);
          
          if (course.courseType === 'LIVE') {
            setIsWaiting(true);
            setIsInCart(false);
          } else {
            setIsWaiting(false);
            setIsInCart(true);
          }
          return;
        }
      }

      // 3. Chưa mua, chưa trong giỏ
      setIsEnrolled(false);
      setIsWaiting(false);
      setIsInCart(false);
    } catch {
      setIsEnrolled(false);
      setIsWaiting(false);
      setIsInCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!course) return;
    const prev = inWishlist; 
    setInWishlist(!prev); 
    setTogglingWishlist(true);
    try {
      if (prev) { 
        await removeFromWishlist(course.id);
        showToast('Đã xóa khỏi yêu thích', 'success'); 
      } else { 
        await addToWishlist(course.id);
        showToast('Đã thêm vào yêu thích', 'success'); 
      }
    } catch (err: any) { 
      setInWishlist(prev); 
      showToast(getErrorMessage(err, 'Thao tác thất bại'), 'error'); 
    } finally { 
      setTogglingWishlist(false); 
    }
  };

  const handleBack = () => { 
    fromHomepage ? navigate('/#courses') : navigate(-1); 
  };

  /**
   * ✅ Handle Buy Now:
   * - Nếu khóa MIỄN PHÍ → gọi createOrder trực tiếp, backend trả về order PAID + ENROLLED → enroll ngay.
   * - Nếu khóa CÓ PHÍ → điều hướng sang trang checkout như cũ.
   */
  const handleBuyNow = async () => {
    if (!course) return;

    // ============ NHÁNH 1: KHÓA MIỄN PHÍ ============
    if (isFreeCourse) {
      try {
        setBuyingNow(true);
        const result = await createOrder([course.id]);

        if (result.isFreeOrder) {
          // Backend đã PAID + ENROLLED → cập nhật state & chuyển sang trang học
          setIsEnrolled(true);
          setIsWaiting(false);
          setIsInCart(false);
          showToast('Đăng ký khóa học miễn phí thành công!', 'success');
          setTimeout(() => navigate(`/my-progress/${course.id}`), 1200);
          return;
        }

        // Fallback: backend chưa kịp cập nhật → vẫn đi checkout như bình thường
        navigate(`/checkout?courses=${course.id}`);
      } catch (err: any) {
        showToast(getErrorMessage(err, 'Không thể đăng ký khóa học'), 'error');
      } finally {
        setBuyingNow(false);
      }
      return;
    }

    // ============ NHÁNH 2: KHÓA CÓ PHÍ ============
    try {
      setBuyingNow(true);
      navigate(`/checkout?courses=${course.id}`);
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Không thể xử lý mua hàng'), 'error');
    } finally {
      setBuyingNow(false);
    }
  };

  /**
   * ✅ Handle Add to Cart:
   * - Nếu khóa MIỄN PHÍ → backend trả về order PAID + ENROLLED → enroll ngay, KHÔNG đưa vào giỏ.
   * - Nếu khóa CÓ PHÍ → tạo order PENDING, cập nhật state giỏ hàng/waiting như cũ.
   */
  const handleAddToCart = async () => {
    if (!course) return;

    if (isInCart) {
      showToast('Khóa học đã có trong giỏ hàng', 'error');
      return;
    }
    if (isWaiting) {
      showToast('Khóa học đang chờ khai giảng', 'error');
      return;
    }
    
    try {
      setAddingToCart(true);
      const result = await createOrder([course.id]);

      // ✅ Nhánh khóa miễn phí: backend đã PAID + ENROLLED sẵn
      if (result.isFreeOrder) {
        setIsEnrolled(true);
        setIsWaiting(false);
        setIsInCart(false);
        showToast('Đăng ký khóa học miễn phí thành công!', 'success');
        setTimeout(() => navigate(`/my-progress/${course.id}`), 1200);
        return;
      }

      // ✅ Khóa có phí → cập nhật trạng thái giỏ hàng/waiting như cũ
      if (course.courseType === 'LIVE') {
        setIsWaiting(true);
        setIsInCart(false);
      } else {
        setIsInCart(true);
        setIsWaiting(false);
      }
      
      showToast('Đã thêm vào giỏ hàng', 'success');
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Không thể thêm vào giỏ hàng'), 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  const handleGoToLearning = () => {
    if (!course) return;
    navigate(`/my-progress/${course.id}`);
  };

  const outcomesList = useMemo<string[]>(() => {
    if (!course?.outcomes) return [];
    try {
      return typeof course.outcomes === 'string' ? JSON.parse(course.outcomes) : course.outcomes;
    } catch {
      return [];
    }
  }, [course?.outcomes]);

  if (loading) return (
    <PublicLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
      </div>
    </PublicLayout>
  );

  if (error || !course) return (
    <PublicLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-500">{error || 'Course not found'}</h2>
      </div>
    </PublicLayout>
  );

  const isLive = course.courseType === 'LIVE';
  const instructorName = course.instructor 
    ? `${course.instructor.firstName} ${course.instructor.lastName}`.trim() 
    : 'TOTC Instructor';

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PublicLayout className="min-h-screen bg-white">
        
        <CourseHeroBanner
          thumbnailUrl={course.thumbnailUrl}
          title={course.title}
          onBack={handleBack}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

            <div className="lg:col-span-7 xl:col-span-8 pt-8 space-y-6">
              <CourseTabNav activeTab={activeTab} onChangeTab={setActiveTab} />
              {activeTab === 'overview' && <CourseOverviewTab course={course} />}
              {activeTab === 'outcomes' && <CourseOutcomesTab outcomes={outcomesList} />}
              {activeTab === 'prerequisites' && <CoursePrerequisitesTab prerequisite={course.prerequisite} />}
              {activeTab === 'reviews' && <CourseReviewsTab averageRating={course.averageRating} />}
            </div>

            <div className="lg:col-span-5 xl:col-span-4 lg:-mt-72 relative z-20">
              <CourseSidebarCard
                course={course}
                isLive={isLive}
                instructorName={instructorName}
                buyingNow={buyingNow}
                togglingWishlist={togglingWishlist}
                inWishlist={inWishlist}
                isEnrolled={isEnrolled}
                isWaiting={isWaiting}
                isInCart={isInCart}
                addingToCart={addingToCart}
                onBuyNow={handleBuyNow}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onGoToLearning={handleGoToLearning}
                onGoToCart={handleGoToCart}
              />
            </div>

          </div>
        </div>

        <RelatedCoursesSection
          relatedCourses={relatedCourses}
          categorySlug={course.category?.slug}
        />

        <ClassroomFeatureSection />
        <EducationDealsSection />

      </PublicLayout>
    </>
  );
}