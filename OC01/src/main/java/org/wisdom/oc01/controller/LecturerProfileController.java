// ============================================
// LecturerProfileController.java - Controller
// ============================================
package org.wisdom.oc01.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.LecturerProfileRequest;
import org.wisdom.oc01.dto.response.LecturerProfileResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.service.LecturerProfileService;

/**
 * ============================================================
 * LECTURER PROFILE CONTROLLER - QUẢN LÝ HỒ SƠ GIẢNG VIÊN
 * ============================================================
 *
 * 1. [TEACHER] Tạo hồ sơ giảng viên
 * 2. [TEACHER] Cập nhật hồ sơ giảng viên
 * 3. [TEACHER] Lấy hồ sơ của tôi
 * 4. [PUBLIC] Lấy hồ sơ theo ID
 * 5. [PUBLIC] Lấy danh sách giảng viên đang hoạt động
 * 6. [PUBLIC] Tìm kiếm giảng viên
 * 7. [ADMIN] Vô hiệu hóa giảng viên
 * 8. [ADMIN] Kích hoạt giảng viên
 * ============================================================
 */
@RestController
@RequestMapping("/api/lecturer-profiles")
@RequiredArgsConstructor
public class LecturerProfileController {

    private final LecturerProfileService profileService;

    // ============================================================
    // 1. TẠO HỒ SƠ GIẢNG VIÊN
    // ============================================================
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> createProfile(
            @AuthenticationPrincipal Account account,
            @Valid @RequestBody LecturerProfileRequest request) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        LecturerProfileResponse profile = profileService.createProfile(account.getIdAccount(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(profile, "Tạo hồ sơ giảng viên thành công"));
    }

    // ============================================================
    // 2. CẬP NHẬT HỒ SƠ GIẢNG VIÊN
    // ============================================================
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> updateProfile(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer id,
            @Valid @RequestBody LecturerProfileRequest request) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        LecturerProfileResponse profile = profileService.updateProfile(id, request);
        return ResponseEntity.ok(new RequestResponse(profile, "Cập nhật hồ sơ giảng viên thành công"));
    }

    // ============================================================
    // 3. LẤY HỒ SƠ CỦA TÔI
    // ============================================================
    @GetMapping("/my-profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<RequestResponse> getMyProfile(
            @AuthenticationPrincipal Account account) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        LecturerProfileResponse profile = profileService.getProfileByAccount(account.getIdAccount());
        return ResponseEntity.ok(new RequestResponse(profile, "Lấy hồ sơ thành công"));
    }

    // ============================================================
    // 4. LẤY HỒ SƠ THEO ID (PUBLIC)
    // ============================================================
    @GetMapping("/{id}")
    public ResponseEntity<RequestResponse> getProfileById(@PathVariable Integer id) {
        LecturerProfileResponse profile = profileService.getProfileById(id);
        return ResponseEntity.ok(new RequestResponse(profile, "Lấy hồ sơ thành công"));
    }

    // ============================================================
    // 5. LẤY DANH SÁCH GIẢNG VIÊN ĐANG HOẠT ĐỘNG (PUBLIC)
    // ============================================================
    @GetMapping
    public ResponseEntity<RequestResponse> getActiveLecturers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("experienceYears").descending());
        Page<LecturerProfileResponse> profiles = profileService.getActiveLecturers(pageable);
        return ResponseEntity.ok(new RequestResponse(profiles, "Lấy danh sách giảng viên thành công"));
    }

    // ============================================================
    // 6. TÌM KIẾM GIẢNG VIÊN (PUBLIC)
    // ============================================================
    @GetMapping("/search")
    public ResponseEntity<RequestResponse> searchLecturers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<LecturerProfileResponse> profiles = profileService.searchLecturers(keyword, pageable);
        return ResponseEntity.ok(new RequestResponse(profiles, "Tìm kiếm giảng viên thành công"));
    }

    // ============================================================
    // 7. VÔ HIỆU HÓA GIẢNG VIÊN (ADMIN)
    // ============================================================
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RequestResponse> deactivateLecturer(@PathVariable Integer id) {
        profileService.deactivateLecturer(id);
        return ResponseEntity.ok(new RequestResponse("Vô hiệu hóa giảng viên thành công"));
    }

    // ============================================================
    // 8. KÍCH HOẠT GIẢNG VIÊN (ADMIN)
    // ============================================================
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RequestResponse> activateLecturer(@PathVariable Integer id) {
        profileService.activateLecturer(id);
        return ResponseEntity.ok(new RequestResponse("Kích hoạt giảng viên thành công"));
    }
}