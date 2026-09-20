// src/pages/elearning/StudentPages/components/CourseDetail/EducationDealsSection.tsx
import { Link } from 'react-router-dom';

export function EducationDealsSection() {
  const mockDeals = [1, 2, 3];

  return (
    <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
          Top Education offers and deals are listed here
        </h2>
        <Link to="/courses" className="text-xs sm:text-sm font-semibold text-[#49BBBD] hover:underline">
          See all
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {mockDeals.map((item) => (
          <div
            key={item}
            className="relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group h-[320px] sm:h-[360px] flex flex-col justify-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800"
              alt="Instructor offer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent" />

            <div className="absolute top-6 left-6 bg-[#E15B5B] text-white font-extrabold text-sm px-4 py-2 rounded-2xl shadow-md">
              50%
            </div>

            <div className="relative z-10 space-y-2">
              <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-wider uppercase">
                FOR INSTRUCTORS
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed line-clamp-3 font-normal opacity-90">
                TOTC's school management software helps traditional and online schools manage scheduling.
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}