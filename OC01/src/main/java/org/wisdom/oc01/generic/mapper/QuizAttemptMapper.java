// ============================================
// QuizAttemptMapper.java - FIXED (phân biệt IN_PROGRESS / FINISHED)
// ============================================
package org.wisdom.oc01.generic.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.dto.response.quiz.QuizAttemptResponse;
import org.wisdom.oc01.entity.Question;
import org.wisdom.oc01.entity.QuizAttempt;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuizAttemptMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== TO RESPONSE ====================

    /**
     * Entity → Response.
     *
     * FIXED [CRITICAL]:
     *  - Nếu attempt CHƯA kết thúc (IN_PROGRESS) → KHÔNG trả correctAnswer.
     *  - Nếu attempt ĐÃ kết thúc (GRADED/TIMEOUT/SUBMITTED) → trả đáp án để review.
     *
     * Điều này đảm bảo học viên:
     *  - Không tải trước đáp án khi đang làm bài.
     *  - Xem được đáp án sau khi nộp để học.
     */
    public QuizAttemptResponse toResponse(QuizAttempt attempt, List<Question> questions) {
        if (attempt == null) return null;

        boolean isFinished = isFinished(attempt.getStatus());

        return QuizAttemptResponse.builder()
                .attemptId(attempt.getIdAttempt())
                .quizId(attempt.getResource() != null
                        ? attempt.getResource().getIdResource() : null)
                .quizTitle(attempt.getResource() != null
                        ? attempt.getResource().getTitle() : null)
                .accountId(attempt.getAccount() != null
                        ? attempt.getAccount().getIdAccount() : null)
                .username(attempt.getAccount() != null
                        ? attempt.getAccount().getUsername() : null)
                .attemptNumber(attempt.getAttemptNumber())
                .score(attempt.getScore())
                .maxScore(attempt.getMaxScore())
                .passingScore(attempt.getPassingScore())
                .isPassed(attempt.getIsPassed())
                .status(attempt.getStatus() != null
                        ? attempt.getStatus().name() : null)
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeSpent(attempt.getTimeSpent())
                .answers(attempt.getAnswers())
                .questions(questions != null
                        ? questions.stream()
                        .map(q -> toQuestionItem(q, isFinished))
                        .collect(Collectors.toList())
                        : null)
                .build();
    }

    // ==================== QUESTION MAPPING ====================

    /**
     * Question → QuestionItem.
     *
     * @param includeAnswer nếu true → populate correctAnswer + explanation.
     *                      CHỈ set true khi attempt đã GRADED/TIMEOUT/SUBMITTED.
     */
    private QuizAttemptResponse.QuestionItem toQuestionItem(Question question,
                                                            boolean includeAnswer) {
        QuizAttemptResponse.QuestionItem.QuestionItemBuilder builder =
                QuizAttemptResponse.QuestionItem.builder()
                        .questionId(question.getIdQuestion())
                        .content(question.getContent())
                        .questionType(question.getQuestionType() != null
                                ? question.getQuestionType().name() : null)
                        .options(parseOptions(question.getOptions()))
                        .points(question.getPoints());

        if (includeAnswer) {
            builder.correctAnswer(parseCorrectAnswer(question.getCorrectAnswer()))
                    .explanation(question.getExplanation());
        }
        // Nếu includeAnswer = false → correctAnswer + explanation = null

        return builder.build();
    }

    /**
     * Parse options JSON → List<OptionItem>.
     */
    private List<QuizAttemptResponse.OptionItem> parseOptions(String optionsJson) {
        if (optionsJson == null || optionsJson.isEmpty()) return null;

        try {
            List<Map<String, String>> options = objectMapper.readValue(
                    optionsJson,
                    new TypeReference<List<Map<String, String>>>() {}
            );

            return options.stream()
                    .map(opt -> QuizAttemptResponse.OptionItem.builder()
                            .label(opt.get("label"))
                            .content(opt.get("content"))
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Parse options JSON failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Parse correctAnswer JSON → List<String>.
     * Ví dụ: ["A"] hoặc ["A","B"].
     */
    private List<String> parseCorrectAnswer(String correctAnswerJson) {
        if (correctAnswerJson == null || correctAnswerJson.isEmpty()) return null;

        try {
            return objectMapper.readValue(
                    correctAnswerJson,
                    new TypeReference<List<String>>() {}
            );
        } catch (Exception e) {
            log.warn("Parse correctAnswer JSON failed: {}", e.getMessage());
            return null;
        }
    }

    // ==================== HELPERS ====================

    /**
     * Attempt đã kết thúc chưa?.
     * Đã kết thúc = học viên được phép xem đáp án.
     */
    private boolean isFinished(QuizAttempt.QuizAttemptStatus status) {
        return status == QuizAttempt.QuizAttemptStatus.GRADED
                || status == QuizAttempt.QuizAttemptStatus.TIMEOUT
                || status == QuizAttempt.QuizAttemptStatus.SUBMITTED;
    }

    // ==================== TO JSON ====================

    /**
     * Entity → JSON (dùng cho audit log — chỉ admin đọc).
     */
    public String toJson(QuizAttempt attempt) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("attemptId", attempt.getIdAttempt());
            data.put("quizId", attempt.getResource() != null
                    ? attempt.getResource().getIdResource() : null);
            data.put("quizTitle", attempt.getResource() != null
                    ? attempt.getResource().getTitle() : null);
            data.put("accountId", attempt.getAccount() != null
                    ? attempt.getAccount().getIdAccount() : null);
            data.put("username", attempt.getAccount() != null
                    ? attempt.getAccount().getUsername() : null);
            data.put("attemptNumber", attempt.getAttemptNumber());
            data.put("score", attempt.getScore());
            data.put("maxScore", attempt.getMaxScore());
            data.put("passingScore", attempt.getPassingScore());
            data.put("isPassed", attempt.getIsPassed());
            data.put("status", attempt.getStatus() != null
                    ? attempt.getStatus().name() : null);
            data.put("startedAt", attempt.getStartedAt() != null
                    ? attempt.getStartedAt().toString() : null);
            data.put("submittedAt", attempt.getSubmittedAt() != null
                    ? attempt.getSubmittedAt().toString() : null);
            data.put("timeSpent", attempt.getTimeSpent());
            data.put("answers", attempt.getAnswers());
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            log.warn("Serialize attempt JSON failed: {}", e.getMessage());
            return null;
        }
    }
}