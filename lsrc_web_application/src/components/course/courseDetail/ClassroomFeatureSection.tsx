// src/pages/elearning/StudentPages/components/CourseDetail/ClassroomFeatureSection.tsx
import { FaPlay } from 'react-icons/fa';

export function ClassroomFeatureSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="relative inline-block">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2F327D] leading-snug sm:leading-tight">
              <span className="relative inline-block">
                Everything you can do in a physical classroom,
                <span className="absolute -top-2 -left-3 w-8 h-8 sm:w-10 sm:h-10 bg-[#55E6A5] rounded-full -z-10 opacity-80" />
              </span>{' '}
              <span className="text-[#49BBBD]">you can do with TOTC</span>
            </h2>
          </div>

          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl">
            TOTC's school management software helps traditional and online schools manage scheduling, attendance, payments, and virtual classrooms all in one secure cloud-based system.
          </p>

          <div>
            <a
              href="#"
              className="text-xs sm:text-sm text-slate-500 underline hover:text-[#49BBBD] transition font-medium underline-offset-4"
            >
              Learn more
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 relative flex justify-center">
          <div className="absolute -top-3 left-2 sm:left-4 w-28 h-28 bg-[#23BDEE] rounded-3xl -z-10" />
          <div className="absolute -bottom-3 right-2 sm:right-4 w-32 h-32 bg-[#33EFA0] rounded-3xl -z-10" />

          <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-100 aspect-[16/10]">
            <img
              src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800"
              alt="Classroom with TOTC"
              className="w-full h-full object-cover"
            />
            
            <button
              type="button"
              aria-label="Play video"
              className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-2xl flex items-center justify-center text-[#23BDEE] hover:scale-110 transition duration-300 cursor-pointer group"
            >
              <FaPlay className="ml-1 text-base sm:text-lg group-hover:text-[#49BBBD] transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}