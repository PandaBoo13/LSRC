// ============================================
// SaveAnswersRequest.java - Request DTO
// ============================================
package org.wisdom.oc01.dto.request;

import lombok.Data;

@Data
public class SaveAnswersRequest {
    private String answersJson; // JSON string chứa danh sách câu trả lời
}