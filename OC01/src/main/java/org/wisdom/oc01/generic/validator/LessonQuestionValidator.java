// ============================================
// LessonQuestionValidator.java - Validator
// ============================================
package org.wisdom.oc01.generic.validator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.LessonQuestion;
import org.wisdom.oc01.exception.ErrorHandler;

import java.math.BigDecimal;

@Component
public class LessonQuestionValidator {

    public void validate(LessonQuestion lessonQuestion) {
        validateResource(lessonQuestion);
        validateQuestion(lessonQuestion);
        validatePoints(lessonQuestion);
        validateOrderIndex(lessonQuestion);
    }

    public void validateForCreate(LessonQuestion lessonQuestion) {
        validate(lessonQuestion);
    }

    public void validateForUpdate(LessonQuestion lessonQuestion) {
        validate(lessonQuestion);
    }

    private void validateResource(LessonQuestion lessonQuestion) {
        if (lessonQuestion.getResource() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "LessonQuestion phải có resource");
        }
    }

    private void validateQuestion(LessonQuestion lessonQuestion) {
        if (lessonQuestion.getQuestion() == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "LessonQuestion phải có question");
        }
    }

    private void validatePoints(LessonQuestion lessonQuestion) {
        if (lessonQuestion.getPoints() != null
                && lessonQuestion.getPoints().compareTo(BigDecimal.ZERO) < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Điểm không được âm");
        }
    }

    private void validateOrderIndex(LessonQuestion lessonQuestion) {
        if (lessonQuestion.getOrderIndex() != null && lessonQuestion.getOrderIndex() < 0) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Thứ tự không được âm");
        }
    }
}