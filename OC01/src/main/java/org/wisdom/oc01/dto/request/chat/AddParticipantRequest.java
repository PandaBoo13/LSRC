// src/main/java/org/wisdom/oc01/dto/request/chat/AddParticipantRequest.java
package org.wisdom.oc01.dto.request.chat;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AddParticipantRequest {

    @NotNull(message = "conversationId không được để trống")
    private Integer conversationId;

    @NotNull(message = "accountIds không được để trống")
    private List<Integer> accountIds;
}