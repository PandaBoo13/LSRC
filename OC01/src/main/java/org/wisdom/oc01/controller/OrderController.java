package org.wisdom.oc01.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.CreateOrderRequest;
import org.wisdom.oc01.dto.request.PaymentRequest;
import org.wisdom.oc01.dto.response.OrderResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.service.OrderService;
import org.wisdom.oc01.service.impl.VnPayService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final VnPayService vnPayService;

    /** URL frontend cho redirect — đọc từ config (.env). */
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /** Tỷ giá SGD → VND. */
    private static final BigDecimal SGD_TO_VND = new BigDecimal("18500");

    // ============================================================
    // 1. TẠO ĐƠN HÀNG
    // ============================================================
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {

        // FIXED: dùng SecurityUtils — principal là CustomUserDetails
        Account current = SecurityUtils.requireCurrentAccount();

        OrderResponse order = orderService.createOrder(
                current.getIdAccount(), request.getCourseIds());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(order, "Tạo đơn hàng thành công"));
    }

    // ============================================================
    // 2. LẤY DANH SÁCH ĐƠN HÀNG CỦA TÔI
    // ============================================================
    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Account current = SecurityUtils.requireCurrentAccount();
        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<OrderResponse> orders = orderService.getOrdersByAccount(
                current.getIdAccount(), pageable);

        return ResponseEntity.ok(
                new RequestResponse(orders, "Lấy danh sách đơn hàng thành công"));
    }

    // ============================================================
    // 3. LẤY CHI TIẾT ĐƠN HÀNG
    // ============================================================
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getOrderById(@PathVariable Integer id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(
                new RequestResponse(order, "Lấy chi tiết đơn hàng thành công"));
    }

    // ============================================================
    // 4. TẠO PAYMENT URL VNPAY
    // ============================================================
    /**
     * FIXED [CRITICAL]:
     *  - KHÔNG tin client paidAmount/amount.
     *  - Luôn tính amount từ order.getFinalAmount() (server-side).
     *  - Chỉ tạo URL, KHÔNG set PAID (chờ IPN).
     */
    @PostMapping("/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> processPayment(
            @Valid @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {

        // Các method khác đi qua service (sẽ throw nếu không support)
        if (!"VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            OrderResponse order = orderService.processPayment(
                    request.getOrderId(),
                    request.getPaymentMethod(),
                    request.getTransactionId());
            return ResponseEntity.ok(new RequestResponse(order, "Thanh toán thành công"));
        }

        // VNPAY: tính amount từ order — KHÔNG tin client
        OrderResponse order = orderService.getOrderById(request.getOrderId());

        BigDecimal vndAmount = order.getFinalAmount()
                .multiply(SGD_TO_VND)
                .setScale(0, RoundingMode.HALF_UP);

        log.info("[VNPAY] Create URL for order #{}: {} SGD → {} VND",
                request.getOrderId(), order.getFinalAmount(), vndAmount);

        // Persist paidAmount lên order + set payment method
        orderService.processPayment(request.getOrderId(), "VNPAY", null);

        String ipAddress = httpRequest.getRemoteAddr();
        String paymentUrl = vnPayService.createPaymentUrl(
                String.valueOf(request.getOrderId()),
                vndAmount.toString(),
                "Thanh toan don hang #" + request.getOrderId(),
                ipAddress);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("orderId", request.getOrderId());
        responseData.put("paymentUrl", paymentUrl);
        responseData.put("paymentMethod", "VNPAY");
        responseData.put("status", "PENDING_PAYMENT");

        return ResponseEntity.ok(
                new RequestResponse(responseData, "Tạo URL thanh toán VNPAY thành công"));
    }

    // ============================================================
    // 4b. VNPAY IPN — server-to-server (BẮT BUỘC verify đầy đủ)
    // ============================================================
    /**
     * Endpoint IPN (Instant Payment Notification) — VNPay gọi server-to-server.
     *
     * FIXED [CRITICAL]:
     *  - Verify đầy đủ: signature, merchant, currency, transaction status, amount.
     *  - Đây là NGUỒN DUY NHẤT được set PAID.
     *  - Response format theo chuẩn VNPay: {"RspCode": "00", "Message": "..."}
     */
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(
            @RequestParam Map<String, String> params) {

        log.info("[VNPAY IPN] Received callback: txnRef={}, responseCode={}",
                params.get("vnp_TxnRef"), params.get("vnp_ResponseCode"));

        // 1. Verify đầy đủ (signature + merchant + currency + status)
        VnPayService.VnPayCallbackResult result;
        try {
            result = vnPayService.verifyCallbackFull(params);
        } catch (VnPayService.VnPayVerificationException e) {
            log.warn("[VNPAY IPN] Verification failed: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "RspCode", "97",
                    "Message", "Invalid signature or checksum"));
        }

        // 2. Parse orderId từ txnRef (format: {orderId}_{timestamp})
        String orderIdStr = result.getTxnRef();
        if (orderIdStr == null || !orderIdStr.contains("_")) {
            return ResponseEntity.ok(Map.of(
                    "RspCode", "01", "Message", "Order not found"));
        }
        Integer orderId;
        try {
            orderId = Integer.parseInt(orderIdStr.split("_")[0]);
        } catch (NumberFormatException e) {
            return ResponseEntity.ok(Map.of(
                    "RspCode", "01", "Message", "Order not found"));
        }

        // 3. Verify amount + update order (idempotent)
        try {
            orderService.confirmVnPayPayment(
                    orderId,
                    result.getTransactionNo(),
                    result.getAmountVnd(),
                    result.isSuccess());
            return ResponseEntity.ok(Map.of(
                    "RspCode", "00", "Message", "Confirm Success"));
        } catch (ErrorHandler e) {
            log.warn("[VNPAY IPN] Failed for order {}: {}", orderId, e.getMessage());
            String rspCode = switch (e.getStatus()) {
                case NOT_FOUND -> "01";       // Order not found
                case BAD_REQUEST -> "04";     // Amount invalid / txn used
                default -> "99";              // Unknown error
            };
            return ResponseEntity.ok(Map.of(
                    "RspCode", rspCode, "Message", e.getMessage()));
        } catch (Exception e) {
            log.error("[VNPAY IPN] Unexpected error", e);
            return ResponseEntity.ok(Map.of(
                    "RspCode", "99", "Message", "Unknown error"));
        }
    }

    // ============================================================
    // 4c. VNPAY RETURN — user redirect (KHÔNG set PAID)
    // ============================================================
    /**
     * Return URL — VNPay redirect user về đây sau khi thanh toán.
     *
     * FIXED [CRITICAL]:
     *  - CHỈ redirect user, KHÔNG update order.
     *  - Lý do: user có thể sửa URL để fake thành công.
     *  - Order được update từ IPN endpoint (server-to-server).
     */
    @GetMapping("/vnpay/return")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> params) {
        // Chỉ verify signature để hiển thị đúng message cho user
        boolean valid = vnPayService.verifyCallbackSignature(params);

        String orderId = params.get("vnp_TxnRef");
        if (orderId != null && orderId.contains("_")) {
            orderId = orderId.split("_")[0];
        }

        String responseCode = params.get("vnp_ResponseCode");
        boolean success = valid && "00".equals(responseCode);

        String targetUrl = success
                ? frontendUrl + "/payment/success?orderId=" + orderId
                : frontendUrl + "/payment/failed?orderId=" + orderId;

        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", targetUrl)
                .build();
    }

    // ============================================================
    // 5. HỦY ĐƠN HÀNG
    // ============================================================
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> cancelOrder(@PathVariable Integer id) {
        SecurityUtils.requireCurrentAccount();  // đảm bảo đã login
        orderService.cancelOrder(id);
        return ResponseEntity.ok(
                new RequestResponse("Hủy đơn hàng thành công"));
    }

    // ============================================================
    // 6. ADMIN — LẤY TẤT CẢ ĐƠN HÀNG
    // ============================================================
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RequestResponse> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = Sort.Direction.fromString(sortDirection.toUpperCase());
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<OrderResponse> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(
                new RequestResponse(orders, "Lấy danh sách đơn hàng thành công"));
    }
}