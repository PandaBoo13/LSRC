import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaCalendarAlt,
  FaArrowRight,
} from 'react-icons/fa';

const aceTekPrograms = [
  {
    id: 1,
    title: 'Diploma in Hospitality Management',
    university: 'AceTek College Singapore',
    country: 'Singapore',
    countryId: 'singapore',
    flag: '🇸🇬',
    duration: '8 months',
    fee: 'SGD 8,500',
    rating: 4.7,
    level: 'Diploma',
    field: 'Hospitality',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    scholarship: false,
    description: 'Chương trình đào tạo quản lý khách sạn chuyên nghiệp, bao gồm thực tập tại khách sạn 5 sao.',
  },
  {
    id: 2,
    title: 'Diploma in Food & Beverage Operations',
    university: 'AceTek College Singapore',
    country: 'Singapore',
    countryId: 'singapore',
    flag: '🇸🇬',
    duration: '8 months',
    fee: 'SGD 8,500',
    rating: 4.6,
    level: 'Diploma',
    field: 'F&B',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    scholarship: false,
    description: 'Đào tạo quản lý nhà hàng, quầy bar và dịch vụ ăn uống cao cấp.',
  },
  {
    id: 3,
    title: 'Diploma in Business IT',
    university: 'AceTek College Singapore',
    country: 'Singapore',
    countryId: 'singapore',
    flag: '🇸🇬',
    duration: '8 months',
    fee: 'SGD 9,000',
    rating: 4.8,
    level: 'Diploma',
    field: 'Technology',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    scholarship: false,
    description: 'Kết hợp kinh doanh và công nghệ thông tin, phù hợp時代 digital transformation.',
  },
  {
    id: 4,
    title: 'Diploma in Logistics & Supply Chain',
    university: 'AceTek College Singapore',
    country: 'Singapore',
    countryId: 'singapore',
    flag: '🇸🇬',
    duration: '8 months',
    fee: 'SGD 8,500',
    rating: 4.5,
    level: 'Diploma',
    field: 'Logistics',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
    scholarship: false,
    description: 'Quản lý chuỗi cung ứng và logistics trong môi trường quốc tế.',
  },
  {
    id: 5,
    title: 'Diploma in Patisserie & Baking',
    university: 'AceTek College Singapore',
    country: 'Singapore',
    countryId: 'singapore',
    flag: '🇸🇬',
    duration: '8 months',
    fee: 'SGD 9,500',
    rating: 4.9,
    level: 'Diploma',
    field: 'Culinary',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    scholarship: false,
    description: 'Nghệ thuật làm bánh và pastry từ cơ bản đến nâng cao.',
  },
  {
    id: 6,
    title: 'Higher Diploma in Hospitality Management',
    university: 'AceTek College Singapore',
    country: 'Singapore',
    countryId: 'singapore',
    flag: '🇸🇬',
    duration: '16 months',
    fee: 'SGD 16,000',
    rating: 4.8,
    level: 'Higher Diploma',
    field: 'Hospitality',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    scholarship: true,
    description: 'Chương trình nâng cao với thực tập 6 tháng tại Singapore.',
  },
  {
    id: 7,
    title: 'Higher Diploma in Food Service & Culinary',
    university: 'AceTek College Singapore',
    country: 'Singapore',
    countryId: 'singapore',
    flag: '🇸🇬',
    duration: '16 months',
    fee: 'SGD 17,000',
    rating: 4.7,
    level: 'Higher Diploma',
    field: 'Culinary',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
    scholarship: true,
    description: 'Đào tạo đầu bếp chuyên nghiệp với kỹ năng quản lý nhà hàng.',
  },
  {
    id: 8,
    title: 'Postgraduate Diploma in Management',
    university: 'AceTek College Singapore',
    country: 'Singapore',
    countryId: 'singapore',
    flag: '🇸🇬',
    duration: '12 months',
    fee: 'SGD 18,000',
    rating: 4.6,
    level: 'Postgraduate',
    field: 'Business',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    scholarship: false,
    description: 'Nâng cao kỹ năng quản lý cho người đã có kinh nghiệm làm việc.',
  },
  {
    id: 9,
    title: 'Diploma in AI Enabled Guest Services',
    university: 'AceTek College Singapore',
    country: 'Singapore',
    countryId: 'singapore',
    flag: '🇸🇬',
    duration: '8 months',
    fee: 'SGD 9,500',
    rating: 4.8,
    level: 'Diploma',
    field: 'Technology',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
    scholarship: false,
    description: 'Ứng dụng AI trong ngành dịch vụ khách hàng và hospitality.',
  },
];

const levels = ['Tất cả', 'Diploma', 'Higher Diploma', 'Postgraduate'];
const fields = ['Tất cả', 'Hospitality', 'F&B', 'Technology', 'Logistics', 'Culinary', 'Business'];

export default function ProgramsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Tất cả');
  const [selectedField, setSelectedField] = useState('Tất cả');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPrograms = aceTekPrograms.filter((program) => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'Tất cả' || program.level === selectedLevel;
    const matchesField = selectedField === 'Tất cả' || program.field === selectedField;
    return matchesSearch && matchesLevel && matchesField;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Chương Trình AceTek College</h1>
          <p className="text-blue-100 mb-6">Đăng ký du học Singapore tại AceTek College qua LSRC</p>

          <div className="max-w-3xl bg-white rounded-xl p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chương trình..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-800"
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
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-800"
                >
                  {fields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-600 mb-6">Tìm thấy <span className="font-semibold">{filteredPrograms.length}</span> chương trình</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x200/3b82f6/ffffff?text=AceTek`;
                    }}
                  />
                  <div className="absolute top-4 left-4 text-3xl">{program.flag}</div>
                  {program.scholarship && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Học bổng
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {program.level}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{program.title}</h3>
                  <p className="text-blue-600 text-sm font-semibold mb-2">AceTek College Singapore</p>
                  <p className="text-gray-500 text-sm mb-3">{program.description}</p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="flex items-center gap-1 text-gray-600">
                      <FaCalendarAlt /> {program.duration}
                    </span>
                    <span className="font-semibold text-blue-600">{program.fee}</span>
                  </div>

                  <div className="flex items-center gap-1 text-yellow-500 mb-4">
                    <FaStar /> <span className="font-semibold text-gray-700">{program.rating}</span>
                    <span className="text-gray-400 text-sm">/ 5.0</span>
                  </div>

                  <Link
                    to={`/study-abroad/ace-tek/${program.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Xem chi tiết & Đăng ký <FaArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
