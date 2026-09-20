import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.wisdom.oc01.dto.response.quiz.QuizAttemptResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.repository.quiz_assessment.QuizAttemptRepository;
import org.wisdom.oc01.service.QuizAttemptService;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@SpringBootTest
@Transactional
class QuizAnswerKeySecurityTest {

    @Autowired
    QuizAttemptService quizAttemptService;
    @Autowired
    QuizAttemptRepository attemptRepository;

    private Integer quizId;
    private Integer studentId;
    private Account student;

    // ==================== IN_PROGRESS ====================

    @Test
    void startAttempt_doesNotReturnAnswer() {
        QuizAttemptResponse response = quizAttemptService.startAttempt(quizId, studentId);

        assertThat(response.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(response.getQuestions()).isNotExactlyInstanceOf();
        assertThat(response.getQuestions()).allSatisfy(q -> {
            assertThat(q.getCorrectAnswer()).isNull();
            assertThat(q.getExplanation()).isNull();
        });
    }

    @Test
    void saveAnswers_doesNotReturnAnswer() {
        QuizAttemptResponse attempt = quizAttemptService.startAttempt(quizId, studentId);

        QuizAttemptResponse response = quizAttemptService.saveAnswers(
                attempt.getAttemptId(),
                "[{\"questionId\":1,\"selectedOptions\":[\"A\"]}]");

        assertThat(response.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(response.getQuestions()).allSatisfy(q -> {
            assertThat(q.getCorrectAnswer()).isNull();
        });
    }

    // ==================== FINISHED ====================

    @Test
    void submitAttempt_returnsAnswer() {
        QuizAttemptResponse attempt = quizAttemptService.startAttempt(quizId, studentId);
        quizAttemptService.saveAnswers(attempt.getAttemptId(), "[]");

        QuizAttemptResponse response = quizAttemptService.submitAttempt(
                attempt.getAttemptId(), studentId);

        assertThat(response.getStatus()).isEqualTo("GRADED");
        assertThat(response.getQuestions()).isNotEmpty();
        assertThat(response.getQuestions()).allSatisfy(q -> {
            assertThat(q.getCorrectAnswer()).isNotNull();
        });
    }

    @Test
    void getAttemptResult_afterSubmit_returnsAnswer() {
        QuizAttemptResponse attempt = quizAttemptService.startAttempt(quizId, studentId);
        quizAttemptService.submitAttempt(attempt.getAttemptId(), studentId);

        QuizAttemptResponse response = quizAttemptService.getAttemptResult(
                attempt.getAttemptId(), studentId);

        assertThat(response.getQuestions()).allSatisfy(q -> {
            assertThat(q.getCorrectAnswer()).isNotNull();
        });
    }

    // ==================== ANONYMOUS ====================

    @Test
    void anonymousCannotFetchQuizQuestions() throws Exception {
        mockMvc.perform(get("/api/quizzes/" + quizId + "/questions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void anonymousCannotFetchCourseQuestions() throws Exception {
        mockMvc.perform(get("/api/courses/1/questions"))
                .andExpect(status().isUnauthorized());
    }
}