// ============================================
// WishlistController.java - Controller
// ============================================
package org.wisdom.oc01.controller;

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
import org.wisdom.oc01.dto.response.WishlistResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.service.WishlistService;

import java.util.List;

/**
 * ============================================================
 * WISHLIST CONTROLLER - QUẢN LÝ DANH SÁCH YÊU THÍCH
 * ============================================================
 *
 * 1. [STUDENT] Thêm khóa học vào wishlist
 * 2. [STUDENT] Xóa khóa học khỏi wishlist
 * 3. [STUDENT] Lấy wishlist của tôi
 * 4. [STUDENT] Kiểm tra khóa học có trong wishlist
 * 5. [STUDENT] Đếm số khóa học trong wishlist
 * ============================================================
 */
@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // ============================================================
    // 1. THÊM KHÓA HỌC VÀO WISHLIST
    // ============================================================
    @PostMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> addToWishlist(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        WishlistResponse wishlist = wishlistService.addToWishlist(account.getIdAccount(), courseId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(wishlist, "Thêm vào wishlist thành công"));
    }

    // ============================================================
    // 2. XÓA KHÓA HỌC KHỎI WISHLIST
    // ============================================================
    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> removeFromWishlist(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        wishlistService.removeFromWishlist(account.getIdAccount(), courseId);
        return ResponseEntity.ok(new RequestResponse("Xóa khỏi wishlist thành công"));
    }

    // ============================================================
    // 3. LẤY WISHLIST CỦA TÔI
    // ============================================================
    @GetMapping("/my-wishlist")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> getMyWishlist(
            @AuthenticationPrincipal Account account,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("addedAt").descending());
        Page<WishlistResponse> wishlist = wishlistService.getWishlistByAccountPaginated(account.getIdAccount(), pageable);
        return ResponseEntity.ok(new RequestResponse(wishlist, "Lấy wishlist thành công"));
    }

    // ============================================================
    // 4. KIỂM TRA KHÓA HỌC CÓ TRONG WISHLIST
    // ============================================================
    @GetMapping("/check/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> checkWishlist(
            @AuthenticationPrincipal Account account,
            @PathVariable Integer courseId) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        boolean isInWishlist = wishlistService.isInWishlist(account.getIdAccount(), courseId);
        return ResponseEntity.ok(new RequestResponse(isInWishlist, "Kiểm tra wishlist thành công"));
    }

    // ============================================================
    // 5. ĐẾM SỐ KHÓA HỌC TRONG WISHLIST
    // ============================================================
    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<RequestResponse> countWishlist(
            @AuthenticationPrincipal Account account) {

        if (account == null) {
            throw new ErrorHandler(HttpStatus.UNAUTHORIZED, "Không xác định được tài khoản");
        }

        Long count = wishlistService.countWishlist(account.getIdAccount());
        return ResponseEntity.ok(new RequestResponse(count, "Đếm wishlist thành công"));
    }
}