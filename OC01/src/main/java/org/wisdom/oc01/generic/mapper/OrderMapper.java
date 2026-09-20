package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.OrderResponse;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.entity.Order;
import org.wisdom.oc01.entity.OrderItem;
import org.wisdom.oc01.repository.OrderItemRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final OrderItemRepository orderItemRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== ENTITY → RESPONSE ====================

    public OrderResponse toResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());

        return OrderResponse.builder()
                .id(order.getId())
                .accountId(order.getAccount().getIdAccount())
                .username(order.getAccount().getUsername())
                // Order info
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                // Thanh toán
                .paymentMethod(order.getPaymentMethod())
                .transactionId(order.getTransactionId())
                .gatewayResponse(order.getGatewayResponse())
                .paymentUrl(order.getPaymentUrl())
                .paidAt(order.getPaidAt())
                .paymentLog(order.getPaymentLog() != null ? order.getPaymentLog().toString() : null) // ✅ Convert Json → String
                // Hóa đơn
                .invoiceNumber(order.getInvoiceNumber())
                .buyerName(order.getBuyerName())
                .buyerEmail(order.getBuyerEmail())
                .invoiceIssuedAt(order.getInvoiceIssuedAt())
                // Items
                .items(items.stream().map(this::toItemResponse).collect(Collectors.toList()))
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public OrderResponse.OrderItemResponse toItemResponse(OrderItem item) {
        Course course = item.getCourse();
        return OrderResponse.OrderItemResponse.builder()
                .id(item.getId())
                .accountId(item.getAccount() != null ? item.getAccount().getIdAccount() : null) // ✅ THÊM
                .courseId(course.getIdCourse())
                .courseTitle(course.getTitle())
                .courseSlug(course.getSlug())
                .courseThumbnailUrl(course.getThumbnailUrl())
                .price(item.getPrice())
                .discount(item.getDiscount())
                .finalPrice(item.getFinalPrice())
                .enrollmentType(item.getEnrollmentType() != null ? item.getEnrollmentType().name() : null)
                .progress(item.getProgress())
                .status(item.getStatus() != null ? item.getStatus().name() : null)
                .completedAt(item.getCompletedAt())
                .build();
    }

    // ==================== ENTITY → JSON ====================

    public String toJson(Order order) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", order.getId());
            data.put("accountId", order.getAccount() != null ? order.getAccount().getIdAccount() : null);
            data.put("totalAmount", order.getTotalAmount());
            data.put("discountAmount", order.getDiscountAmount());
            data.put("finalAmount", order.getFinalAmount());
            data.put("status", order.getStatus() != null ? order.getStatus().name() : null);
            data.put("paymentMethod", order.getPaymentMethod());
            data.put("transactionId", order.getTransactionId());
            data.put("gatewayResponse", order.getGatewayResponse());
            data.put("paymentUrl", order.getPaymentUrl());
            data.put("paidAt", order.getPaidAt() != null ? order.getPaidAt().toString() : null);
            data.put("paymentLog", order.getPaymentLog() != null ? order.getPaymentLog().toString() : null); // ✅ Convert Json → String
            data.put("invoiceNumber", order.getInvoiceNumber());
            data.put("buyerName", order.getBuyerName());
            data.put("buyerEmail", order.getBuyerEmail());
            data.put("invoiceIssuedAt", order.getInvoiceIssuedAt() != null ? order.getInvoiceIssuedAt().toString() : null);
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }

    // ==================== HELPERS ====================

    /** Sinh số hóa đơn mặc định (dành cho đơn có phí) */
    public String generateInvoiceNumber() {
        return generateInvoiceNumber(false);
    }

    /**
     * ✅ Sinh số hóa đơn có phân biệt đơn miễn phí.
     * @param isFree true → prefix "INV-FREE-", false → prefix "INV-"
     */
    public String generateInvoiceNumber(boolean isFree) {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%06d", (int) (Math.random() * 1000000));
        return (isFree ? "INV-FREE-" : "INV-") + date + "-" + random;
    }

    public String getBuyerName(Order order) {
        if (order.getAccount() != null && order.getAccount().getUser() != null) {
            String firstName = order.getAccount().getUser().getFirstName() != null
                    ? order.getAccount().getUser().getFirstName() : "";
            String lastName = order.getAccount().getUser().getLastName() != null
                    ? order.getAccount().getUser().getLastName() : "";
            if (!firstName.isEmpty() || !lastName.isEmpty()) {
                return (firstName + " " + lastName).trim();
            }
        }
        return order.getAccount() != null ? order.getAccount().getUsername() : "";
    }

    public String getBuyerEmail(Order order) {
        return order.getAccount() != null ? order.getAccount().getEmail() : null;
    }
}