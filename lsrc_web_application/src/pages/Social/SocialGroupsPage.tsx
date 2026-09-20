import { useState } from 'react';
import {
  FaUsers,
  FaSearch,
  FaPlus,
  FaCalendar,
  FaComments,
  FaLock,
  FaGlobe,
} from 'react-icons/fa';

const groups = [
  {
    id: 1,
    name: 'Du học sinh Singapore',
    description: 'Cộng đồng du học sinh Việt Nam tại Singapore. Chia sẻ kinh nghiệm học tập và cuộc sống.',
    members: 2345,
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400',
    isPublic: true,
    posts: 1234,
    events: 12,
    joined: false,
  },
  {
    id: 2,
    name: 'AI & Data Science Enthusiasts',
    description: 'Nhóm yêu thích AI và Data Science. Học hỏi, chia sẻ kiến thức và dự án.',
    members: 5678,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
    isPublic: true,
    posts: 3456,
    events: 8,
    joined: true,
  },
  {
    id: 3,
    name: 'IELTS Preparation',
    description: 'Chuẩn bị thi IELTS cùng nhau. Tài liệu, mẹo thi, và luyện tập nhóm.',
    members: 8901,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    isPublic: true,
    posts: 5678,
    events: 24,
    joined: false,
  },
  {
    id: 4,
    name: 'Startup & Innovation',
    description: 'Kết nối startup và innovator. Chia sẻ ý tưởng, tìm kiếm đối tác.',
    members: 1234,
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
    isPublic: false,
    posts: 890,
    events: 6,
    joined: false,
  },
  {
    id: 5,
    name: 'Study in Vietnam',
    description: 'Học viên quốc tế tại Việt Nam. Chia sẻ trải nghiệm và văn hóa.',
    members: 3456,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
    isPublic: true,
    posts: 2345,
    events: 15,
    joined: true,
  },
  {
    id: 6,
    name: 'Web Development',
    description: 'Nhóm phát triển web. React, Vue, Angular và nhiều framework khác.',
    members: 4567,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
    isPublic: true,
    posts: 4567,
    events: 10,
    joined: false,
  },
];

const myGroups = groups.filter(g => g.joined);

export default function SocialGroupsPage() {
  const [activeTab, setActiveTab] = useState<'discover' | 'my'>('discover');
  const [searchTerm, setSearchTerm] = useState('');
  const [localGroups, setLocalGroups] = useState(groups);

  const handleJoin = (groupId: number) => {
    setLocalGroups(localGroups.map(g =>
      g.id === groupId
        ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 }
        : g
    ));
  };

  const displayGroups = activeTab === 'my'
    ? localGroups.filter(g => g.joined)
    : localGroups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Nhóm</h1>
              <p className="text-gray-500">Tham gia nhóm để kết nối với cộng đồng</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              <FaPlus /> Tạo nhóm mới
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('discover')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'discover'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Khám phá
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'my'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Nhóm của tôi ({myGroups.length})
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhóm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-40">
                <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                  {group.isPublic ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FaGlobe /> Công khai
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FaLock /> Riêng tư
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2">{group.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{group.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FaUsers /> {group.members.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaComments /> {group.posts}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendar /> {group.events}
                  </span>
                </div>
                <button
                  onClick={() => handleJoin(group.id)}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                    group.joined
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {group.joined ? 'Đã tham gia' : 'Tham gia'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {displayGroups.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy nhóm nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
