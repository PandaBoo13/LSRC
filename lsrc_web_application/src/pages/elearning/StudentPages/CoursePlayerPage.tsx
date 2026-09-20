import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
  FaExpand,
  FaBookOpen,
  FaStickyNote,
  FaBookmark,
  FaCheckCircle,
  FaArrowLeft,
  FaList,
  FaClock,
} from 'react-icons/fa';

const lessons = [
  { id: 1, title: 'Giới thiệu khóa học', duration: '5:30', completed: true },
  { id: 2, title: 'Cài đặt môi trường', duration: '12:45', completed: true },
  { id: 3, title: 'Biến và kiểu dữ liệu', duration: '18:20', completed: true },
  { id: 4, title: 'Cấu trúc điều khiển', duration: '22:15', completed: false, current: true },
  { id: 5, title: 'Hàm và closure', duration: '25:00', completed: false },
  { id: 6, title: 'Đối tượng và lớp', duration: '28:30', completed: false },
  { id: 7, title: 'Xử lý lỗi', duration: '15:45', completed: false },
  { id: 8, title: 'Bài tập thực hành', duration: '30:00', completed: false },
];

const notes = [
  { id: 1, time: '2:30', content: 'Ghi chú về biến let vs const' },
  { id: 2, time: '8:45', content: 'Lưu ý về scope của biến' },
  { id: 3, time: '15:20', content: 'Công thức tính area' },
];

export default function CoursePlayerPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [showNotes, setShowNotes] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [currentNote, setCurrentNote] = useState('');

  const completedCount = lessons.filter(l => l.completed).length;
  const totalDuration = lessons.reduce((acc, l) => {
    const [min, sec] = l.duration.split(':').map(Number);
    return acc + min * 60 + sec;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/my-courses" className="text-gray-400 hover:text-white">
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-white font-semibold">Lập trình Web với React</h1>
              <p className="text-gray-400 text-sm">Bài 4: Cấu trúc điều khiển</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span>{completedCount}/{lessons.length} bài học</span>
            <span>{Math.floor(totalDuration / 60)} phút</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          {/* Video Player */}
          <div className="relative bg-black aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200"
                alt="Course"
                className="w-full h-full object-cover opacity-50"
              />
            </div>

            {/* Play Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                {isPlaying ? (
                  <FaPause className="text-white text-3xl" />
                ) : (
                  <FaPlay className="text-white text-3xl ml-2" />
                )}
              </div>
            </button>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>8:30</span>
                  <span>22:15</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="text-white hover:text-cyan-400">
                    <FaStepBackward />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:text-cyan-400"
                  >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  <button className="text-white hover:text-cyan-400">
                    <FaStepForward />
                  </button>
                  <button className="text-white hover:text-cyan-400">
                    <FaVolumeUp />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`flex items-center gap-2 px-3 py-1 rounded ${showNotes ? 'bg-cyan-500 text-white' : 'text-white hover:text-cyan-400'}`}
                  >
                    <FaStickyNote /> Ghi chú
                  </button>
                  <button className="text-white hover:text-cyan-400">
                    <FaBookmark />
                  </button>
                  <button className="text-white hover:text-cyan-400">
                    <FaExpand />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Panel */}
          {showNotes && (
            <div className="bg-gray-800 border-t border-gray-700 p-4">
              <h3 className="text-white font-semibold mb-3">Ghi chú bài học</h3>
              <div className="space-y-3 mb-4">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-cyan-400 text-sm mb-1">
                      <FaClock size={12} /> {note.time}
                    </div>
                    <p className="text-gray-300 text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Thêm ghi chú tại 8:30..."
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                />
                <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-600">
                  Thêm
                </button>
              </div>
            </div>
          )}

          {/* Course Info */}
          <div className="bg-gray-800 p-6">
            <div className="flex gap-4 mb-4">
              <button className="flex items-center gap-2 text-cyan-400 border-b-2 border-cyan-400 pb-2">
                <FaBookOpen /> Tổng quan
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white pb-2">
                <FaStickyNote /> Ghi chú (3)
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white pb-2">
                <FaBookmark /> Đánh dấu
              </button>
            </div>

            <h2 className="text-white text-xl font-bold mb-2">Bài 4: Cấu trúc điều khiển</h2>
            <p className="text-gray-400 mb-4">
              Trong bài học này, bạn sẽ tìm hiểu về các cấu trúc điều khiển trong JavaScript bao gồm
              if/else, switch, và các vòng lặp for, while, do-while.
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><FaClock /> 22:15</span>
              <span className="flex items-center gap-1"><FaBookOpen /> 8 bài học</span>
              <span className="flex items-center gap-1"><FaCheckCircle /> 3 hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Sidebar - Playlist */}
        <div className={`w-80 bg-gray-800 border-l border-gray-700 ${showPlaylist ? 'block' : 'hidden'}`}>
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-semibold">Nội dung khóa học</h3>
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="text-gray-400 hover:text-white"
            >
              <FaList />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                  lesson.current ? 'bg-gray-700 border-l-4 border-cyan-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {lesson.completed ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : lesson.current ? (
                      <FaPlay className="text-cyan-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-500"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${lesson.current ? 'text-cyan-400' : 'text-white'}`}>
                      {lesson.title}
                    </h4>
                    <span className="text-xs text-gray-500">{lesson.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
