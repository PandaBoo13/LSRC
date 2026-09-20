package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    @NotNull(message = "accountId không được để trống")
    private Integer accountId;

    @NotEmpty(message = "Vui lòng chọn ít nhất một khóa học")
    private List<Integer> courseIds;
}