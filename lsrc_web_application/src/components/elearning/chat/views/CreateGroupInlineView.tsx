// src/components/elearning/chat/views/CreateGroupInlineView.tsx
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaBook, FaSearch, FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';
import {
  searchUsers,
  getStudentsByCourse,
  createGroupConversation,
} from '../../../../service/chatService';
import type {
  CourseContact,
  StudentContact,
  UserSearchResult,
  Conversation,
} from '../../../../types/chat.types';

interface Props {
  myCourses: CourseContact[];
  preselectedMembers?: { accountId: number; name: string }[];   // ✅ ĐỔI
  onBack: () => void;
  onClose?: () => void;
  onCreated: (conversation: Conversation) => Promise<void> | void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

export const CreateGroupInlineView: React.FC<Props> = ({
  myCourses,
  preselectedMembers = [],
  onBack,
  onClose,
  onCreated,
  onToast,
}) => {
  // ✅ Derive IDs từ preselectedMembers
  const preselectedMemberIds = preselectedMembers.map(m => m.accountId);

  // Tên nhóm
  const [groupName, setGroupName] = useState('');

  // Tab: 'course' | 'search'
  const [activeTab, setActiveTab] = useState<'course' | 'search'>('course');

  // Chọn thành viên — init với preselected
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(preselectedMemberIds)
  );

  // ✅ Map accountId → tên (dùng để generate group name)
  const [nameMap, setNameMap] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    preselectedMembers.forEach(m => { map[m.accountId] = m.name; });
    return map;
  });

  // Data từ khóa học
  const [studentsByCourse, setStudentsByCourse] = useState<Record<number, StudentContact[]>>({});
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Data từ search
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // ✅ Compute cho UI
  const needsMore = Math.max(0, 2 - selectedIds.size);
  const isValidGroup = selectedIds.size >= 2;
  const totalMembers = selectedIds.size + 1;

  // Debounce search
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
        console.error(err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchKeyword, activeTab]);

  // Load students
  const handleLoadStudents = async (courseId: number) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }
    setExpandedCourse(courseId);
    if (!studentsByCourse[courseId]) {
      setLoadingStudents(true);
      try {
        const students = await getStudentsByCourse(courseId);
        setStudentsByCourse(prev => ({ ...prev, [courseId]: students }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    }
  };

  // ✅ Toggle chọn thành viên — lưu tên vào nameMap
  const toggleSelect = (accountId: number, name?: string) => {
    if (preselectedMemberIds.includes(accountId)) {
      onToast('Thành viên này bắt buộc có trong nhóm', 'error');
      return;
    }
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
        // ✅ Lưu tên khi thêm mới
        if (name) {
          setNameMap(m => ({ ...m, [accountId]: name }));
        }
      }
      return next;
    });
  };

  // ✅ Helper: generate tên nhóm từ danh sách thành viên
  const generateGroupName = (): string => {
    const names = Array.from(selectedIds)
      .map(id => nameMap[id])
      .filter(Boolean);

    if (names.length === 0) return 'Nhóm chat mới';

    const MAX = 3;   // Lấy tối đa 3 tên
    if (names.length <= MAX) return names.join(', ');

    return `${names.slice(0, MAX).join(', ')} + ${names.length - MAX} người khác`;
  };

  const handleSubmit = async () => {
    // ✅ Bỏ validate tên nhóm
    if (!isValidGroup) {
      onToast(`Cần chọn thêm ${needsMore} người nữa (nhóm phải có ít nhất 3 người)`, 'error');
      return;
    }

    // ✅ Nếu chưa nhập tên → generate từ tên thành viên
    const finalGroupName = groupName.trim() || generateGroupName();

    setSubmitting(true);
    try {
      const conv = await createGroupConversation(finalGroupName, Array.from(selectedIds));
      onToast('Tạo nhóm thành công', 'success');
      await onCreated(conv);
    } catch (err: any) {
      onToast(err?.response?.data?.message || 'Không thể tạo nhóm', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-slate-200 flex items-center gap-2 shrink-0 bg-white">
        <button onClick={onBack} className="p-1.5 hover:bg-slate-100 rounded-lg">
          <FaArrowLeft size={13} className="text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800">Tạo nhóm chat</h4>
          <p className="text-[11px] text-slate-500">
            Đã chọn {selectedIds.size} thành viên
            {selectedIds.size < 2 && (
              <span className="text-amber-600 font-semibold">
                {' '}(cần thêm ít nhất {2 - selectedIds.size} người)
              </span>
            )}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg shrink-0"
            title="Đóng"
          >
            <FaTimes size={13} className="text-slate-600" />
          </button>
        )}
      </div>

      {/* Tên nhóm — không còn required */}
      <div className="p-3 border-b border-slate-100 shrink-0">
        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">
          Tên nhóm <span className="text-slate-400 font-normal">(để trống sẽ tự động tạo)</span>
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="VD: Nhóm học Toán 12A1 (có thể để trống)"
          maxLength={100}
          className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#49BBBD]"
        />
      </div>

      {/* Tabs */}
      <div className="px-2 pt-2 flex gap-1 shrink-0 border-b border-slate-100">
        <button
          onClick={() => setActiveTab('course')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${
            activeTab === 'course' ? 'bg-[#49BBBD]/10 text-[#49BBBD]' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <FaBook size={11} /> Khóa học
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-slate-50 chat-scrollbar">
        {activeTab === 'course' ? (
          myCourses.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">Chưa có khóa học</p>
          ) : (
            myCourses.map(course => {
              const isExpanded = expandedCourse === course.courseId;
              const students = studentsByCourse[course.courseId] || [];
              return (
                <div key={course.courseId} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => handleLoadStudents(course.courseId)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700"
                  >
                    <span className="truncate">{course.title}</span>
                    <span className="text-[10px]">{isExpanded ? '▼' : '▶'}</span>
                  </button>
                  {isExpanded && (
                    <div className="p-2 border-t border-slate-100 space-y-1">
                      {loadingStudents ? (
                        <div className="py-2 text-center">
                          <FaSpinner className="animate-spin text-[#49BBBD] inline" size={14} />
                        </div>
                      ) : students.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-2">Không có học viên</p>
                      ) : (
                        students.map(s => {
                          const isPreselected = preselectedMemberIds.includes(s.accountId);
                          const isSelected = selectedIds.has(s.accountId);
                          const displayName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.username;
                          return (
                            <button
                              key={s.accountId}
                              onClick={() => toggleSelect(s.accountId, displayName)}
                              disabled={isPreselected}
                              className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition text-left ${
                                isPreselected
                                  ? 'bg-amber-50 border border-amber-300 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-[#49BBBD]/10 border border-[#49BBBD]/30'
                                  : 'hover:bg-slate-50 border border-transparent'
                              }`}
                            >
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {s.username?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-bold text-slate-700 truncate flex-1">
                                {s.firstName} {s.lastName}
                              </span>
                              {isPreselected && (
                                <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                                  BẮT BUỘC
                                </span>
                              )}
                              {isSelected && !isPreselected && (
                                <FaCheck size={10} className="text-[#49BBBD] shrink-0" />
                              )}
                              {isPreselected && (
                                <FaCheck size={10} className="text-amber-500 shrink-0" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          <div className="space-y-1">
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Nhập email, SĐT, username..."
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#49BBBD] bg-white"
            />
            {searchLoading ? (
              <div className="py-4 text-center">
                <FaSpinner className="animate-spin text-[#49BBBD] inline" size={16} />
              </div>
            ) : searchKeyword.trim().length < 2 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">Nhập từ 2 ký tự</p>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">Không tìm thấy</p>
            ) : (
              searchResults.map(u => {
                const isPreselected = preselectedMemberIds.includes(u.accountId);
                const isSelected = selectedIds.has(u.accountId);
                return (
                  <button
                    key={u.accountId}
                    onClick={() => toggleSelect(u.accountId, u.fullName || u.username)}
                    disabled={isPreselected}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl transition text-left ${
                      isPreselected
                        ? 'bg-amber-50 border border-amber-300 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#49BBBD]/10 border border-[#49BBBD]/30'
                        : 'bg-white hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                      {u.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{u.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.email || u.phone || `@${u.username}`}</p>
                    </div>
                    {isPreselected && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                        BẮT BUỘC
                      </span>
                    )}
                    {isSelected && !isPreselected && (
                      <FaCheck size={11} className="text-[#49BBBD] shrink-0" />
                    )}
                    {isPreselected && (
                      <FaCheck size={11} className="text-amber-500 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 flex gap-2 shrink-0">
        <button
          onClick={onBack}
          className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValidGroup || submitting}    
          className="flex-1 py-2 rounded-xl bg-[#49BBBD] text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {submitting && <FaSpinner className="animate-spin" size={11} />}
          {!isValidGroup ? `Cần thêm ${needsMore} người` : `Tạo nhóm (${totalMembers})`}
        </button>
      </div>
    </div>
  );
};