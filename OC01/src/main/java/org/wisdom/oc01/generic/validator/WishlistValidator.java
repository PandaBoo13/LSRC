// ============================================
// WishlistValidator.java - Validator
// ============================================
package org.wisdom.oc01.generic.validator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.Wishlist;
import org.wisdom.oc01.exception.ErrorHandler;

@Component
public class WishlistValidator {

    public void validate(Wishlist wishlist) {
        validateAccount(wishlist);
        validateCourse(wishlist);
    }

    public void validateForAdd(Wishlist wishlist, boolean alreadyExists) {
        validate(wishlist);
        if (alreadyExists) {
            throw new ErrorHandler(HttpStatus.CONFLICT, "Khóa học đã có trong danh sách yêu thích");
        }
    }

    private void validateAccount(Wishlist wishlist) {
        if (wishlist.getAccount() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Wishlist phải có account");
        }
    }

    private void validateCourse(Wishlist wishlist) {
        if (wishlist.getCourse() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Wishlist phải có khóa học");
        }
    }
}