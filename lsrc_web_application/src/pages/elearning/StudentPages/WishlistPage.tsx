// src/pages/student/WishlistPage.tsx
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { FaHeart, FaSpinner } from 'react-icons/fa';

import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { Panel } from '../../../components/elearning/ui/Panel';
import { studentNav } from '../../../data/elearning';
// ✅ Sửa import
import { getMyWishlist } from '../../../service/wishlistService';
import { getImageUrl } from '../../../utils/imageHelper';
import type { WishlistResponse } from '../../../types/wishlist.types';
import CourseCard, { type Course } from '../../../components/course/CourseCard';

export function WishlistPage() {
  const [items, setItems] = useState<WishlistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadWishlist();
  }, [page]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      // ✅ Đổi wishlistService.getWishlist → getMyWishlist
      const data = await getMyWishlist({ page, size: 10 });
      setItems(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell role="Student" title="Wishlist" subtitle="Đang tải..." navItems={studentNav}>
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="Student"
      title="Wishlist"
      subtitle="Courses you saved for later. Enroll when you're ready to start learning."
      navItems={studentNav}
    >
      {items.length === 0 ? (
        <Panel className="rounded-3xl py-16 text-center shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <FaHeart className="mx-auto text-5xl text-slate-300" />
          <p className="mt-4 text-lg font-bold text-slate-900">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-slate-500">Save courses you like to find them easily later.</p>
          <Link
            to="/courses"
            className="mt-6 inline-block rounded-2xl bg-[#49BBBD] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#49BBBD]/20 transition hover:bg-[#3fa2a4]"
          >
            Browse Courses
          </Link>
        </Panel>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {items.map((item) => {
  const courseData: Course = {
    id: String(item.courseId), // ✅ Course.id là string, nên chuyển number → string
    slug: item.courseSlug,
    title: item.courseTitle,
    thumbnailUrl: getImageUrl(item.courseThumbnailUrl),
    price: item.coursePrice || 0, // ✅ null → 0
    oldPrice: item.courseOldPrice || undefined, // ✅ null → undefined
    category: 'General',
    instructor: {
      name: 'Instructor',
    },
  };

  return <CourseCard key={item.id} course={courseData} />;
})}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    page === i
                      ? "bg-[#49BBBD] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}