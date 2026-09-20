import { useState } from 'react';
import {
  FaSearch,
  FaPaperPlane,
  FaImage,
  FaSmile,
  FaEllipsisV,
} from 'react-icons/fa';

const conversations = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Chào bạn, mình muốn hỏi về khóa học...',
    time: '2 phút trước',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Cảm ơn bạn đã chia sẻ!',
    time: '15 phút trước',
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: 'Lê Minh C',
    avatar: 'https://i.pravatar.cc/150?img=8',
    lastMessage: 'Mình đã đăng ký khóa học rồi',
    time: '1 giờ trước',
    unread: 1,
    online: false,
  },
  {
    id: 4,
    name: 'Phạm Thu D',
    avatar: 'https://i.pravatar.cc/150?img=9',
    lastMessage: 'Hẹn gặp lại bạn nhé!',
    time: '3 giờ trước',
    unread: 0,
    online: false,
  },
];

const messages = [
  { id: 1, sender: 'other', content: 'Chào bạn, mình muốn hỏi về khóa học Data Science', time: '10:30' },
  { id: 2, sender: 'me', content: 'Chào bạn! Khóa học đang có ưu đãi giảm 20%', time: '10:32' },
  { id: 3, sender: 'other', content: 'Tuyệt vời! Thời gian học là bao lâu?', time: '10:33' },
  { id: 4, sender: 'me', content: 'Khóa học kéo dài 6 tháng, học online 3 buổi/tuần', time: '10:35' },
  { id: 5, sender: 'other', content: 'Mình có thể đăng ký thử không?', time: '10:36' },
  { id: 6, sender: 'me', content: 'Được bạn! Bạn có thể đăng ký học thử miễn phí 7 ngày', time: '10:38' },
];

export default function SocialMessagesPage() {
  const [selectedConvo, setSelectedConvo] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [localMessages, setLocalMessages] = useState(messages);

  const handleSend = () => {
    if (newMessage.trim()) {
      setLocalMessages([
        ...localMessages,
        { id: Date.now(), sender: 'me', content: newMessage, time: 'Now' },
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-120px)]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Tin nhắn</h2>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConvo(convo)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${
                      selectedConvo.id === convo.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={convo.avatar}
                        alt={convo.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {convo.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800 text-sm">{convo.name}</h4>
                        <span className="text-xs text-gray-500">{convo.time}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{convo.lastMessage}</p>
                    </div>
                    {convo.unread > 0 && (
                      <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {convo.unread}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConvo.avatar}
                    alt={selectedConvo.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedConvo.name}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedConvo.online ? 'Đang hoạt động' : 'Không hoạt động'}
                    </p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <FaEllipsisV />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {localMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        msg.sender === 'me'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-gray-200 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <button className="text-gray-500 hover:text-gray-700">
                    <FaImage />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <FaSmile />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleSend}
                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
