import { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaSpinner, 
  FaTimes, 
  FaUser, 
  FaUserShield, 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaChevronLeft, 
  FaChevronRight,
  FaFileExcel
} from 'react-icons/fa';
import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { adminNav } from '../../../data/elearning';
// ✅ Sửa import
import { getAllAccounts } from '../../../service/rbacService';
import type { Account } from '../../../types/rbac.types';
import { UserExcelImportTab } from '../../../components/elearning/user/UserExcelImportTab';

const PAGE_SIZE = 12;
type TabType = 'all' | 'instructor' | 'student' | 'excel_import';

export function AdminUsersPage() {
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<TabType>('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // ✅ Đổi rbacService.getAllAccounts → getAllAccounts
      const res = await getAllAccounts();
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Sửa - role giờ là string
  const getRoleName = (role: any) => (typeof role === 'string' ? role : role?.roleName)?.toUpperCase() || '';

  const tabFiltered = users.filter(u => {
    const r = getRoleName(u.role);
    if (tab === 'instructor') return r === 'TEACHER' || r === 'INSTRUCTOR';
    if (tab === 'student') return r === 'STUDENT';
    return true;
  });

  const filteredUsers = tabFiltered.filter(u => 
    u.username?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const pagedUsers = filteredUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const adminCount = users.filter(u => getRoleName(u.role) === 'ADMIN').length;
  const teacherCount = users.filter(u => { const r = getRoleName(u.role); return r === 'TEACHER' || r === 'INSTRUCTOR'; }).length;
  const studentCount = users.filter(u => getRoleName(u.role) === 'STUDENT').length;

  const getRoleInfo = (role: any) => {
    const name = getRoleName(role);
    if (name === 'ADMIN') return { label: 'Admin', icon: <FaUserShield />, bg: 'bg-purple-100 text-purple-700' };
    if (name === 'TEACHER' || name === 'INSTRUCTOR') return { label: 'Giảng viên', icon: <FaChalkboardTeacher />, bg: 'bg-blue-100 text-blue-700' };
    return { label: 'Học viên', icon: <FaUserGraduate />, bg: 'bg-emerald-100 text-emerald-700' };
  };

  const tabs: { key: TabType; label: string; count?: number; icon: React.ReactNode; activeClass: string }[] = [
    { key: 'all', label: 'Tất cả', count: users.length, icon: <FaUser />, activeClass: 'bg-[#49BBBD] text-white shadow-cyan-500/20' },
    { key: 'instructor', label: 'Giảng viên', count: teacherCount, icon: <FaChalkboardTeacher />, activeClass: 'bg-blue-500 text-white shadow-blue-500/20' },
    { key: 'student', label: 'Học viên', count: studentCount, icon: <FaUserGraduate />, activeClass: 'bg-emerald-500 text-white shadow-emerald-500/20' },
    { key: 'excel_import', label: 'Nhập Excel', icon: <FaFileExcel />, activeClass: 'bg-[#2F327D] text-white shadow-indigo-500/20' },
  ];

  if (loading && tab !== 'excel_import') {
    return (
      <DashboardShell role="Admin" title="Người dùng" subtitle="Đang tải..." navItems={adminNav}>
        <div className="flex justify-center py-20">
          <FaSpinner className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-[#49BBBD]" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Admin" title="Quản lý người dùng" subtitle={`${users.length} người dùng trong hệ thống`} navItems={adminNav}>
      
      {/* STATS CARDS */}
      {tab !== 'excel_import' && (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-2.5 sm:p-5 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4 shadow-2xs sm:shadow-sm">
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xs sm:text-xl shrink-0">
              <FaUserShield />
            </div>
            <div className="text-center sm:text-left min-w-0">
              <p className="text-base sm:text-2xl font-bold text-[#2F327D] leading-tight sm:leading-normal">{adminCount}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">Quản trị viên</p>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-2.5 sm:p-5 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4 shadow-2xs sm:shadow-sm">
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xs sm:text-xl shrink-0">
              <FaChalkboardTeacher />
            </div>
            <div className="text-center sm:text-left min-w-0">
              <p className="text-base sm:text-2xl font-bold text-[#2F327D] leading-tight sm:leading-normal">{teacherCount}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">Giảng viên</p>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-2.5 sm:p-5 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4 shadow-2xs sm:shadow-sm">
            <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs sm:text-xl shrink-0">
              <FaUserGraduate />
            </div>
            <div className="text-center sm:text-left min-w-0">
              <p className="text-base sm:text-2xl font-bold text-[#2F327D] leading-tight sm:leading-normal">{studentCount}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">Học viên</p>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex flex-nowrap overflow-x-auto gap-1.5 sm:gap-2 mb-4 sm:mb-6 pb-1.5 scrollbar-none">
        {tabs.map(t => (
          <button 
            key={t.key} 
            onClick={() => { setTab(t.key); setPage(0); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              tab === t.key 
                ? t.activeClass + ' shadow-md scale-[1.01]' 
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-xs sm:text-sm">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(' ')[0]}</span>
            {t.count !== undefined && (
              <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-slate-100'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {tab === 'excel_import' ? (
        <UserExcelImportTab onSuccess={fetchUsers} />
      ) : (
        <>
          {/* SEARCH */}
          <div className="relative mb-3.5 sm:mb-6 w-full">
            <FaSearch className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc email..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="h-9 sm:h-11 w-full rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white pl-9 sm:pl-10 pr-9 sm:pr-10 text-xs sm:text-sm font-medium outline-none transition focus:border-[#49BBBD] focus:ring-4 focus:ring-cyan-50" 
            />
            {search && (
              <button 
                onClick={() => { setSearch(''); setPage(0); }} 
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <FaTimes className="text-xs sm:text-sm" />
              </button>
            )}
          </div>

          {/* USER CARDS */}
          <div className="grid gap-2.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 mb-4 sm:mb-6">
            {pagedUsers.length > 0 ? pagedUsers.map(user => {
              const roleInfo = getRoleInfo(user.role);
              return (
                <div key={user.idAccount} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-2.5 sm:p-4 flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-cyan-200 transition-all">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#49BBBD] to-blue-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-200 shrink-0">
                    {user.username?.charAt(0).toUpperCase() || <FaUser className="text-xs" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2F327D] text-xs sm:text-sm truncate">{user.username}</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 sm:mt-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${roleInfo.bg}`}>
                      <span className="text-[9px] sm:text-[10px]">{roleInfo.icon}</span> {roleInfo.label}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center py-10 sm:py-16 text-slate-400 text-xs sm:text-sm bg-white rounded-xl sm:rounded-2xl border border-slate-100">
                {search ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 sm:gap-2 pt-2">
              <button 
                onClick={() => setPage(Math.max(0, page - 1))} 
                disabled={page === 0} 
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <FaChevronLeft className="text-[10px] sm:text-xs" /> 
                <span className="hidden sm:inline">Trước</span>
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => {
                  const shouldShow = 
                    i === 0 || 
                    i === totalPages - 1 || 
                    Math.abs(i - page) <= 1 ||
                    totalPages <= 5;
                  
                  if (!shouldShow) {
                    if (i === 1 && page > 2) return <span key="dots1" className="w-6 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 text-[10px]">...</span>;
                    if (i === totalPages - 2 && page < totalPages - 3) return <span key="dots2" className="w-6 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 text-[10px]">...</span>;
                    return null;
                  }
                  
                  return (
                    <button 
                      key={i} 
                      onClick={() => setPage(i)} 
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition ${
                        page === i 
                          ? 'bg-[#49BBBD] text-white shadow-md shadow-cyan-200' 
                          : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))} 
                disabled={page === totalPages - 1} 
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span className="hidden sm:inline">Sau</span> 
                <FaChevronRight className="text-[10px] sm:text-xs" />
              </button>
            </div>
          )}
        </>
      )}

    </DashboardShell>
  );
}