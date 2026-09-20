// ============================================
// AddToCartRequest.java
// ============================================
package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {
    @NotNull(message = "Course ID không được để trống")
    private Integer courseId;
}