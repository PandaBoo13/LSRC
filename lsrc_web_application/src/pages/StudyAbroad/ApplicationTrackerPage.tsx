import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaCalendarAlt,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';

type ApplicationStatus = 'pending' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';

interface Application {
  id: number;
  program: string;
  university: string;
  country: string;
  flag: string;
  status: ApplicationStatus;
  deadline: string;
  documents: { name: string; uploaded: boolean }[];
  notes: string;
}

const initialApplications: Application[] = [
  {
    id: 1,
    program: 'Bachelor of Computer Science',
    university: 'National University of Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    status: 'in_progress',
    deadline: '15/01/2027',
    documents: [
      { name: 'Hộ chiếu', uploaded: true },
      { name: 'Bảng điểm', uploaded: true },
      { name: 'IELTS Certificate', uploaded: false },
      { name: 'Thư giới thiệu', uploaded: false },
      { name: 'Bài luận', uploaded: false },
    ],
    notes: 'Đang chuẩn bị IELTS',
  },
  {
    id: 2,
    program: 'Master of Data Science',
    university: 'University of Melbourne',
    country: 'Australia',
    flag: '🇦🇺',
    status: 'pending',
    deadline: '01/03/2027',
    documents: [
      { name: 'Hộ chiếu', uploaded: true },
      { name: 'Bảng điểm ĐH', uploaded: false },
      { name: 'IELTS Certificate', uploaded: false },
      { name: 'CV', uploaded: false },
    ],
    notes: 'Sẽ đăng ký sau',
  },
  {
    id: 3,
    program: 'MSc Artificial Intelligence',
    university: 'University of Edinburgh',
    country: 'UK',
    flag: '🇬🇧',
    status: 'submitted',
    deadline: '30/11/2026',
    documents: [
      { name: 'Hộ chiếu', uploaded: true },
      { name: 'Bảng điểm', uploaded: true },
      { name: 'IELTS Certificate', uploaded: true },
      { name: 'Thư giới thiệu', uploaded: true },
      { name: 'Bài luận', uploaded: true },
    ],
    notes: 'Đã gửi hồ sơ, chờ phản hồi',
  },
];

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Chưa bắt đầu', color: 'bg-gray-100 text-gray-700', icon: <FaClock /> },
  in_progress: { label: 'Đang chuẩn bị', color: 'bg-yellow-100 text-yellow-700', icon: <FaExclamationTriangle /> },
  submitted: { label: 'Đã gửi', color: 'bg-blue-100 text-blue-700', icon: <FaFileAlt /> },
  accepted: { label: 'Được chấp nhận', color: 'bg-green-100 text-green-700', icon: <FaCheckCircle /> },
  rejected: { label: 'Bị từ chối', color: 'bg-red-100 text-red-700', icon: <FaExclamationTriangle /> },
};

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const toggleDocument = (appId: number, docIndex: number) => {
    setApplications(apps =>
      apps.map(app =>
        app.id === appId
          ? {
              ...app,
              documents: app.documents.map((doc, idx) =>
                idx === docIndex ? { ...doc, uploaded: !doc.uploaded } : doc
              ),
            }
          : app
      )
    );
  };

  const deleteApplication = (appId: number) => {
    setApplications(apps => apps.filter(app => app.id !== appId));
    setSelectedApp(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/study-abroad" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <FaArrowLeft /> Quay lại
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Theo Dõi Đơn Đăng Ký</h1>
          <p className="text-indigo-100">Quản lý và theo dõi tiến trình đăng ký du học của bạn</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Đơn đăng ký ({applications.length})</h2>
              <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">
                <FaPlus /> Thêm đơn mới
              </button>
            </div>

            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedApp?.id === app.id ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{app.flag}</span>
                    <div>
                      <h3 className="font-bold text-gray-800">{app.program}</h3>
                      <p className="text-gray-500 text-sm">{app.university}</p>
                      <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                        <FaCalendarAlt /> Deadline: {app.deadline}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusConfig[app.status].color}`}>
                    {statusConfig[app.status].icon}
                    {statusConfig[app.status].label}
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Hồ sơ</span>
                    <span className="font-semibold">
                      {app.documents.filter(d => d.uploaded).length}/{app.documents.length} tài liệu
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(app.documents.filter(d => d.uploaded).length / app.documents.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedApp ? (
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Chi tiết đơn</h3>
                  <button
                    onClick={() => deleteApplication(selectedApp.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-4xl">{selectedApp.flag}</span>
                    <h4 className="font-bold text-gray-800 mt-2">{selectedApp.program}</h4>
                    <p className="text-gray-500 text-sm">{selectedApp.university}</p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Tài liệu cần nộp:</h5>
                    <div className="space-y-2">
                      {selectedApp.documents.map((doc, index) => (
                        <label
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={doc.uploaded}
                            onChange={() => toggleDocument(selectedApp.id, index)}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className={`text-sm ${doc.uploaded ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {doc.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Ghi chú:</h5>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{selectedApp.notes}</p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Deadline:</h5>
                    <p className="text-red-600 font-semibold">{selectedApp.deadline}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chọn đơn đăng ký để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
