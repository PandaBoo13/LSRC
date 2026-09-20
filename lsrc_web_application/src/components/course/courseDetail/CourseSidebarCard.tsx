// src/components/course/courseDetail/CourseSidebarCard.tsx
import { useState, useEffect } from 'react';
import { 
  FaHeart, 
  FaRegHeart, 
  FaSpinner, 
  FaShieldAlt, 
  FaMobileAlt, 
  FaCertificate, 
  FaLayerGroup,
  FaTwitter, 
  FaFacebookF, 
  FaYoutube, 
  FaInstagram, 
  FaTelegramPlane, 
  FaWhatsapp,
  FaCheckCircle,
  FaBookOpen,
  FaShoppingCart,
  FaBolt,
  FaClock,
  FaCreditCard,
  FaGift,
  FaBroadcastTower
} from 'react-icons/fa';
import { getImageUrl, getImageDimensions, getImageClass, type ImageDimensions } from '../../../utils/imageHelper';
import { useCurrency } from '../../../context/CurrencyContext';
import type { Course } from '../../../types/course.types';

export interface CourseSidebarCardProps {
  course: Course;
  isLive?: boolean;                  // ✅ THÊM: khóa LIVE hay không
  instructorName?: string;           // ✅ THÊM: tên giảng viên
  buyingNow: boolean;
  togglingWishlist: boolean;
  inWishlist: boolean;
  isEnrolled?: boolean;              // Đã thanh toán (PAID) hoặc đã enroll free
  isWaiting?: boolean;               // Chờ khai giảng (LIVE + PENDING)
  isInCart?: boolean;                // Trong giỏ hàng (SELF_PACED + PENDING)
  addingToCart?: boolean;
  onBuyNow: () => void | Promise<void>;
  onAddToCart: () => void | Promise<void>;
  onToggleWishlist: () => void | Promise<void>;
  onGoToLearning?: () => void;
  onGoToCart?: () => void;
}

export function CourseSidebarCard({
  course,
  isLive = false,
  instructorName,
  buyingNow,
  togglingWishlist,
  inWishlist,
  isEnrolled = false,
  isWaiting = false,
  isInCart = false,
  addingToCart = false,
  onBuyNow,
  onAddToCart,
  onToggleWishlist,
  onGoToLearning,
  onGoToCart,
}: CourseSidebarCardProps) {
  // Dùng context - chỉ lấy convertFormatted
  const { convertFormatted } = useCurrency();

  // Kiểm tra kích thước ảnh
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const imageUrl = getImageUrl(course.thumbnailUrl);

  useEffect(() => {
    if (imageUrl && imageUrl !== '/placeholder.jpg') {
      getImageDimensions(imageUrl)
        .then(setImageDimensions)
        .catch(() => setImageDimensions(null));
    }
  }, [imageUrl]);

  // ✅ Xác định khóa học miễn phí (ưu tiên isFree, fallback price = 0)
  const isFreeCourse = course.isFree === true || (course.price ?? 0) === 0;

  const discountPercent = course.oldPrice && course.oldPrice > course.price
    ? Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100)
    : null;

  // ✅ Message phù hợp: khóa free không nói "thanh toán"
  const enrolledMessage = isFreeCourse
    ? 'Bạn đã đăng ký khóa học miễn phí này. Bắt đầu học ngay!'
    : 'Bạn đã thanh toán khóa học này. Bắt đầu học ngay!';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-6 w-full max-w-md mx-auto">
      {/* 1. PREVIEW IMAGE */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-video bg-slate-100">
        <img
          src={imageUrl}
          alt={course.title}
          className={`${getImageClass(imageDimensions?.orientation)} transition-transform duration-300`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 
              'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600';
          }}
        />

        {/* ✅ Badge "Miễn phí" nổi bật trên ảnh */}
        {isFreeCourse && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            <FaGift size={11} />
            Miễn phí
          </div>
        )}

        {/* ✅ Badge "LIVE" — dùng prop isLive */}
        {isLive && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            <FaBroadcastTower size={10} />
            LIVE
          </div>
        )}
      </div>

      {/* ✅ Hiển thị tên giảng viên nếu có */}
      {instructorName && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-medium">Giảng viên:</span>
          <span className="text-slate-700 font-semibold">{instructorName}</span>
        </div>
      )}

      {/* 2. PRICE */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3 flex-wrap">
          {isFreeCourse ? (
            <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Miễn phí
            </span>
          ) : (
            <span className="text-3xl font-extrabold text-slate-800">
              {convertFormatted(course.price)}
            </span>
          )}

          {/* Chỉ hiển thị giá gốc/giảm giá khi KHÔNG phải khóa miễn phí */}
          {!isFreeCourse && course.oldPrice && course.oldPrice > course.price && (
            <>
              <span className="text-base text-slate-400 line-through font-medium">
                {convertFormatted(course.oldPrice)}
              </span>
              {discountPercent && (
                <span className="text-base font-bold text-slate-500">
                  {discountPercent}% Off
                </span>
              )}
            </>
          )}
        </div>

        {/* ✅ Ghi chú phụ cho khóa free */}
        {isFreeCourse && (
          <p className="text-xs text-emerald-600 font-medium">
            Đăng ký ngay để bắt đầu học — không cần thanh toán
          </p>
        )}
      </div>

      {/* ==================== TRẠNG THÁI 1: ĐÃ ĐĂNG KÝ ==================== */}
      {isEnrolled ? (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <FaCheckCircle className="text-emerald-500 text-2xl mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-700">Đã đăng ký</p>
            <p className="text-xs text-emerald-600 mt-1">
              {enrolledMessage}
            </p>
          </div>

          {onGoToLearning && (
            <button
              onClick={onGoToLearning}
              className="w-full py-3.5 px-4 bg-[#49BBBD] hover:bg-[#3db0b2] text-white font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#49BBBD]/20"
            >
              <FaBookOpen size={14} />
              Vào học
            </button>
          )}
        </div>
      ) : isWaiting ? (
        /* ==================== TRẠNG THÁI 2: CHỜ KHAI GIẢNG ==================== */
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-center">
            <FaClock className="text-yellow-500 text-2xl mx-auto mb-2" />
            <p className="text-sm font-bold text-yellow-700">Chờ khai giảng</p>
            <p className="text-xs text-yellow-600 mt-1">
              Bạn đã đăng ký khóa học LIVE. Khóa học sẽ sớm bắt đầu.
            </p>
          </div>

          {onGoToCart && (
            <button
              onClick={onGoToCart}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <FaShoppingCart size={14} />
              Xem đơn hàng
            </button>
          )}
        </div>
      ) : isInCart ? (
        /* ==================== TRẠNG THÁI 3: TRONG GIỎ HÀNG ==================== */
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-center">
            <FaShoppingCart className="text-[#49BBBD] text-2xl mx-auto mb-2" />
            <p className="text-sm font-bold text-[#49BBBD]">Đã thêm vào giỏ hàng</p>
            <p className="text-xs text-slate-600 mt-1">
              Khóa học đang chờ thanh toán. Thanh toán để bắt đầu học!
            </p>
          </div>

          {onGoToCart && (
            <button
              onClick={onGoToCart}
              className="w-full py-3.5 px-4 bg-[#49BBBD] hover:bg-[#3db0b2] text-white font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#49BBBD]/20"
            >
              <FaCreditCard size={14} />
              Thanh toán ngay
            </button>
          )}
        </div>
      ) : (
        /* ==================== TRẠNG THÁI 4: CHƯA ĐĂNG KÝ ==================== */
        <div className="space-y-3">
          {/* ✅ Nút chính — label đổi theo loại khóa */}
          <button
            onClick={onBuyNow}
            disabled={buyingNow}
            className={`w-full py-3.5 px-4 text-white font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md ${
              isFreeCourse
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20'
                : 'bg-[#49BBBD] hover:bg-[#3db0b2] shadow-[#49BBBD]/20'
            }`}
          >
            {buyingNow ? (
              <FaSpinner className="animate-spin" />
            ) : isFreeCourse ? (
              <>
                <FaGift size={14} />
                Đăng ký ngay
              </>
            ) : (
              <>
                <FaBolt size={14} />
                Mua ngay
              </>
            )}
          </button>

          {/* ✅ Ẩn "Thêm vào giỏ hàng" với khóa miễn phí (enroll tức thì, không cần giỏ) */}
          {!isFreeCourse && (
            <button
              onClick={onAddToCart}
              disabled={addingToCart}
              className="w-full py-3 px-4 rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50"
            >
              {addingToCart ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <FaShoppingCart size={14} />
                  Thêm vào giỏ hàng
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Wishlist Button - Chỉ hiển thị khi chưa đăng ký và chưa trong giỏ */}
      {!isEnrolled && !isInCart && !isWaiting && (
        <button
          onClick={onToggleWishlist}
          disabled={togglingWishlist}
          className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          {togglingWishlist ? (
            <FaSpinner className="animate-spin" />
          ) : inWishlist ? (
            <>
              <FaHeart className="text-rose-500" />
              Đã thêm vào yêu thích
            </>
          ) : (
            <>
              <FaRegHeart />
              Thêm vào yêu thích
            </>
          )}
        </button>
      )}

      {/* 4. THIS COURSE INCLUDED */}
      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h4 className="font-bold text-slate-800 text-sm">Khóa học bao gồm</h4>
        <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
          <li className="flex items-center gap-2.5">
            <FaShieldAlt className="text-[#49BBBD] text-sm" />
            <span>Đảm bảo hoàn tiền</span>
          </li>
          <li className="flex items-center gap-2.5">
            <FaMobileAlt className="text-[#49BBBD] text-sm" />
            <span>Truy cập trên mọi thiết bị</span>
          </li>
          <li className="flex items-center gap-2.5">
            <FaCertificate className="text-[#49BBBD] text-sm" />
            <span>Chứng chỉ hoàn thành</span>
          </li>
          <li className="flex items-center gap-2.5">
            <FaLayerGroup className="text-[#49BBBD] text-sm" />
            <span>Nội dung đầy đủ</span>
          </li>
        </ul>
      </div>

      {/* 5. SHARE THIS COURSE */}
      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h4 className="font-bold text-slate-800 text-sm">Chia sẻ khóa học</h4>
        <div className="flex items-center justify-between text-slate-600">
          <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#49BBBD] hover:text-white flex items-center justify-center transition cursor-pointer">
            <FaTwitter size={13} />
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#49BBBD] hover:text-white flex items-center justify-center transition cursor-pointer">
            <FaFacebookF size={13} />
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#49BBBD] hover:text-white flex items-center justify-center transition cursor-pointer">
            <FaYoutube size={13} />
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#49BBBD] hover:text-white flex items-center justify-center transition cursor-pointer">
            <FaInstagram size={13} />
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#49BBBD] hover:text-white flex items-center justify-center transition cursor-pointer">
            <FaTelegramPlane size={13} />
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#49BBBD] hover:text-white flex items-center justify-center transition cursor-pointer">
            <FaWhatsapp size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}