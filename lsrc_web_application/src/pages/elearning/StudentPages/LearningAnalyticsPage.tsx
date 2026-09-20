import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBookOpen,
  FaClock,
  FaStar,
  FaFire,
} from 'react-icons/fa';

const stats = [
  { label: 'Khóa học đang học', value: '5', icon: <FaBookOpen />, color: 'bg-blue-100 text-blue-600' },
  { label: 'Giờ học tuần này', value: '12.5', icon: <FaClock />, color: 'bg-green-100 text-green-600' },
  { label: 'Chuỗi học liên tục', value: '7 ngày', icon: <FaFire />, color: 'bg-orange-100 text-orange-600' },
  { label: 'Điểm trung bình', value: '8.5', icon: <FaStar />, color: 'bg-yellow-100 text-yellow-600' },
];

const weeklyData = [
  { day: 'T2', hours: 2.5 },
  { day: 'T3', hours: 1.8 },
  { day: 'T4', hours: 3.2 },
  { day: 'T5', hours: 2.0 },
  { day: 'T6', hours: 1.5 },
  { day: 'T7', hours: 1.0 },
  { day: 'CN', hours: 0.5 },
];

const recentCourses = [
  { name: 'React Advanced', progress: 75, lastAccess: 'Hôm nay' },
  { name: 'Node.js Masterclass', progress: 45, lastAccess: 'Hôm qua' },
  { name: 'TypeScript Basics', progress: 100, lastAccess: '3 ngày trước' },
  { name: 'Python for AI', progress: 30, lastAccess: '5 ngày trước' },
];

const achievements = [
  { name: 'Học viên chăm chỉ', description: 'Học liên tục 7 ngày', icon: '🔥', earned: true },
  { name: 'Hoàn thành khóa đầu tiên', description: 'Hoàn thành 1 khóa học', icon: '🎓', earned: true },
  { name: 'Điểm xuất sắc', description: 'Đạt điểm > 9.0', icon: '⭐', earned: false },
  { name: 'Top learner', description: 'Top 10% học viên', icon: '🏆', earned: false },
];

export default function LearningAnalyticsPage() {
  const maxHours = Math.max(...weeklyData.map(d => d.hours));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Thống kê học tập</h1>
              <p className="text-gray-500">Theo dõi tiến trình học tập của bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Hoạt động tuần này</h2>
            <div className="flex items-end justify-between h-48 gap-2">
              {weeklyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-cyan-500 rounded-t-lg transition-all hover:bg-cyan-600"
                    style={{ height: `${(data.hours / maxHours) * 100}%` }}
                  />
                  <span className="text-sm text-gray-500 mt-2">{data.day}</span>
                  <span className="text-xs text-gray-400">{data.hours}h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Thành tích</h2>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    achievement.earned ? 'bg-yellow-50' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{achievement.name}</h3>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Khóa học gần đây</h2>
          <div className="space-y-4">
            {recentCourses.map((course, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{course.name}</h3>
                  <p className="text-sm text-gray-500">Truy cập lần cuối: {course.lastAccess}</p>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Tiến độ</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        course.progress === 100 ? 'bg-green-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                <Link
                  to="/learn/1/1"
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-600"
                >
                  {course.progress === 100 ? 'Xem lại' : 'Tiếp tục'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
