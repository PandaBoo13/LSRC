// src/components/homepage/Services.tsx
import {
  FaCalendarAlt,
  FaCreditCard,
  FaUsers,
  FaPlane,
} from 'react-icons/fa';

interface ServiceItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const services: ServiceItem[] = [
  {
    title: 'Thanh toán trực tuyến\n& Hóa đơn',
    description:
      'Kiểm soát đơn giản và an toàn các giao dịch tài chính và pháp lý của tổ chức.',
    icon: <FaCreditCard />,
    color: 'bg-indigo-500',
  },
  {
    title: 'Lịch học linh hoạt\n& Theo dõi điểm danh',
    description:
      'Lên lịch và đặt phòng học tại một hoặc nhiều cơ sở. Theo dõi điểm danh tự động.',
    icon: <FaCalendarAlt />,
    color: 'bg-cyan-500',
  },
  {
    title: 'Quản lý học viên',
    description:
      'Tự động hóa và theo dõi email đến từng cá nhân hoặc nhóm, giúp tổ chức của bạn hoạt động hiệu quả.',
    icon: <FaUsers />,
    color: 'bg-sky-500',
  },
  {
    title: 'Tư vấn Du học Singapore',
    description:
      'Hợp tác Birmingham Academy mang đến cơ hội học tập và thực tập có lương tại Singapore.',
    icon: <FaPlane />,
    color: 'bg-emerald-500',
  },
];

export default function Services() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Heading */}
        <div className="mb-16 text-center">
          <h2 className="text-[42px] font-bold text-[#2F327D]">
            Tất cả trong một{' '}
            <span className="text-[#49BBBD]">
              Nền tảng Cloud.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-slate-500">
            LSRC là bộ phần mềm trực tuyến mạnh mẽ kết hợp
            tất cả các công cụ cần thiết để vận hành
            trường học hoặc văn phòng thành công.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="relative rounded-[20px] bg-white px-6 pb-8 pt-14 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div
                className={`absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-lg text-white shadow-lg ${service.color}`}
              >
                {service.icon}
              </div>

              <h3 className="whitespace-pre-line text-[19px] font-semibold leading-7 text-[#2F327D]">
                {service.title}
              </h3>

              <p className="mt-4 text-[13px] leading-6 text-slate-500">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}