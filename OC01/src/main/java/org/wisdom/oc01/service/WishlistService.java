// ============================================
// WishlistService.java - Service Interface
// ============================================
package org.wisdom.oc01.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.wisdom.oc01.dto.response.WishlistResponse;

import java.util.List;

public interface WishlistService {

    // Thêm khóa học vào wishlist
    WishlistResponse addToWishlist(Integer accountId, Integer courseId);

    // Xóa khóa học khỏi wishlist
    void removeFromWishlist(Integer accountId, Integer courseId);

    // Lấy wishlist của account
    List<WishlistResponse> getWishlistByAccount(Integer accountId);

    // Lấy wishlist của account (phân trang)
    Page<WishlistResponse> getWishlistByAccountPaginated(Integer accountId, Pageable pageable);

    // Kiểm tra khóa học có trong wishlist không
    boolean isInWishlist(Integer accountId, Integer courseId);

    // Đếm số khóa học trong wishlist
    Long countWishlist(Integer accountId);
}