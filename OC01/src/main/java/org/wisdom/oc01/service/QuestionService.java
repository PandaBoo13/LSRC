// ============================================
// QuestionService.java - Interface
// ============================================
package org.wisdom.oc01.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.wisdom.oc01.dto.request.question.QuestionRequest;
import org.wisdom.oc01.dto.response.question.QuestionLearnerResponse;
import org.wisdom.oc01.dto.response.question.QuestionResponse;

import java.util.List;

public interface QuestionService {

    // ==================== CREATE ====================
    QuestionResponse createQuestion(QuestionRequest request);

    // ==================== UPDATE ====================
    QuestionResponse updateQuestion(Integer questionId, QuestionRequest request);

    // ==================== DELETE ====================
    void deleteQuestion(Integer questionId);

    // ==================== GET — ADMIN / INSTRUCTOR (FULL VIEW) ====================
    QuestionResponse getQuestionById(Integer questionId);
    Page<QuestionResponse> getQuestionsByCourse(Integer courseId, Pageable pageable);
    List<QuestionResponse> getAllQuestionsByCourse(Integer courseId);

    List<QuestionResponse> getQuestionsByLesson(Integer lessonId);
    Page<QuestionResponse> getQuestionsByLessonPaginated(Integer lessonId, Pageable pageable);

    List<QuestionResponse> getQuestionsByLessons(List<Integer> lessonIds);
    List<QuestionResponse> getRandomQuestionsByLessons(List<Integer> lessonIds, Integer limit);

    List<QuestionResponse> getRandomQuestions(Integer courseId, Integer limit);

    // ==================== GET — LEARNER / PUBLIC (KHÔNG ĐÁP ÁN) ====================
    // FIXED [CRITICAL]: tách learner view để không lộ correctAnswer / explanation.
    Page<QuestionLearnerResponse> getQuestionsByLessonPaginatedLearner(
            Integer lessonId, Pageable pageable);

    List<QuestionLearnerResponse> getQuestionsByQuizLearner(Integer quizId);

    Page<QuestionLearnerResponse> getQuestionsByCourseLearner(
            Integer courseId, Pageable pageable);

    List<QuestionLearnerResponse> getAllQuestionsByCourseLearner(Integer courseId);

    List<QuestionLearnerResponse> getRandomQuestionsLearner(Integer courseId, Integer limit);
}