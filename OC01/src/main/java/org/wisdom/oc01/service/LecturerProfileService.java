// ============================================
// LecturerProfileService.java - Service Interface
// ============================================
package org.wisdom.oc01.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.wisdom.oc01.dto.request.LecturerProfileRequest;
import org.wisdom.oc01.dto.response.LecturerProfileResponse;

public interface LecturerProfileService {

    // Tạo hồ sơ giảng viên
    LecturerProfileResponse createProfile(Integer accountId, LecturerProfileRequest request);

    // Cập nhật hồ sơ giảng viên
    LecturerProfileResponse updateProfile(Integer profileId, LecturerProfileRequest request);

    // Lấy hồ sơ theo account
    LecturerProfileResponse getProfileByAccount(Integer accountId);

    // Lấy hồ sơ theo ID
    LecturerProfileResponse getProfileById(Integer profileId);

    // Lấy tất cả giảng viên đang hoạt động
    Page<LecturerProfileResponse> getActiveLecturers(Pageable pageable);

    // Tìm kiếm giảng viên
    Page<LecturerProfileResponse> searchLecturers(String keyword, Pageable pageable);

    // Vô hiệu hóa giảng viên
    void deactivateLecturer(Integer profileId);

    // Kích hoạt giảng viên
    void activateLecturer(Integer profileId);
}