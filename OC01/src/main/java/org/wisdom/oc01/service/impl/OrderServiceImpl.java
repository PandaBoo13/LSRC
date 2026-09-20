package org.wisdom.oc01.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.response.OrderResponse;
import org.wisdom.oc01.entity.*;
import org.wisdom.oc01.entity.OrderItem.EnrollmentStatus;
import org.wisdom.oc01.entity.OrderItem.EnrollmentType;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.OrderMapper;
import org.wisdom.oc01.generic.validator.OrderValidator;
import org.wisdom.oc01.repository.*;
import org.wisdom.oc01.service.OrderService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final OrderValidator validator;
    private final OrderMapper mapper;
    private final VnPayService vnPayService;

    // ==================== CONSTANTS ====================

    private static final String PAYMENT_METHOD_FREE = "FREE";
    private static final String PAYMENT_METHOD_VNPAY = "VNPAY";

    private static final Map<String, BigDecimal> RATES_FROM_SGD = Map.of(
            "SGD", BigDecimal.ONE,
            "VND", new BigDecimal("18500"),
            "USD", new BigDecimal("0.74"),
            "EUR", new BigDecimal("0.68"),
            "JPY", new BigDecimal("110.50"),
            "CNY", new BigDecimal("5.35")
    );

    private static final Map<String, String> GATEWAY_CURRENCY = Map.of(
            "VNPAY", "VND",
            "MOMO", "VND",
            "ZALOPAY", "VND",
            "PAYPAL", "USD",
            "STRIPE", "USD"
    );

    private static final BigDecimal VNPAY_MAX_AMOUNT = new BigDecimal("500000000");

    // ==================== AUTHORIZATION HELPERS ====================

    private boolean isAdmin(Account account) {
        return account != null
                && account.getRole() != null
                && "ADMIN".equalsIgnoreCase(account.getRole().getRoleName());
    }

    /**
     * Load order và enforce ownership.
     *
     * FIXED [PERF]: dùng `findByIdAndAccountIdAccount` cho non-admin
     *   → giảm từ 1 (findById) + check owner sang 1 query duy nhất.
     *   → tránh lazy-load `order.getAccount()` để so sánh.
     *
     * Trả 404 (không phải 403) để tránh rò rỉ sự tồn tại của order.
     */
    private Order loadOwnedOrder(Integer orderId) {
        Account current = SecurityUtils.requireCurrentAccount();

        if (isAdmin(current)) {
            // Admin: load mọi order
            return orderRepository.findById(orderId)
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                            "Đơn hàng không tồn tại"));
        }

        // Non-admin: query đã scope theo owner → không cần check thêm
        return orderRepository.findByIdAndAccountIdAccount(orderId, current.getIdAccount())
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Đơn hàng không tồn tại"));
    }

    // ==================== CREATE ORDER ====================

    @Override
    @Transactional
    public OrderResponse createOrder(Integer accountId, List<Integer> courseIds) {
        Account current = SecurityUtils.requireCurrentAccount();

        Integer targetAccountId;
        if (accountId != null && !accountId.equals(current.getIdAccount())) {
            if (!isAdmin(current)) {
                throw new ErrorHandler(HttpStatus.FORBIDDEN,
                        "Bạn không có quyền tạo đơn hàng cho tài khoản khác");
            }
            targetAccountId = accountId;
        } else {
            targetAccountId = current.getIdAccount();
        }

        Account account = accountRepository.findById(targetAccountId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Tài khoản không tồn tại"));

        if (courseIds == null || courseIds.isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Vui lòng chọn ít nhất một khóa học");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        boolean allFree = true;

        for (Integer courseId : courseIds) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                            "Khóa học không tồn tại: " + courseId));
            if (course.getStatus() != Course.CourseStatus.PUBLISHED) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Khóa học \"" + course.getTitle() + "\" hiện không khả dụng");
            }

            List<OrderItem> existingItems = orderItemRepository
                    .findAllByAccountIdAccountAndCourseIdCourse(targetAccountId, courseId);

            boolean isOwned = existingItems.stream().anyMatch(item ->
                    item.getEnrollmentType() == EnrollmentType.ENROLLED
                            && item.getStatus() == EnrollmentStatus.ACTIVE
                            && item.getOrder() != null
                            && item.getOrder().getStatus() == Order.OrderStatus.PAID);
            if (isOwned) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Bạn đã sở hữu khóa học \"" + course.getTitle() + "\"");
            }

            boolean isInCart = existingItems.stream().anyMatch(item ->
                    item.getOrder() != null
                            && item.getOrder().getStatus() == Order.OrderStatus.PENDING);
            if (isInCart) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Khóa học \"" + course.getTitle() + "\" đã có trong giỏ hàng");
            }

            if (course.getPrerequisiteCourse() != null) {
                Course prerequisite = course.getPrerequisiteCourse();
                boolean hasPrerequisite = orderItemRepository
                        .findAllByAccountIdAccountAndCourseIdCourse(targetAccountId,
                                prerequisite.getIdCourse())
                        .stream().anyMatch(item ->
                                item.getEnrollmentType() == EnrollmentType.ENROLLED
                                        && item.getStatus() == EnrollmentStatus.ACTIVE
                                        && item.getOrder() != null
                                        && item.getOrder().getStatus() == Order.OrderStatus.PAID);
                if (!hasPrerequisite) {
                    throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                            "Khóa học \"" + course.getTitle() + "\" yêu cầu hoàn thành \""
                                    + prerequisite.getTitle() + "\" trước");
                }
            }

            BigDecimal price = course.getPrice() != null ? course.getPrice() : BigDecimal.ZERO;
            totalAmount = totalAmount.add(price);

            if (Boolean.FALSE.equals(course.getIsFree())
                    || price.compareTo(BigDecimal.ZERO) > 0) {
                allFree = false;
            }
        }

        boolean isFreeOrder = allFree || totalAmount.compareTo(BigDecimal.ZERO) == 0;

        Order order = new Order();
        order.setAccount(account);
        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setFinalAmount(totalAmount);

        if (isFreeOrder) {
            order.setStatus(Order.OrderStatus.PAID);
            order.setPaymentMethod(PAYMENT_METHOD_FREE);
            order.setTransactionId("FREE-" + System.currentTimeMillis());
            order.setPaidAt(LocalDateTime.now());
            order.setPaidAmount(BigDecimal.ZERO);
            order.setPaidCurrency("SGD");
            order.setInvoiceNumber(mapper.generateInvoiceNumber(true));
            order.setBuyerName(mapper.getBuyerName(order));
            order.setBuyerEmail(mapper.getBuyerEmail(order));
            order.setInvoiceIssuedAt(LocalDateTime.now());
            log.info("🆓 [Free Order] Account #{} đăng ký {} khóa học miễn phí",
                    targetAccountId, courseIds.size());
        } else {
            order.setStatus(Order.OrderStatus.PENDING);
        }

        validator.validate(order);
        order = orderRepository.save(order);

        for (Integer courseId : courseIds) {
            Course course = courseRepository.findById(courseId).orElseThrow();
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setAccount(account);
            orderItem.setCourse(course);
            orderItem.setPrice(course.getPrice());
            orderItem.setDiscount(BigDecimal.ZERO);
            orderItem.setFinalPrice(course.getPrice());
            orderItem.setProgress(BigDecimal.ZERO);

            if (isFreeOrder) {
                orderItem.setEnrollmentType(EnrollmentType.ENROLLED);
                orderItem.setStatus(EnrollmentStatus.ACTIVE);
            } else {
                orderItem.setEnrollmentType(EnrollmentType.WAITING);
                orderItem.setStatus(EnrollmentStatus.ACTIVE);
            }
            orderItemRepository.save(orderItem);
        }

        log.info("✅ Order #{} created: {} items, total={}, isFree={}",
                order.getId(), courseIds.size(), totalAmount, isFreeOrder);

        return mapper.toResponse(order);
    }

    // ==================== PROCESS PAYMENT ====================

    @Override
    @Transactional
    public OrderResponse processPayment(Integer orderId, String paymentMethod,
                                        String transactionId) {
        Order order = loadOwnedOrder(orderId);

        if (PAYMENT_METHOD_FREE.equalsIgnoreCase(order.getPaymentMethod())
                && order.getStatus() == Order.OrderStatus.PAID) {
            log.info("ℹ️ Order #{} là đơn miễn phí, bỏ qua processPayment", orderId);
            return mapper.toResponse(order);
        }

        validator.validateForPayment(order);

        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Phương thức thanh toán không được để trống");
        }

        if (!PAYMENT_METHOD_VNPAY.equalsIgnoreCase(paymentMethod)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Phương thức thanh toán chưa được hỗ trợ. Vui lòng chọn VNPAY.");
        }

        String currency = GATEWAY_CURRENCY.getOrDefault(paymentMethod.toUpperCase(), "SGD");
        BigDecimal rate = RATES_FROM_SGD.getOrDefault(currency, BigDecimal.ONE);
        BigDecimal paidAmount = order.getFinalAmount()
                .multiply(rate).setScale(2, RoundingMode.HALF_UP);

        log.info("💰 [Payment] Order #{}: {} SGD → {} {} (rate={})",
                order.getId(), order.getFinalAmount(), paidAmount, currency, rate);

        if (paidAmount.compareTo(VNPAY_MAX_AMOUNT) > 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Đơn hàng vượt giới hạn VNPAY (500 triệu VND).");
        }

        order.setPaidCurrency(currency);
        order.setPaidAmount(paidAmount);
        order.setPaymentMethod(paymentMethod);

        String paymentUrl = vnPayService.createPaymentUrl(
                String.valueOf(order.getId()),
                paidAmount.toString(),
                "Thanh toan don hang #" + order.getId(),
                "127.0.0.1");

        order.setPaymentUrl(paymentUrl);
        order = orderRepository.save(order);

        return mapper.toResponse(order);
    }

    // ==================== CONFIRM VNPAY PAYMENT (CALLBACK) ====================

    /**
     * Xác nhận thanh toán VNPay — CHỈ được gọi từ IPN endpoint đã verify signature.
     *
     * FIXED [CRITICAL]:
     *  - Dùng `transaction_id` làm idempotency key (KHÔNG thêm cột mới).
     *  - Verify amount khớp order.paidAmount.
     *  - Idempotency: nếu order đã PAID → return luôn.
     *  - Idempotency: nếu transaction_id đã dùng cho order khác → reject.
     */
    @Override
    @Transactional
    public OrderResponse confirmVnPayPayment(Integer orderId,
                                             String transactionNo,
                                             BigDecimal amountVnd,
                                             boolean success) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Đơn hàng không tồn tại"));

        // ============ IDEMPOTENCY 1: order đã PAID ============
        if (order.getStatus() == Order.OrderStatus.PAID) {
            log.info("[VNPAY] Order #{} đã PAID, bỏ qua callback lặp", orderId);
            return mapper.toResponse(order);
        }

        // ============ IDEMPOTENCY 2: transaction_id đã dùng ============
        if (transactionNo != null && !transactionNo.isBlank()) {
            boolean txnUsed = orderRepository.existsByTransactionId(transactionNo);
            if (txnUsed) {
                log.warn("[VNPAY] Transaction {} đã được sử dụng cho order khác",
                        transactionNo);
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Giao dịch đã được sử dụng");
            }
        }

        // ============ VERIFY AMOUNT ============
        if (success) {
            if (amountVnd == null || order.getPaidAmount() == null) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Không xác định được số tiền thanh toán");
            }

            BigDecimal diff = amountVnd.subtract(order.getPaidAmount()).abs();
            BigDecimal tolerance = BigDecimal.ONE;

            if (diff.compareTo(tolerance) > 0) {
                log.warn("[VNPAY] Amount mismatch for order #{}: callback={}, expected={}",
                        orderId, amountVnd, order.getPaidAmount());
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Số tiền không khớp với đơn hàng");
            }
        }

        // ============ UPDATE STATUS ============
        if (success) {
            order.setStatus(Order.OrderStatus.PAID);
            order.setTransactionId(transactionNo);
            order.setPaidAt(LocalDateTime.now());
            order.setInvoiceNumber(mapper.generateInvoiceNumber());
            order.setBuyerName(mapper.getBuyerName(order));
            order.setBuyerEmail(mapper.getBuyerEmail(order));
            order.setInvoiceIssuedAt(LocalDateTime.now());
            order = orderRepository.save(order);

            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
            for (OrderItem item : items) {
                item.setEnrollmentType(EnrollmentType.ENROLLED);
                item.setStatus(EnrollmentStatus.ACTIVE);
                orderItemRepository.save(item);
            }

            log.info("[VNPAY] Order #{} PAID, txn={}", orderId, transactionNo);
        } else {
            order.setStatus(Order.OrderStatus.FAILED);
            order.setTransactionId(transactionNo);
            order = orderRepository.save(order);
            log.info("[VNPAY] Order #{} FAILED, txn={}", orderId, transactionNo);
        }

        return mapper.toResponse(order);
    }

    // ==================== GET ORDER ====================

    @Override
    public OrderResponse getOrderById(Integer orderId) {
        Order order = loadOwnedOrder(orderId);
        return mapper.toResponse(order);
    }

    @Override
    public Page<OrderResponse> getOrdersByAccount(Integer accountId, Pageable pageable) {
        Account current = SecurityUtils.requireCurrentAccount();
        if (!isAdmin(current) && !accountId.equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền xem đơn hàng của tài khoản khác");
        }

        if (!accountRepository.existsById(accountId)) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại");
        }
        return orderRepository.findByAccountIdAccount(accountId, pageable)
                .map(mapper::toResponse);
    }

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Account current = SecurityUtils.requireCurrentAccount();
        if (!isAdmin(current)) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Chỉ quản trị viên mới có quyền xem tất cả đơn hàng");
        }
        return orderRepository.findAll(pageable).map(mapper::toResponse);
    }

    // ==================== CANCEL ORDER ====================

    @Override
    @Transactional
    public void cancelOrder(Integer orderId) {
        Order order = loadOwnedOrder(orderId);
        validator.validateForCancel(order);
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}