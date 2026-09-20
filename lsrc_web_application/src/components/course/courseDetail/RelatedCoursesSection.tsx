// src/pages/elearning/StudentPages/components/CourseDetail/RelatedCoursesSection.tsx
import { Link, useNavigate } from 'react-router-dom';
import { FaThLarge, FaRegClock } from 'react-icons/fa';
import { getImageUrl } from '../../../utils/imageHelper';
import { formatCurrency } from '../../../lib/elearning';
import type { Course } from '../../../types/course.types';

interface RelatedCoursesSectionProps {
  relatedCourses: Course[];
  categorySlug?: string;
}

export function RelatedCoursesSection({ relatedCourses, categorySlug }: RelatedCoursesSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="bg-[#eef4f9]/60 py-16 border-t border-slate-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Related Courses</h2>
          <Link 
            to={categorySlug ? `/courses2?category=${categorySlug}` : '/courses2'} 
            className="text-xs sm:text-sm font-semibold text-[#49BBBD] hover:underline"
          >
            See all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedCourses.length > 0 ? (
            relatedCourses.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/courses/${c.slug}`)}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition duration-300 group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-slate-100">
                  <img
                    src={getImageUrl(c.thumbnailUrl)}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <FaThLarge size={11} />
                    {c.category?.name || 'General'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaRegClock size={11} />
                    {c.duration || 'N/A'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-2 leading-snug group-hover:text-[#49BBBD] transition line-clamp-2">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{c.description || ''}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700">
                    {c.instructor ? `${c.instructor.firstName} ${c.instructor.lastName}` : 'Instructor'}
                  </span>
                  <span className="text-sm font-extrabold text-[#49BBBD]">
                    {c.isFree ? 'Free' : formatCurrency(c.price)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-slate-400 py-8">No related courses found</p>
          )}
        </div>
      </div>
    </section>
  );
}