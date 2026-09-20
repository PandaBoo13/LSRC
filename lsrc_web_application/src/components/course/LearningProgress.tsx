// src/components/progress/LearningProgress.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseProgressCard } from '../elearning/progress/CourseProgressCard';
import { courseProgressService } from '../../service/courseProgressService';
import type { CourseProgressResponse } from '../../service/progress/progress.types';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PER_PAGE = 3;

export default function LearningProgress() {
  const navigate = useNavigate();
  const [progressList, setProgressList] = useState<CourseProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    (async () => {
      try { setLoading(true); const data = await courseProgressService.getMyProgresses(); setProgressList(data || []); }
      catch {} finally { setLoading(false); }
    })();
  }, []);

  const totalPages = Math.ceil(progressList.length / PER_PAGE);
  const paged = progressList.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <section className="pb-12 pt-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="overflow-hidden rounded-[36px] bg-[#EEF5FA] p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Welcome back, ready for your next lesson?</h1>
              <p className="mt-2 text-sm text-slate-500">Tiếp tục hành trình học tập và hoàn thành các khóa học của bạn.</p>
            </div>
            <button onClick={() => navigate('/my-progress')} className="self-start md:self-auto rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
              View History
            </button>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1,2,3].map(n => <div key={n} className="aspect-[1.12/1] bg-white/60 animate-pulse rounded-3xl" />)}
            </div>
          ) : progressList.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paged.map(item => <CourseProgressCard key={item.id || item.courseId} progress={item} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-3 mt-6">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                    className="w-10 h-10 rounded-lg bg-teal-100/60 hover:bg-teal-200 text-teal-600 flex items-center justify-center disabled:opacity-40"><FaChevronLeft size={12} /></button>
                  <span className="flex items-center text-sm text-slate-500">{page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}
                    className="w-10 h-10 rounded-lg bg-teal-400 hover:bg-teal-500 text-white flex items-center justify-center shadow-md disabled:opacity-40"><FaChevronRight size={12} /></button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">Chưa có khóa học nào đang học</p>
              <button onClick={() => navigate('/courses')} className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600 transition">
                Khám phá khóa học
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}