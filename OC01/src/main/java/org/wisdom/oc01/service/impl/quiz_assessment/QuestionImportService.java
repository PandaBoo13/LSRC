// src/main/java/org/wisdom/oc01/service/impl/quiz_assessment/QuestionImportService.java
package org.wisdom.oc01.service.impl.quiz_assessment;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.wisdom.oc01.dto.response.question.QuestionImportResponse;
import org.wisdom.oc01.dto.response.question.QuestionResponse;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.entity.CourseResource;
import org.wisdom.oc01.entity.CourseResource.ResourceType;
import org.wisdom.oc01.entity.Question;
import org.wisdom.oc01.entity.Question.QuestionStatus;
import org.wisdom.oc01.entity.Question.QuestionType;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.import_.ExcelImportEngine;
import org.wisdom.oc01.generic.import_.ImportConfig;
import org.wisdom.oc01.generic.import_.ImportResult;
import org.wisdom.oc01.generic.import_.RowContext;
import org.wisdom.oc01.generic.mapper.QuestionMapper;
import org.wisdom.oc01.generic.validator.QuestionValidator;
import org.wisdom.oc01.repository.CourseRepository;
import org.wisdom.oc01.repository.CourseResourceRepository;
import org.wisdom.oc01.repository.quiz_assessment.QuestionRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Import câu hỏi trắc nghiệm từ Excel.
 * ─────────────────── FORMAT FILE EXCEL ───────────────────
 *  |  A  |       B           |      C         |  D  |  E  |  F  |  G  |   H        |    I      |  J   |
 *  | STT | Nội dung câu hỏi  | Loại câu hỏi   | A   | B   | C   | D   | Đáp án đúng| Giải thích| Điểm |
 *  - Cột B (index 1): bắt buộc, nếu trống → skip row
 *  - Cột C (index 2): SINGLE_CHOICE / MULTIPLE_CHOICE / TRUE_FALSE / SHORT_ANSWER (trống → dùng defaultQuestionType từ API)
 *  - Cột D–G (3–6): đáp án A/B/C/D (TRUE_FALSE tự sinh, SHORT_ANSWER bỏ qua)
 *  - Cột H (7): đáp án đúng, VD: "B" hoặc "A,C"
 *  - Cột I (8): giải thích (optional)
 *  - Cột J (9): điểm (optional, mặc định 1)
 */
@Slf4j @Service @RequiredArgsConstructor public class QuestionImportService {
    private final ExcelImportEngine importEngine;
    private final QuestionRepository questionRepository;
    private final CourseRepository courseRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final QuestionMapper mapper;
    private final QuestionValidator questionValidator;
    /** ObjectMapper riêng cho import — thread-safe. */
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Cột Excel (0-indexed) ──
    private static final int COL_CONTENT     = 1;
    private static final int COL_TYPE        = 2;
    private static final int COL_OPTION_A    = 3;
    private static final int COL_OPTION_B    = 4;
    private static final int COL_OPTION_C    = 5;
    private static final int COL_OPTION_D    = 6;
    private static final int COL_CORRECT     = 7;
    private static final int COL_EXPLANATION = 8;
    private static final int COL_POINTS      = 9;

    // ==================== PUBLIC ENTRY ====================

    /** Import câu hỏi từ file Excel theo course (và lesson nếu có) */
    public QuestionImportResponse importQuestions(MultipartFile file, Integer courseId, Integer lessonId, String defaultQuestionType) {
        // Validate course
        if (courseId == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "courseId không được để trống");
        }
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại: " + courseId));

        // Validate lesson nếu có — chấp nhận cả LESSON và VIDEO
        CourseResource lesson = null;
        if (lessonId != null) {
            lesson = courseResourceRepository.findById(lessonId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Bài học không tồn tại: " + lessonId));
            ResourceType type = lesson.getResourceType();
            if (type != ResourceType.LESSON && type != ResourceType.VIDEO) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Resource chỉ định phải là LESSON hoặc VIDEO, hiện tại: " + type);
            }
            if (lesson.getCourse() == null || !lesson.getCourse().getIdCourse().equals(courseId)) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Bài học phải thuộc cùng khóa học với câu hỏi");
            }
        }

        // Parse default type
        QuestionType fallbackType = parseDefaultType(defaultQuestionType);

        // AtomicInteger cho orderIndex — tránh trùng khi import nhiều row
        int startOrderIndex = 0;
        if (lesson != null) {
            startOrderIndex = questionRepository.findByLessonIdResource(lesson.getIdResource()).size();
        }
        final AtomicInteger orderCounter = new AtomicInteger(startOrderIndex);
        final Course finalCourse = course;
        final CourseResource finalLesson = lesson;

        // Build config cho engine
        ImportConfig<Question> config = ImportConfig.<Question>builder()
                .entityName("Câu hỏi")
                .parser(ctx -> parseQuestionRow(ctx, finalCourse, finalLesson, fallbackType, orderCounter))
                .validator(this::validateImportedQuestion)
                .batchSaver(questionRepository::saveAll)
                .build();

        // Chạy engine
        ImportResult<Question> result = importEngine.execute(file, config);

        // Map sang response
        List<QuestionResponse> responses = result.getImportedItems().stream().map(mapper::toResponse).collect(Collectors.toList());
        log.info("✅ Import câu hỏi cho course={}, lesson={}: {} OK / {} lỗi", courseId, lessonId, result.getSuccessCount(), result.getFailedCount());

        return QuestionImportResponse.builder()
                .entityName(result.getEntityName())
                .totalRows(result.getTotalRows())
                .successCount(result.getSuccessCount())
                .failedCount(result.getFailedCount())
                .importedQuestions(responses)
                .errors(result.getErrors())
                .build();
    }

    // ==================== PARSING ====================

    /** Parse 1 row Excel → Question (trả null nếu cột content trống để skip) */
    private Question parseQuestionRow(RowContext ctx, Course course, CourseResource lesson, QuestionType fallbackType, AtomicInteger orderCounter) {
        // Content (bắt buộc) — trống thì skip
        String content = ctx.getStringTrimmed(COL_CONTENT);
        if (content.isEmpty()) return null;

        // Type
        QuestionType type = resolveQuestionType(ctx, fallbackType);

        // Options → List<Map>
        List<Map<String, String>> optionsList = parseOptions(ctx, type);
        if (optionsList.isEmpty() && type != QuestionType.SHORT_ANSWER) {
            throw new IllegalArgumentException("Câu hỏi thiếu đáp án (A/B/C/D)");
        }

        // Correct answer → List<String>
        String correctStr = ctx.getStringTrimmed(COL_CORRECT);
        if (correctStr.isEmpty()) {
            throw new IllegalArgumentException("Thiếu đáp án đúng (cột H)");
        }
        List<String> correctAnswers = parseCorrectAnswers(correctStr, type, optionsList);

        // Serialize List → JSON String (entity là String)
        String optionsJson = toJson(optionsList);
        String correctAnswerJson = toJson(correctAnswers);

        // Points (optional, mặc định 1)
        BigDecimal points = BigDecimal.ONE;
        String pointsStr = ctx.getStringTrimmed(COL_POINTS);
        if (!pointsStr.isEmpty()) {
            try {
                points = new BigDecimal(pointsStr);
                if (points.signum() <= 0) throw new NumberFormatException();
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Điểm không hợp lệ: " + pointsStr);
            }
        }

        // Explanation (optional)
        String explanation = ctx.getStringTrimmed(COL_EXPLANATION);
        if (explanation.isEmpty()) explanation = null;

        // Tăng orderIndex cho từng row
        int orderIndex = orderCounter.getAndIncrement();

        return Question.builder()
                .course(course)
                .lesson(lesson)
                .content(content)
                .questionType(type)
                .options(optionsJson)
                .correctAnswer(correctAnswerJson)
                .explanation(explanation)
                .status(QuestionStatus.ACTIVE)
                .orderIndex(orderIndex)
                .points(points)
                .build();
    }

    /** Xác định loại câu hỏi từ cột C, fallback về defaultQuestionType nếu trống */
    private QuestionType resolveQuestionType(RowContext ctx, QuestionType fallbackType) {
        String raw = ctx.getStringTrimmed(COL_TYPE);
        if (raw.isEmpty()) {
            if (fallbackType == null) {
                throw new IllegalArgumentException("Thiếu loại câu hỏi (cột C) và không có defaultQuestionType");
            }
            return fallbackType;
        }
        try {
            return QuestionType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Loại câu hỏi không hợp lệ: " + raw);
        }
    }

    /** Parse options theo loại câu hỏi (TRUE_FALSE tự sinh, SHORT_ANSWER bỏ qua, còn lại đọc cột D–G) */
    private List<Map<String, String>> parseOptions(RowContext ctx, QuestionType type) {
        List<Map<String, String>> options = new ArrayList<>();
        // TRUE_FALSE: tự sinh
        if (type == QuestionType.TRUE_FALSE) {
            options.add(buildOption("TRUE", "Đúng"));
            options.add(buildOption("FALSE", "Sai"));
            return options;
        }
        // SHORT_ANSWER: không có options
        if (type == QuestionType.SHORT_ANSWER) return options;
        // SINGLE / MULTIPLE: đọc cột D–G
        int[] cols = {COL_OPTION_A, COL_OPTION_B, COL_OPTION_C, COL_OPTION_D};
        String[] labels = {"A", "B", "C", "D"};
        for (int i = 0; i < cols.length; i++) {
            String val = ctx.getStringTrimmed(cols[i]);
            if (!val.isEmpty()) {
                options.add(buildOption(labels[i], val));
            }
        }
        return options;
    }

    /** Parse đáp án đúng theo từng loại câu hỏi và validate với options */
    private List<String> parseCorrectAnswers(String correctStr, QuestionType type, List<Map<String, String>> options) {
        String normalized = correctStr.trim().toUpperCase();
        List<String> answers = new ArrayList<>();

        // SHORT_ANSWER: tách theo ; hoặc |
        if (type == QuestionType.SHORT_ANSWER) {
            for (String token : correctStr.split("[;|]")) {
                String t = token.trim();
                if (!t.isEmpty()) answers.add(t);
            }
            if (answers.isEmpty()) {
                throw new IllegalArgumentException("Đáp án SHORT_ANSWER rỗng");
            }
            return answers;
        }

        // TRUE_FALSE: chỉ TRUE/FALSE
        if (type == QuestionType.TRUE_FALSE) {
            if ("ĐÚNG".equals(normalized) || "TRUE".equals(normalized) || "T".equals(normalized)) {
                return List.of("TRUE");
            }
            if ("SAI".equals(normalized) || "FALSE".equals(normalized) || "F".equals(normalized)) {
                return List.of("FALSE");
            }
            throw new IllegalArgumentException("Đáp án TRUE_FALSE phải là TRUE/FALSE/Đúng/Sai");
        }

        // SINGLE / MULTIPLE: tách token và đối chiếu với labels của options
        Set<String> validLabels = options.stream().map(o -> o.get("label")).collect(Collectors.toSet());
        for (String token : normalized.split("[,\\s;|]+")) {
            String t = token.trim();
            if (t.isEmpty()) continue;
            if (!validLabels.contains(t)) {
                throw new IllegalArgumentException("Đáp án '" + t + "' không khớp với options đã nhập");
            }
            if (!answers.contains(t)) answers.add(t);
        }
        if (answers.isEmpty()) {
            throw new IllegalArgumentException("Không parse được đáp án đúng");
        }
        if (type == QuestionType.SINGLE_CHOICE && answers.size() > 1) {
            throw new IllegalArgumentException("SINGLE_CHOICE chỉ được có 1 đáp án đúng, nhận được: " + answers);
        }
        return answers;
    }

    // ==================== VALIDATION ====================

    /** Validate 1 câu hỏi import: gọi validator cũ + business rule theo loại câu hỏi */
    private void validateImportedQuestion(Question q, RowContext ctx) {
        // Gọi validator cũ
        try {
            questionValidator.validateForCreate(q);
        } catch (ErrorHandler e) {
            // Chuyển ErrorHandler → IllegalArgumentException để engine bắt per-row
            throw new IllegalArgumentException(e.getMessage());
        }

        // Bổ sung business rule theo loại câu hỏi
        QuestionType type = q.getQuestionType();
        List<Map<String, String>> options = readOptions(q.getOptions());
        List<String> answers = readAnswers(q.getCorrectAnswer());

        switch (type) {
            case SINGLE_CHOICE -> {
                if (answers.size() != 1) {
                    throw new IllegalArgumentException("SINGLE_CHOICE phải có đúng 1 đáp án đúng");
                }
                assertAnswersInOptions(answers, options);
            }
            case MULTIPLE_CHOICE -> {
                if (answers.size() < 2) {
                    throw new IllegalArgumentException("MULTIPLE_CHOICE phải có ít nhất 2 đáp án đúng");
                }
                assertAnswersInOptions(answers, options);
            }
            case TRUE_FALSE -> {
                if (answers.size() != 1 || (!"TRUE".equals(answers.get(0)) && !"FALSE".equals(answers.get(0)))) {
                    throw new IllegalArgumentException("TRUE_FALSE chỉ chấp nhận đáp án TRUE hoặc FALSE");
                }
            }
            case SHORT_ANSWER -> { /* Không cần check gì thêm */ }
        }
    }

    /** Đảm bảo mọi đáp án đúng đều nằm trong danh sách options */
    private void assertAnswersInOptions(List<String> answers, List<Map<String, String>> options) {
        Set<String> labels = options.stream().map(o -> o.get("label")).collect(Collectors.toSet());
        for (String ans : answers) {
            if (!labels.contains(ans)) {
                throw new IllegalArgumentException("Đáp án '" + ans + "' không nằm trong danh sách options");
            }
        }
    }

    // ==================== JSON HELPERS ====================

    /** Serialize object → JSON string */
    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new IllegalArgumentException("Không serialize được JSON: " + e.getMessage());
        }
    }

    /** Đọc JSON string → List<Map> options (trả rỗng nếu lỗi) */
    private List<Map<String, String>> readOptions(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
        } catch (Exception e) {
            return List.of();
        }
    }

    /** Đọc JSON string → List<String> answers (trả rỗng nếu lỗi) */
    private List<String> readAnswers(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return List.of();
        }
    }

    /** Tạo map option với label + content (giữ thứ tự) */
    private Map<String, String> buildOption(String label, String content) {
        Map<String, String> opt = new LinkedHashMap<>();
        opt.put("label", label);
        opt.put("content", content);
        return opt;
    }

    /** Parse defaultQuestionType từ API, trả null nếu trống */
    private QuestionType parseDefaultType(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return QuestionType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "defaultQuestionType không hợp lệ: " + raw);
        }
    }
}