export interface TeamMember {
  name: string;
  degree: string;
  image: string;
  badgeBg?: string;
}

const members: TeamMember[] = [
  {
    name: 'Mr. Chong Chee Song (Member)',
    degree:
      'Master of Business Administration, Columbia Southern University Alabama',
    image:
      '/images/mr-chong.png',
  },
  {
    name: 'Dr Abdul Rashid (Member)',
    degree: 'Doctorate in Education, Edith Cowan University',
    image:
      '/images/Abdul.png',
  },
  {
    name: 'Mr. Ng Joon Peng (Chairman)',
    degree:
      'Master of Business Administration, Central Queensland University',
    image:
      '/images/Joon.png',
  },
  {
    name: 'Dr Huang Qiang (Member)',
    degree:
      'Doctor of Philosophy in Management, Renmin University of China',
    image:
      '/images/john.png',
  },
  {
    name: 'Dr Mamata Bhandar (Member)',
    degree: 'Doctor of Philosophy, National University of Singapore',
    image:
      '/images/Mamata.png',
    badgeBg: 'bg-[#c48b8b] text-white',
  },
  {
    name: 'Dr Rudolph Jurgen (Member)',
    degree: 'Doctor of Philosophy, Friedrich-Alexander University',
    image:
      '/images/Dr.-Jurgen-Rudolph.jpg',
  },
];

export default function TeamSection() {
  return (
    <section className="overflow-hidden bg-white py-20">
      {/* CSS Keyframes cho hiệu ứng trượt mượt mà */}
      <style>{`
        @keyframes teamMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-team-marquee {
          display: flex;
          width: max-content;
          animation: teamMarquee 35s linear infinite;
        }
        .animate-team-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="mb-16 text-center">
          <div className="relative inline-block">
            <h2 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
              Key Personnel
            </h2>
            <svg
              className="absolute -right-6 -top-4 h-7 w-7 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M12 3v3M18.36 5.64l-2.12 2.12M21 12h-3" />
            </svg>
          </div>

          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Experience our campus and facilities through a virtual tour, anytime, anywhere.
          </p>
        </div>
      </div>

      {/* BĂNG TRUYỀN MARQUEE CONTAINER */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        {/* Nhân bản danh sách ([...members, ...members]) để lặp vô tận không ngắt quãng */}
        <div className="animate-team-marquee flex gap-6 pb-6 pt-2">
          {[...members, ...members].map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className="flex w-[280px] shrink-0 flex-col items-center transition-transform duration-300 hover:-translate-y-2 sm:w-[300px]"
            >
              {/* Khung chứa ảnh */}
              <div className="h-[280px] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
                />
              </div>

              {/* Thẻ Name Badge */}
              <div
                className={`-mt-10 min-h-[96px] w-[90%] rounded-2xl p-4 text-center shadow-md ${
                  member.badgeBg || 'bg-[#eaedf1] text-slate-800'
                }`}
              >
                <h3 className="text-sm font-bold sm:text-base">
                  {member.name}
                </h3>
                <p
                  className={`mt-1 text-xs leading-snug ${
                    member.badgeBg ? 'opacity-90' : 'text-slate-500'
                  }`}
                >
                  {member.degree}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}