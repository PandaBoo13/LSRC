import { useState } from 'react';
import {
  FaBell,
  FaHeart,
  FaComment,
  FaUserPlus,
  FaGraduationCap,
  FaCalendar,
  FaCog,
  FaCheck,
  FaTrash,
} from 'react-icons/fa';

const notifications = [
  {
    id: 1,
    type: 'like',
    user: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?img=5',
    content: 'đã thích bài viết của bạn',
    time: '5 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'comment',
    user: 'Lê Minh C',
    avatar: 'https://i.pravatar.cc/150?img=8',
    content: 'đã bình luận về bài viết của bạn',
    time: '15 phút trước',
    read: false,
  },
  {
    id: 3,
    type: 'follow',
    user: 'Phạm Thu D',
    avatar: 'https://i.pravatar.cc/150?img=9',
    content: 'đã bắt đầu theo dõi bạn',
    time: '1 giờ trước',
    read: true,
  },
  {
    id: 4,
    type: 'course',
    user: 'Hệ thống',
    avatar: 'https://i.pravatar.cc/150?img=12',
    content: 'Bạn đã hoàn thành khóa học "Python for Data Science"',
    time: '2 giờ trước',
    read: true,
  },
  {
    id: 5,
    type: 'event',
    user: 'LSRC Events',
    avatar: 'https://i.pravatar.cc/150?img=15',
    content: 'Workshop "AI for Beginners" sẽ diễn ra vào ngày 15/07',
    time: '5 giờ trước',
    read: true,
  },
  {
    id: 6,
    type: 'like',
    user: 'Nguyễn Văn E',
    avatar: 'https://i.pravatar.cc/150?img=11',
    content: 'đã thích bình luận của bạn',
    time: '1 ngày trước',
    read: true,
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'like': return <FaHeart className="text-red-500" />;
    case 'comment': return <FaComment className="text-blue-500" />;
    case 'follow': return <FaUserPlus className="text-green-500" />;
    case 'course': return <FaGraduationCap className="text-purple-500" />;
    case 'event': return <FaCalendar className="text-orange-500" />;
    default: return <FaBell className="text-gray-500" />;
  }
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: number) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifs(notifs.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifs(notifs.filter(n => n.id !== id));
  };

  const filtered = filter === 'unread' ? notifs.filter(n => !n.read) : notifs;
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
              <p className="text-gray-500">{unreadCount} thông báo chưa đọc</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                <FaCheck /> Đọc tất cả
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <FaCog />
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === 'all' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === 'unread' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                !notif.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <img src={notif.avatar} alt={notif.user} className="w-12 h-12 rounded-full object-cover" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                  {getIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1">
                <p className="text-gray-700">
                  <span className="font-semibold">{notif.user}</span> {notif.content}
                </p>
                <p className="text-sm text-gray-500 mt-1">{notif.time}</p>
              </div>

              <div className="flex items-center gap-2">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-blue-500 hover:text-blue-600"
                    title="Đánh dấu đã đọc"
                  >
                    <FaCheck size={14} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="Xóa"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <FaBell className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có thông báo nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
