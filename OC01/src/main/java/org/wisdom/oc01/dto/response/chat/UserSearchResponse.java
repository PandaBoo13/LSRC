// src/main/java/org/wisdom/oc01/dto/response/chat/UserSearchResponse.java
package org.wisdom.oc01.dto.response.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response cho API search user dùng trong chat.
 * Trả về thông tin cơ bản + trạng thái đã có private conversation chưa.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserSearchResponse {

    /** ID account (dùng để tạo conversation) */
    private Integer accountId;

    /** Username đăng nhập (unique) */
    private String username;

    /** Tên đầy đủ (firstName + lastName) hoặc fallback về username */
    private String fullName;

    /** Email — có thể null */
    private String email;

    /** Số điện thoại — có thể null (lấy từ User entity) */
    private String phone;

    /** URL avatar — có thể null */
    private String avatarUrl;

    /**
     * Đã có private conversation giữa current user và user này chưa?
     * - true: đã từng chat riêng
     * - false: chưa chat
     */
    private Boolean hasPrivateConversation;

    /**
     * ID conversation nếu đã có.
     * Null nếu chưa từng chat riêng.
     * FE có thể dùng để nhảy thẳng vào conv cũ thay vì tạo mới.
     */
    private Integer existingConversationId;
}