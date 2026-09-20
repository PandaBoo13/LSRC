// src/components/elearning/chat/views/AddMembersView.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  FaBook, FaChevronDown, FaChevronUp, FaSpinner, FaCheck, FaSearch,
} from 'react-icons/fa';
import { getStudentsByCourse, addParticipants, searchUsers } from '../../../../service/chatService';
import { getErrorMessage } from '../../../../utils/errorUtils';
import type {
  Participant, CourseContact, StudentContact, UserSearchResult,
} from '../../../../types/chat.types';

interface AddMembersViewProps {
  myCourses: CourseContact[];
  localParticipants: Participant[];
  conversationId: number;
  onBack: () => void;
  onAdded: () => Promise<void> | void;
  onToast: (message: string, type: 'success' | 'error') => void;
}

export const AddMembersView: React.FC<AddMembersViewProps> = ({
  myCourses,
  localParticipants,
  conversationId,
  onBack,
  onAdded,
  onToast,
}) => {
  // ==================== STATE ====================
  const [studentsByCourse, setStudentsByCourse] = useState<Record<number, StudentContact[]>>({});
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // ✅ State cho tab search
  const [activeTab, setActiveTab] = useState<'course' | 'search'>('course');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSearchUsers, setSelectedSearchUsers] = useState<Set<number>>(new Set());

  // ==================== LOAD STUDENTS ====================

  const handleLoadStudents = useCallback(async (courseId: number) => {
    // Toggle nếu đã mở
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }

    setExpandedCourse(courseId);

    // Chỉ load 1 lần
    if (!studentsByCourse[courseId]) {
      setLoadingStudents(true);
      try {
        const students = await getStudentsByCourse(courseId);
        setStudentsByCourse(prev => ({ ...prev, [courseId]: students }));
      } catch (err) {
        console.error('Lỗi tải danh sách học viên:', err);
        onToast(getErrorMessage(err, 'Tải danh sách học viên thất bại'), 'error');
      } finally {
        setLoadingStudents(false);
      }
    }
  }, [expandedCourse, studentsByCourse, onToast]);

  // ==================== ✅ DEBOUNCE SEARCH ====================

  useEffect(() => {
    if (activeTab !== 'search') return;
    if (!searchKeyword.trim() || searchKeyword.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchUsers(searchKeyword.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Lỗi search:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchKeyword, activeTab]);

  // ==================== TOGGLE SELECT ====================

  const toggleStudent = useCallback((studentId: number) => {
    // Kiểm tra đã là thành viên chưa
    const existingMemberIds = new Set(localParticipants.map(p => p.accountId));
    if (existingMemberIds.has(studentId)) {
      onToast('Học viên đã là thành viên', 'error');
      return;
    }

    setSelectedStudents(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  }, [localParticipants, onToast]);

  const toggleAllStudents = useCallback((courseId: number) => {
    const students = studentsByCourse[courseId] || [];
    const existingMemberIds = new Set(localParticipants.map(p => p.accountId));
    const availableStudents = students.filter(s => !existingMemberIds.has(s.accountId));

    setSelectedStudents(prev => {
      const next = new Set(prev);
      const allSelected = availableStudents.length > 0
        && availableStudents.every(s => next.has(s.accountId));

      availableStudents.forEach(s => {
        if (allSelected) next.delete(s.accountId);
        else next.add(s.accountId);
      });
      return next;
    });
  }, [studentsByCourse, localParticipants]);

  // ✅ Toggle chọn user từ search
  const toggleSearchUser = useCallback((accountId: number) => {
    const existingMemberIds = new Set(localParticipants.map(p => p.accountId));
    if (existingMemberIds.has(accountId)) {
      onToast('User đã là thành viên', 'error');
      return;
    }
    setSelectedSearchUsers(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      return next;
    });
  }, [localParticipants, onToast]);

  // ==================== SUBMIT ====================

  const handleSubmit = async () => {
    // Gộp ID từ 2 nguồn
    const allSelectedIds = new Set([...selectedStudents, ...selectedSearchUsers]);
    if (allSelectedIds.size === 0) return;

    // Lọc bỏ thành viên đã tồn tại
    const existingMemberIds = new Set(localParticipants.map(p => p.accountId));
    const newIds = Array.from(allSelectedIds).filter(id => !existingMemberIds.has(id));
    const duplicateCount = allSelectedIds.size - newIds.length;

    if (newIds.length === 0) {
      onToast('Tất cả đã là thành viên nhóm', 'error');
      setSelectedStudents(new Set());
      setSelectedSearchUsers(new Set());
      return;
    }

    setSubmittingAdd(true);
    try {
      await addParticipants(conversationId, { accountIds: newIds });

      if (duplicateCount > 0) {
        onToast(
          `Đã thêm ${newIds.length} thành viên (bỏ qua ${duplicateCount} đã tồn tại)`,
          'success'
        );
      } else {
        onToast(`Đã thêm ${newIds.length} thành viên mới`, 'success');
      }

      setSelectedStudents(new Set());
      setSelectedSearchUsers(new Set());
      setSearchKeyword('');
      setSearchResults([]);
      setExpandedCourse(null);
      await onAdded();
    } catch (err: any) {
      console.error('Lỗi thêm thành viên:', err);

      if (err?.response?.status === 409) {
        onToast('Một số thành viên đã tồn tại trong nhóm. Đang cập nhật lại danh sách...', 'error');
        await onAdded();
      } else {
        onToast(getErrorMessage(err, 'Thêm thành viên thất bại'), 'error');
      }
    } finally {
      setSubmittingAdd(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* ✅ Tabs */}
      <div className="px-2 pt-2 flex gap-1 shrink-0 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('course')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${
            activeTab === 'course' ? 'bg-[#49BBBD]/10 text-[#49BBBD]' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <FaBook size={11} /> Từ khóa học
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${
            activeTab === 'search' ? 'bg-[#49BBBD]/10 text-[#49BBBD]' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <FaSearch size={11} /> Tìm kiếm
        </button>
      </div>

      {/* ==================== TAB: COURSE ==================== */}
      {activeTab === 'course' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-slate-50 chat-scrollbar">
          {myCourses.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Không tìm thấy khóa học khả dụng
            </p>
          ) : (
            myCourses.map((course) => {
              const isExpanded = expandedCourse === course.courseId;
              const students = studentsByCourse[course.courseId] || [];
              const existingMemberIds = new Set(localParticipants.map(p => p.accountId));
              const availableStudents = students.filter(s => !existingMemberIds.has(s.accountId));
              const allSelected = availableStudents.length > 0
                && availableStudents.every(s => selectedStudents.has(s.accountId));

              return (
                <div
                  key={course.courseId}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                >
                  {/* Course header */}
                  <button
                    onClick={() => handleLoadStudents(course.courseId)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 text-xs transition"
                  >
                    <span className="truncate flex items-center gap-2">
                      <FaBook className="text-[#49BBBD] shrink-0" size={11} />
                      {course.title}
                    </span>
                    {isExpanded ? (
                      <FaChevronUp size={10} className="shrink-0" />
                    ) : (
                      <FaChevronDown size={10} className="shrink-0" />
                    )}
                  </button>

                  {/* Students list */}
                  {isExpanded && (
                    <div className="p-2 border-t border-slate-100 space-y-1">
                      {loadingStudents ? (
                        <div className="py-3 text-center">
                          <FaSpinner className="animate-spin text-[#49BBBD] inline" size={14} />
                        </div>
                      ) : availableStudents.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-2">
                          Tất cả học viên đã ở trong nhóm
                        </p>
                      ) : (
                        <>
                          {/* Select all */}
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1">
                            <span className="text-[10px] text-slate-400 font-medium">Chọn tất cả</span>
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={() => toggleAllStudents(course.courseId)}
                              className="rounded text-[#49BBBD] focus:ring-0 cursor-pointer"
                            />
                          </div>

                          {/* Student list */}
                          {availableStudents.map((student) => (
                            <label
                              key={student.accountId}
                              className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-[#49BBBD]/10 text-[#49BBBD] flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {student.username?.charAt(0).toUpperCase() || 'S'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs text-slate-700 font-medium truncate">
                                    {student.firstName} {student.lastName}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    @{student.username}
                                  </p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={selectedStudents.has(student.accountId)}
                                onChange={() => toggleStudent(student.accountId)}
                                className="rounded text-[#49BBBD] focus:ring-0 cursor-pointer shrink-0"
                              />
                            </label>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ==================== TAB: SEARCH ==================== */}
      {activeTab === 'search' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
          {/* Search box */}
          <div className="p-2 shrink-0">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Nhập email, SĐT, username (≥2 ký tự)..."
                className="w-full h-9 rounded-lg border border-slate-200 pl-8 pr-3 text-xs outline-none focus:border-[#49BBBD] bg-white"
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 chat-scrollbar">
            {searchLoading ? (
              <div className="py-4 text-center">
                <FaSpinner className="animate-spin text-[#49BBBD] inline" size={16} />
              </div>
            ) : searchKeyword.trim().length < 2 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                Nhập từ 2 ký tự để tìm user
              </p>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                Không tìm thấy user nào
              </p>
            ) : (
              searchResults.map((u) => {
                const isSelected = selectedSearchUsers.has(u.accountId);
                const isMember = localParticipants.some(p => p.accountId === u.accountId);
                return (
                  <button
                    key={u.accountId}
                    onClick={() => toggleSearchUser(u.accountId)}
                    disabled={isMember}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl transition text-left ${
                      isMember
                        ? 'opacity-50 cursor-not-allowed bg-slate-100'
                        : isSelected
                        ? 'bg-[#49BBBD]/10 border border-[#49BBBD]/30'
                        : 'bg-white hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                      {u.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate flex items-center gap-1">
                        {u.fullName}
                        {isMember && <span className="text-[9px] text-slate-400 font-normal">(đã là TV)</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {u.email || u.phone || `@${u.username}`}
                      </p>
                    </div>
                    {isSelected && <FaCheck size={11} className="text-[#49BBBD] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-slate-200 bg-white shrink-0 flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            (selectedStudents.size + selectedSearchUsers.size === 0) || submittingAdd
          }
          className="flex-1 py-2 rounded-xl bg-[#49BBBD] hover:bg-[#3da4a6] text-white text-xs font-bold disabled:opacity-40 transition flex items-center justify-center gap-1.5"
        >
          {submittingAdd ? (
            <FaSpinner className="animate-spin" size={11} />
          ) : (
            <FaCheck size={11} />
          )}
          Thêm ({selectedStudents.size + selectedSearchUsers.size})
        </button>
      </div>
    </div>
  );
};