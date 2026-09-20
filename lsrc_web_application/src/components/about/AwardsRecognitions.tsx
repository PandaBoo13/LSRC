// components/AwardsRecognitions.tsx

const certificates = [
  {
    id: 1,
    title: 'EduTrust Certificate',
    image: '/images/certi-3.png',
  },
  {
    id: 2,
    title: 'Registration PEI',
    image: '/images/certi-2.png',
  },
  {
    id: 3,
    title: 'Singapore Business Federation',
    image: '/images/certi-1.png',
  },
  {
    id: 4,
    title: 'Fee Protection Scheme (FPS)',
    image: '/images/Untitled-design-2 (1).png',
  },
];

export default function AwardsRecognitions() {
  return (
    <section className="my-16 overflow-hidden rounded-3xl border border-slate-100 bg-[#f7f7f8] py-16">
      {/* HEADER */}
      <div className="mx-auto mb-12 max-w-4xl px-6 text-center">
        <div className="relative inline-block">
          <h2 className="text-3xl font-extrabold text-[#2F327D] sm:text-4xl">
            Awards &amp; Recognitions
          </h2>
          <svg
            className="absolute -right-8 -top-6 h-8 w-8 text-rose-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M12 3v3M18.36 5.64l-2.12 2.12M21 12h-3" />
          </svg>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
          Our awards and recognitions reflect Birmingham Academy’s unwavering commitment to academic excellence, institutional integrity, and student success.
        </p>
      </div>

      {/* BĂNG TRUYỀN KHUNG TRANH */}
      <div className="relative w-full pt-4 pb-12">
        {/* Kệ gỗ phía dưới */}
        <div className="absolute bottom-6 left-0 right-0 z-0 h-4 bg-gradient-to-b from-[#b89772] to-[#8c6d48] shadow-md" />

        {/* Marquee Container */}
        <div className="flex w-full select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex shrink-0 animate-[marquee_35s_linear_infinite] items-end gap-10 pr-10 hover:[animation-play-state:paused]">
            {[...certificates, ...certificates, ...certificates].map((cert, index) => (
              <div
                key={`${cert.id}-${index}`}
                className="group relative z-10 flex-none transition-transform duration-300 hover:-translate-y-3"
              >
                {/* Khung tranh */}
                <div className="relative rounded-sm border-4 border-[#cfbaa3] bg-[#e8ded1] p-3 shadow-2xl ring-1 ring-black/10">
                  <div className="border border-slate-300/80 bg-white p-2 shadow-inner">
                    <img
                      src={cert.image}
                      alt={cert.title}
                      className="h-[280px] w-[200px] rounded-sm object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Bóng đổ xuống kệ gỗ */}
                <div className="mx-auto mt-1 h-3 w-[90%] rounded-full bg-black/20 blur-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}