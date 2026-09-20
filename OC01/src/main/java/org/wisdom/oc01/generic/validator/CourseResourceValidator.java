// ============================================
// CourseResourceValidator.java - Validator (Đã sửa)
// ============================================
package org.wisdom.oc01.generic.validator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.CourseResource;
import org.wisdom.oc01.exception.ErrorHandler;

import java.math.BigDecimal;

@Component
public class CourseResourceValidator {

    // ==================== VALIDATE TỔNG QUÁT ====================

    public void validate(CourseResource resource) {
        validateCourse(resource);
        validateResourceType(resource);
        validateTitle(resource);
        validateStatus(resource);

        // Validate theo từng type
        switch (resource.getResourceType()) {
            case VIDEO:
                validateVideo(resource);
                break;
            case QUIZ:
                validateQuiz(resource);
                break;
            case PDF:
            case SLIDE:
            case AUDIO:
            case DOCUMENT:
            case IMAGE:
            case SCORM:
                validateFile(resource);
                break;
            case LINK:
                validateLink(resource);
                break;
            default:
                break;
        }
    }

    public void validateForCreate(CourseResource resource) {
        // ✅ Nếu status null, set mặc định DRAFT
        if (resource.getStatus() == null) {
            resource.setStatus(CourseResource.Status.DRAFT);
        }

        // ✅ Cho phép DRAFT hoặc READY khi tạo mới
        validate(resource);
    }

    public void validateForUpdate(CourseResource resource) {
        validate(resource);
    }

    public void validateForPublish(CourseResource resource) {
        if (resource.getStatus() == CourseResource.Status.PUBLISHED) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Resource đã xuất bản rồi");
        }
    }

    // ==================== VALIDATE CHUNG ====================

    private void validateCourse(CourseResource resource) {
        if (resource.getCourse() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Resource phải có khóa học");
        }
    }

    private void validateResourceType(CourseResource resource) {
        if (resource.getResourceType() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Loại resource không được để trống");
        }
    }

    private void validateTitle(CourseResource resource) {
        if (resource.getTitle() == null || resource.getTitle().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiêu đề không được để trống");
        }
        if (resource.getTitle().length() > 255) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Tiêu đề không được vượt quá 255 ký tự");
        }
    }

    private void validateStatus(CourseResource resource) {
        if (resource.getStatus() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Trạng thái không được để trống");
        }
    }

    // ==================== VALIDATE VIDEO ====================

    private void validateVideo(CourseResource resource) {
        if (resource.getFileUrl() == null || resource.getFileUrl().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Video phải có fileUrl");
        }
        // ✅ Bỏ validate duration vì có thể chưa set khi upload
        // if (resource.getDuration() == null || resource.getDuration() <= 0) {
        //     throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Video phải có duration > 0");
        // }
    }

    // ==================== VALIDATE QUIZ ====================

    private void validateQuiz(CourseResource resource) {
        if (resource.getTotalQuestions() == null || resource.getTotalQuestions() <= 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Quiz phải có tổng số câu hỏi > 0");
        }
        if (resource.getPassingScore() == null
                || resource.getPassingScore().compareTo(BigDecimal.ZERO) < 0
                || resource.getPassingScore().compareTo(new BigDecimal("100")) > 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Điểm đạt phải từ 0 đến 100");
        }
        if (resource.getTimeLimit() != null && resource.getTimeLimit() <= 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Thời gian làm bài phải > 0");
        }
    }

    // ==================== VALIDATE FILE ====================

    private void validateFile(CourseResource resource) {
        // ✅ Bỏ validate fileUrl vì có thể upload sau
        // if (resource.getFileUrl() == null || resource.getFileUrl().trim().isEmpty()) {
        //     throw new ErrorHandler(HttpStatus.BAD_REQUEST, "File phải có fileUrl");
        // }
    }

    // ==================== VALIDATE LINK ====================

    private void validateLink(CourseResource resource) {
        if (resource.getFileUrl() == null || resource.getFileUrl().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Link phải có URL");
        }
        if (!resource.getFileUrl().startsWith("http://") && !resource.getFileUrl().startsWith("https://")) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Link phải bắt đầu bằng http:// hoặc https://");
        }
    }
}