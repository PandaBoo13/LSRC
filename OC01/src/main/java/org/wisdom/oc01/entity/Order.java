package org.wisdom.oc01.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", precision = 10, scale = 2)
    private BigDecimal finalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    // ==================== THANH TOÁN ====================
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "paid_currency", length = 10)
    private String paidCurrency;

    @Column(name = "paid_amount", precision = 19, scale = 2)
    private BigDecimal paidAmount;

    /**
     * ID giao dịch từ gateway (VNPAY vnp_TransactionNo, PayPal PAY-xxx, Momo transId...).
     * KHÔNG unique ở entity — unique constraint khai báo ở DB level.
     */
    @Column(name = "transaction_id", length = 255)
    private String transactionId;

    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;

    @Column(name = "payment_url", length = 1000)
    private String paymentUrl;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "payment_log", columnDefinition = "JSON")
    private String paymentLog;

    // ==================== HÓA ĐƠN ====================
    @Column(name = "invoice_number", length = 50)
    private String invoiceNumber;

    @Column(name = "buyer_name", length = 100)
    private String buyerName;

    @Column(name = "buyer_email", length = 255)
    private String buyerEmail;

    @Column(name = "invoice_issued_at")
    private LocalDateTime invoiceIssuedAt;

    @JsonManagedReference("order-items")
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = OrderStatus.PENDING;
        if (this.totalAmount == null) this.totalAmount = BigDecimal.ZERO;
        if (this.discountAmount == null) this.discountAmount = BigDecimal.ZERO;
        if (this.finalAmount == null) this.finalAmount = BigDecimal.ZERO;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum OrderStatus { PENDING, PAID, FAILED, CANCELLED }
}