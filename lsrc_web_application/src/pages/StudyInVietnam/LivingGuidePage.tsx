import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaHome,
  FaUtensils,
  FaBus,
  FaShieldAlt,
  FaPhone,
} from 'react-icons/fa';

const accommodation = [
  { type: 'Ký túc xá', price: '1-3 triệu/tháng', description: 'An toàn, gần trường, có tiện ích chung', icon: '🏠' },
  { type: 'Thuê phòng trọ', price: '2-5 triệu/tháng', description: 'Riêng tư hơn, tự do sinh hoạt', icon: '🏢' },
  { type: 'Ở cùng gia đình', price: '3-6 triệu/tháng', description: 'Trải nghiệm văn hóa, có người hỗ trợ', icon: '👨‍👩‍👧' },
  { type: 'Căn hộ chung cư', price: '5-10 triệu/tháng', description: 'Đầy đủ tiện nghi, phù hợp nhóm', icon: '🏙️' },
];

const food = [
  { name: 'Phở', price: '30-50K', description: 'Món quốc dân, ăn sáng hoặc trưa' },
  { name: 'Bún chả', price: '40-60K', description: 'Đặc biệt Hà Nội, ăn trưa hoặc tối' },
  { name: 'Cơm tấm', price: '35-55K', description: 'Đặc biệt Sài Gòn, ăn trưa' },
  { name: 'Bánh mì', price: '15-25K', description: 'Ăn sáng nhanh, tiện lợi' },
  { name: 'Cơm bình dân', price: '25-40K', description: 'Ăn trưa no bụng, giá rẻ' },
  { name: 'Trà sữa', price: '25-45K', description: 'Đồ uống phổ biến' },
];

const transport = [
  { type: 'Xe buýt', price: '7-9K/lượt', description: 'Rẻ nhất, phủ sóng rộng' },
  { type: 'Grab/Bike', price: '15-30K', description: 'Tiện lợi, nhanh chóng' },
  { type: 'Grab/Car', price: '30-80K', description: 'Thoải mái, phù hợp nhóm' },
  { type: 'Thuê xe máy', price: '1-2 triệu/tháng', description: 'Tự do di chuyển' },
  { type: 'Taxi', price: '15-20K/km', description: 'An toàn,舒适' },
];

const tips = [
  { title: 'Mang theo hộ chiếu', description: 'Luôn mang theo bản photo hộ chiếu' },
  { title: 'Mua SIM当地', description: 'Mua SIM Vinaphone/Mobifone tại sân bay' },
  { title: 'Học几句越南语', description: 'Xin chào, cảm ơn, bao nhiêu tiền' },
  { title: 'Sử dụng ứng dụng', description: 'Grab, Google Maps, Google Translate' },
  { title: 'Mua bảo hiểm', description: 'Bảo hiểm y tế cho du học sinh' },
  { title: 'Biết số khẩn cấp', description: '113 (cảnh sát), 115 (cấp cứu)' },
];

export default function LivingGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/study-in-vietnam" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <FaArrowLeft /> Quay lại
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Hướng Dẫn Sinh Hoạt</h1>
          <p className="text-orange-100">Mọi thứ cần biết khi sống tại Việt Nam</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Accommodation */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaHome className="text-orange-500" /> Nhà ở
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {accommodation.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.type}</h3>
                <p className="text-orange-600 font-semibold mb-2">{item.price}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Food */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaUtensils className="text-red-500" /> Ẩm thực
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Món ăn</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Giá</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {food.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-orange-600">{item.price}</td>
                    <td className="px-6 py-4 text-gray-600">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transport */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaBus className="text-blue-500" /> Di chuyển
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transport.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  🚗
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.type}</h3>
                  <p className="text-blue-600 font-semibold">{item.price}</p>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaShieldAlt className="text-green-500" /> Mẹo hữu ích
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <h3 className="font-bold text-gray-800 mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency */}
        <section className="bg-red-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaPhone className="text-red-500" /> Số điện thoại khẩn cấp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🚔</div>
              <h3 className="font-bold text-gray-800">Cảnh sát</h3>
              <p className="text-2xl font-bold text-red-600">113</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🚑</div>
              <h3 className="font-bold text-gray-800">Cấp cứu</h3>
              <p className="text-2xl font-bold text-red-600">115</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <h3 className="font-bold text-gray-800">Cứu hỏa</h3>
              <p className="text-2xl font-bold text-red-600">114</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
