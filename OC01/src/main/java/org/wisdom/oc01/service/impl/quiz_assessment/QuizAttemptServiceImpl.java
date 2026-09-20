package org.wisdom.oc01.service.impl.quiz_assessment;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.response.quiz.QuizAttemptResponse;
import org.wisdom.oc01.entity.*;
import org.wisdom.oc01.entity.CourseResource.ResourceType;
import org.wisdom.oc01.entity.CourseResource.Status;
import org.wisdom.oc01.entity.OrderItem.EnrollmentStatus;
import org.wisdom.oc01.entity.OrderItem.EnrollmentType;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.QuizAttemptMapper;
import org.wisdom.oc01.repository.*;
import org.wisdom.oc01.repository.quiz_assessment.LessonQuestionRepository;
import org.wisdom.oc01.repository.quiz_assessment.QuestionRepository;
import org.wisdom.oc01.repository.quiz_assessment.QuizAttemptRepository;
import org.wisdom.oc01.service.ProgressService;
import org.wisdom.oc01.service.QuizAttemptService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final CourseResourceRepository resourceRepository;
    private final QuestionRepository questionRepository;
    private final LessonQuestionRepository lessonQuestionRepository;
    private final OrderItemRepository orderItemRepository;
    private final AccountRepository accountRepository;
    private final QuizAttemptMapper mapper;
    private final ProgressService progressService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== AUTHORIZATION HELPERS ====================

    private boolean isAdmin(Account account) {
        return account != null
                && account.getRole() != null
                && "ADMIN".equalsIgnoreCase(account.getRole().getRoleName());
    }

    /**
     * Đảm bảo current user = accountId truyền vào (hoặc admin).
     * Dùng cho các method nhận `accountId` từ caller để tránh IDOR.
     */
    private void assertAccountAccess(Integer accountId) {
        Account current = SecurityUtils.requireCurrentAccount();
        if (isAdmin(current)) return;
        if (accountId == null || !accountId.equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền truy cập dữ liệu của tài khoản khác");
        }
    }

    /**
     * Load attempt và enforce ownership (strict).
     * Dùng cho endpoint chỉ có user gọi (saveAnswers, submitAttempt, getAttemptResult).
     * - Admin: bypass.
     * - Non-admin: chỉ attempt thuộc chính mình.
     * - Chưa login: throw 401.
     * Trả 404 (không phải 403) để tránh enumeration.
     */
    private QuizAttempt loadOwnedAttemptStrict(Integer attemptId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Attempt không tồn tại"));

        Account current = SecurityUtils.requireCurrentAccount();
        if (isAdmin(current)) return attempt;

        if (attempt.getAccount() == null
                || !attempt.getAccount().getIdAccount().equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Attempt không tồn tại");
        }
        return attempt;
    }

    /**
     * Load attempt và enforce ownership, nhưng CHO PHÉP system call (không có SecurityContext).
     * Dùng cho handleTimeout — có thể gọi từ scheduler.
     * - Không có user (scheduler): cho qua.
     * - Có user: check owner như strict.
     */
    private QuizAttempt loadOwnedAttemptAllowSystem(Integer attemptId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Attempt không tồn tại"));

        Account current = SecurityUtils.getCurrentAccount();
        if (current == null) return attempt;  // system call
        if (isAdmin(current)) return attempt;

        if (attempt.getAccount() == null
                || !attempt.getAccount().getIdAccount().equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Attempt không tồn tại");
        }
        return attempt;
    }

    /**
     * Đảm bảo current user là giảng viên của course chứa quiz, hoặc admin.
     * Dùng cho getAttemptsByQuiz.
     */
    private void assertQuizInstructorOrAdmin(CourseResource quiz) {
        Account current = SecurityUtils.requireCurrentAccount();
        if (isAdmin(current)) return;

        Course course = quiz.getCourse();
        if (course == null || course.getAccount() == null
                || !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không phải giảng viên của khóa học này");
        }
    }

    // ==================== START ATTEMPT ====================

    /** Bắt đầu lượt làm quiz: validate quiz + enrollment + số lần làm, snapshot câu hỏi */
    @Override
    @Transactional
    public QuizAttemptResponse startAttempt(Integer quizId, Integer accountId) {
        // FIXED [HIGH]: không tin accountId từ caller.
        assertAccountAccess(accountId);

        CourseResource quiz = resourceRepository.findById(quizId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Quiz không tồn tại"));
        if (quiz.getResourceType() != ResourceType.QUIZ) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Resource không phải là quiz");
        }
        if (quiz.getStatus() != Status.PUBLISHED) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Quiz chưa được xuất bản");
        }

        validateEnrollment(accountId, quiz.getCourse().getIdCourse());

        Long currentAttempts = attemptRepository
                .countByAccountIdAccountAndResourceIdResource(accountId, quizId);
        if (quiz.getMaxAttempts() != null && currentAttempts >= quiz.getMaxAttempts()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Đã vượt quá số lần làm tối đa (" + quiz.getMaxAttempts() + " lần)");
        }

        boolean hasPassed = attemptRepository
                .findByResourceIdResourceAndAccountIdAccountOrderByAttemptNumberDesc(quizId, accountId)
                .stream().anyMatch(a -> Boolean.TRUE.equals(a.getIsPassed()));
        if (hasPassed) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Bạn đã vượt qua quiz này rồi");
        }

        // Bốc và chốt danh sách câu hỏi cho Attempt này
        List<Question> selectedQuestions = generateQuestionsForQuiz(quiz);
        List<Integer> questionIds = selectedQuestions.stream()
                .map(Question::getIdQuestion).collect(Collectors.toList());

        QuizAttempt attempt = new QuizAttempt();
        attempt.setResource(quiz);
        attempt.setAccount(accountRepository.getReferenceById(accountId));
        attempt.setCourse(quiz.getCourse());
        attempt.setAttemptNumber(currentAttempts.intValue() + 1);
        attempt.setScore(BigDecimal.ZERO);
        attempt.setMaxScore(BigDecimal.ZERO);
        attempt.setPassingScore(quiz.getPassingScore() != null
                ? quiz.getPassingScore() : new BigDecimal("80.00"));
        attempt.setIsPassed(false);
        attempt.setStatus(QuizAttempt.QuizAttemptStatus.IN_PROGRESS);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setTimeSpent(0);

        // Snapshot danh sách câu hỏi đã bốc vào answersJson
        try {
            Map<String, Object> initialPayload = new HashMap<>();
            initialPayload.put("questionIds", questionIds);
            initialPayload.put("userAnswers", List.of());
            attempt.setAnswers(objectMapper.writeValueAsString(initialPayload));
        } catch (Exception e) {
            log.error("Lỗi serialize questionIds cho attempt", e);
        }

        attempt = attemptRepository.save(attempt);
        log.info("✅ Student {} bắt đầu attempt {} cho quiz {} với {} câu hỏi",
                accountId, attempt.getIdAttempt(), quizId, selectedQuestions.size());

        return mapper.toResponse(attempt, selectedQuestions);
    }

    // ==================== SAVE ANSWERS ====================

    /** Lưu tạm câu trả lời, merge an toàn với payload cũ để bảo toàn questionIds snapshot */
    @Override
    @Transactional
    public QuizAttemptResponse saveAnswers(Integer attemptId, String newAnswersJson) {
        // FIXED [CRITICAL]: enforce ownership — student A không ghi đè đáp án của B.
        QuizAttempt attempt = loadOwnedAttemptStrict(attemptId);

        if (attempt.getStatus() != QuizAttempt.QuizAttemptStatus.IN_PROGRESS) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Attempt đã kết thúc, không thể lưu");
        }

        try {
            Map<String, Object> payloadMap = new HashMap<>();
            Object parsedNewAnswers = null;

            if (newAnswersJson != null && !newAnswersJson.trim().isEmpty()) {
                parsedNewAnswers = objectMapper.readValue(newAnswersJson, Object.class);
            }

            String existingAnswers = attempt.getAnswers();
            if (existingAnswers != null && !existingAnswers.trim().isEmpty()) {
                try {
                    payloadMap = objectMapper.readValue(existingAnswers,
                            new TypeReference<Map<String, Object>>() {});
                } catch (Exception e) {
                    log.warn("⚠️ Payload cũ không phải Map Object, khởi tạo payload bọc mới");
                }
            }

            if (parsedNewAnswers instanceof Map
                    && ((Map<?, ?>) parsedNewAnswers).containsKey("userAnswers")) {
                Map<String, Object> newMap = (Map<String, Object>) parsedNewAnswers;
                payloadMap.put("userAnswers", newMap.get("userAnswers"));
                if (newMap.get("questionIds") != null
                        && !((List<?>) newMap.get("questionIds")).isEmpty()) {
                    payloadMap.put("questionIds", newMap.get("questionIds"));
                }
            } else {
                payloadMap.put("userAnswers",
                        parsedNewAnswers != null ? parsedNewAnswers : List.of());
            }

            attempt.setAnswers(objectMapper.writeValueAsString(payloadMap));
            attempt = attemptRepository.save(attempt);
            log.info("✅ Đã lưu tạm answers an toàn cho attempt {} (Bảo toàn questionIds)",
                    attemptId);
        } catch (Exception e) {
            log.error("❌ Lỗi merge JSON trong saveAnswers cho attempt {}: {}",
                    attemptId, e.getMessage());
            throw new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không thể lưu câu trả lời do lỗi định dạng dữ liệu");
        }
        return mapper.toResponse(attempt, null);
    }

    // ==================== SUBMIT + AUTO GRADING ====================

    /** Nộp bài: chấm điểm dựa trên snapshot câu hỏi của attempt và cập nhật progress */
    @Override
    @Transactional
    public QuizAttemptResponse submitAttempt(Integer attemptId, Integer accountId) {
        // FIXED [HIGH]: enforce current user = accountId (trừ admin).
        assertAccountAccess(accountId);

        QuizAttempt attempt = loadOwnedAttemptStrict(attemptId);

        if (attempt.getStatus() != QuizAttempt.QuizAttemptStatus.IN_PROGRESS) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Attempt đã được submit rồi");
        }

        List<Question> questions = getQuestionsFromSnapshot(attempt);
        GradingResult result = autoGrade(attempt, questions);

        attempt.setScore(result.getScore());
        attempt.setMaxScore(result.getMaxScore());
        attempt.setIsPassed(result.isPassed());
        attempt.setStatus(QuizAttempt.QuizAttemptStatus.GRADED);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setTimeSpent(calculateTimeSpent(attempt));
        attempt = attemptRepository.save(attempt);

        updateProgressAfterAttempt(attempt);
        log.info("✅ Attempt {} đã submit: score={}, max={}, passed={}",
                attemptId, result.getScore(), result.getMaxScore(), result.isPassed());

        return mapper.toResponse(attempt, questions);
    }

    // ==================== TIMEOUT ====================

    /** Xử lý hết giờ: chấm điểm những gì đã lưu, đánh dấu TIMEOUT */
    @Override
    @Transactional
    public QuizAttemptResponse handleTimeout(Integer attemptId) {
        // FIXED [CRITICAL]: enforce ownership — nhưng CHO PHÉP scheduler gọi (không có context).
        QuizAttempt attempt = loadOwnedAttemptAllowSystem(attemptId);

        if (attempt.getStatus() != QuizAttempt.QuizAttemptStatus.IN_PROGRESS) {
            return mapper.toResponse(attempt, null);
        }

        List<Question> questions = getQuestionsFromSnapshot(attempt);
        GradingResult result = autoGrade(attempt, questions);

        attempt.setScore(result.getScore());
        attempt.setMaxScore(result.getMaxScore());
        attempt.setIsPassed(result.isPassed());
        attempt.setStatus(QuizAttempt.QuizAttemptStatus.TIMEOUT);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setTimeSpent(calculateTimeSpent(attempt));
        attempt = attemptRepository.save(attempt);

        updateProgressAfterAttempt(attempt);
        return mapper.toResponse(attempt, questions);
    }

    // ==================== GET RESULTS ====================

    /** Lấy kết quả 1 attempt (chỉ chủ sở hữu) */
    @Override
    public QuizAttemptResponse getAttemptResult(Integer attemptId, Integer accountId) {
        // FIXED [HIGH]: enforce current = accountId.
        assertAccountAccess(accountId);
        QuizAttempt attempt = loadOwnedAttemptStrict(attemptId);
        List<Question> questions = getQuestionsFromSnapshot(attempt);
        return mapper.toResponse(attempt, questions);
    }

    /** Lấy danh sách attempt của user cho 1 quiz */
    @Override
    public List<QuizAttemptResponse> getMyAttempts(Integer quizId, Integer accountId) {
        // FIXED [HIGH]: enforce current = accountId.
        assertAccountAccess(accountId);
        List<QuizAttempt> attempts = attemptRepository
                .findByResourceIdResourceAndAccountIdAccountOrderByAttemptNumberDesc(
                        quizId, accountId);
        return attempts.stream()
                .map(a -> mapper.toResponse(a, getQuestionsFromSnapshot(a)))
                .collect(Collectors.toList());
    }

    /** Lấy tất cả attempt của 1 quiz — chỉ instructor của course hoặc admin */
    @Override
    public List<QuizAttemptResponse> getAttemptsByQuiz(Integer quizId) {
        // FIXED [HIGH]: trước đây ai cũng gọi được → xem toàn bộ attempt của mọi student.
        CourseResource quiz = resourceRepository.findById(quizId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Quiz không tồn tại"));
        assertQuizInstructorOrAdmin(quiz);

        List<QuizAttempt> attempts = attemptRepository.findByResourceIdResource(quizId);
        return attempts.stream()
                .map(a -> mapper.toResponse(a, getQuestionsFromSnapshot(a)))
                .collect(Collectors.toList());
    }

    // ==================== AUTO GRADING ====================

    /** Chấm điểm tự động: so sánh Set đáp án (không phụ thuộc thứ tự) */
    private GradingResult autoGrade(QuizAttempt attempt, List<Question> questions) {
        BigDecimal totalScore = BigDecimal.ZERO;
        BigDecimal maxScore = BigDecimal.ZERO;
        Map<Integer, List<String>> selectedAnswers = parseAnswers(attempt.getAnswers());

        for (Question question : questions) {
            BigDecimal points = question.getPoints() != null
                    ? question.getPoints() : BigDecimal.ONE;
            maxScore = maxScore.add(points);

            List<String> studentAnswer = selectedAnswers.get(question.getIdQuestion());
            if (studentAnswer == null || studentAnswer.isEmpty()) continue;

            List<String> correctAnswer = parseCorrectAnswer(question.getCorrectAnswer());
            if (new HashSet<>(studentAnswer).equals(new HashSet<>(correctAnswer))) {
                totalScore = totalScore.add(points);
            }
        }

        boolean passed = calculatePassed(totalScore, maxScore, attempt.getPassingScore());
        return GradingResult.builder()
                .score(totalScore).maxScore(maxScore).passed(passed).build();
    }

    // ==================== HELPER: SNAPSHOT CÂU HỎI ====================

    private List<Question> generateQuestionsForQuiz(CourseResource quiz) {
        List<Question> questions = new ArrayList<>();
        if (quiz.getHashtagFilter() != null && !quiz.getHashtagFilter().trim().isEmpty()) {
            List<Integer> lessonIds = parseLessonIdsFromHashtagFilter(quiz.getHashtagFilter());
            if (!lessonIds.isEmpty()) {
                questions = new ArrayList<>(questionRepository.findByLessonIdResourceIn(lessonIds));
            }
        }
        if (questions.isEmpty()) {
            questions = new ArrayList<>(
                    lessonQuestionRepository.findQuestionsByResource(quiz.getIdResource()));
        }
        if (Boolean.TRUE.equals(quiz.getShuffleQuestions())
                || (quiz.getTotalQuestions() != null && quiz.getTotalQuestions() > 0)) {
            Collections.shuffle(questions);
        }
        if (quiz.getTotalQuestions() != null && quiz.getTotalQuestions() > 0) {
            questions = questions.stream().limit(quiz.getTotalQuestions())
                    .collect(Collectors.toList());
        }
        return questions;
    }

    private List<Question> getQuestionsFromSnapshot(QuizAttempt attempt) {
        if (attempt == null || attempt.getAnswers() == null) return List.of();
        try {
            Map<String, Object> payload = objectMapper.readValue(attempt.getAnswers(),
                    new TypeReference<Map<String, Object>>() {});
            if (payload.containsKey("questionIds")) {
                List<Integer> qIds = (List<Integer>) payload.get("questionIds");
                return questionRepository.findAllById(qIds);
            }
        } catch (Exception e) {
            Map<Integer, List<String>> answers = parseAnswers(attempt.getAnswers());
            if (!answers.isEmpty()) {
                return questionRepository.findAllById(answers.keySet());
            }
        }
        return generateQuestionsForQuiz(attempt.getResource());
    }

    private List<Integer> parseLessonIdsFromHashtagFilter(String hashtagFilter) {
        if (hashtagFilter == null || hashtagFilter.trim().isEmpty()) return List.of();
        return Arrays.stream(hashtagFilter.split(","))
                .map(String::trim)
                .filter(tag -> tag.startsWith("#lesson-"))
                .map(tag -> {
                    try {
                        return Integer.parseInt(tag.substring("#lesson-".length()));
                    } catch (NumberFormatException e) {
                        log.warn("⚠️ Không parse được hashtag: {}", tag);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ==================== HELPER METHODS ====================

    private Map<Integer, List<String>> parseAnswers(String answersJson) {
        if (answersJson == null || answersJson.isEmpty()) return Map.of();
        try {
            if (answersJson.contains("userAnswers")) {
                Map<String, Object> payload = objectMapper.readValue(answersJson,
                        new TypeReference<Map<String, Object>>() {});
                answersJson = objectMapper.writeValueAsString(payload.get("userAnswers"));
            }
            List<AnswerItem> answerItems = objectMapper.readValue(answersJson,
                    new TypeReference<List<AnswerItem>>() {});
            return answerItems.stream()
                    .filter(item -> item.getQuestionId() != null)
                    .collect(Collectors.toMap(
                            AnswerItem::getQuestionId,
                            item -> item.getSelectedOptions() != null
                                    ? item.getSelectedOptions() : List.of(),
                            (a, b) -> b));
        } catch (Exception e) {
            log.error("❌ Parse answers JSON lỗi: {}", e.getMessage());
            return Map.of();
        }
    }

    private List<String> parseCorrectAnswer(String correctAnswerJson) {
        if (correctAnswerJson == null || correctAnswerJson.isEmpty()) return List.of();
        try {
            return objectMapper.readValue(correctAnswerJson,
                    new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.error("❌ Parse correct answer JSON lỗi: {}", e.getMessage());
            return List.of();
        }
    }

    private boolean calculatePassed(BigDecimal score, BigDecimal maxScore,
                                    BigDecimal passingScore) {
        if (maxScore == null || maxScore.compareTo(BigDecimal.ZERO) == 0) return false;
        if (passingScore == null) passingScore = new BigDecimal("80.00");
        BigDecimal percentage = score.multiply(new BigDecimal("100"))
                .divide(maxScore, 2, RoundingMode.HALF_UP);
        return percentage.compareTo(passingScore) >= 0;
    }

    private Integer calculateTimeSpent(QuizAttempt attempt) {
        if (attempt.getStartedAt() == null) return 0;
        return (int) Duration.between(attempt.getStartedAt(), LocalDateTime.now()).getSeconds();
    }

    /**
     * Validate user đã đăng ký khóa học.
     * FIXED [HIGH]: trước đây chỉ check tồn tại OrderItem → user chưa trả tiền vẫn làm quiz.
     *               Nay yêu cầu: order PAID + enrollmentType ENROLLED + status ACTIVE.
     */
    private void validateEnrollment(Integer accountId, Integer courseId) {
        List<OrderItem> items = orderItemRepository
                .findAllByAccountIdAccountAndCourseIdCourse(accountId, courseId);

        boolean enrolled = items.stream().anyMatch(item ->
                item.getEnrollmentType() == EnrollmentType.ENROLLED
                        && item.getStatus() == EnrollmentStatus.ACTIVE
                        && item.getOrder() != null
                        && item.getOrder().getStatus() == Order.OrderStatus.PAID);

        if (!enrolled) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN, "Bạn chưa đăng ký khóa học này");
        }
    }

    private void updateProgressAfterAttempt(QuizAttempt attempt) {
        try {
            progressService.updateResourceScore(
                    attempt.getAccount().getIdAccount(),
                    attempt.getResource().getIdResource(),
                    attempt.getScore(),
                    attempt.getMaxScore(),
                    attempt.getIsPassed());
        } catch (Exception e) {
            log.warn("⚠️ Không thể cập nhật progress: {}", e.getMessage());
        }
    }

    // ==================== INNER CLASSES ====================

    @lombok.Builder @lombok.Data
    private static class GradingResult {
        private BigDecimal score;
        private BigDecimal maxScore;
        private boolean passed;
    }

    @lombok.Data
    private static class AnswerItem {
        private Integer questionId;
        private List<String> selectedOptions;
    }
}