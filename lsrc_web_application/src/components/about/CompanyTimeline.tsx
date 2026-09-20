const timeline = [
  {
    year: '2011',
    title: 'Chứng nhận EduTrust',
    description: 'Đạt chứng nhận Edutrust 4 năm.',
  },
  {
    year: '2013',
    title: 'Thành viên SBF',
    description:
      'Trở thành thành viên chính thức của Liên đoàn Doanh nghiệp Singapore (Singapore Business Federation).',
  },
  {
    year: '2014',
    title: 'Top 30 Tổ chức Giáo dục',
    description:
      'Được chọn là một trong "Top 30 Tổ chức Giáo dục Tư thục tại Singapore" bởi JobsCentral.',
  },
  {
    year: '2023',
    title: 'Hợp tác SHMS & Montfort',
    description:
      'Hình thành quan hệ hợp tác với Trường Quản lý Khách sạn SHMS và Đại học Montfort.',
  },
  {
    year: '2024',
    title: 'Chương trình OSSD (Canada)',
    description:
      'Hợp tác với Trường Rosedale Global High School, cung cấp chương trình OSSD tại Singapore.',
  },
  {
    year: '2026',
    title: 'Hợp tác Lincoln Bishop',
    description:
      'Thiết lập quan hệ hợp tác với Lincoln Bishop University.',
  },
];

export default function CompanyTimeline() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-800 lg:text-5xl uppercase">
            Lịch Sử Hình Thành & Phát Triển
          </h2>

          <p className="mt-4 text-slate-500">
            Các cột mốc quan trọng trong quá trình phát triển của trường.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 h-full w-1 rounded-full bg-cyan-200 lg:left-1/2 lg:-translate-x-1/2" />

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div
                key={item.year}
                className={`flex flex-col lg:flex-row items-center ${
                  index % 2 === 0 ? '' : 'lg:flex-row-reverse'
                }`}
              >
                <div className="flex-1 w-full" />

                {/* Badge Year */}
                <div className="relative z-10 my-4 lg:my-0 flex shrink-0 justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 font-bold text-white shadow-lg shadow-cyan-500/30 text-sm">
                    {item.year}
                  </div>
                </div>

                {/* Content Box */}
                <div className="flex-1 w-full px-0 lg:px-8">
                  <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
                      NĂM {item.year}
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-slate-800">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}