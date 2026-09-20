package org.wisdom.oc01.dto.request;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(min = 2, max = 45, message = "Tên phải từ 2-45 ký tự")
    private String firstName;

    @Size(min = 2, max = 45, message = "Họ phải từ 2-45 ký tự")
    private String lastName;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 500, message = "Bio không được vượt quá 500 ký tự")
    private String bio;

    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate dateOfBirth;

    @Pattern(regexp = "^(male|female|other)$", message = "Giới tính không hợp lệ")
    private String gender;

    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String address;
}