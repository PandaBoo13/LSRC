// ============================================================
// NotificationRequest.java - BỎ notificationType
// ============================================================
package org.wisdom.oc01.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    // ❌ BỎ: private String notificationType;

    private Integer senderAccountId;        // Người gửi (null = system)

    // ==================== RECEIVERS ====================
    private Integer receiverAccountId;      // Gửi cho 1 user cụ thể
    private List<Integer> receiverAccountIds; // Gửi cho nhiều user cụ thể
    private String receiverRole;            // ALL_STUDENTS, ALL_TEACHERS, ALL_USERS
    private Integer courseId;               // Gửi cho học viên/giảng viên của khóa học

    // ==================== CONTENT ====================
    private String title;                   // Tiêu đề thông báo
    private String content;                 // Nội dung thông báo

    // ==================== REFERENCE ====================
    private String referenceType;           // course, order, chat, assignment...
    private Integer referenceId;            // ID đối tượng liên quan

    // ==================== EXTRA DATA ====================
    private Map<String, Object> extraData;  // Dữ liệu mở rộng tùy loại
}