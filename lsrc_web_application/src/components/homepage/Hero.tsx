

// src/components/homepage/Hero.tsx
import {
  FaBook,
  FaPlay,
  FaRegCalendarAlt,
  FaPlane,
  FaGraduationCap,
  FaStar,
} from "react-icons/fa";

import heroGirl from "../../assets/hero-girl.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#49BBBD]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid min-h-[850px] items-center lg:grid-cols-2">
          {/* LEFT */}
          <div className="pt-32 lg:pt-20">
            <h1 className="max-w-xl text-5xl font-extrabold leading-tight text-white lg:text-6xl">
              <span className="text-orange-400">
                Học tập
              </span>{" "}
              Online dễ dàng hơn bao giờ hết
            </h1>

            <p className="mt-6 max-w-md text-lg text-white/80">
              LSRC là nền tảng giáo dục tương tác hàng đầu,
              kết nối học viên với giảng viên và cơ hội du học
              Singapore cùng Birmingham Academy.
            </p>

            <div className="mt-10 flex items-center gap-8">
              <button className="rounded-full bg-white/30 px-8 py-4 font-medium text-white backdrop-blur hover:bg-white/40 transition cursor-pointer">
                Đăng ký miễn phí
              </button>

              <button className="flex items-center gap-4 cursor-pointer">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#49BBBD] shadow-lg">
                  <FaPlay />
                </div>

                <span className="text-white">
                  Xem cách hoạt động
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative flex items-center justify-center">
            <img
              src={heroGirl}
              alt="student"
              className="relative z-10 w-[500px] lg:w-[600px]"
            />

            {/* Card 1: Assisted Student */}
            <div className="absolute left-0 top-44 z-20 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-xl">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-500">
                <FaGraduationCap />
              </div>

              <div>
                <h4 className="font-bold">
                  10K+
                </h4>

                <p className="text-sm text-slate-500">
                  Học viên đã tham gia
                </p>
              </div>
            </div>

            {/* Card 2: Admission */}
            <div className="absolute right-0 top-72 z-20 rounded-2xl bg-white p-4 shadow-xl">
              <div className="flex gap-3">
                <div className="rounded-xl bg-orange-100 p-3 text-orange-500">
                  <FaRegCalendarAlt />
                </div>

                <div>
                  <h4 className="font-semibold">
                    Chúc mừng!
                  </h4>

                  <p className="text-sm text-slate-500">
                    Hồ sơ nhập học đã hoàn tất
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Birmingham Academy */}
            <div className="absolute bottom-48 left-4 z-20 rounded-2xl bg-white p-4 shadow-xl max-w-[220px]">
              <div className="flex gap-3">
                <div className="rounded-xl bg-[#49BBBD]/10 p-3 text-[#49BBBD]">
                  <FaPlane />
                </div>

                <div>
                  <h4 className="font-semibold text-sm">
                    Du học Singapore
                  </h4>

                  <p className="text-xs text-slate-500">
                    Birmingham Academy
                  </p>

                  <button className="mt-2 rounded-full bg-[#F59E0B] px-4 py-1 text-xs text-white cursor-pointer">
                    Tìm hiểu ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Icon: Star Rating */}
            <div className="absolute right-8 top-40 z-20 flex h-14 w-14 items-center justify-center rounded-xl bg-[#F59E0B] text-white shadow-lg">
              <FaStar />
            </div>
          </div>
        </div>
      </div>

      {/* CURVE */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          viewBox="0 0 1440 220"
          className="h-[180px] w-full"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff"
            d="M0,96L80,112C160,128,320,160,480,176C640,192,800,192,960,181.3C1120,171,1280,149,1360,138.7L1440,128L1440,320L0,320Z"
          />
        </svg>
      </div>
    </section>
  );
}