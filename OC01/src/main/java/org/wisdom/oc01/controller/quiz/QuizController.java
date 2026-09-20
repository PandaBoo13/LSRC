// src/main/java/org/wisdom/oc01/controller/quiz/QuizController.java
package org.wisdom.oc01.controller.quiz;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.question.QuestionRequest;
import org.wisdom.oc01.dto.request.resource.CourseResourceRequest;
import org.wisdom.oc01.dto.response.CourseResourceResponse;
import org.wisdom.oc01.dto.response.question.QuestionImportResponse;
import org.wisdom.oc01.dto.response.question.QuestionLearnerResponse;
import org.wisdom.oc01.dto.response.question.QuestionResponse;
import org.wisdom.oc01.dto.response.quiz.QuizAttemptResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.service.CourseResourceService;
import org.wisdom.oc01.service.LessonQuestionService;
import org.wisdom.oc01.service.QuestionService;
import org.wisdom.oc01.service.QuizAttemptService;
import org.wisdom.oc01.service.impl.quiz_assessment.QuestionImportService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuizController {

    private final CourseResourceService resourceService;
    private final QuestionService questionService;
    private final LessonQuestionService lessonQuestionService;
    private final QuizAttemptService attemptService;
    private final QuestionImportService questionImportService;

    // ==================== A. QUIZ MANAGEMENT ====================

    @PostMapping("/courses/{courseId}/quizzes")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> createQuiz(
            @PathVariable Integer courseId,
            @Valid @ModelAttribute CourseResourceRequest request) {
        request.setResourceType("QUIZ");
        CourseResourceResponse quiz = resourceService.uploadResource(courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(quiz, "Tạo quiz thành công"));
    }

    @PutMapping("/quizzes/{quizId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> updateQuiz(
            @PathVariable Integer quizId,
            @Valid @ModelAttribute CourseResourceRequest request) {
        request.setResourceType("QUIZ");
        CourseResourceResponse quiz = resourceService.updateResource(quizId, request);
        return ResponseEntity.ok(new RequestResponse(quiz, "Cập nhật quiz thành công"));
    }

    @DeleteMapping("/quizzes/{quizId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> deleteQuiz(@PathVariable Integer quizId) {
        resourceService.deleteResource(quizId);
        return ResponseEntity.ok(new RequestResponse(null, "Xóa quiz thành công"));
    }

    /** Danh sách quiz của course — cần đăng nhập, service check ownership. */
    @GetMapping("/courses/{courseId}/quizzes")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<RequestResponse> getQuizzesByCourse(
            @PathVariable Integer courseId) {
        List<CourseResourceResponse> quizzes = resourceService.getResourcesByCourse(courseId)
                .stream()
                .filter(r -> "QUIZ".equals(r.getResourceType()))
                .toList();
        return ResponseEntity.ok(
                new RequestResponse(quizzes, "Lấy danh sách quiz thành công"));
    }

    @GetMapping("/quizzes/{quizId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<RequestResponse> getQuizById(@PathVariable Integer quizId) {
        CourseResourceResponse quiz = resourceService.getResourceById(quizId);
        if (!"QUIZ".equals(quiz.getResourceType())) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Resource không phải là quiz");
        }
        return ResponseEntity.ok(new RequestResponse(quiz, "Lấy quiz thành công"));
    }

    @PutMapping("/quizzes/{quizId}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> publishQuiz(@PathVariable Integer quizId) {
        CourseResourceResponse quiz = resourceService.publishResource(quizId);
        return ResponseEntity.ok(new RequestResponse(quiz, "Publish quiz thành công"));
    }

    @PutMapping("/quizzes/{quizId}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> closeQuiz(@PathVariable Integer quizId) {
        CourseResourceResponse quiz = resourceService.unpublishResource(quizId);
        return ResponseEntity.ok(new RequestResponse(quiz, "Đóng quiz thành công"));
    }

    // ==================== B. QUESTION MANAGEMENT ====================

    /** Tạo câu hỏi cho quiz — full view (admin/instructor). */
    @PostMapping("/quizzes/{quizId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> createQuestionForQuiz(
            @PathVariable Integer quizId,
            @Valid @RequestBody QuestionRequest request) {

        CourseResourceResponse quiz = resourceService.getResourceById(quizId);
        request.setCourseId(quiz.getCourseId());
        request.setLessonId(quizId);

        QuestionResponse question = questionService.createQuestion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(question, "Tạo câu hỏi thành công"));
    }

    @PostMapping("/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> createQuestion(
            @Valid @RequestBody QuestionRequest request) {
        QuestionResponse question = questionService.createQuestion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(question, "Tạo câu hỏi thành công"));
    }

    // ==================== IMPORT CÂU HỎI TỪ EXCEL ====================

    @PostMapping(value = "/questions/import-excel",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> importQuestionsFromExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Integer courseId,
            @RequestParam(value = "lessonId", required = false) Integer lessonId,
            @RequestParam(value = "defaultQuestionType", required = false)
            String defaultQuestionType) {

        QuestionImportResponse result = questionImportService.importQuestions(
                file, courseId, lessonId, defaultQuestionType);

        String message = String.format(
                "Import hoàn tất: %d thành công / %d lỗi",
                result.getSuccessCount(), result.getFailedCount());

        return ResponseEntity.ok(new RequestResponse(result, message));
    }

    // ==================== TẢI FILE EXCEL MẪU ====================

    @GetMapping("/questions/import-template")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<Resource> downloadImportTemplate() throws IOException {
        byte[] excelBytes;
        try (Workbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("Questions");
            String[] headers = {
                    "STT", "Nội dung câu hỏi", "Loại câu hỏi",
                    "Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D",
                    "Đáp án đúng", "Giải thích", "Điểm"
            };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
                sheet.setColumnWidth(i, i == 1 ? 8000 : 4000);
            }

            addSampleRow(sheet, 1, 1, "2 + 2 = ?", "SINGLE_CHOICE",
                    "3", "4", "5", "6", "B", "Phép cộng cơ bản", 1);
            addSampleRow(sheet, 2, 2, "Số nào là số nguyên tố?", "MULTIPLE_CHOICE",
                    "2", "9", "13", "21", "A,C", "2 và 13 là số nguyên tố", 2);
            addSampleRow(sheet, 3, 3, "Trái đất hình tròn.", "TRUE_FALSE",
                    "", "", "", "", "TRUE", "Kiến thức địa lý cơ bản", 1);
            addSampleRow(sheet, 4, 4, "Thủ đô Việt Nam là gì?", "SHORT_ANSWER",
                    "", "", "", "", "Hà Nội;Ha Noi", "Chấp nhận cả 2 dạng", 1);

            wb.write(out);
            excelBytes = out.toByteArray();
        }

        ByteArrayResource resource = new ByteArrayResource(excelBytes);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=question_import_template.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelBytes.length)
                .body(resource);
    }

    private void addSampleRow(Sheet sheet, int rowIdx, Object... values) {
        Row row = sheet.createRow(rowIdx);
        for (int i = 0; i < values.length; i++) {
            Object v = values[i];
            if (v instanceof Number) {
                row.createCell(i).setCellValue(((Number) v).doubleValue());
            } else {
                row.createCell(i).setCellValue(v == null ? "" : v.toString());
            }
        }
    }

    // ==================== CẬP NHẬT / XÓA CÂU HỎI ====================

    /** Update — full view (admin/instructor). */
    @PutMapping("/questions/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> updateQuestion(
            @PathVariable Integer questionId,
            @Valid @RequestBody QuestionRequest request) {

        QuestionResponse question = questionService.updateQuestion(questionId, request);
        return ResponseEntity.ok(
                new RequestResponse(question, "Cập nhật câu hỏi thành công"));
    }

    /**
     * Lấy câu hỏi theo lesson (phân trang).
     * FIXED [HIGH]: đổi sang QuestionLearnerResponse để không lộ đáp án.
     *               Chỉ admin/teacher mới được thấy full view qua endpoint riêng.
     */
    @GetMapping("/questions/lesson/{lessonId}/paginated")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<RequestResponse> getQuestionsByLessonPaginated(
            @PathVariable Integer lessonId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by("orderIndex").ascending());

        // Trả về DTO learner để tránh lộ đáp án
        Page<QuestionLearnerResponse> questions =
                questionService.getQuestionsByLessonPaginatedLearner(lessonId, pageable);

        return ResponseEntity.ok(
                new RequestResponse(questions, "Lấy câu hỏi theo bài học thành công"));
    }

    @DeleteMapping("/questions/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> deleteQuestion(
            @PathVariable Integer questionId) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.ok(
                new RequestResponse(null, "Xóa câu hỏi thành công"));
    }

    /**
     * Lấy danh sách câu hỏi của quiz.
     * FIXED [CRITICAL]: đổi sang QuestionLearnerResponse — không lộ correctAnswer.
     * FIXED [HIGH]: fix N+1 — batch fetch thay vì query từng câu.
     */
    @GetMapping("/quizzes/{quizId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<RequestResponse> getQuestionsByQuiz(
            @PathVariable Integer quizId) {

        List<QuestionLearnerResponse> questions =
                questionService.getQuestionsByQuizLearner(quizId);

        return ResponseEntity.ok(
                new RequestResponse(questions, "Lấy danh sách câu hỏi thành công"));
    }

    /**
     * Lấy danh sách câu hỏi của course (phân trang).
     * FIXED [CRITICAL]: learner view — không lộ đáp án.
     */
    @GetMapping("/courses/{courseId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<RequestResponse> getQuestionsByCourse(
            @PathVariable Integer courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by("orderIndex").ascending());
        Page<QuestionLearnerResponse> questions =
                questionService.getQuestionsByCourseLearner(courseId, pageable);
        return ResponseEntity.ok(
                new RequestResponse(questions, "Lấy danh sách câu hỏi thành công"));
    }

    /**
     * Lấy TẤT CẢ câu hỏi của course (không phân trang).
     * FIXED [CRITICAL]: learner view — không lộ đáp án.
     */
    @GetMapping("/courses/{courseId}/questions/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<RequestResponse> getAllQuestionsByCourse(
            @PathVariable Integer courseId) {

        List<QuestionLearnerResponse> questions =
                questionService.getAllQuestionsByCourseLearner(courseId);
        return ResponseEntity.ok(
                new RequestResponse(questions, "Lấy tất cả câu hỏi thành công"));
    }

    /**
     * Lấy câu hỏi ngẫu nhiên (dùng cho practice).
     * FIXED [CRITICAL]: learner view — không lộ đáp án.
     */
    @GetMapping("/courses/{courseId}/questions/random")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<RequestResponse> getRandomQuestions(
            @PathVariable Integer courseId,
            @RequestParam(defaultValue = "10") Integer limit) {

        List<QuestionLearnerResponse> questions =
                questionService.getRandomQuestionsLearner(courseId, limit);
        return ResponseEntity.ok(
                new RequestResponse(questions, "Lấy câu hỏi ngẫu nhiên thành công"));
    }

    @PostMapping("/quizzes/{quizId}/assign-questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> assignQuestionsToQuiz(
            @PathVariable Integer quizId,
            @RequestBody Map<String, List<Integer>> body) {

        List<Integer> questionIds = body.get("questionIds");
        List<?> result = lessonQuestionService.assignQuestions(quizId, questionIds);
        return ResponseEntity.ok(
                new RequestResponse(result, "Gán câu hỏi vào quiz thành công"));
    }

    @DeleteMapping("/quizzes/{quizId}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> unassignQuestion(
            @PathVariable Integer quizId,
            @PathVariable Integer questionId) {

        lessonQuestionService.unassignQuestion(quizId, questionId);
        return ResponseEntity.ok(
                new RequestResponse(null, "Gỡ câu hỏi khỏi quiz thành công"));
    }

    // ==================== C. QUIZ ATTEMPT ====================

    /**
     * Bắt đầu làm bài.
     * FIXED: dùng SecurityUtils thay @AuthenticationPrincipal Account
     *        (principal là CustomUserDetails, không phải Account).
     */
    @PostMapping("/quizzes/{quizId}/attempts")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<RequestResponse> startAttempt(
            @PathVariable Integer quizId) {

        Account account = SecurityUtils.requireCurrentAccount();
        QuizAttemptResponse attempt = attemptService.startAttempt(
                quizId, account.getIdAccount());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(attempt, "Bắt đầu làm bài thành công"));
    }

    @PutMapping("/attempts/{attemptId}/answers")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<RequestResponse> saveAnswers(
            @PathVariable Integer attemptId,
            @RequestBody Map<String, String> body) {

        String answersJson = body.get("answers");
        QuizAttemptResponse attempt = attemptService.saveAnswers(attemptId, answersJson);
        return ResponseEntity.ok(
                new RequestResponse(attempt, "Lưu câu trả lời thành công"));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<RequestResponse> submitAttempt(
            @PathVariable Integer attemptId) {

        Account account = SecurityUtils.requireCurrentAccount();
        QuizAttemptResponse result = attemptService.submitAttempt(
                attemptId, account.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse(result, "Nộp bài thành công"));
    }

    @GetMapping("/attempts/{attemptId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<RequestResponse> getAttemptResult(
            @PathVariable Integer attemptId) {

        Account account = SecurityUtils.requireCurrentAccount();
        QuizAttemptResponse result = attemptService.getAttemptResult(
                attemptId, account.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse(result, "Lấy kết quả thành công"));
    }

    @GetMapping("/quizzes/{quizId}/attempts/mine")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<RequestResponse> getMyAttempts(
            @PathVariable Integer quizId) {

        Account account = SecurityUtils.requireCurrentAccount();
        List<QuizAttemptResponse> attempts = attemptService.getMyAttempts(
                quizId, account.getIdAccount());
        return ResponseEntity.ok(
                new RequestResponse(attempts, "Lấy lịch sử làm bài thành công"));
    }

    @GetMapping("/quizzes/{quizId}/attempts")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'INSTRUCTOR')")
    public ResponseEntity<RequestResponse> getAttemptsByQuiz(
            @PathVariable Integer quizId) {

        List<QuizAttemptResponse> attempts = attemptService.getAttemptsByQuiz(quizId);
        return ResponseEntity.ok(
                new RequestResponse(attempts, "Lấy danh sách lượt làm bài thành công"));
    }
}