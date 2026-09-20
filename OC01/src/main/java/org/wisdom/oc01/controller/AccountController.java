package org.wisdom.oc01.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.UpdateProfileRequest;
import org.wisdom.oc01.dto.response.UserInfoResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.service.AccountService;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // ==================== ADMIN ====================

    @GetMapping
    public ResponseEntity<RequestResponse> getAllUsers() {
        List<UserInfoResponse> users = accountService.getAllUsers();
        return ResponseEntity.ok(new RequestResponse(users, "Lấy danh sách người dùng thành công"));
    }

    @GetMapping("/teachers")
    public ResponseEntity<RequestResponse> getAllTeachers() {
        List<UserInfoResponse> teachers = accountService.getAllTeachers();
        return ResponseEntity.ok(new RequestResponse(teachers, "Lấy danh sách giáo viên thành công"));
    }



}