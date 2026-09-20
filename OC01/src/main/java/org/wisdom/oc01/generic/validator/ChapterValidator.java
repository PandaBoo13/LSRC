// ============================================
// ChapterValidator.java - Validator
// ============================================
package org.wisdom.oc01.generic.validator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.Chapter;
import org.wisdom.oc01.exception.ErrorHandler;

@Component
public class ChapterValidator {

    public void validate(Chapter chapter) {
        validateTitle(chapter);
        validateDescription(chapter);
        validateOrderIndex(chapter);
        validateCourse(chapter);
    }

    public void validateForCreate(Chapter chapter) {
        validate(chapter);
    }

    public void validateForUpdate(Chapter chapter) {
        validate(chapter);
    }

    public void validateForDelete(Chapter chapter) {
        // ✅ Đổi getLessons() → getResources()
        if (chapter.getResources() != null && !chapter.getResources().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Không thể xóa chương có chứa tài nguyên. Hãy xóa tài nguyên trước");
        }
    }

    private void validateTitle(Chapter chapter) {
        if (chapter.getTitle() == null || chapter.getTitle().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiêu đề chương không được để trống");
        }
        if (chapter.getTitle().length() > 255) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiêu đề chương không được vượt quá 255 ký tự");
        }
    }

    private void validateDescription(Chapter chapter) {
        if (chapter.getDescription() != null && chapter.getDescription().length() > 5000) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Mô tả không được vượt quá 5000 ký tự");
        }
    }

    private void validateOrderIndex(Chapter chapter) {
        if (chapter.getOrderIndex() != null && chapter.getOrderIndex() < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Thứ tự không được âm");
        }
    }

    private void validateCourse(Chapter chapter) {
        if (chapter.getCourse() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Chương phải thuộc một khóa học");
        }
    }
}