// src/pages/elearning/StudentPages/components/CourseDetail/CourseReviewsTab.tsx
import { FaStar, FaRegClock } from 'react-icons/fa';

interface CourseReviewsTabProps {
  averageRating?: number;
}

export function CourseReviewsTab({ averageRating }: CourseReviewsTabProps) {
  // Mock dữ liệu phân bổ % đánh giá theo sao
  const starDistributions = [
    { label: '5 stars', percent: '80%' },
    { label: '4 stars', percent: '15%' },
    { label: '3 stars', percent: '5%' },
    { label: '2 stars', percent: '0%' },
    { label: '1 star', percent: '0%' },
  ];

  return (
    <div className="bg-[#EBF3FE] rounded-3xl p-6 sm:p-8">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Student Reviews</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center mb-8">
        <div className="sm:col-span-5 bg-white rounded-2xl p-6 text-center shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-3xl font-extrabold text-slate-800 mb-1">
            {averageRating ? averageRating.toFixed(1) : '4.5'}
          </h3>
          <div className="flex text-amber-400 gap-1 my-1">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} size={15} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Average Rating</p>
        </div>

        <div className="sm:col-span-7 space-y-2">
          {starDistributions.map((star, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="w-12">{star.label}</span>
              <div className="flex-1 bg-slate-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#49BBBD] h-full rounded-full"
                  style={{ width: star.percent }}
                />
              </div>
              <span className="w-8 text-right text-slate-400">{star.percent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Review items */}
      <div className="space-y-4">
        <div className="border-t border-slate-200/70 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#49BBBD]/20 text-[#49BBBD] font-bold flex items-center justify-center text-xs">
                ST
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">TOTC Student</h4>
                <div className="flex text-amber-400 text-xs gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <FaRegClock size={12} />
              <span>Just now</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Detailed and practical course. The structured knowledge is smooth and easy to follow.
          </p>
        </div>
      </div>
    </div>
  );
}