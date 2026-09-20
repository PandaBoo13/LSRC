import { useParams, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaHome,
  FaPassport,
  FaCalendarAlt,
  FaCheckCircle,
} from 'react-icons/fa';

const countryData: Record<string, {
  name: string;
  flag: string;
  image: string;
  description: string;
  highlights: string[];
  topUniversities: { name: string; ranking: string; programs: number }[];
  costOfLiving: { accommodation: string; food: string; transport: string; total: string };
  visaRequirements: string[];
  programs: { title: string; duration: string; fee: string; level: string }[];
}> = {
  singapore: {
    name: 'Singapore',
    flag: '🇸🇬',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200',
    description: 'Singapore là trung tâm giáo dục hàng đầu Châu Á với hệ thống giáo dục tiên tiến và bằng cấp được công nhận toàn cầu.',
    highlights: [
      'Bằng cấp được công nhận quốc tế',
      'Môi trường học tập đa văn hóa',
      'Cơ hội việc làm sau tốt nghiệp',
      'An ninh tuyệt đối',
      'Chi phí hợp lý so với chất lượng',
    ],
    topUniversities: [
      { name: 'National University of Singapore (NUS)', ranking: '#1 Châu Á', programs: 150 },
      { name: 'Nanyang Technological University (NTU)', ranking: '#2 Châu Á', programs: 120 },
      { name: 'Singapore Management University (SMU)', ranking: '#3 Singapore', programs: 80 },
    ],
    costOfLiving: {
      accommodation: 'SGD 800 - 1,500/tháng',
      food: 'SGD 400 - 600/tháng',
      transport: 'SGD 100 - 150/tháng',
      total: 'SGD 1,500 - 2,500/tháng',
    },
    visaRequirements: [
      'Hộ chiếu còn hiệu lực 6 tháng',
      'Thư nhập học từ trường',
      'Chứng minh tài chính',
      'Bảo hiểm y tế',
      'Visa Student Pass',
    ],
    programs: [
      { title: 'Bachelor of Computer Science', duration: '4 năm', fee: 'SGD 29,000/năm', level: 'Cử nhân' },
      { title: 'Master of Business Administration', duration: '1-2 năm', fee: 'SGD 65,000/năm', level: 'Thạc sĩ' },
      { title: 'MSc Data Science', duration: '1.5 năm', fee: 'SGD 45,000/năm', level: 'Thạc sĩ' },
    ],
  },
  australia: {
    name: 'Australia',
    flag: '🇦🇺',
    image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200',
    description: 'Australia nổi tiếng với nền giáo dục chất lượng cao, môi trường sống tuyệt vời và cơ hội định cư.',
    highlights: [
      'Giáo dục chất lượng hàng đầu thế giới',
      'Môi trường sống an toàn, thân thiện',
      'Cơ hội làm thêm 20 giờ/tuần',
      'Chương trình định cư sau tốt nghiệp',
      'Đa dạng văn hóa',
    ],
    topUniversities: [
      { name: 'University of Melbourne', ranking: '#1 Australia', programs: 200 },
      { name: 'University of Sydney', ranking: '#2 Australia', programs: 180 },
      { name: 'Australian National University', ranking: '#3 Australia', programs: 150 },
    ],
    costOfLiving: {
      accommodation: 'AUD 1,000 - 2,000/tháng',
      food: 'AUD 500 - 800/tháng',
      transport: 'AUD 150 - 200/tháng',
      total: 'AUD 2,000 - 3,500/tháng',
    },
    visaRequirements: [
      'Hộ chiếu còn hiệu lực',
      'Thư nhập học (CoE)',
      'Chứng minh tài chính AUD 21,041/năm',
      'Bảo hiểm y tế (OSHC)',
      'Visa Subclass 500',
    ],
    programs: [
      { title: 'Bachelor of Engineering', duration: '4 năm', fee: 'AUD 45,000/năm', level: 'Cử nhân' },
      { title: 'Master of IT', duration: '2 năm', fee: 'AUD 50,000/năm', level: 'Thạc sĩ' },
      { title: 'MBA', duration: '2 năm', fee: 'AUD 55,000/năm', level: 'Thạc sĩ' },
    ],
  },
  uk: {
    name: 'United Kingdom',
    flag: '🇬🇧',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
    description: 'UK là quê hương của những trường đại học danh giá nhất thế giới như Oxford và Cambridge.',
    highlights: [
      'Bằng cấp danh giá toàn cầu',
      'Nghiên cứu tiên tiến',
      'Chương trình ngắn hạn (1 năm Thạc sĩ)',
      'Văn hóa đa dạng',
      'Cơ hội việc làm quốc tế',
    ],
    topUniversities: [
      { name: 'University of Oxford', ranking: '#1 Thế giới', programs: 250 },
      { name: 'University of Cambridge', ranking: '#2 Thế giới', programs: 230 },
      { name: 'Imperial College London', ranking: '#3 UK', programs: 180 },
    ],
    costOfLiving: {
      accommodation: 'GBP 800 - 1,500/tháng',
      food: 'GBP 400 - 600/tháng',
      transport: 'GBP 150 - 200/tháng',
      total: 'GBP 1,500 - 2,500/tháng',
    },
    visaRequirements: [
      'Hộ chiếu còn hiệu lực',
      'Thư nhập học (CAS)',
      'Chứng minh tài chính',
      'IELTS 6.0+',
      'Visa Student',
    ],
    programs: [
      { title: 'BA Economics', duration: '3 năm', fee: 'GBP 22,000/năm', level: 'Cử nhân' },
      { title: 'MSc Computer Science', duration: '1 năm', fee: 'GBP 30,000/năm', level: 'Thạc sĩ' },
      { title: 'PhD Research', duration: '3-4 năm', fee: 'GBP 25,000/năm', level: 'Tiến sĩ' },
    ],
  },
  usa: {
    name: 'United States',
    flag: '🇺🇸',
    image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f04?w=1200',
    description: 'Mỹ là cường quốc giáo dục với hơn 4,000 trường đại học và chương trình nghiên cứu tiên tiến nhất.',
    highlights: [
      'Hệ thống giáo dục lớn nhất thế giới',
      'Nghiên cứu và đổi mới hàng đầu',
      'Đa dạng chương trình học',
      'Cơ hội networking toàn cầu',
      'Chương trình thực tập (OPT/CPT)',
    ],
    topUniversities: [
      { name: 'MIT', ranking: '#1 Thế giới', programs: 300 },
      { name: 'Stanford University', ranking: '#2 Thế giới', programs: 280 },
      { name: 'Harvard University', ranking: '#3 Thế giới', programs: 260 },
    ],
    costOfLiving: {
      accommodation: 'USD 1,000 - 2,500/tháng',
      food: 'USD 500 - 800/tháng',
      transport: 'USD 100 - 300/tháng',
      total: 'USD 2,000 - 4,000/tháng',
    },
    visaRequirements: [
      'Hộ chiếu còn hiệu lực',
      'I-20 từ trường',
      'Chứng minh tài chính',
      'GRE/GMAT (nếu yêu cầu)',
      'Visa F-1',
    ],
    programs: [
      { title: 'BS Computer Science', duration: '4 năm', fee: 'USD 55,000/năm', level: 'Cử nhân' },
      { title: 'MS Data Science', duration: '2 năm', fee: 'USD 60,000/năm', level: 'Thạc sĩ' },
      { title: 'MBA', duration: '2 năm', fee: 'USD 75,000/năm', level: 'Thạc sĩ' },
    ],
  },
  canada: {
    name: 'Canada',
    flag: '🇨🇦',
    image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1200',
    description: 'Canada nổi tiếng với môi trường học tập an toàn, chi phí hợp lý và cơ hội định cư hấp dẫn.',
    highlights: [
      'Môi trường sống an toàn top đầu',
      'Chi phí hợp lý hơn US/UK',
      'Cơ hội định cư sau tốt nghiệp',
      'Chất lượng giáo dục cao',
      'Đa dạng văn hóa',
    ],
    topUniversities: [
      { name: 'University of Toronto', ranking: '#1 Canada', programs: 200 },
      { name: 'McGill University', ranking: '#2 Canada', programs: 180 },
      { name: 'University of British Columbia', ranking: '#3 Canada', programs: 170 },
    ],
    costOfLiving: {
      accommodation: 'CAD 800 - 1,500/tháng',
      food: 'CAD 400 - 600/tháng',
      transport: 'CAD 100 - 150/tháng',
      total: 'CAD 1,500 - 2,500/tháng',
    },
    visaRequirements: [
      'Hộ chiếu còn hiệu lực',
      'Letter of Acceptance',
      'Chứng minh tài chính CAD 20,635/năm',
      'Đánh giá sức khỏe',
      'Visa Study Permit',
    ],
    programs: [
      { title: 'BSc Computer Science', duration: '4 năm', fee: 'CAD 35,000/năm', level: 'Cử nhân' },
      { title: 'MEng Electrical', duration: '2 năm', fee: 'CAD 40,000/năm', level: 'Thạc sĩ' },
      { title: 'MBA', duration: '2 năm', fee: 'CAD 50,000/năm', level: 'Thạc sĩ' },
    ],
  },
};

export default function CountryDetailPage() {
  const { countryId } = useParams<{ countryId: string }>();
  const country = countryData[countryId || ''];

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy quốc gia</h1>
          <Link to="/study-abroad" className="text-blue-600 hover:underline">
            Quay lại trang Du học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-96">
        <img src={country.image} alt={country.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Link to="/study-abroad" className="text-white/80 hover:text-white flex items-center gap-2 mb-4">
              <FaArrowLeft /> Quay lại Du học
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{country.flag}</span>
              <h1 className="text-4xl font-bold text-white">{country.name}</h1>
            </div>
            <p className="text-white/90 mt-4 max-w-2xl">{country.description}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Điểm nổi bật</h2>
              <ul className="space-y-3">
                {country.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Universities */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Trường Đại Học</h2>
              <div className="space-y-4">
                {country.topUniversities.map((uni, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-800">{uni.name}</h3>
                      <p className="text-sm text-blue-600">{uni.ranking}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-800">{uni.programs}</span>
                      <p className="text-xs text-gray-500">chương trình</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Programs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Chương Trình Học</h2>
              <div className="space-y-4">
                {country.programs.map((program, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{program.title}</h3>
                        <p className="text-sm text-gray-500">{program.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{program.fee}</p>
                        <p className="text-sm text-gray-500">{program.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost of Living */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Chi Phí Sinh Hoạt</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaHome className="text-blue-500" /> Nhà ở
                  </span>
                  <span className="font-semibold">{country.costOfLiving.accommodation}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-500" /> Ăn uống
                  </span>
                  <span className="font-semibold">{country.costOfLiving.food}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaCalendarAlt className="text-orange-500" /> Di chuyển
                  </span>
                  <span className="font-semibold">{country.costOfLiving.transport}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-blue-50 -mx-6 px-6 mt-4">
                  <span className="font-bold text-gray-800">Tổng cộng</span>
                  <span className="font-bold text-blue-600">{country.costOfLiving.total}</span>
                </div>
              </div>
            </div>

            {/* Visa Requirements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Yêu Cầu Visa</h3>
              <ul className="space-y-3">
                {country.visaRequirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <FaPassport className="text-blue-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Đăng Ký Tư Vấn Miễn Phí</h3>
              <p className="text-blue-100 text-sm mb-4">
                Nhận thông tin chi tiết về chương trình và hỗ trợ đăng ký
              </p>
              <Link
                to="/contact"
                className="block w-full bg-white text-blue-600 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Đăng Ký Ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
