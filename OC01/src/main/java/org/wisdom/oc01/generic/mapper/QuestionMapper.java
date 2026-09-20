// src/main/java/org/wisdom/oc01/generic/mapper/QuestionMapper.java
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.question.QuestionLearnerResponse;
import org.wisdom.oc01.dto.response.question.QuestionResponse;
import org.wisdom.oc01.entity.Question;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class QuestionMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== FULL VIEW (ADMIN / INSTRUCTOR) ====================

    /**
     * Full response — CHỨA correctAnswer + explanation.
     * CHỈ dùng cho:
     *  - Admin quản lý question bank
     *  - Instructor sửa/soạn câu hỏi
     *  - Endpoint review sau khi student submit (đúng owner)
     *
     * KHÔNG được dùng cho endpoint public/learner.
     */
    public QuestionResponse toResponse(Question question) {
        return QuestionResponse.builder()
                .id(question.getIdQuestion())
                .courseId(question.getCourse() != null ? question.getCourse().getIdCourse() : null)
                .courseTitle(question.getCourse() != null ? question.getCourse().getTitle() : null)
                .lessonId(question.getLesson() != null ? question.getLesson().getIdResource() : null)
                .lessonTitle(question.getLesson() != null ? question.getLesson().getTitle() : null)
                .content(question.getContent())
                .questionType(question.getQuestionType() != null
                        ? question.getQuestionType().name() : null)
                .options(question.getOptions())
                .correctAnswer(question.getCorrectAnswer())   // ← có đáp án
                .explanation(question.getExplanation())       // ← có giải thích
                .status(question.getStatus() != null ? question.getStatus().name() : null)
                .orderIndex(question.getOrderIndex())
                .points(question.getPoints())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

    // ==================== LEARNER VIEW (PUBLIC / STUDENT) ====================

    /**
     * Learner response — KHÔNG chứa correctAnswer + explanation.
     * Dùng cho mọi endpoint mà learner/public có thể truy cập:
     *  - Xem câu hỏi khi làm quiz
     *  - Xem preview đề thi
     *  - Xem danh sách câu hỏi public
     */
    public QuestionLearnerResponse toLearnerResponse(Question question) {
        return QuestionLearnerResponse.builder()
                .id(question.getIdQuestion())
                .courseId(question.getCourse() != null ? question.getCourse().getIdCourse() : null)
                .courseTitle(question.getCourse() != null ? question.getCourse().getTitle() : null)
                .lessonId(question.getLesson() != null ? question.getLesson().getIdResource() : null)
                .lessonTitle(question.getLesson() != null ? question.getLesson().getTitle() : null)
                .content(question.getContent())
                .questionType(question.getQuestionType() != null
                        ? question.getQuestionType().name() : null)
                .options(question.getOptions())
                // KHÔNG map correctAnswer
                // KHÔNG map explanation
                .status(question.getStatus() != null ? question.getStatus().name() : null)
                .orderIndex(question.getOrderIndex())
                .points(question.getPoints())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

    // ==================== JSON (AUDIT LOG — DÙNG NỘI BỘ) ====================

    /**
     * toJson — CHỈ dùng cho audit log nội bộ, không trả ra ngoài API.
     * Có thể chứa đáp án vì log chỉ admin đọc.
     */
    public String toJson(Question question) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", question.getIdQuestion());
            data.put("courseId", question.getCourse() != null
                    ? question.getCourse().getIdCourse() : null);
            data.put("lessonId", question.getLesson() != null
                    ? question.getLesson().getIdResource() : null);
            data.put("lessonTitle", question.getLesson() != null
                    ? question.getLesson().getTitle() : null);
            data.put("content", question.getContent());
            data.put("questionType", question.getQuestionType() != null
                    ? question.getQuestionType().name() : null);
            data.put("options", question.getOptions());
            data.put("correctAnswer", question.getCorrectAnswer());
            data.put("explanation", question.getExplanation());
            data.put("status", question.getStatus() != null
                    ? question.getStatus().name() : null);
            data.put("orderIndex", question.getOrderIndex());
            data.put("points", question.getPoints());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }
}