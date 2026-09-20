package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private String description;

    private String parentId;
}