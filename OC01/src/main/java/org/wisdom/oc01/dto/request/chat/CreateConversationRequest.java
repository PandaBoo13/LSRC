// src/main/java/org/wisdom/oc01/dto/request/chat/CreateConversationRequest.java
package org.wisdom.oc01.dto.request.chat;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateConversationRequest {

    private String conversationType; // PRIVATE, GROUP, COURSE

    private String name; // Tên nhóm (nếu GROUP)

    private Integer courseId; // Course ID (nếu COURSE)

    @NotNull(message = "accountId không được để trống")
    private Integer accountId; // Người tạo

    private List<Integer> participantIds; // Danh sách thành viên (nếu GROUP)
}