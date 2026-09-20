import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaGraduationCap,
  FaPaperPlane,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaIdCard,
} from 'react-icons/fa';

const aceTekPrograms: Record<string, {
  title: string;
  duration: string;
  fee: string;
  intake: string;
  requirements: string[];
  highlights: string[];
  curriculum: string[];
  image: string;
  description: string;
}> = {
  '1': { title: 'Diploma in Hospitality Management', duration: '8 months', fee: 'SGD 8,500', intake: 'Jan, Apr, Jul, Oct', requirements: ['Onsite 18 years old', 'GCE O-Level or Equivalent', 'IELTS 5.5 or Equivalent'], highlights: ['Thực tập tại khách sạn 5 sao', 'Chứng chỉ được công nhận', 'Hỗ trợ việc làm'], curriculum: ['Introduction to Hospitality', 'Hotel Operations Management', 'Food & Beverage Management', 'Front Office Operations', 'Housekeeping Management', 'Marketing for Hospitality'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description: 'Chương trình đào tạo quản lý khách sạn chuyên nghiệp tại Singapore.' },
  '2': { title: 'Diploma in Food & Beverage Operations', duration: '8 months', fee: 'SGD 8,500', intake: 'Jan, Apr, Jul, Oct', requirements: ['Onsite 18 years old', 'GCE O-Level or Equivalent', 'IELTS 5.5 or Equivalent'], highlights: ['Kitchen management', 'Wine & beverage knowledge', 'Restaurant operations'], curriculum: ['F&B Introduction', 'Kitchen Management', 'Wine & Beverage', 'Restaurant Operations', 'Cost Control', 'Customer Service'], image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', description: 'Đào tạo quản lý nhà hàng và dịch vụ ăn uống cao cấp.' },
  '3': { title: 'Diploma in Business IT', duration: '8 months', fee: 'SGD 9,000', intake: 'Jan, Apr, Jul, Oct', requirements: ['Onsite 18 years old', 'GCE O-Level or Equivalent', 'IELTS 5.5 or Equivalent'], highlights: ['Digital transformation', 'Business analytics', 'IT project management'], curriculum: ['Business Fundamentals', 'IT Systems', 'Database Management', 'Business Analytics', 'Project Management', 'Digital Marketing'], image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800', description: 'Kết hợp kinh doanh và công nghệ thông tin.' },
  '4': { title: 'Diploma in Logistics & Supply Chain', duration: '8 months', fee: 'SGD 8,500', intake: 'Jan, Apr, Jul, Oct', requirements: ['Onsite 18 years old', 'GCE O-Level or Equivalent', 'IELTS 5.5 or Equivalent'], highlights: ['Global logistics', 'Warehouse management', 'Procurement'], curriculum: ['Supply Chain Basics', 'Warehouse Management', 'Transportation', 'Procurement', 'Inventory Control', 'Global Logistics'], image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800', description: 'Quản lý chuỗi cung ứng và logistics quốc tế.' },
  '5': { title: 'Diploma in Patisserie & Baking', duration: '8 months', fee: 'SGD 9,500', intake: 'Jan, Apr, Jul, Oct', requirements: ['Onsite 18 years old', 'GCE O-Level or Equivalent', 'IELTS 5.5 or Equivalent'], highlights: ['Hands-on training', 'Professional kitchen', 'International recipes'], curriculum: ['Baking Fundamentals', 'Pastry Arts', 'Chocolate & Confectionery', 'Bread Making', 'Cake Decorating', 'Food Safety'], image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', description: 'Nghệ thuật làm bánh và pastry từ cơ bản đến nâng cao.' },
  '6': { title: 'Higher Diploma in Hospitality Management', duration: '16 months', fee: 'SGD 16,000', intake: 'Jan, Jul', requirements: ['Onsite 18 years old', 'Diploma or Equivalent', 'IELTS 6.0 or Equivalent'], highlights: ['6-month internship', 'Industry certification', 'Career placement'], curriculum: ['Advanced Hotel Management', 'Revenue Management', 'Strategic Planning', 'HR Management', 'Finance for Hospitality', 'Industry Internship'], image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description: 'Chương trình nâng cao với thực tập 6 tháng tại Singapore.' },
  '7': { title: 'Higher Diploma in Food Service & Culinary', duration: '16 months', fee: 'SGD 17,000', intake: 'Jan, Jul', requirements: ['Onsite 18 years old', 'Diploma or Equivalent', 'IELTS 6.0 or Equivalent'], highlights: ['Advanced culinary skills', 'Kitchen management', 'F&B business'], curriculum: ['Advanced Culinary', 'Menu Planning', 'Kitchen Management', 'F&B Business', 'Food Innovation', 'Industry Internship'], image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800', description: 'Đào tạo đầu bếp chuyên nghiệp với kỹ năng quản lý.' },
  '8': { title: 'Postgraduate Diploma in Management', duration: '12 months', fee: 'SGD 18,000', intake: 'Jan, Jul', requirements: ['Bachelor degree', '2 years work experience', 'IELTS 6.5 or Equivalent'], highlights: ['Executive training', 'Leadership skills', 'Global perspective'], curriculum: ['Strategic Management', 'Leadership', 'Finance', 'Marketing', 'Innovation', 'Capstone Project'], image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', description: 'Nâng cao kỹ năng quản lý cho người đi làm.' },
  '9': { title: 'Diploma in AI Enabled Guest Services', duration: '8 months', fee: 'SGD 9,500', intake: 'Jan, Apr, Jul, Oct', requirements: ['Onsite 18 years old', 'GCE O-Level or Equivalent', 'IELTS 5.5 or Equivalent'], highlights: ['AI in hospitality', 'Chatbot design', 'Smart hotel tech'], curriculum: ['AI Fundamentals', 'Chatbot Design', 'Smart Hotel Systems', 'Data Analytics', 'Customer Experience', 'Implementation'], image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', description: 'Ứng dụng AI trong ngành dịch vụ khách hàng.' },
};

type ApplicationStep = 'info' | 'documents' | 'review' | 'submit';

export default function AceTekProgramDetailPage() {
  const { programId } = useParams<{ programId: string }>();
  const program = aceTekPrograms[programId || '1'] || aceTekPrograms['1'];

  const [step, setStep] = useState<ApplicationStep>('info');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    dateOfBirth: '',
    passportNumber: '',
    passportExpiry: '',
    highestEducation: '',
    englishLevel: '',
    workExperience: '',
    howDidYouHear: '',
    additionalNotes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log('Application submitted:', { program: program.title, ...formData });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký thành công!</h2>
          <p className="text-gray-500 mb-6">Chúng tôi sẽ liên hệ bạn trong vòng 24 giờ để tư vấn chi tiết.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-600"><strong>Chương trình:</strong> {program.title}</p>
            <p className="text-sm text-gray-600"><strong>Họ tên:</strong> {formData.firstName} {formData.lastName}</p>
            <p className="text-sm text-gray-600"><strong>Email:</strong> {formData.email}</p>
            <p className="text-sm text-gray-600"><strong>Điện thoại:</strong> {formData.phone}</p>
          </div>
          <Link to="/study-abroad" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const steps: { id: ApplicationStep; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Thông tin', icon: <FaUser /> },
    { id: 'documents', label: 'Hồ sơ', icon: <FaIdCard /> },
    { id: 'review', label: 'Xác nhận', icon: <FaCheckCircle /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-80">
        <img src={program.image} alt={program.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Link to="/study-abroad/programs" className="text-white/80 hover:text-white flex items-center gap-2 mb-4">
              <FaArrowLeft /> Quay lại danh sách
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">{program.title}</h1>
            <div className="flex items-center gap-4 text-white/80">
              <span className="flex items-center gap-1"><FaMapMarkerAlt /> AceTek College Singapore</span>
              <span className="flex items-center gap-1"><FaCalendarAlt /> {program.duration}</span>
              <span className="flex items-center gap-1"><FaMoneyBillWave /> {program.fee}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Giới thiệu chương trình</h2>
              <p className="text-gray-600 mb-4">{program.description}</p>
              <h3 className="font-bold text-gray-800 mb-3">Điểm nổi bật:</h3>
              <ul className="space-y-2">
                {program.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <FaCheckCircle className="text-green-500" size={14} /> {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Chương trình học</h2>
              <div className="grid grid-cols-2 gap-3">
                {program.curriculum.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FaGraduationCap className="text-blue-500" size={14} />
                    <span className="text-gray-700 text-sm">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Yêu cầu nhập học</h3>
              <ul className="space-y-3">
                {program.requirements.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <FaCheckCircle className="text-green-500" size={14} /> {r}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700"><strong>Khai giảng:</strong> {program.intake}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-3">Đăng ký tư vấn miễn phí</h3>
              <div className="space-y-2 text-sm text-blue-100">
                <p className="flex items-center gap-2"><FaPhone /> Hotline: +65 6235 1234</p>
                <p className="flex items-center gap-2"><FaEnvelope /> Email: info@acetek.edu.sg</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Đăng ký chương trình</h2>

          <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  step === s.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {s.icon}
                  <span className="text-sm font-semibold">{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className="w-12 h-px bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>

          {step === 'info' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 mb-4">Thông tin cá nhân</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ *</label>
                  <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
                  <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại *</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quốc tịch *</label>
                  <input name="nationality" value={formData.nationality} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
                  <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setStep('documents')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {step === 'documents' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 mb-4">Hồ sơ học tập</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số hộ chiếu</label>
                  <input name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn hộ chiếu</label>
                  <input name="passportExpiry" type="date" value={formData.passportExpiry} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ học vấn cao nhất</label>
                  <select name="highestEducation" value={formData.highestEducation} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Chọn</option>
                    <option value="thpt">THPT</option>
                    <option value="college">Cao đẳng</option>
                    <option value="bachelor">Cử nhân</option>
                    <option value="master">Thạc sĩ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ tiếng Anh</label>
                  <select name="englishLevel" value={formData.englishLevel} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Chọn</option>
                    <option value="ielts5">IELTS 5.0-5.5</option>
                    <option value="ielts6">IELTS 6.0-6.5</option>
                    <option value="ielts7">IELTS 7.0+</option>
                    <option value="none">Chưa có chứng chỉ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm làm việc (nếu có)</label>
                <textarea name="workExperience" value={formData.workExperience} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep('info')} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">
                  Quay lại
                </button>
                <button onClick={() => setStep('review')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <h3 className="font-bold text-gray-800 mb-4">Xác nhận thông tin</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Thông tin cá nhân</h4>
                  <p className="text-sm text-gray-600"><strong>Họ tên:</strong> {formData.firstName} {formData.lastName}</p>
                  <p className="text-sm text-gray-600"><strong>Email:</strong> {formData.email}</p>
                  <p className="text-sm text-gray-600"><strong>Điện thoại:</strong> {formData.phone}</p>
                  <p className="text-sm text-gray-600"><strong>Quốc tịch:</strong> {formData.nationality}</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Hồ sơ</h4>
                  <p className="text-sm text-gray-600"><strong>Hộ chiếu:</strong> {formData.passportNumber || 'Chưa cập nhật'}</p>
                  <p className="text-sm text-gray-600"><strong>Trình độ:</strong> {formData.highestEducation || 'Chưa cập nhật'}</p>
                  <p className="text-sm text-gray-600"><strong>Tiếng Anh:</strong> {formData.englishLevel || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Lưu ý:</strong> Bằng việc đăng ký, bạn đồng ý với điều khoản sử dụng của LSRC và AceTek College.
                </p>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep('documents')} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">
                  Quay lại
                </button>
                <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                  <FaPaperPlane /> Gửi đăng ký
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
