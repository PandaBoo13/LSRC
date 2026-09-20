import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaGraduationCap,
  FaExternalLinkAlt,
  FaCheckCircle,
} from 'react-icons/fa';

const scholarships = [
  {
    id: 1,
    name: 'Học bổng Chính phủ Việt Nam',
    provider: 'Bộ Giáo dục và Đào tạo',
    coverage: '100% học phí + Sinh hoạt phí',
    deadline: '31/03/2026',
    level: 'Cử nhân, Thạc sĩ, Tiến sĩ',
    requirements: ['GPA >= 3.5', 'IELTS >= 6.0', 'Dưới 30 tuổi'],
    status: 'Đang mở',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=400',
  },
  {
    id: 2,
    name: 'Học bổng UEH',
    provider: 'Đại học Kinh tế TP.HCM',
    coverage: '50-100% học phí',
    deadline: '15/04/2026',
    level: 'Cử nhân, Thạc sĩ',
    requirements: ['GPA >= 3.0', 'Phỏng vấn'],
    status: 'Đang mở',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400',
  },
  {
    id: 3,
    name: 'Học bổng FPT',
    provider: 'Đại học FPT',
    coverage: '30-70% học phí',
    deadline: '30/06/2026',
    level: 'Cử nhân',
    requirements: ['Điểm thi THPT >= 24', 'Phỏng vấn'],
    status: 'Đang mở',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=400',
  },
  {
    id: 4,
    name: 'Học bổng JICA',
    provider: 'JICA Nhật Bản',
    coverage: '100% học phí + vé máy bay + sinh hoạt phí',
    deadline: '31/05/2026',
    level: 'Thạc sĩ',
    requirements: ['IELTS >= 6.5', 'Kinh nghiệm 2 năm', 'Dưới 35 tuổi'],
    status: 'Đang mở',
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400',
  },
  {
    id: 5,
    name: 'Học bổng RMIT',
    provider: 'RMIT Việt Nam',
    coverage: '25-50% học phí',
    deadline: '31/07/2026',
    level: 'Cử nhân, Thạc sĩ',
    requirements: ['GPA >= 3.0', 'Thành tích ngoại khóa'],
    status: 'Đang mở',
    image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400',
  },
];

const levels = ['Tất cả', 'Cử nhân', 'Thạc sĩ', 'Tiến sĩ'];
const providers = ['Tất cả', 'Bộ GD&ĐT', 'Đại học', 'Tổ chức quốc tế'];

export default function ScholarshipPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Tất cả');
  const [selectedProvider, setSelectedProvider] = useState('Tất cả');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = scholarships.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'Tất cả' || s.level.includes(selectedLevel);
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/study-in-vietnam" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <FaArrowLeft /> Quay lại
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Học Bổng</h1>
          <p className="text-green-100 mb-6">Khám phá cơ hội học bổng từ các tổ chức uy tín</p>

          {/* Search */}
          <div className="max-w-3xl bg-white rounded-xl p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm học bổng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 text-gray-800"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-200"
              >
                <FaFilter /> Lọc
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-800"
                >
                  {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-800"
                >
                  {providers.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-600 mb-6">Tìm thấy <span className="font-semibold">{filtered.length}</span> học bổng</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((scholarship) => (
              <div key={scholarship.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <img
                    src={scholarship.image}
                    alt={scholarship.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x200/16a34a/ffffff?text=Scholarship`;
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FaCheckCircle /> {scholarship.status}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{scholarship.name}</h3>
                  <p className="text-green-600 text-sm font-semibold mb-4">{scholarship.provider}</p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMoneyBillWave className="text-green-500" />
                      {scholarship.coverage}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt className="text-orange-500" />
                      Hạn: {scholarship.deadline}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaGraduationCap className="text-blue-500" />
                      {scholarship.level}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Yêu cầu:</p>
                    <ul className="space-y-1">
                      {scholarship.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    Đăng ký ngay <FaExternalLinkAlt size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
