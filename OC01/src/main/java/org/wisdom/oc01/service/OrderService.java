package org.wisdom.oc01.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.wisdom.oc01.dto.response.OrderResponse;

import java.math.BigDecimal;
import java.util.List;

public interface OrderService {

    /**
     * Tạo đơn hàng từ danh sách khóa học.
     * accountId chỉ được chỉ định bởi admin; user thường luôn dùng account của mình.
     */
    OrderResponse createOrder(Integer accountId, List<Integer> courseIds);

    /**
     * Xử lý thanh toán — CHỈ hỗ trợ VNPAY (tạo payment URL, order vẫn PENDING).
     * Các method khác sẽ throw 400.
     */
    OrderResponse processPayment(Integer orderId, String paymentMethod, String transactionId);

    /**
     * Xác nhận thanh toán VNPay — CHỈ được gọi từ IPN endpoint đã verify signature.
     *
     * FIXED [CRITICAL]:
     *  - Thêm param `amountVnd` để verify số tiền callback khớp với order.paidAmount.
     *  - Dùng `transaction_id` làm idempotency key.
     *
     * @param orderId       ID order
     * @param transactionNo vnp_TransactionNo từ VNPay
     * @param amountVnd     Số tiền VNPay báo về (đã /100)
     * @param success       true nếu responseCode + transactionStatus đều "00"
     */
    OrderResponse confirmVnPayPayment(Integer orderId,
                                      String transactionNo,
                                      BigDecimal amountVnd,
                                      boolean success);

    /** Lấy đơn hàng theo ID — enforce ownership. */
    OrderResponse getOrderById(Integer orderId);

    /** Lấy danh sách đơn hàng của account — chỉ self hoặc admin. */
    Page<OrderResponse> getOrdersByAccount(Integer accountId, Pageable pageable);

    /** Lấy tất cả đơn hàng — chỉ admin. */
    Page<OrderResponse> getAllOrders(Pageable pageable);

    /** Hủy đơn hàng — chỉ chủ sở hữu hoặc admin. */
    void cancelOrder(Integer orderId);
}