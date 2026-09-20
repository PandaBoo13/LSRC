import { useState } from 'react';
import {
  FaHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaImage,
  FaVideo,
  FaSmile,
  FaEllipsisH,
  FaUserPlus,
  FaSearch,
  FaUsers,
  FaNewspaper,
} from 'react-icons/fa';

const posts = [
  {
    id: 1,
    user: {
      name: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?img=1',
      role: 'Student',
    },
    content: 'Vừa hoàn thành khóa học Data Science tại LSRC! Cảm ơn các giảng viên đã hướng dẫn tận tình. Đây là hành trình 6 tháng đầy thử thách nhưng rất đáng giá. #DataScience #LSRC',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
    likes: 128,
    comments: 24,
    shares: 8,
    time: '2 giờ trước',
    liked: false,
    saved: false,
  },
  {
    id: 2,
    user: {
      name: 'Trần Thị B',
      avatar: 'https://i.pravatar.cc/150?img=5',
      role: 'Instructor',
    },
    content: 'Khóa học mới "AI for Beginners" sắp khai giảng! Đăng ký sớm để nhận ưu đãi giảm 30%. Chương trình học thực hành 100%, cam kết việc làm sau tốt nghiệp.',
    image: null,
    likes: 89,
    comments: 15,
    shares: 45,
    time: '5 giờ trước',
    liked: true,
    saved: false,
  },
  {
    id: 3,
    user: {
      name: 'Lê Minh C',
      avatar: 'https://i.pravatar.cc/150?img=8',
      role: 'Student',
    },
    content: 'Chia sẻ kinh nghiệm du học Singapore từ LSRC. Các bạn tư vấn rất chi tiết từ visa đến nhà ở. Mình đã có scholarship 50% nhờ sự hỗ trợ của team!',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600',
    likes: 256,
    comments: 42,
    shares: 67,
    time: '1 ngày trước',
    liked: false,
    saved: true,
  },
];

const trendingTopics = [
  { tag: '#DuHocSingapore', posts: 1234 },
  { tag: '#DataScience', posts: 892 },
  { tag: '#IELTS', posts: 756 },
  { tag: '#HọcBổng', posts: 634 },
  { tag: '#AI2024', posts: 521 },
];

const suggestedUsers = [
  { name: 'PGS. TS. Trần Văn D', role: 'Giảng viên AI', avatar: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Công ty TechViet', role: 'Đối tác tuyển dụng', avatar: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Nhóm Du học sinh', role: 'Cộng đồng 5K thành viên', avatar: 'https://i.pravatar.cc/150?img=13' },
];

export default function SocialFeedPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'groups'>('feed');
  const [newPost, setNewPost] = useState('');
  const [localPosts, setLocalPosts] = useState(posts);

  const handleLike = (postId: number) => {
    setLocalPosts(localPosts.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId: number) => {
    setLocalPosts(localPosts.map(post =>
      post.id === postId ? { ...post, saved: !post.saved } : post
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://i.pravatar.cc/150?img=3"
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">Phạm Minh E</h3>
                  <p className="text-sm text-gray-500">Student</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-bold text-gray-800">128</div>
                  <div className="text-gray-500">Bài viết</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-bold text-gray-800">1.2K</div>
                  <div className="text-gray-500">Theo dõi</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-bold text-gray-800">356</div>
                  <div className="text-gray-500">Đang theo</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-xl shadow-sm p-2">
              <button
                onClick={() => setActiveTab('feed')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'feed' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <FaNewspaper /> Bảng tin
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'trending' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <FaSearch /> Xu hướng
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'groups' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <FaUsers /> Nhóm
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start gap-3">
                <img
                  src="https://i.pravatar.cc/150?img=3"
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Bạn đang nghĩ gì?"
                    className="w-full p-3 bg-gray-50 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
                        <FaImage /> Ảnh
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-green-600">
                        <FaVideo /> Video
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-yellow-600">
                        <FaSmile /> Cảm xúc
                      </button>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Đăng
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            {localPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.user.avatar}
                      alt={post.user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">{post.user.name}</h4>
                      <p className="text-sm text-gray-500">{post.user.role} · {post.time}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <FaEllipsisH />
                  </button>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-4">
                  <p className="text-gray-800 mb-4">{post.content}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full rounded-lg object-cover max-h-96"
                    />
                  )}
                </div>

                {/* Post Stats */}
                <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>{post.likes} lượt thích</span>
                  <div className="flex gap-4">
                    <span>{post.comments} bình luận</span>
                    <span>{post.shares} chia sẻ</span>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-around">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      post.liked ? 'text-red-500' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <FaHeart /> Thích
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50">
                    <FaComment /> Bình luận
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50">
                    <FaShare /> Chia sẻ
                  </button>
                  <button
                    onClick={() => handleSave(post.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      post.saved ? 'text-blue-500' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <FaBookmark /> Lưu
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Trending */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-4">Xu hướng</h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-blue-600">{topic.tag}</p>
                      <p className="text-sm text-gray-500">{topic.posts} bài viết</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-4">Gợi ý kết nối</h3>
              <div className="space-y-4">
                {suggestedUsers.map((user, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700">
                      <FaUserPlus />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-4">Sự kiện sắp tới</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 text-blue-600 rounded-lg p-2 text-center min-w-12">
                    <div className="text-xl font-bold">15</div>
                    <div className="text-xs">T7</div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Workshop AI</p>
                    <p className="text-xs text-gray-500">Online · 14:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="bg-green-100 text-green-600 rounded-lg p-2 text-center min-w-12">
                    <div className="text-xl font-bold">20</div>
                    <div className="text-xs">T7</div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Hội thảo Du học</p>
                    <p className="text-xs text-gray-500">TP.HCM · 09:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
