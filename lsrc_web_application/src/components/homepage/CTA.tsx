// import { FaArrowRight } from "react-icons/fa";

// export default function CTA() {
//   return (
//     <section className="relative overflow-hidden bg-cyan-500 py-24">
//       {/* Background Shapes */}
//       <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
//       <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

//       <div className="relative mx-auto max-w-5xl px-6 text-center">
//         <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-medium text-white">
//           GET STARTED
//         </span>

//         <h2 className="mt-8 text-4xl font-bold text-white md:text-5xl">
//           Start learning today
//         </h2>

//         <p className="mx-auto mt-6 max-w-2xl text-lg text-cyan-100">
//           Join thousands of students and instructors already
//           using TOTC to improve learning experiences around
//           the world.
//         </p>

//         <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
//           <button className="rounded-full bg-white px-8 py-4 font-semibold text-cyan-600 transition hover:scale-105">
//             Join For Free
//           </button>

//           <button className="flex items-center justify-center gap-3 rounded-full border border-white px-8 py-4 text-white transition hover:bg-white hover:text-cyan-600">
//             Explore Courses
//             <FaArrowRight />
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

// src/components/homepage/CTA.tsx
import { FaArrowRight, FaPlane } from "react-icons/fa";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#49BBBD] py-24">
      {/* Background Shapes */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-[#F59E0B]/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <span className="rounded-full bg-white/20 px-5 py-2 text-sm font-medium text-white">
          BẮT ĐẦU NGAY HÔM NAY
        </span>

        <h2 className="mt-8 text-4xl font-bold text-white md:text-5xl">
          Sẵn sàng cho hành trình học tập toàn cầu?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-cyan-100">
          Tham gia cùng hàng nghìn học viên và giảng viên trên LSRC.
          Đặc biệt, khám phá chương trình du học Singapore 6+6
          cùng Birmingham Academy với thực tập có lương.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="rounded-full bg-white px-8 py-4 font-semibold text-[#49BBBD] transition hover:scale-105 cursor-pointer">
            Đăng ký miễn phí
          </button>

          <button className="flex items-center justify-center gap-3 rounded-full border border-white px-8 py-4 text-white transition hover:bg-white hover:text-[#49BBBD] cursor-pointer">
            Khám phá khóa học
            <FaArrowRight />
          </button>
        </div>

        {/* Birmingham Academy Highlight */}
        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
          <div className="flex items-center justify-center gap-3">
            <FaPlane className="text-white text-xl" />
            <p className="text-white text-sm sm:text-base font-medium">
              Đối tác chiến lược: <strong>Birmingham Academy Singapore</strong>
            </p>
          </div>
          <p className="mt-2 text-cyan-100 text-xs sm:text-sm">
            Học bổng 40% • Thực tập có lương 1.100-1.800 SGD/tháng • 85% S-PASS
          </p>
        </div>
      </div>
    </section>
  );
}