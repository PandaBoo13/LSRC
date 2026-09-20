// src/pages/elearning/StudentPages/CheckoutPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { Toast, type ToastMessage } from "../../../components/elearning/ui/Toast";
import { getCourseById } from "../../../service/courseService";
import { createOrder, processPayment, getMyOrders } from "../../../service/orderService";
import { getImageUrl, getImageDimensions, getImageClass, type ImageDimensions } from "../../../utils/imageHelper";
import { useCurrency } from "../../../context/CurrencyContext";
import type { Course } from "../../../types/course.types";

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ Dùng currency context — LẤY THÊM targetCurrency + rate
  const { convertFormatted, targetCurrency, rate } = useCurrency();

  const coursesParam = searchParams.get('courses');
  const orderIdParam = searchParams.get('orderId');
  const selectedCourseIds = coursesParam ? coursesParam.split(',').map(Number).filter(id => !isNaN(id)) : [];

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");

  const [form, setForm] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    billingEmail: "",
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!coursesParam || selectedCourseIds.length === 0) {
      navigate('/cart');
      return;
    }
    loadCourses();
  }, [coursesParam]);

  const loadCourses = async () => {
    try {
      setLoading(true);

      if (orderIdParam) {
        const myOrders = await getMyOrders({ page: 0, size: 10 });
        const cartOrder = (myOrders.content || []).find(o => o.id === Number(orderIdParam));

        if (cartOrder && cartOrder.items) {
          const coursePromises = cartOrder.items.map(item => getCourseById(item.courseId));
          const results = await Promise.allSettled(coursePromises);
          const validCourses = results
            .filter((r): r is PromiseFulfilledResult<Course> => r.status === 'fulfilled')
            .map(r => r.value);
          setCourses(validCourses);
        } else {
          setCourses([]);
        }
      } else {
        const coursePromises = selectedCourseIds.map(id => getCourseById(id));
        const results = await Promise.allSettled(coursePromises);
        const validCourses = results
          .filter((r): r is PromiseFulfilledResult<Course> => r.status === 'fulfilled')
          .map(r => r.value);
        setCourses(validCourses);
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = courses.reduce((sum, c) => sum + (c.price || 0), 0);

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (courses.length === 0) {
      showToast("Không có khóa học nào được chọn", "error");
      return;
    }

    try {
      setSubmitting(true);

      let orderId: number;

      if (orderIdParam) {
        orderId = Number(orderIdParam);
        console.log('🟡 Dùng order hiện tại:', orderId);
      } else {
        console.log('🟡 Tạo order mới...');
        const order = await createOrder(selectedCourseIds);
        orderId = order.id;
        console.log('🔵 Order created:', order);
      }

      // ✅ Gửi kèm currency + paidAmount theo đơn vị user đang xem
      // - amount: SGD gốc (giữ cho tương thích + verify)
      // - currency: 'VND', 'USD', ...
      // - paidAmount: subtotal × rate = số tiền theo currency user xem
      const paidAmount = subtotal * rate;

      console.log(`💰 [Checkout] ${subtotal} SGD × ${rate} = ${paidAmount} ${targetCurrency}`);

      const response = await processPayment({
        orderId,
        paymentMethod,
        amount: subtotal,
        currency: targetCurrency,
        paidAmount,
      });

      console.log('🟢 Payment Response:', response);

      if ('paymentUrl' in response && response.paymentUrl) {
        window.location.href = response.paymentUrl;
        return;
      }

      if ('status' in response && response.status === 'PAID') {
        showToast("Thanh toán thành công!", "success");
        setTimeout(() => navigate(`/payment/success?orderId=${orderId}`), 1200);
      } else {
        showToast("Thanh toán chưa hoàn tất", "error");
      }
    } catch (err: any) {
      console.error('🔴 Payment error:', err);
      showToast(err?.response?.data?.message || err?.message || "Thanh toán thất bại", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <FaSpinner className="h-10 w-10 animate-spin text-[#49BBBD]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <p className="text-xl text-slate-600 font-semibold">Chưa chọn khóa học nào để thanh toán</p>
          <Link to="/cart" className="mt-6 px-6 py-3 rounded-xl bg-[#49BBBD] text-white font-medium hover:bg-[#3db0b2] transition-colors">
            Quay lại giỏ hàng
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-white text-slate-800">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Checkout Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">
              Checkout
            </h1>

            {/* Payment Method Option Tabs */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 mb-3">
                Phương thức thanh toán
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("VNPAY")}
                  className={`h-14 rounded-2xl border-2 flex items-center justify-center p-2 transition-all cursor-pointer ${
                    paymentMethod === "VNPAY" ? "border-[#49BBBD] bg-teal-50/20" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-700">VNPAY</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("PAYPAL")}
                  className={`h-14 rounded-2xl border-2 flex items-center justify-center p-2 transition-all cursor-pointer ${
                    paymentMethod === "PAYPAL" ? "border-[#49BBBD] bg-teal-50/20" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-700">PayPal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`h-14 rounded-2xl border-2 flex items-center justify-center p-2 transition-all cursor-pointer ${
                    paymentMethod === "CARD" ? "border-[#49BBBD] bg-teal-50/20" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-700">Thẻ tín dụng</span>
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {paymentMethod === "CARD" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      placeholder="Enter name on Card"
                      value={form.cardholderName}
                      onChange={(e) => handleChange("cardholderName", e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#49BBBD] focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Card Number"
                      maxLength={19}
                      value={form.cardNumber}
                      onChange={(e) => handleChange("cardNumber", e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#49BBBD] focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Expiration Date ( MM/YY )
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={form.expiryDate}
                        onChange={(e) => handleChange("expiryDate", e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#49BBBD] focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        CVC
                      </label>
                      <input
                        type="password"
                        placeholder="CVC"
                        maxLength={4}
                        value={form.cvc}
                        onChange={(e) => handleChange("cvc", e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#49BBBD] focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-5 bg-teal-50/60 rounded-2xl border border-teal-100 text-sm my-4">
                  <p className="font-semibold text-teal-800 flex items-center gap-2">
                    🔒 Thanh toán trực tuyến qua {paymentMethod}
                  </p>
                  <p className="mt-2 text-slate-600 text-xs leading-relaxed">
                    Bạn sẽ được chuyển sang giao diện thanh toán an toàn của <strong>{paymentMethod}</strong>. Sau khi hoàn tất, hệ thống sẽ tự động chuyển hướng về lại website.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 mt-4 bg-[#49BBBD] hover:bg-[#3db0b2] text-white font-semibold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : paymentMethod === 'VNPAY' ? (
                  "Thanh toán qua VNPAY"
                ) : paymentMethod === 'PAYPAL' ? (
                  "Thanh toán qua PayPal"
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:col-span-5 bg-[#EEF5FA] rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Summary
            </h2>

            <div className="space-y-4 mb-6">
              {courses.map((course) => (
                <CheckoutCourseItem
                  key={course.id}
                  course={course}
                  convertFormatted={convertFormatted}
                />
              ))}
            </div>

            <hr className="border-slate-200/80 my-5" />

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Tạm tính</span>
                <span className="font-bold text-slate-800">{convertFormatted(subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600 font-medium">
                <span>Giảm giá</span>
                <span className="font-bold text-slate-800">{convertFormatted(0)}</span>
              </div>

              <hr className="border-slate-200/80 my-3" />

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                <span>Tổng cộng</span>
                <span>{convertFormatted(subtotal)}</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// ==================== CHECKOUT COURSE ITEM ====================

interface CheckoutCourseItemProps {
  course: Course;
  convertFormatted: (amount: number) => string;
}

function CheckoutCourseItem({ course, convertFormatted }: CheckoutCourseItemProps) {
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const imageUrl = getImageUrl(course.thumbnailUrl);

  useEffect(() => {
    if (imageUrl && imageUrl !== '/placeholder.jpg') {
      getImageDimensions(imageUrl)
        .then(setImageDimensions)
        .catch(() => setImageDimensions(null));
    }
  }, [imageUrl]);

  return (
    <div className="flex gap-4 items-center">
      <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
        <img
          src={imageUrl}
          alt={course.title}
          className={`${getImageClass(imageDimensions?.orientation)} transition-transform duration-300`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-semibold text-slate-800 line-clamp-1">
          {course.title}
        </h3>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="text-xs font-bold text-slate-800">
          {convertFormatted(course.price)}
        </span>
      </div>
    </div>
  );
}