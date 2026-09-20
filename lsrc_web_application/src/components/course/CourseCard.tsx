// src/components/course/CourseCard.tsx
import { Link } from 'react-router-dom';
import { FaThLarge, FaRegClock } from 'react-icons/fa';
import { useCurrency } from '../../context/CurrencyContext';
import { getImageUrl } from '../../utils/imageHelper';

// Interface khớp với dữ liệu khóa học trả về từ API
export interface Course {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  image?: string;
  category?: string | { name: string };
  duration?: string;
  price: number;
  oldPrice?: number;
  instructor?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  // Dùng currency context
  const { convertFormatted } = useCurrency();

  // Xử lý fallback cho các dữ liệu động từ API
  const categoryName =
    typeof course.category === 'object'
      ? course.category?.name
      : course.category || 'Design';

  const instructorName =
    course.instructor?.name ||
    (course.instructor?.firstName
      ? `${course.instructor.firstName} ${course.instructor.lastName || ''}`
      : 'Lina');

  const instructorAvatar =
    course.instructor?.avatarUrl || 'https://i.pravatar.cc/100?img=32';

  const thumbnail =
    getImageUrl(course.thumbnailUrl || course.image) || 
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500';

  const durationText = course.duration || '3 Month';

  const descriptionText =
    course.description ||
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor';

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white p-4 border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Thumbnail Image */}
      <div className="relative mb-4 overflow-hidden rounded-2xl aspect-[4/3] bg-slate-100">
        <img
          src={thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500';
          }}
        />
      </div>

      {/* Category & Duration Row */}
      <div className="mb-2.5 flex items-center justify-between text-xs font-medium text-slate-400">
        <div className="flex items-center gap-1.5">
          <FaThLarge className="text-slate-300" size={12} />
          <span>{categoryName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaRegClock className="text-slate-300" size={12} />
          <span>{durationText}</span>
        </div>
      </div>

      {/* Course Title */}
      <h3 className="mb-2 text-base font-bold text-[#2F327D] line-clamp-2 leading-snug transition-colors group-hover:text-[#49BBBD]">
        {course.title}
      </h3>

      {/* Course Description */}
      <p className="mb-4 text-xs leading-relaxed text-slate-400 line-clamp-2">
        {descriptionText}
      </p>

      {/* ✅ Footer: Instructor + Price */}
      <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
        {/* Instructor Row */}
        <div className="flex items-center gap-2">
          <img
            src={instructorAvatar}
            alt={instructorName}
            className="h-6 w-6 rounded-full object-cover border border-slate-100"
          />
          <span className="text-xs font-bold text-slate-700">
            {instructorName}
          </span>
        </div>

        {/* ✅ Price Row - Giá hiện tại trên, giá gốc dưới */}
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            {/* Giá hiện tại */}
            <span className="block text-lg font-extrabold text-[#49BBBD]">
              {convertFormatted(course.price)}
            </span>
            
            {/* Giá gốc - nằm dưới giá hiện tại */}
            {course.oldPrice && course.oldPrice > course.price && (
              <span className="block text-xs font-medium text-slate-300 line-through">
                {convertFormatted(course.oldPrice)}
              </span>
            )}
          </div>
          
          {/* CTA hover */}
          <span className="text-xs font-semibold text-[#49BBBD] opacity-0 group-hover:opacity-100 transition-opacity">
            Xem chi tiết →
          </span>
        </div>
      </div>
    </Link>
  );
}