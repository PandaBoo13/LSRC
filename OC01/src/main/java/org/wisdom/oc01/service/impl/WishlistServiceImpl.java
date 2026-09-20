// ============================================
// WishlistServiceImpl.java - Service Implementation
// ============================================
package org.wisdom.oc01.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.dto.response.WishlistResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.entity.Wishlist;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.WishlistMapper;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.CourseRepository;
import org.wisdom.oc01.repository.WishlistRepository;
import org.wisdom.oc01.service.WishlistService;
import org.wisdom.oc01.generic.validator.WishlistValidator;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor public class WishlistServiceImpl implements WishlistService {
    private final WishlistRepository wishlistRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final WishlistValidator validator;
    private final WishlistMapper mapper;

    // ==================== ADD ====================

    /** Thêm khóa học vào wishlist, validate trùng lặp */
    @Override @Transactional
    public WishlistResponse addToWishlist(Integer accountId, Integer courseId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại"));
        Wishlist wishlist = Wishlist.builder().account(account).course(course).build();
        validator.validateForAdd(wishlist, wishlistRepository.existsByAccountIdAccountAndCourseIdCourse(accountId, courseId));
        wishlist = wishlistRepository.save(wishlist);
        return mapper.toResponse(wishlist);
    }

    // ==================== REMOVE ====================

    /** Xóa khóa học khỏi wishlist */
    @Override @Transactional
    public void removeFromWishlist(Integer accountId, Integer courseId) {
        Wishlist wishlist = wishlistRepository.findByAccountIdAccountAndCourseIdCourse(accountId, courseId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không có trong wishlist"));
        wishlistRepository.delete(wishlist);
    }

    // ==================== GET ====================

    /** Lấy toàn bộ wishlist của account, sắp xếp mới nhất trước */
    @Override
    public List<WishlistResponse> getWishlistByAccount(Integer accountId) {
        return wishlistRepository.findByAccountIdAccountOrderByAddedAtDesc(accountId).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    /** Lấy wishlist của account có phân trang */
    @Override
    public Page<WishlistResponse> getWishlistByAccountPaginated(Integer accountId, Pageable pageable) {
        return wishlistRepository.findByAccountIdAccount(accountId, pageable).map(mapper::toResponse);
    }

    // ==================== CHECK ====================

    /** Kiểm tra khóa học có trong wishlist không */
    @Override
    public boolean isInWishlist(Integer accountId, Integer courseId) {
        return wishlistRepository.existsByAccountIdAccountAndCourseIdCourse(accountId, courseId);
    }

    // ==================== COUNT ====================

    /** Đếm số khóa học trong wishlist */
    @Override
    public Long countWishlist(Integer accountId) {
        return wishlistRepository.countByAccountIdAccount(accountId);
    }
}