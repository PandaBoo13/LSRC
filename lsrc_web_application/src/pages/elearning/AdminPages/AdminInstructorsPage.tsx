// src/pages/elearning/AdminPages/AdminInstructorsPage.tsx
import { useState, useEffect } from "react";
import { 
  FaSpinner, 
  FaSearch, 
  FaTimes, 
  FaUserCheck, 
  FaStar, 
  FaUserClock, 
  FaChevronLeft, 
  FaChevronRight,
  FaEdit,
  FaRedo,
  FaUserGraduate,
  FaAward,
  FaUserShield
} from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { adminNav } from "../../../data/elearning";
// ✅ Sửa import
import { getAllLecturers } from "../../../service/lecturerService";
import { InstructorFormModal } from "../../../components/elearning/instructor/InstructorFormModal";
import { MetricCard } from "../../../components/elearning";
import type { LecturerProfileResponse } from "../../../types/lecturer.types";

function parseSpecialties(specialties: any): string[] {
  if (!specialties) return [];
  if (Array.isArray(specialties)) return specialties;
  if (typeof specialties === 'string') {
    try { 
      const parsed = JSON.parse(specialties); 
      return Array.isArray(parsed) ? parsed : []; 
    } catch { 
      return []; 
    }
  }
  return [];
}

export function AdminInstructorsPage() {
  const [profiles, setProfiles] = useState<LecturerProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [editingProfile, setEditingProfile] = useState<LecturerProfileResponse | null>(null);

  useEffect(() => { 
    loadProfiles(); 
  }, [page, search]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      // ✅ Đổi lecturerService.getAll → getAllLecturers
      const data = await getAllLecturers({ keyword: search || undefined, page, size: 10 });
      setProfiles(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) { 
      console.error("Failed to load instructors:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const activeCount = profiles.filter(i => i.isActive).length;
  const totalCertificates = profiles.reduce((sum, p) => sum + (p.certificates?.length || 0), 0);
  const avgExp = Math.round(profiles.reduce((s, p) => s + (p.experienceYears || 0), 0) / (profiles.length || 1));

  return (
    <DashboardShell role="Admin" title="Quản lý Giảng viên" subtitle="Quản lý hồ sơ giảng viên, chuyên môn và chứng chỉ giảng dạy." navItems={adminNav}>
      {/* Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-3 mb-8">
        <MetricCard 
          label="Tổng số giảng viên" 
          value={String(profiles.length)} 
          note={`${activeCount} đang hoạt động`} 
          icon={<FaUserCheck className="text-xl" />} 
          accent="bg-gradient-to-br from-cyan-50 to-cyan-100/60 text-cyan-600 border border-cyan-200/50" 
        />
        <MetricCard 
          label="Tổng chứng chỉ" 
          value={String(totalCertificates)} 
          note="Đã xác minh hệ thống" 
          icon={<FaStar className="text-xl" />} 
          accent="bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-600 border border-amber-200/50" 
        />
        <MetricCard 
          label="Kinh nghiệm trung bình" 
          value={`${avgExp} năm`} 
          note="Toàn bộ đội ngũ" 
          icon={<FaUserClock className="text-xl" />} 
          accent="bg-gradient-to-br from-violet-50 to-violet-100/60 text-violet-600 border border-violet-200/50" 
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, chuyên môn..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="h-11 w-full rounded-2xl border border-slate-200/80 bg-white pl-11 pr-10 text-sm outline-none transition duration-200 shadow-xs focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50" 
          />
          {search && (
            <button 
              onClick={() => { setSearch(''); setPage(0); }} 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              <FaTimes size={13} />
            </button>
          )}
        </div>

        <button 
          onClick={loadProfiles} 
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
        >
          <FaRedo className={loading ? "animate-spin text-cyan-500" : "text-slate-400"} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading && profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <FaSpinner className="h-8 w-8 animate-spin text-cyan-500" />
            <p className="text-sm font-medium">Đang tải danh sách giảng viên...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Giảng viên</th>
                  <th className="px-6 py-4">Lĩnh vực chuyên môn</th>
                  <th className="px-6 py-4">Kinh nghiệm</th>
                  <th className="px-6 py-4">Chứng chỉ</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {profiles.length > 0 ? (
                  profiles.map(profile => {
                    const specs = parseSpecialties(profile.specialties);
                    const initial = profile.firstName?.charAt(0)?.toUpperCase() || 'G';

                    return (
                      <tr key={profile.accountId} className="group hover:bg-slate-50/70 transition-colors"> {/* ✅ Đổi userId → accountId */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/20">
                                {initial}
                              </div>
                              <span 
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                                  profile.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                                }`} 
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">
                                {profile.firstName} {profile.lastName}
                              </p>
                              <p className="text-xs text-slate-400 font-medium">
                                {profile.email || `ID: ${profile.accountId}`} {/* ✅ Đổi userId → accountId */}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                            {specs.slice(0, 2).map((s: string, i: number) => (
                              <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                                {s}
                              </span>
                            ))}
                            {specs.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-500">
                                +{specs.length - 2}
                              </span>
                            )}
                            {specs.length === 0 && <span className="text-xs text-slate-300 italic">Chưa cập nhật</span>}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <FaUserGraduate className="text-slate-400" size={12} />
                            {profile.experienceYears || 0} năm
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                            <FaAward size={12} />
                            {profile.certificates?.length || 0} chứng chỉ
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {profile.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Không hoạt động
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setEditingProfile(profile)} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-500 hover:text-white transition-all shadow-2xs"
                          >
                            <FaEdit size={11} />
                            <span>Chỉnh sửa</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-slate-400">
                        <FaUserShield size={40} className="text-slate-200 mb-1" />
                        <p className="font-semibold text-slate-700 text-base">Không tìm thấy giảng viên</p>
                        <p className="text-xs text-slate-400">
                          {search ? `Không có giảng viên nào phù hợp với từ khóa "${search}"` : 'Hiện tại chưa có dữ liệu giảng viên nào trong hệ thống.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-6 px-2">
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            Trang <strong className="text-slate-700">{page + 1}</strong> / {totalPages}
          </p>

          <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
            <button 
              onClick={() => setPage(Math.max(0, page - 1))} 
              disabled={page === 0} 
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
            >
              <FaChevronLeft size={10} /> Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button 
                key={i} 
                onClick={() => setPage(i)} 
                className={`w-9 h-9 rounded-xl text-xs font-bold transition shadow-2xs ${
                  page === i 
                    ? 'bg-cyan-500 text-white shadow-cyan-200' 
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))} 
              disabled={page === totalPages - 1} 
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
            >
              Sau <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {editingProfile && (
        <InstructorFormModal 
          profile={editingProfile} 
          onClose={() => setEditingProfile(null)} 
          onSuccess={loadProfiles} 
        />
      )}
    </DashboardShell>
  );
}