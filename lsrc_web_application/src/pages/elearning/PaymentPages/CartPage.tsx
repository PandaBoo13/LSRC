// src/pages/elearning/StudentPages/CartPage.tsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaSpinner, FaShoppingCart, FaArrowRight } from "react-icons/fa";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getMyOrders, deleteOrderItem } from "../../../service/orderService";
import { getImageUrl, getImageDimensions, getImageClass, type ImageDimensions } from "../../../utils/imageHelper";
import { useCurrency } from "../../../context/CurrencyContext";
import type { OrderResponse, OrderItemResponse } from "../../../types/order.types";

export function CartPage() {
  const navigate = useNavigate();
  
  // ✅ Dùng currency context
  const { convertFormatted, formatAmount } = useCurrency();
  
  const [cartOrder, setCartOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyOrders({ page: 0, size: 10, sortBy: 'createdAt', sortDirection: 'DESC' });
      const cart = (data.content || []).find(o => o.status === 'PENDING');
      setCartOrder(cart || null);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleRemove = async (orderItemId: number) => {
    try {
      setRemovingId(orderItemId);
      await deleteOrderItem(orderItemId);
      
      // Cập nhật lại giỏ hàng
      if (cartOrder && cartOrder.items) {
        const updatedItems = cartOrder.items.filter(item => item.id !== orderItemId);
        
        if (updatedItems.length === 0) {
          setCartOrder(null); // Giỏ hàng trống
        } else {
          setCartOrder({
            ...cartOrder,
            items: updatedItems,
            totalAmount: updatedItems.reduce((sum, item) => sum + (item.finalPrice || 0), 0),
            finalAmount: updatedItems.reduce((sum, item) => sum + (item.finalPrice || 0), 0),
          });
        }
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = () => {
    if (cartOrder && cartOrder.items && cartOrder.items.length > 0) {
      const courseIds = cartOrder.items.map(item => item.courseId).join(',');
      navigate(`/checkout?courses=${courseIds}&orderId=${cartOrder.id}`);
    }
  };

  const totalPrice = cartOrder?.items?.reduce((sum, item) => sum + (item.finalPrice || 0), 0) || 0;

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

  if (!cartOrder || !cartOrder.items || cartOrder.items.length === 0) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-800">
        <Header />
        <div className="flex flex-col items-center justify-center py-28 text-center px-6">
          <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-[#49BBBD] mb-5">
            <FaShoppingCart className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Giỏ hàng trống</h2>
          <p className="text-slate-400 text-sm max-w-md mb-8">
            Hãy khám phá các khóa học hấp dẫn và thêm vào giỏ hàng của bạn!
          </p>
          <Link
            to="/courses"
            className="px-8 py-3.5 bg-[#49BBBD] hover:bg-teal-600 text-white font-semibold rounded-2xl shadow-md transition-all text-sm"
          >
            Khám phá khóa học
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-white text-slate-800">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
          Giỏ hàng của bạn
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          {cartOrder.items.length} khóa học trong giỏ hàng
        </p>

        {/* Cart Items */}
        <div className="space-y-4">
          {cartOrder.items.map((item: OrderItemResponse) => (
            <CartItem 
              key={item.id} 
              item={item} 
              removingId={removingId} 
              onRemove={handleRemove}
              convertFormatted={convertFormatted}
              formatAmount={formatAmount}
            />
          ))}
        </div>

        {/* Checkout Summary */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Tổng cộng ({cartOrder.items.length} khóa học)
              </p>
              {/* ✅ Giá hiển thị theo tiền tệ đã chọn */}
              <p className="text-2xl font-bold text-[#2F327D] mt-1">
                {convertFormatted(totalPrice)}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#49BBBD] hover:bg-teal-600 text-white font-semibold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
            >
              Tiến hành thanh toán
              <FaArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ==================== CART ITEM COMPONENT ====================

interface CartItemProps {
  item: OrderItemResponse;
  removingId: number | null;
  onRemove: (id: number) => void;
  convertFormatted: (amount: number) => string;
  formatAmount: (amount: number) => string;
}

function CartItem({ item, removingId, onRemove, convertFormatted, formatAmount }: CartItemProps) {
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const imageUrl = getImageUrl(item.courseThumbnailUrl);

  useEffect(() => {
    if (imageUrl && imageUrl !== '/placeholder.jpg') {
      getImageDimensions(imageUrl)
        .then(setImageDimensions)
        .catch(() => setImageDimensions(null));
    }
  }, [imageUrl]);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4">
      {/* Course Thumbnail - ✅ Dùng getImageClass */}
      <div className="w-24 sm:w-32 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
        <img
          src={imageUrl}
          alt={item.courseTitle}
          className={`${getImageClass(imageDimensions?.orientation)} transition-transform duration-300`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300";
          }}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/courses/${item.courseSlug}`}
          className="font-bold text-slate-800 text-sm sm:text-base line-clamp-1 hover:text-[#49BBBD] transition-colors"
        >
          {item.courseTitle}
        </Link>
        
        {/* ✅ Giá hiển thị theo tiền tệ đã chọn */}
        <p className="text-sm font-bold text-[#49BBBD] mt-2">
          {item.finalPrice === 0 ? 'Miễn phí' : convertFormatted(item.finalPrice)}
        </p>
        
        {item.discount > 0 && (
          <p className="text-xs text-slate-400 line-through mt-0.5">
            {convertFormatted(item.price)}
          </p>
        )}
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={removingId === item.id}
        className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50"
        title="Xóa khỏi giỏ hàng"
      >
        {removingId === item.id ? (
          <FaSpinner className="animate-spin text-sm" />
        ) : (
          <FaTrash className="text-sm" />
        )}
      </button>
    </div>
  );
}