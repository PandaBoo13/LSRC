import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaGraduationCap,
  FaGlobeAsia,
  FaHome,
  FaMoneyBillWave,
  FaArrowRight,
  FaCalendarAlt,
  FaArrowLeft,
} from 'react-icons/fa';

const universities = [
  {
    id: 1,
    name: 'Đại học Quốc gia Hà Nội',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400',
    city: 'Hà Nội',
    ranking: '#1 Việt Nam',
    programs: 120,
    international: true,
  },
  {
    id: 2,
    name: 'Đại học Quốc gia TP.HCM',
    image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400',
    city: 'TP. Hồ Chí Minh',
    ranking: '#2 Việt Nam',
    programs: 150,
    international: true,
  },
  {
    id: 3,
    name: 'Đại học Bách Khoa Hà Nội',
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400',
    city: 'Hà Nội',
    ranking: '#3 Việt Nam',
    programs: 80,
    international: true,
  },
  {
    id: 4,
    name: 'Đại học FPT',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400',
    city: 'Đà Nẵng',
    ranking: 'Top 5 Việt Nam',
    programs: 60,
    international: true,
  },
];

const programs = [
  {
    id: 1,
    title: 'Vietnamese Language Program',
    duration: '6-12 tháng',
    fee: 'VND 20-50 triệu',
    level: 'Ngôn ngữ',
    image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=300',
  },
  {
    id: 2,
    title: 'BSc Computer Science (English)',
    duration: '4 năm',
    fee: 'VND 80-150 triệu/năm',
    level: 'Cử nhân',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300',
  },
  {
    id: 3,
    title: 'MBA International',
    duration: '2 năm',
    fee: 'VND 150-300 triệu/năm',
    level: 'Thạc sĩ',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  },
];

const livingCosts = [
  { item: 'Nhà ở (ký túc xá)', cost: 'VND 1-3 triệu/tháng' },
  { item: 'Ăn uống', cost: 'VND 2-4 triệu/tháng' },
  { item: 'Di chuyển', cost: 'VND 500K-1 triệu/tháng' },
  { item: 'Giải trí', cost: 'VND 1-2 triệu/tháng' },
  { item: 'Tổng cộng', cost: 'VND 5-10 triệu/tháng', highlight: true },
];

const scholarships = [
  {
    name: 'Chính phủ Việt Nam',
    coverage: 'Học phí + Sinh hoạt phí',
    deadline: '31/03 hàng năm',
    level: 'Cử nhân, Thạc sĩ',
  },
  {
    name: 'Học bổng Đại học',
    coverage: '30-100% học phí',
    deadline: 'Theo từng trường',
    level: 'Tất cả cấp bậc',
  },
  {
    name: 'Học bổng doanh nghiệp',
    coverage: 'Học phí + Thực tập',
    deadline: 'Linhh hoạt',
    level: 'Cử nhân, Thạc sĩ',
  },
];

export default function StudyInVietnamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-700 to-red-900 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <FaArrowLeft /> Về trang chủ
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Du Học Tại Việt Nam
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Khám phá nền giáo dục chất lượng tại Việt Nam với chi phí hợp lý
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-4 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chương trình, trường..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800"
                />
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 text-gray-800"
              >
                <option value="">Tất cả thành phố</option>
                <option value="hanoi">Hà Nội</option>
                <option value="hcm">TP. Hồ Chí Minh</option>
                <option value="danang">Đà Nẵng</option>
                <option value="hue">Huế</option>
              </select>
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Tìm Kiếm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Vietnam */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tại Sao Chọn Việt Nam?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Việt Nam offers a unique blend of quality education, affordable living, and rich culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMoneyBillWave className="text-2xl text-red-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Chi Phí Thấp</h3>
              <p className="text-gray-600 text-sm">Sinh hoạt phí chỉ 300-600 USD/tháng</p>
            </div>

            <div className="text-center p-6 bg-red-50 rounded-xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="text-2xl text-red-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Giáo Dục Chất Lượng</h3>
              <p className="text-gray-600 text-sm">Nhiều trường top khu vực & quốc tế</p>
            </div>

            <div className="text-center p-6 bg-red-50 rounded-xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGlobeAsia className="text-2xl text-red-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Văn Hóa Đa Dạng</h3>
              <p className="text-gray-600 text-sm">Con người thân thiện, ẩm thực phong phú</p>
            </div>

            <div className="text-center p-6 bg-red-50 rounded-xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHome className="text-2xl text-red-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">An Toàn Tuyệt Đối</h3>
              <p className="text-gray-600 text-sm">Môi trường sống an toàn, yên bình</p>
            </div>
          </div>
        </div>
      </section>

      {/* Universities */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Trường Đại Học Hàng Đầu</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Các trường đại học uy tín tại Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {universities.map((uni) => (
              <div
                key={uni.id}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={uni.image}
                    alt={uni.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/dc2626/ffffff?text=${encodeURIComponent(uni.name)}`;
                    }}
                  />
                  {uni.international && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Quốc tế
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{uni.name}</h3>
                  <p className="text-red-600 text-sm font-semibold mb-2">{uni.city}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{uni.ranking}</span>
                    <span className="text-gray-500">{uni.programs} programs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Chương Trình Học</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Các chương trình phổ biến cho học viên quốc tế
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/dc2626/ffffff?text=${encodeURIComponent(program.title)}`;
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {program.level}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{program.title}</h3>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="flex items-center gap-1 text-gray-600">
                      <FaCalendarAlt /> {program.duration}
                    </span>
                    <span className="font-semibold text-red-600">{program.fee}</span>
                  </div>
                  <div className="flex items-center text-red-600 font-semibold group-hover:gap-2 transition-all">
                    Xem chi tiết <FaArrowRight className="ml-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Living Guide */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Cost of Living */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Chi Phí Sinh Hoạt</h2>
              <div className="space-y-4">
                {livingCosts.map((item, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center py-3 ${
                      item.highlight ? 'border-t-2 border-red-500 mt-4 pt-4' : 'border-b border-gray-100'
                    }`}
                  >
                    <span className={`${item.highlight ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                      {item.item}
                    </span>
                    <span className={`${item.highlight ? 'font-bold text-red-600 text-lg' : 'font-semibold'}`}>
                      {item.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scholarships */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Học Bổng</h2>
              <div className="space-y-4">
                {scholarships.map((scholarship, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                    <h3 className="font-bold text-gray-800 mb-2">{scholarship.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold">Phạm vi:</span> {scholarship.coverage}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Hạn:</span> {scholarship.deadline}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Cấp bậc:</span> {scholarship.level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng học tại Việt Nam?</h2>
          <p className="text-red-100 mb-8 text-lg">
            Đăng ký tư vấn miễn phí để được hỗ trợ chọn trường và chương trình phù hợp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              Đăng Ký Tư Vấn
            </Link>
            <Link
              to="/"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
