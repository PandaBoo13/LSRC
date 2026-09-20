import {
  FaBookOpen,
  FaComments,
  FaGraduationCap,
  FaRoute,
} from 'react-icons/fa';

const academyFeatures = [
  {
    icon: FaBookOpen,
    title: 'Preparatory Courses',
  },
  {
    icon: FaComments,
    title: 'Language Programs',
  },
  {
    icon: FaGraduationCap,
    title: 'Certificate & Diploma Courses',
  },
  {
    icon: FaRoute,
    title: 'Higher Learning Pathways',
  },
];

const singaporeBenefits = [
  'Safe City',
  'Clean & Healthy Living',
  'Conductive Study Environment',
  'Modern & Efficient City',
  'Good Accommodation',
  'Economical Cost',
  'Our People & Festivals',
  'Opportunities',
  'Convenient Transportation',
  'Political Factor',
];

export default function WhyChooseUs() {
  return (
    <section className="relative bg-white pt-16">
      {/* KHỐI 1: WHY CHOOSE BIRMINGHAM ACADEMY */}
      <div className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Cột trái - Nội dung text & 4 Card */}
          <div className="lg:col-span-8">
            <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl lg:text-5xl">
              Why Choose Birmingham Academy
            </h2>

            <p className="mt-6 text-sm leading-relaxed text-slate-600 sm:text-base">
              Birmingham Academy Pte Ltd (RBN200306960N) was incorporated on 23 July 2003 and is officially registered with the Accounting and Corporate Regulatory Authority (ACRA). It is also registered with the Ministry of Education as a private school under the Singapore Private Education Act. In September 2010, Birmingham Academy successfully migrated and registered as a Private Education Institution (PEI) under the Enhanced Registration Framework (ERF).
            </p>

            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
              Birmingham Academy provides opportunities for both Singaporean and international students to achieve academic excellence through:
            </p>

            {/* Lưới 4 Thẻ Chương Trình */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {academyFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <div className="mb-3 text-rose-500">
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xs font-semibold text-slate-800 sm:text-sm">
                      {item.title}
                    </h3>
                  </div>
                );
              })}
            </div>

            <p className="mt-8 text-sm leading-relaxed text-slate-600 sm:text-base">
              Birmingham Academy is managed by a team of professionals with highly respected academic backgrounds and specialised expertise, ensuring strong leadership, sound governance, and quality education delivery. The Academy is also an established provider of Government School Preparatory Programmes, with a proven record of successfully placing students into Singapore government schools.
            </p>
          </div>

          {/* Cột phải - Hình sinh viên */}
          <div className="relative flex justify-center lg:col-span-4 lg:justify-end">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000"
              alt="Birmingham Student"
              className="max-h-[520px] w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* KHỐI 2: WHY STUDY IN SINGAPORE (Giao diện xanh đen) */}
      <div className="relative bg-[#1e2942] py-20 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="relative inline-block">
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              Why Study in Singapore
            </h2>
            {/* Nét vẽ trang trí góc trên */}
            <svg
              className="absolute -right-8 -top-4 h-6 w-6 text-amber-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M12 3v3M18.36 5.64l-2.12 2.12M21 12h-3" />
            </svg>
          </div>

          <p className="mt-8 text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-8">
            Singapore is recognised as a premier education hub in Asia, offering a diverse and distinctive range of educational services within a safe, cosmopolitan, and comfortable environment. Guided by a strong commitment to excellence, Singapore’s education system delivers a broad-based curriculum and a global perspective, equipping students with relevant qualifications and practical training that serve as a springboard to a brighter future. At the heart of Singapore’s success is its people. Education plays a vital role in nurturing young minds and helping individuals realise their full potential. The nation provides a forward-looking education system that is closely aligned with the needs of today’s generation, supported by world-class facilities and cutting-edge educational tools and technologies.
          </p>

          <p className="mt-8 text-sm font-medium text-slate-200 sm:text-base">
            Singapore offers an ideal environment for students, providing:
          </p>

          {/* Danh sách các thẻ Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {singaporeBenefits.map((benefit) => (
              <span
                key={benefit}
                className="rounded-full bg-[#2b385e] px-5 py-2.5 text-xs font-medium text-slate-100 shadow-sm transition-colors hover:bg-[#384878] sm:text-sm"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}