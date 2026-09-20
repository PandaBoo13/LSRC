import {
  FaLightbulb,
  FaUserTie,
  FaShieldAlt,
  FaBalanceScale,
  FaComments,
  FaUsers,
  FaUserFriends,
} from 'react-icons/fa';

const values = [
  {
    icon: FaLightbulb,
    title: 'Innovative',
    description: 'Đổi mới và sáng tạo liên tục trong tư duy cũng như phương pháp giáo dục.',
  },
  {
    icon: FaUserTie,
    title: 'Professional',
    description: 'Tác phong chuyên nghiệp, chuẩn mực trong giảng dạy và vận hành.',
  },
  {
    icon: FaShieldAlt,
    title: 'Integrity',
    description: 'Xây dựng sự tin tưởng dựa trên sự chính trực, minh bạch và trách nhiệm.',
  },
  {
    icon: FaBalanceScale,
    title: 'Fairness',
    description: 'Công bằng, tôn trọng sự đa dạng và tạo cơ hội bình đẳng cho mọi người.',
  },
  {
    icon: FaComments,
    title: 'Responsiveness',
    description: 'Lắng nghe, phản hồi nhanh chóng và hỗ trợ kịp thời nhu cầu học viên.',
  },
  {
    icon: FaUsers,
    title: 'Teamwork',
    description: 'Đoàn kết, gắn kết tập thể để cùng hướng tới mục tiêu chung.',
  },
];

export default function CoreValues() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-extrabold text-slate-800 lg:text-5xl">
            Values
          </h2>
          <p className="mt-4 text-base text-slate-500 max-w-2xl mx-auto">
            The principles that guide our academic culture and daily interactions.
          </p>
        </div>

        {/* BADGES / PILLS DESIGN (Giống giao diện ảnh tham khảo) */}
        <div className="mb-16 flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-sm border border-slate-100 hover:shadow-md transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                  <Icon className="text-lg" />
                </div>
                <span className="text-base font-bold text-slate-800">
                  {value.title}
                </span>
              </div>
            );
          })}

          {/* Công thức Responsive Team */}
          <div className="flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
              <FaUserFriends className="text-lg" />
            </div>
            <span className="text-base font-bold text-slate-800">
              Responsive Team = Fairness + Professional
            </span>
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div
                key={value.title}
                className="rounded-[32px] bg-white p-8 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 text-2xl text-cyan-600">
                  <Icon />
                </div>

                <h3 className="text-2xl font-bold text-slate-800">
                  {value.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-500">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}