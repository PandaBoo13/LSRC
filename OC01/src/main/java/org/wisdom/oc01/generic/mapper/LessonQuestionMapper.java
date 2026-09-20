// ============================================
// LessonQuestionMapper.java - Mapper
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import org.wisdom.oc01.dto.request.question.LessonQuestionRequest;
import org.wisdom.oc01.dto.response.question.LessonQuestionResponse;
import org.wisdom.oc01.entity.CourseResource;
import org.wisdom.oc01.entity.LessonQuestion;
import org.wisdom.oc01.entity.Question;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.repository.CourseResourceRepository;
import org.wisdom.oc01.repository.quiz_assessment.QuestionRepository;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class LessonQuestionMapper {

    private final CourseResourceRepository courseResourceRepository;
    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== REQUEST → ENTITY (CREATE) ====================

    public LessonQuestion toEntity(LessonQuestionRequest request) {
        CourseResource resource = courseResourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Resource không tồn tại"));
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Câu hỏi không tồn tại"));

        LessonQuestion lessonQuestion = new LessonQuestion();
        lessonQuestion.setResource(resource);
        lessonQuestion.setQuestion(question);
        lessonQuestion.setOrderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0);
        lessonQuestion.setPoints(request.getPoints() != null ? request.getPoints() : java.math.BigDecimal.ONE);

        return lessonQuestion;
    }

    // ==================== REQUEST → ENTITY (UPDATE) ====================

    public void updateEntity(LessonQuestion lessonQuestion, LessonQuestionRequest request) {
        if (request.getOrderIndex() != null) {
            lessonQuestion.setOrderIndex(request.getOrderIndex());
        }
        if (request.getPoints() != null) {
            lessonQuestion.setPoints(request.getPoints());
        }
    }

    // ==================== ENTITY → RESPONSE ====================

    public LessonQuestionResponse toResponse(LessonQuestion lessonQuestion) {
        Question question = lessonQuestion.getQuestion();
        CourseResource resource = lessonQuestion.getResource();

        return LessonQuestionResponse.builder()
                .id(lessonQuestion.getId())
                .resourceId(resource.getIdResource())
                .resourceTitle(resource.getTitle())
                .questionId(question.getIdQuestion())
                .questionContent(question.getContent())
                .orderIndex(lessonQuestion.getOrderIndex())
                .points(lessonQuestion.getPoints())
                .createdAt(lessonQuestion.getCreatedAt())
                .build();
    }

    // ==================== ENTITY → JSON ====================

    public String toJson(LessonQuestion lessonQuestion) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", lessonQuestion.getId());
            data.put("resourceId", lessonQuestion.getResource() != null ? lessonQuestion.getResource().getIdResource() : null);
            data.put("questionId", lessonQuestion.getQuestion() != null ? lessonQuestion.getQuestion().getIdQuestion() : null);
            data.put("orderIndex", lessonQuestion.getOrderIndex());
            data.put("points", lessonQuestion.getPoints());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }
}