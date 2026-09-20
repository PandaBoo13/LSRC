// import {
//   FaQuoteLeft,
//   FaStar,
// } from "react-icons/fa";

// export default function Testimonials() {
//   return (
//     <section className="bg-white py-24">
//       <div className="mx-auto max-w-7xl px-6">
//         <div className="grid items-center gap-16 lg:grid-cols-2">
//           {/* LEFT */}
//           <div>
//             <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-600">
//               TESTIMONIAL
//             </span>

//             <h2 className="mt-6 text-5xl font-bold text-slate-800">
//               What They Say?
//             </h2>

//             <p className="mt-6 text-lg leading-relaxed text-slate-500">
//               TOTC has helped thousands of students and
//               instructors improve their online learning
//               experience with powerful classroom tools.
//             </p>

//             <button className="mt-8 rounded-full border-2 border-cyan-500 px-8 py-4 font-semibold text-cyan-500 transition hover:bg-cyan-500 hover:text-white">
//               Write Your Assessment
//             </button>
//           </div>

//           {/* RIGHT */}
//           <div className="relative">
//             <div className="overflow-hidden rounded-[40px]">
//               <img
//                 src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200"
//                 alt="student"
//                 className="h-[550px] w-full object-cover"
//                 onError={(e) => {
//                   (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x550/06b6d4/ffffff?text=Student';
//                 }}
//               />
//             </div>

//             <div className="absolute bottom-10 left-10 right-10 rounded-3xl bg-white p-8 shadow-2xl">
//               <FaQuoteLeft className="mb-4 text-3xl text-cyan-500" />

//               <p className="text-slate-600">
//                 Thank you so much for your help. It's
//                 exactly what I've been looking for.
//                 TOTC has transformed my learning journey
//                 and made online classes much easier.
//               </p>

//               <div className="mt-6 flex items-center justify-between">
//                 <div>
//                   <h4 className="font-bold text-slate-800">
//                     Gloria Rose
//                   </h4>

//                   <p className="text-sm text-slate-500">
//                     Student
//                   </p>
//                 </div>

//                 <div className="flex gap-1 text-yellow-400">
//                   <FaStar />
//                   <FaStar />
//                   <FaStar />
//                   <FaStar />
//                   <FaStar />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import {
  FaQuoteLeft,
  FaStar,
} from "react-icons/fa";

export default function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-[#49BBBD]">
              ĐÁNH GIÁ HỌC VIÊN
            </span>

            <h2 className="mt-6 text-5xl font-bold text-slate-800">
              Học viên nói gì?
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-slate-500">
              Hàng nghìn học viên đã trải nghiệm chương trình 6+6 tại Birmingham Academy
              Singapore. Đây là những chia sẻ thực tế từ cựu học viên Việt Nam.
            </p>

            <button className="mt-8 rounded-full border-2 border-[#49BBBD] px-8 py-4 font-semibold text-[#49BBBD] transition hover:bg-[#49BBBD] hover:text-white">
              Viết đánh giá của bạn
            </button>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div className="overflow-hidden rounded-[40px]">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200"
                alt="student"
                className="h-[550px] w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x550/49BBBD/ffffff?text=Birmingham+Student';
                }}
              />
            </div>

            <div className="absolute bottom-10 left-10 right-10 rounded-3xl bg-white p-8 shadow-2xl">
              <FaQuoteLeft className="mb-4 text-3xl text-[#49BBBD]" />

              <p className="text-slate-600">
                "Điều mình thích nhất ở chương trình 6+6 là được học và
                thực tập ngay tại Singapore. Sau 6 tháng học, mình có cơ hội
                tiếp xúc môi trường làm việc quốc tế thật sự nên trưởng thành
                và tự tin hơn rất nhiều."
              </p>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">
                    Nguyễn Minh Anh
                  </h4>

                  <p className="text-sm text-slate-500">
                    Cựu học viên Diploma 6+6 - Birmingham Academy
                  </p>
                </div>

                <div className="flex gap-1 text-yellow-400">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}