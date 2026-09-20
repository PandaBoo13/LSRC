// src/components/elearning/course/preview/CoursePreviewOverview.tsx
import React from 'react';
import type { Course } from '../../../../types/course.types';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaUserCheck,
  FaBookOpen,
  FaBullseye,
  FaInfoCircle,
  FaGraduationCap,
} from 'react-icons/fa';

type Props = {
  course: Course;
};

export const CoursePreviewOverview: React.FC<Props> = ({ course }) => {
  // Parse outcomes từ JSON hoặc Chuỗi
  const outcomes: string[] = (() => {
    if (!course.outcomes) return [];
    try {
      const parsed = JSON.parse(course.outcomes);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return course.outcomes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  })();

  return (
    <div className="space-y-8">
      {/* ========== MÔ TẢ CHI TIẾT ========== */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-50 text-[#49BBBD]">
            <FaBookOpen size={15} />
          </div>
          <h3 className="text-base font-extrabold text-[#2F327D]">Mô tả khóa học</h3>
        </div>

        <div className="bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200/60">
          {course.description ? (
            <div
              className="prose prose-sm max-w-none text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          ) : (
            <p className="text-xs text-slate-400 italic">Chưa có mô tả chi tiết cho khóa học này.</p>
          )}
        </div>
      </section>

      {/* ========== MỤC TIÊU ĐẠT ĐƯỢC ========== */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <FaBullseye size={15} />
          </div>
          <h3 className="text-base font-extrabold text-[#2F327D]">
            Bạn sẽ học được gì từ khóa học này?
          </h3>
        </div>

        {outcomes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {outcomes.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs"
              >
                <FaCheckCircle className="mt-0.5 text-emerald-500 shrink-0" size={15} />
                <span className="text-xs sm:text-sm font-medium text-slate-700 leading-snug">
                  {item}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
            Chưa cập nhật mục tiêu khóa học.
          </p>
        )}
      </section>

      {/* ========== YÊU CẦU ĐẦU VÀO ========== */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
            <FaExclamationCircle size={15} />
          </div>
          <h3 className="text-base font-extrabold text-[#2F327D]">Yêu cầu kiến thức đầu vào</h3>
        </div>

        {course.prerequisites && course.prerequisites.length > 0 ? (
          <div className="space-y-2">
            {course.prerequisites.map((prereq) => (
              <div
                key={prereq.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/40 border border-amber-200/50 text-xs sm:text-sm text-slate-700"
              >
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 uppercase ${
                    prereq.isRequired !== false
                      ? 'bg-red-100 text-red-600'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {prereq.isRequired !== false ? 'Bắt buộc' : 'Khuyến nghị'}
                </span>
                <span className="font-semibold text-[#2F327D]">{prereq.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
            Khóa học không yêu cầu kiến thức nền tảng trước khi bắt đầu.
          </p>
        )}
      </section>

      {/* ========== GIẢNG VIÊN HƯỚNG DẪN ========== */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <FaGraduationCap size={15} />
          </div>
          <h3 className="text-base font-extrabold text-[#2F327D]">Giảng viên giảng dạy</h3>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="w-13 h-13 rounded-2xl bg-[#49BBBD] text-white flex items-center justify-center text-lg font-black shadow-sm shrink-0">
            {course.instructor?.firstName?.charAt(0) || '?'}
            {course.instructor?.lastName?.charAt(0) || ''}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-800 text-sm sm:text-base">
              {course.instructor?.firstName} {course.instructor?.lastName}
            </h4>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
              <FaUserCheck size={12} className="text-[#49BBBD]" />
              <span>Giảng viên chuyên môn</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BẢNG THÔNG TIN CHI TIẾT ========== */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
            <FaInfoCircle size={15} />
          </div>
          <h3 className="text-base font-extrabold text-[#2F327D]">Thông số chi tiết</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Trạng thái', value: course.status === 'DRAFT' ? 'Bản nháp' : course.status },
            { label: 'Hình thức học', value: course.courseType === 'LIVE' ? 'Trực tuyến (Live)' : 'Tự học (Self-paced)' },
            { label: 'Trình độ', value: course.level || 'Tất cả' },
            { label: 'Ngôn ngữ', value: course.language === 'vi' ? 'Tiếng Việt' : course.language || 'Tiếng Việt' },
            { label: 'Thời hạn truy cập', value: course.accessPeriod || 'Trọn đời' },
            { label: 'Cấp chứng chỉ', value: course.hasCertificate ? 'Có cấp chứng chỉ' : 'Không' },
            { label: 'Danh mục', value: course.category?.name || 'Chưa phân loại' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between space-y-1">
              <span className="text-[11px] font-medium text-slate-400">{item.label}</span>
              <span className="text-xs font-bold text-slate-700 truncate">{item.value || '—'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};