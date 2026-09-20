// src/pages/elearning/StudentPages/MyCoursesPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { EnrollmentCard } from "../../../components/elearning/enrollment/EnrollmentCard";
import { studentNav } from "../../../data/elearning";
import { getEnrolledCourses, getActiveCourses, getCompletedCourses } from "../../../service/orderService";
import { getResourcesByCourse } from "../../../service/courseResourceService";
import { getCourseProgress, getResourceProgressByCourse } from "../../../service/progress/progressService";
import type { OrderItemResponse } from "../../../types/order.types";
import type { CourseResource } from "../../../types/courseResource.types";
import type { ProgressResponse } from "../../../service/progress/progress.types";

export function MyCoursesPage() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<OrderItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [initialized, setInitialized] = useState(false);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      let data: OrderItemResponse[] = [];

      if (activeFilter === "In Progress") {
        data = await getActiveCourses();
      } else if (activeFilter === "Completed") {
        data = await getCompletedCourses();
      } else {
        data = await getEnrolledCourses();
      }

      if (searchTerm.trim()) {
        data = data.filter(item => 
          item.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // ✅ Lấy tiến độ thực tế từ progress cho mỗi enrollment
      const enrichedData = await Promise.all(
        data.map(async (item) => {
          try {
            const progress = await getCourseProgress(item.courseId);
            return {
              ...item,
              progress: Number(progress?.progressPercentage) || 0,
              progressStatus: progress?.status || item.status,
              completedItems: progress?.completedItems || 0,
              totalItems: progress?.totalItems || 0,
            };
          } catch {
            return item;
          }
        })
      );

      setEnrollments(enrichedData);
    } catch (error) {
      console.error("Failed to fetch my courses:", error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
    setInitialized(true);
  }, [activeFilter]);

  useEffect(() => {
    if (!initialized) return;
    const timer = setTimeout(() => {
      fetchMyCourses();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCourseClick = (enrollment: OrderItemResponse) => {
    navigate(`/my-progress/${enrollment.courseId}`);
  };

  const handleViewProgress = (e: React.MouseEvent, enrollment: OrderItemResponse) => {
    e.stopPropagation();
    navigate(`/my-progress/${enrollment.courseId}`);
  };

  const handleStartLearning = useCallback(async (e: React.MouseEvent, enrollment: OrderItemResponse) => {
    e.stopPropagation();
    try {
      // ✅ Lấy VIDEO lessons trực tiếp từ getResourcesByCourse
      const allResources = await getResourcesByCourse(enrollment.courseId);
      const videoLessons: CourseResource[] = allResources
        .filter(r => r.resourceType === 'VIDEO')
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

      if (videoLessons.length === 0) {
        navigate(`/my-progress/${enrollment.courseId}`);
        return;
      }

      try {
        // ✅ Lấy progress để tìm lesson chưa hoàn thành
        const allProgress = await getResourceProgressByCourse(enrollment.courseId);
        const completedLessonIds = new Set<number>(
          allProgress
            .filter((p: ProgressResponse) => p.status === 'COMPLETED')
            .map((p: ProgressResponse) => p.referenceId)
            .filter((id): id is number => id !== null && id !== undefined)
        );

        // ✅ Tìm lesson chưa hoàn thành đầu tiên
        const nextLesson = videoLessons.find(lesson => !completedLessonIds.has(lesson.id)) || videoLessons[0];
        
        // ✅ Navigate đến LearningRoomPage
        navigate(`/learn/${enrollment.courseId}/${nextLesson.id}`);
      } catch {
        // Nếu không lấy được progress, vào lesson đầu tiên
        navigate(`/learn/${enrollment.courseId}/${videoLessons[0].id}`);
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      navigate(`/my-progress/${enrollment.courseId}`);
    }
  }, [navigate]);

  return (
    <DashboardShell
      role="Student"
      title="My Courses"
      subtitle="All enrolled courses and learning progress in one place."
      navItems={studentNav}
    >
      {/* Toolbar */}
      <div className="mb-8 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search enrolled courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#49BBBD] focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "In Progress", "Completed"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveFilter(item)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  activeFilter === item
                    ? "bg-[#49BBBD] text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
        </div>
      ) : enrollments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              onClick={() => handleCourseClick(enrollment)}
              className="cursor-pointer"
            >
              <EnrollmentCard 
                enrollment={enrollment}
                onStartLearning={(e) => handleStartLearning(e, enrollment)}
                onViewProgress={(e) => handleViewProgress(e, enrollment)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-slate-400">No courses found</p>
          <p className="text-sm text-slate-400 mt-1">
            {searchTerm || activeFilter !== "All"
              ? "Try adjusting your search or filter"
              : "Enroll in a course to get started"}
          </p>
        </div>
      )}
    </DashboardShell>
  );
}