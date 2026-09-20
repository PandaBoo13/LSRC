package org.wisdom.oc01.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.wisdom.oc01.entity.VnPayConfig;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnPayService {

    private final VnPayConfig vnPayConfig;

    private static final String RESPONSE_CODE_SUCCESS = "00";
    private static final String TRANSACTION_STATUS_SUCCESS = "00";
    private static final String VND_CURRENCY = "VND";

    // ==================== CREATE PAYMENT URL ====================

    public String createPaymentUrl(String orderId, String amount, String orderInfo, String ipAddress) {
        String vnpVersion = "2.1.0";
        String vnpCommand = "pay";
        String vnpTxnRef = orderId + "_" + System.currentTimeMillis();

        BigDecimal amountBD = new BigDecimal(amount);
        long amountVND = amountBD.multiply(new BigDecimal("100")).longValue();
        String vnpAmount = String.valueOf(amountVND);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", vnpVersion);
        params.put("vnp_Command", vnpCommand);
        params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        params.put("vnp_Amount", vnpAmount);
        params.put("vnp_CurrCode", VND_CURRENCY);
        params.put("vnp_TxnRef", vnpTxnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "education");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        params.put("vnp_IpAddr", (ipAddress == null || ipAddress.isEmpty()) ? "127.0.0.1" : ipAddress);
        params.put("vnp_CreateDate", vnp_CreateDate);
        params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String field : fieldNames) {
            String value = params.get(field);
            if (value != null && !value.isEmpty()) {
                hashData.append(field).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8)).append("&");
                query.append(field).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8)).append("&");
            }
        }

        String hashDataStr = hashData.substring(0, hashData.length() - 1);
        String queryStr = query.substring(0, query.length() - 1);
        String secureHash = hmacSHA512(vnPayConfig.getHashSecret(), hashDataStr);
        String paymentUrl = vnPayConfig.getApiUrl() + "?" + queryStr + "&vnp_SecureHash=" + secureHash;

        log.info("[VNPAY] Created payment URL for order {}: amount={} VND", orderId, amountVND);
        return paymentUrl;
    }

    // ==================== VERIFY CALLBACK (FULL) ====================

    /**
     * Verify callback đầy đủ: signature + TmnCode + currency + transaction status.
     *
     * KHÔNG mutate params truyền vào. Dùng defensive copy.
     *
     * @param rawParams params từ VNPay gửi về
     * @return VnPayCallbackResult nếu hợp lệ
     * @throws VnPayVerificationException nếu bất kỳ verify nào fail
     */
    public VnPayCallbackResult verifyCallbackFull(Map<String, String> rawParams) {
        if (rawParams == null || rawParams.isEmpty()) {
            throw new VnPayVerificationException("Empty callback params");
        }

        // 1. Copy ra map mới để không mutate input
        Map<String, String> params = new HashMap<>(rawParams);

        // 2. Extract signature
        String receivedHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        if (receivedHash == null || receivedHash.isEmpty()) {
            throw new VnPayVerificationException("Missing vnp_SecureHash");
        }

        // 3. Tính hash và compare
        String computedHash = buildHash(params);
        if (!computedHash.equalsIgnoreCase(receivedHash)) {
            throw new VnPayVerificationException("Invalid signature");
        }

        // 4. Verify merchant
        String tmnCode = params.get("vnp_TmnCode");
        if (!vnPayConfig.getTmnCode().equals(tmnCode)) {
            throw new VnPayVerificationException("Invalid merchant: " + tmnCode);
        }

        // 5. Verify currency
        String currency = params.get("vnp_CurrCode");
        if (!VND_CURRENCY.equals(currency)) {
            throw new VnPayVerificationException("Invalid currency: " + currency);
        }

        // 6. Verify transaction status — BẮT BUỘC cả 2 đều "00"
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        boolean success = RESPONSE_CODE_SUCCESS.equals(responseCode)
                && TRANSACTION_STATUS_SUCCESS.equals(transactionStatus);

        // 7. Parse amount (VNPay * 100)
        String rawAmount = params.get("vnp_Amount");
        if (rawAmount == null || rawAmount.isEmpty()) {
            throw new VnPayVerificationException("Missing amount");
        }
        BigDecimal amountVnd;
        try {
            amountVnd = new BigDecimal(rawAmount)
                    .divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            throw new VnPayVerificationException("Invalid amount format: " + rawAmount);
        }

        String txnRef = params.get("vnp_TxnRef");
        String transactionNo = params.get("vnp_TransactionNo");

        return VnPayCallbackResult.builder()
                .success(success)
                .amountVnd(amountVnd)
                .txnRef(txnRef)
                .transactionNo(transactionNo)
                .responseCode(responseCode)
                .transactionStatus(transactionStatus)
                .currency(currency)
                .tmnCode(tmnCode)
                .rawParams(params)
                .build();
    }

    /** Verify đơn giản (chỉ signature) — dùng cho return URL. */
    public boolean verifyCallbackSignature(Map<String, String> rawParams) {
        try {
            Map<String, String> params = new HashMap<>(rawParams);
            String receivedHash = params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");
            if (receivedHash == null) return false;
            return buildHash(params).equalsIgnoreCase(receivedHash);
        } catch (Exception e) {
            log.warn("[VNPAY] Verify signature failed: {}", e.getMessage());
            return false;
        }
    }

    // ==================== PRIVATE HELPERS ====================

    private String buildHash(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String field : fieldNames) {
            String value = params.get(field);
            if (value != null && !value.isEmpty()) {
                hashData.append(field).append("=")
                        .append(URLEncoder.encode(value, StandardCharsets.UTF_8))
                        .append("&");
            }
        }
        if (hashData.length() == 0) return "";
        String hashDataStr = hashData.substring(0, hashData.length() - 1);
        return hmacSHA512(vnPayConfig.getHashSecret(), hashDataStr);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC SHA512 failed", e);
        }
    }

    // ==================== INNER CLASSES ====================

    public static class VnPayVerificationException extends RuntimeException {
        public VnPayVerificationException(String message) {
            super(message);
        }
    }

    @lombok.Builder
    @lombok.Data
    public static class VnPayCallbackResult {
        private boolean success;
        private BigDecimal amountVnd;
        private String txnRef;
        private String transactionNo;
        private String responseCode;
        private String transactionStatus;
        private String currency;
        private String tmnCode;
        private Map<String, String> rawParams;
    }
}