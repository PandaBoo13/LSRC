import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaBookOpen,
  FaPaperPlane,
} from 'react-icons/fa';

const programData = {
  id: 1,
  title: 'Bachelor of Computer Science',
  university: 'National University of Singapore',
  country: 'Singapore',
  countryId: 'singapore',
  flag: '🇸🇬',
  duration: '4 years',
  fee: 'SGD 29,000/year',
  rating: 4.9,
  level: 'Bachelor',
  field: 'Technology',
  image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
  description: 'Chương trình Cử nhân Khoa học Máy tính tại NUS được đánh giá top đầu Châu Á. Sinh viên được học tập trong môi trường tiên tiến với cơ hội thực tập tại các tập đoàn công nghệ hàng đầu.',
  highlights: [
    'Đào tạo bởi các giáo sư hàng đầu thế giới',
    'Cơ hội thực tập tại Google, Microsoft, Amazon',
    'Phòng lab hiện đại với trang thiết bị tiên tiến',
    'Chương trình trao đổi sinh viên quốc tế',
    'Hỗ trợ việc làm sau tốt nghiệp',
  ],
  curriculum: [
    { semester: 'Year 1', courses: ['Introduction to Programming', 'Discrete Mathematics', 'Data Structures', 'Computer Architecture'] },
    { semester: 'Year 2', courses: ['Algorithms', 'Database Systems', 'Operating Systems', 'Object-Oriented Programming'] },
    { semester: 'Year 3', courses: ['Software Engineering', 'Artificial Intelligence', 'Computer Networks', 'Machine Learning'] },
    { semester: 'Year 4', courses: ['Capstone Project', 'Specialization Electives', 'Industry Internship', 'Research Methodology'] },
  ],
  requirements: [
    'Tốt nghiệp THPT với điểm GPA >= 3.5',
    'IELTS >= 6.5 hoặc TOEFL >= 90',
    'Điểm SAT >= 1450 (khuyến khích)',
    'Thư giới thiệu từ giáo viên',
    'Bài luận cá nhân',
  ],
  deadlines: [
    { round: 'Early Decision', date: '15/11/2026', status: 'upcoming' },
    { round: 'Regular Decision', date: '15/01/2027', status: 'upcoming' },
    { round: 'Final Deadline', date: '01/03/2027', status: 'upcoming' },
  ],
};

export default function ProgramDetailPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'requirements' | 'apply'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-96">
        <img src={programData.image} alt={programData.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Link to="/study-abroad" className="text-white/80 hover:text-white flex items-center gap-2 mb-4">
              <FaArrowLeft /> Quay lại Du học
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{programData.flag}</span>
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">{programData.level}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{programData.title}</h1>
            <p className="text-xl text-white/90">{programData.university}</p>
            <div className="flex items-center gap-6 mt-4 text-white/80">
              <span className="flex items-center gap-2"><FaMapMarkerAlt /> {programData.country}</span>
              <span className="flex items-center gap-2"><FaCalendarAlt /> {programData.duration}</span>
              <span className="flex items-center gap-2"><FaMoneyBillWave /> {programData.fee}</span>
              <span className="flex items-center gap-2"><FaStar className="text-yellow-400" /> {programData.rating}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'overview', label: 'Tổng quan' },
                  { id: 'curriculum', label: 'Chương trình học' },
                  { id: 'requirements', label: 'Yêu cầu' },
                  { id: 'apply', label: 'Đăng ký' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-6 py-4 font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">Giới thiệu chương trình</h3>
                      <p className="text-gray-600 leading-relaxed">{programData.description}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">Điểm nổi bật</h3>
                      <ul className="space-y-3">
                        {programData.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-600">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Curriculum */}
                {activeTab === 'curriculum' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Chương trình đào tạo</h3>
                    {programData.curriculum.map((semester, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-2">
                          <FaBookOpen /> {semester.semester}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {semester.courses.map((course, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-gray-600">
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              {course}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Requirements */}
                {activeTab === 'requirements' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Yêu cầu nhập học</h3>
                    <ul className="space-y-3">
                      {programData.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>

                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">Thời hạn đăng ký</h4>
                      <div className="space-y-3">
                        {programData.deadlines.map((deadline, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FaClock className="text-orange-500" />
                              <span className="font-semibold text-gray-800">{deadline.round}</span>
                            </div>
                            <span className="text-gray-600">{deadline.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Apply */}
                {activeTab === 'apply' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Đăng ký chương trình</h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Điểm GPA</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IELTS/TOEFL</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thư giới thiệu</label>
                        <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <FaPaperPlane /> Gửi đăng ký
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin nhanh</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Thời gian</span>
                  <span className="font-semibold">{programData.duration}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Học phí</span>
                  <span className="font-semibold text-blue-600">{programData.fee}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Đánh giá</span>
                  <span className="font-semibold flex items-center gap-1">
                    <FaStar className="text-yellow-400" /> {programData.rating}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Cấp bậc</span>
                  <span className="font-semibold">{programData.level}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Lĩnh vực</span>
                  <span className="font-semibold">{programData.field}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Cần tư vấn?</h3>
              <p className="text-blue-100 text-sm mb-4">Liên hệ với chúng tôi để được hỗ trợ tốt nhất</p>
              <Link to="/contact" className="block w-full bg-white text-blue-600 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Liên hệ ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
