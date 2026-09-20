import { useState } from 'react';
import {
  FaCamera,
  FaEdit,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaBookOpen,
  FaHeart,
  FaComment,
  FaShare,
} from 'react-icons/fa';

const userData = {
  name: 'Nguyễn Minh Tuấn',
  avatar: 'https://i.pravatar.cc/150?img=3',
  cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
  bio: 'Sinh viên CNTT tại ĐHQG Hà Nội. Yêu thích AI và Machine Learning.',
  location: 'Hà Nội, Việt Nam',
  joinDate: 'Tháng 1, 2024',
  followers: 1234,
  following: 567,
  posts: 89,
  courses: 12,
};

const userPosts = [
  {
    id: 1,
    content: 'Vừa hoàn thành khóa học Machine Learning tại LSRC! Cảm ơn các giảng viên đã hướng dẫn tận tình.',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600',
    likes: 128,
    comments: 24,
    shares: 8,
    time: '2 giờ trước',
  },
  {
    id: 2,
    content: 'Chia sẻ kinh nghiệm học IELTS từ 5.0 lên 7.0 trong 3 tháng. Đọc bài viết đầy đủ tại blog của mình.',
    image: null,
    likes: 256,
    comments: 45,
    shares: 67,
    time: '1 ngày trước',
  },
  {
    id: 3,
    content: 'Hôm nay đi meetup AI tại Hà Nội, gặp được nhiều bạn thú vị. AI thực sự đang thay đổi thế giới!',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
    likes: 89,
    comments: 12,
    shares: 5,
    time: '3 ngày trước',
  },
];

const enrolledCourses = [
  { name: 'Machine Learning A-Z', progress: 85, image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=200' },
  { name: 'Python for Data Science', progress: 100, image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200' },
  { name: 'Deep Learning Specialization', progress: 45, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200' },
];

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'courses' | 'about'>('posts');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cover & Profile */}
      <div className="bg-white shadow-sm">
        <div className="relative h-64 md:h-80">
          <img src={userData.cover} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <button className="absolute top-4 right-4 bg-white/90 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white flex items-center gap-2">
            <FaCamera /> Đổi ảnh bìa
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <button className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                <FaCamera size={14} />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left pb-4">
              <h1 className="text-2xl font-bold text-gray-800">{userData.name}</h1>
              <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                <FaMapMarkerAlt /> {userData.location} · <FaCalendarAlt /> Tham gia {userData.joinDate}
              </p>
            </div>

            <button className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">
              <FaEdit /> Chỉnh sửa hồ sơ
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-8 mt-6 py-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{userData.posts}</div>
              <div className="text-gray-500 text-sm">Bài viết</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{userData.followers.toLocaleString()}</div>
              <div className="text-gray-500 text-sm">Theo dõi</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{userData.following}</div>
              <div className="text-gray-500 text-sm">Đang theo</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{userData.courses}</div>
              <div className="text-gray-500 text-sm">Khóa học</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'posts', label: 'Bài viết', icon: <FaBookOpen /> },
              { id: 'courses', label: 'Khóa học', icon: <FaBookOpen /> },
              { id: 'about', label: 'Giới thiệu', icon: <FaUsers /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {userPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={userData.avatar} alt={userData.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="font-semibold text-gray-800">{userData.name}</h4>
                    <p className="text-sm text-gray-500">{post.time}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{post.content}</p>
                {post.image && (
                  <img src={post.image} alt="Post" className="w-full rounded-lg object-cover max-h-96 mb-4" />
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-red-500">
                    <FaHeart /> {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500">
                    <FaComment /> {post.comments}
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-green-500">
                    <FaShare /> {post.shares}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {enrolledCourses.map((course, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                <img src={course.image} alt={course.name} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{course.name}</h3>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">Tiến độ</span>
                      <span className="font-semibold">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600">
                  {course.progress === 100 ? 'Hoàn thành' : 'Tiếp tục'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* About */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Giới thiệu</h3>
            <p className="text-gray-600 leading-relaxed">{userData.bio}</p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <FaMapMarkerAlt className="text-gray-400" /> {userData.location}
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <FaCalendarAlt className="text-gray-400" /> Tham gia {userData.joinDate}
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <FaBookOpen className="text-gray-400" /> {userData.courses} khóa học đã hoàn thành
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
