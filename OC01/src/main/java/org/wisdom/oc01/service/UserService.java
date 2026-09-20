package org.wisdom.oc01.service;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.wisdom.oc01.dto.request.UpdateProfileRequest;
import org.wisdom.oc01.dto.response.UserInfoResponse;

public interface UserService {

    /**
     * Lấy thông tin cá nhân (Profile) của người dùng theo accountId
     * @param accountId ID của tài khoản
     * @return Thông tin chi tiết cá nhân bọc trong UserInfoResponse
     */
    UserInfoResponse getProfile(Integer accountId);

    /**
     * Cập nhật thông tin cá nhân (Profile) của người dùng
     * @param accountId ID của tài khoản
     * @param request DTO chứa các thông tin cập nhật (họ tên, SĐT, ngày sinh,...)
     * @return Thông tin chi tiết cá nhân sau khi cập nhật
     */
    UserInfoResponse updateProfile(Integer accountId, UpdateProfileRequest request);

    /**
     * Cập nhật hình đại diện (Avatar) của người dùng
     * @param accountId ID của tài khoản
     * @param file File ảnh tải lên
     * @return Thông tin chi tiết cá nhân sau khi cập nhật avatar
     */
    UserInfoResponse updateAvatar(Integer accountId, MultipartFile file);

    /**
     * Import danh sách học viên từ file Excel (.xlsx / .xls)
     * Tự động tạo Account + User mới nếu Email chưa tồn tại, hoặc Cập nhật User nếu Email đã tồn tại.
     * @param file File Excel gửi lên
     */
    void importStudentsFromExcel(MultipartFile file);

    @Transactional(readOnly = true)
    UserInfoResponse getPublicProfile(Integer accountId);
}