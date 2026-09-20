import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaGlobeAmericas,
  FaSearch,
  FaGraduationCap,
  FaPassport,
  FaHome,
  FaMoneyBillWave,
  FaArrowRight,
  FaStar,
  FaCalendarAlt,
  FaArrowLeft,
} from 'react-icons/fa';

const countries = [
  {
    id: 'singapore',
    name: 'Singapore',
    flag: '🇸🇬',
    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400',
    programs: 156,
    ranking: 'Top 10 Global Education',
    description: 'Trung tâm giáo dục hàng đầu Châu Á với bằng cấp được công nhận toàn cầu.',
  },
  {
    id: 'australia',
    name: 'Australia',
    flag: '🇦🇺',
    image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400',
    programs: 234,
    ranking: 'Top 5 Du học',
    description: 'Giáo dục chất lượng cao với môi trường đa văn hóa và cơ hội việc làm.',
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
    programs: 189,
    ranking: 'Top 3 Thế giới',
    description: 'Bằng cấp danh giá từ Oxford, Cambridge và các trường đại học顶尖.',
  },
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    image: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=400',
    programs: 312,
    ranking: 'Top 1 Innovation',
    description: 'Đại học hàng đầu thế giới với chương trình nghiên cứu tiên tiến.',
  },
  {
    id: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400',
    programs: 178,
    ranking: 'Top 3 An toàn',
    description: 'Môi trường học tập an toàn, chi phí hợp lý và cơ hội định cư.',
  },
];

const featuredPrograms = [
  {
    id: 1,
    title: 'Bachelor of Computer Science',
    university: 'National University of Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    duration: '4 years',
    fee: 'SGD 29,000/year',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300',
  },
  {
    id: 2,
    title: 'Master of Business Administration',
    university: 'University of Melbourne',
    country: 'Australia',
    flag: '🇦🇺',
    duration: '2 years',
    fee: 'AUD 45,000/year',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  },
  {
    id: 3,
    title: 'MSc Data Science',
    university: 'University of Edinburgh',
    country: 'UK',
    flag: '🇬🇧',
    duration: '1 year',
    fee: 'GBP 28,000/year',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300',
  },
];

const stats = [
  { number: '5,000+', label: 'Học viên' },
  { number: '200+', label: 'Chương trình' },
  { number: '50+', label: 'Đối tác' },
  { number: '95%', label: 'Tỷ lệ thành công' },
];

export default function StudyAbroadPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
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
              Du Học Quốc Tế
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Khám phá cơ hội giáo dục toàn cầu với hơn 5,000 chương trình từ 50+ trường đại học hàng đầu
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-4 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chương trình, trường, quốc gia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                />
              </div>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value="">Tất cả quốc gia</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Tìm Kiếm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">{stat.number}</div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Điểm Đến Du Học</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá các quốc gia có nền giáo dục hàng đầu thế giới
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country) => (
              <Link
                key={country.id}
                to={`/study-abroad/${country.id}`}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={country.image}
                    alt={country.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/3b82f6/ffffff?text=${country.name}`;
                    }}
                  />
                  <div className="absolute top-4 left-4 text-3xl">{country.flag}</div>
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {country.programs} programs
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{country.name}</h3>
                  <p className="text-blue-600 text-sm font-semibold mb-2">{country.ranking}</p>
                  <p className="text-gray-600 text-sm mb-4">{country.description}</p>
                  <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                    Khám phá ngay <FaArrowRight className="ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Chương Trình Nổi Bật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Các chương trình được đánh giá cao bởi học viên
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPrograms.map((program) => (
              <Link
                key={program.id}
                to={`/study-abroad/programs`}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/6366f1/ffffff?text=Program`;
                    }}
                  />
                  <div className="absolute top-4 left-4 text-2xl">{program.flag}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{program.title}</h3>
                  <p className="text-blue-600 font-semibold mb-2">{program.university}</p>
                  <p className="text-gray-500 text-sm mb-4">{program.country}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <FaCalendarAlt /> {program.duration}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <FaMoneyBillWave /> {program.fee}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-yellow-500">
                    <FaStar /> <span className="font-semibold">{program.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tại Sao Chọn LSRC?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGlobeAmericas className="text-2xl text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Đối Tác Toàn Cầu</h3>
              <p className="text-gray-600 text-sm">Hơn 200 trường đại học tại 50+ quốc gia</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="text-2xl text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Tư Vấn Chuyên Sâu</h3>
              <p className="text-gray-600 text-sm">Đội ngũ tư vấn viên giàu kinh nghiệm</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPassport className="text-2xl text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Hỗ Trợ Visa</h3>
              <p className="text-gray-600 text-sm">Tỷ lệ visa thành công 95%</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHome className="text-2xl text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Ký Túc Xá</h3>
              <p className="text-gray-600 text-sm">Tìm nhà ở phù hợp với ngân sách</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu hành trình du học?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Đăng ký tư vấn miễn phí để được hỗ trợ chọn chương trình phù hợp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Đăng Ký Tư Vấn
            </Link>
            <Link
              to="/study-abroad/programs"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Xem Tất Cả Chương Trình
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
