package org.wisdom.oc01.dto.request;

import lombok.Data;
import org.springframework.data.domain.Sort;

@Data
public class CourseSearchRequest {

    private String keyword;        // Tìm theo title hoặc description
    private String status;         // DRAFT, PUBLISHED, ARCHIVED
    private String categoryId;     // Lọc theo danh mục
    private String level;          // BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS
    private Boolean isFree;        // true: miễn phí, false: có phí, null: tất cả

    // Phân trang
    private int page = 0;
    private int size = 10;

    // Sắp xếp
    private String sortBy = "createdAt";           // createdAt, title, price
    private Sort.Direction sortDirection = Sort.Direction.DESC;  // ASC, DESC
}