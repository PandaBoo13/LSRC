// src/components/elearning/course/preview/CoursePreviewBanner.tsx
import React from 'react';
import { FaStar, FaUserGraduate, FaCrown, FaTag } from 'react-icons/fa';

type MetaItem = {
  icon: React.ReactNode;
  text: string;
};

type Props = {
  thumbnail: string;
  title: string;
  description?: string;
  instructorName: string;
  metaItems: MetaItem[];
  price?: number;
  oldPrice?: number;
  isFree?: boolean;
  averageRating?: number;
  totalStudents?: number;
};

export const CoursePreviewBanner: React.FC<Props> = ({
  thumbnail,
  title,
  description,
  instructorName,
  metaItems,
  price,
  oldPrice,
  isFree,
  averageRating,
  totalStudents,
}) => {
  // Tính % giảm giá nếu có
  const discountPercent =
    oldPrice && price && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="flex flex-col lg:flex-row items-stretch">
        
        {/* Hình ảnh Course / Thumbnail Box */}
        <div className="lg:w-5/12 xl:w-4/12 relative group shrink-0 overflow-hidden bg-slate-900 min-h-[220px] sm:min-h-[260px]">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:hidden" />
          
          {/* Badge Preview Mode Overlay */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
            👁️ Chế độ xem trước
          </div>
        </div>

        {/* Nội dung thông tin chính */}
        <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between gap-5">
          <div className="space-y-3.5">
            
            {/* Giảng viên & Đánh giá Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-slate-700 font-medium">
                <FaCrown className="text-amber-500" size={13} />
                <span>Giảng viên: <strong className="text-[#2F327D] font-bold">{instructorName}</strong></span>
              </div>

              <div className="flex items-center gap-3">
                {averageRating !== undefined && averageRating > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 font-bold">
                    <FaStar size={12} className="text-amber-500" />
                    <span>{averageRating.toFixed(1)}</span>
                  </div>
                )}
                {totalStudents !== undefined && (
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <FaUserGraduate size={12} className="text-slate-400" />
                    <span>{totalStudents.toLocaleString('vi-VN')} học viên</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tiêu đề */}
            <h1 className="text-xl sm:text-2xl xl:text-3xl font-extrabold text-[#2F327D] leading-tight tracking-tight">
              {title}
            </h1>

            {/* Trích dẫn mô tả */}
            {description && (
              <p
                className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: description.replace(/<[^>]*>/g, '').substring(0, 220),
                }}
              />
            )}

            {/* Các thẻ Metadata (Thời lượng, Số bài, Ngôn ngữ, Trình độ...) */}
            <div className="flex flex-wrap gap-2 pt-1">
              {metaItems.map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  <span className="text-[#49BBBD]">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Khối Hiển thị Giá */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Học phí khóa học
              </span>
              <div className="flex items-baseline gap-2.5">
                {isFree ? (
                  <span className="text-2xl font-black text-emerald-600">Miễn phí</span>
                ) : (
                  <>
                    <span className="text-2xl sm:text-3xl font-black text-[#49BBBD]">
                      {price?.toLocaleString('vi-VN')}đ
                    </span>
                    {oldPrice && oldPrice > (price || 0) && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                        {oldPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Badge Giảm giá nếu có */}
            {!isFree && discountPercent > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-600 font-extrabold text-xs animate-pulse">
                <FaTag size={10} /> Tiết kiệm {discountPercent}%
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};