package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
public class CourseRequest {

    @NotBlank(message = "Tiêu đề khóa học không được để trống")
    @Size(min = 5, max = 255, message = "Tiêu đề phải từ 5 đến 255 ký tự")
    private String title;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    @Size(max = 500, message = "URL ảnh không được vượt quá 500 ký tự")
    private String thumbnailUrl;

    private MultipartFile thumbnail;

    // ==================== ✅ THÊM BACKGROUND ====================

    @Size(max = 500, message = "Background không được vượt quá 500 ký tự")
    private String backgroundThumbnail; // Gradient CSS, pattern URL, hoặc image URL

    private String backgroundType; // GRADIENT, PATTERN, IMAGE, SOLID

    private String level;

    @Size(max = 50, message = "Thời lượng không được vượt quá 50 ký tự")
    private String duration;

    @DecimalMin(value = "0.0", message = "Giá không được âm")
    private BigDecimal price;

    @DecimalMin(value = "0.0", message = "Giá gốc không được âm")
    private BigDecimal oldPrice;

    private Boolean isFree = false;

    private Boolean hasCertificate = false;

    private String courseType;

    @Size(max = 50, message = "Thời gian truy cập không được vượt quá 50 ký tự")
    private String accessPeriod;

    private String outcomes;

    private String categoryId;

    private Integer accountId;

    private Integer prerequisiteCourseId;

    @Size(max = 10, message = "Mã ngôn ngữ không được vượt quá 10 ký tự")
    private String language;

    private String progressType;
}