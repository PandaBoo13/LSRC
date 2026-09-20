// ============================================
// QuestionValidator.java - Validator (Thêm validate lesson)
// ============================================
package org.wisdom.oc01.generic.validator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.Question;
import org.wisdom.oc01.exception.ErrorHandler;

import java.math.BigDecimal;

@Component
public class QuestionValidator {

    public void validate(Question question) {
        validateCourse(question);
        // ✅ THÊM: Validate lesson nếu có
        validateLesson(question);
        validateContent(question);
        validateType(question);
        validateOptions(question);
        validateCorrectAnswer(question);
        validatePoints(question);
        validateStatus(question);
    }

    public void validateForCreate(Question question) {
        validate(question);
    }

    public void validateForUpdate(Question question) {
        validate(question);
    }

    private void validateCourse(Question question) {
        if (question.getCourse() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Câu hỏi phải thuộc một khóa học");
        }
    }

    // ✅ THÊM: Validate lesson
    private void validateLesson(Question question) {
        if (question.getLesson() != null && question.getCourse() != null) {
            // Kiểm tra lesson phải thuộc cùng course với question
            if (question.getLesson().getCourse() != null
                    && !question.getLesson().getCourse().getIdCourse().equals(question.getCourse().getIdCourse())) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                        "Bài học phải thuộc cùng khóa học với câu hỏi");
            }
        }
    }

    private void validateContent(Question question) {
        if (question.getContent() == null || question.getContent().trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Nội dung câu hỏi không được để trống");
        }
        if (question.getContent().length() > 10000) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Nội dung câu hỏi không được vượt quá 10000 ký tự");
        }
    }

    private void validateType(Question question) {
        if (question.getQuestionType() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Loại câu hỏi không được để trống");
        }
    }

    private void validateOptions(Question question) {
        if (question.getQuestionType() == Question.QuestionType.SINGLE_CHOICE
                || question.getQuestionType() == Question.QuestionType.MULTIPLE_CHOICE) {
            if (question.getOptions() == null || question.getOptions().trim().isEmpty()) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Câu hỏi trắc nghiệm phải có đáp án");
            }
        }
    }

    private void validateCorrectAnswer(Question question) {
        if (question.getQuestionType() != Question.QuestionType.SHORT_ANSWER) {
            if (question.getCorrectAnswer() == null || question.getCorrectAnswer().trim().isEmpty()) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Phải có đáp án đúng");
            }
        }
    }

    private void validatePoints(Question question) {
        if (question.getPoints() != null && question.getPoints().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Điểm phải là số dương");
        }
    }

    private void validateStatus(Question question) {
        if (question.getStatus() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Trạng thái không được để trống");
        }
    }
}