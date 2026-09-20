




// src/components/homepage/Features.tsx
import {
  FaChalkboardTeacher,
  FaClipboardCheck,
  FaUsers,
  FaChartBar,
  FaPlane,
} from 'react-icons/fa';

const features = [
  {
    title: 'Giao diện thân thiện cho lớp học',
    description:
      'Giảng viên dễ dàng quản lý lớp học, học viên và tài liệu trong một không gian làm việc trực quan.',
    icon: <FaChalkboardTeacher />,
    image: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Công cụ cho Giảng viên & Học viên',
    description:
      'Tạo bài tập, phân phối tài liệu và theo dõi tiến độ học tập một cách dễ dàng.',
    icon: <FaUsers />,
    image: 'https://images.pexels.com/photos/8471980/pexels-photo-8471980.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Kiểm tra, Quiz, Đánh giá',
    description:
      'Tạo bài kiểm tra và quiz ngay lập tức. Kết quả được thu thập và tổ chức tự động.',
    icon: <FaClipboardCheck />,
    image: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Quản lý lớp học chuyên nghiệp',
    description:
      'Quản lý điểm danh, chấm điểm, bài tập và hoạt động lớp học từ một bảng điều khiển duy nhất.',
    icon: <FaChartBar />,
    image: 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Cầu nối Du học Singapore',
    description:
      'Hợp tác Birmingham Academy mang đến chương trình học tập và thực tập có lương 6+6 tại Singapore.',
    icon: <FaPlane />,
    image: 'https://images.pexels.com/photos/8197544/pexels-photo-8197544.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
];

export default function Features() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Heading */}
        <div className="mb-24 text-center">
          <h2 className="text-[42px] font-bold text-[#2F327D]">
            Tính năng <span className="text-[#49BBBD]">nổi bật</span>
          </h2>

          <p className="mt-4 text-lg text-[#696984]">
            Những tính năng vượt trội giúp việc học tập hiệu quả hơn
          </p>
        </div>

        {/* Feature Sections */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`grid items-center gap-16 lg:grid-cols-2 ${
                index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              {/* Image */}
              <div className="relative">
                <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-[#49BBBD]/20" />
                <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-[#F59E0B]/20" />

                <img
                  src={feature.image}
                  alt={feature.title}
                  loading="lazy"
                  className="relative z-10 h-[400px] w-full rounded-3xl object-cover shadow-2xl"
                />
              </div>

              {/* Content */}
              <div>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#49BBBD] text-2xl text-white shadow-lg">
                  {feature.icon}
                </div>

                <h3 className="text-3xl font-bold leading-tight text-[#2F327D] md:text-4xl">
                  {feature.title}
                </h3>

                <p className="mt-6 text-lg leading-8 text-[#696984]">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="mt-24 text-center">
          <button className="rounded-full border-2 border-[#49BBBD] px-10 py-4 font-semibold text-[#49BBBD] transition-all duration-300 hover:bg-[#49BBBD] hover:text-white">
            Xem thêm tính năng
          </button>
        </div>
      </div>
    </section>
  );
}