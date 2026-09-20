package org.wisdom.oc01.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.UpdateProfileRequest;
import org.wisdom.oc01.dto.response.UserInfoResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<RequestResponse> getProfile(@AuthenticationPrincipal Account account) {
        UserInfoResponse profile = userService.getProfile(account.getIdAccount());
        return ResponseEntity.ok(new RequestResponse(profile, "Lấy thông tin profile thành công"));
    }

    @PutMapping("/profile")
    public ResponseEntity<RequestResponse> updateProfile(
            @AuthenticationPrincipal Account account,
            @RequestBody UpdateProfileRequest request) {
        UserInfoResponse profile = userService.updateProfile(account.getIdAccount(), request);
        return ResponseEntity.ok(new RequestResponse(profile, "Cập nhật profile thành công"));
    }

    @PostMapping("/avatar")
    public ResponseEntity<RequestResponse> updateAvatar(
            @AuthenticationPrincipal Account account,
            @RequestParam("file") MultipartFile file) {
        UserInfoResponse profile = userService.updateAvatar(account.getIdAccount(), file);
        return ResponseEntity.ok(new RequestResponse(profile, "Cập nhật avatar thành công"));
    }
    @PostMapping("/import-students")
    public ResponseEntity<RequestResponse> importStudents(
            @RequestParam("file") MultipartFile file) {
        userService.importStudentsFromExcel(file);
        return ResponseEntity.ok(new RequestResponse(null, "Import students thành công"));
    }
    // ==================== ✅ PROFILE PUBLIC CỦA USER KHÁC ====================

    /**
     * Lấy profile PUBLIC của user khác theo accountId
     * GET /api/users/{accountId}/profile
     * Chỉ trả field an toàn — ẩn email/SĐT/địa chỉ/ngày sinh.
     */
    @GetMapping("/{accountId}/profile")
    public ResponseEntity<RequestResponse> getProfileById(@PathVariable Integer accountId) {
        UserInfoResponse profile = userService.getPublicProfile(accountId);
        return ResponseEntity.ok(new RequestResponse(profile, "Lấy thông tin profile thành công"));
    }



}