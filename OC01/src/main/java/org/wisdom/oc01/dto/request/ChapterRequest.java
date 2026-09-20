// ============================================
// ChapterRequest.java - Request DTO
// ============================================
package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChapterRequest {

    @NotBlank(message = "Tiêu đề chương không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    @Min(value = 0, message = "Thứ tự không được âm")
    private Integer orderIndex;
}