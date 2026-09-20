// ============================================
// QuizAttemptService.java - Interface (FIXED)
// ============================================
package org.wisdom.oc01.service;

import org.wisdom.oc01.dto.response.quiz.QuizAttemptResponse;

import java.util.List;

public interface QuizAttemptService {

    // Bắt đầu attempt - trả về câu hỏi (không có đáp án đúng)
    QuizAttemptResponse startAttempt(Integer quizId, Integer accountId);

    // Lưu tạm câu trả lời - nhận JSON string trực tiếp
    QuizAttemptResponse saveAnswers(Integer attemptId, String answersJson);

    // Submit + Auto grading (tất cả đều tự chấm)
    QuizAttemptResponse submitAttempt(Integer attemptId, Integer accountId);

    // Timeout - tự động submit
    QuizAttemptResponse handleTimeout(Integer attemptId);

    // Xem kết quả
    QuizAttemptResponse getAttemptResult(Integer attemptId, Integer accountId);

    // Lịch sử làm bài của student
    List<QuizAttemptResponse> getMyAttempts(Integer quizId, Integer accountId);

    // Danh sách attempt của quiz (teacher)
    List<QuizAttemptResponse> getAttemptsByQuiz(Integer quizId);
}