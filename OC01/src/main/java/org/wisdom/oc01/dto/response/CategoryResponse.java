package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryResponse {
    private String id;
    private String name;
    private String slug;
    private String description;
    private Integer level;
    private String parentId;
    private String parentName;
    private Boolean isActive;
    private List<CategoryResponse> children;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}