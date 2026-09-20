package org.wisdom.oc01.service.impl.quiz_assessment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.request.question.QuestionRequest;
import org.wisdom.oc01.dto.response.question.QuestionLearnerResponse;
import org.wisdom.oc01.dto.response.question.QuestionResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.entity.CourseResource;
import org.wisdom.oc01.entity.CourseResource.ResourceType;
import org.wisdom.oc01.entity.Question;
import org.wisdom.oc01.entity.Question.QuestionStatus;
import org.wisdom.oc01.entity.Question.QuestionType;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.QuestionMapper;
import org.wisdom.oc01.generic.validator.QuestionValidator;
import org.wisdom.oc01.repository.CourseRepository;
import org.wisdom.oc01.repository.CourseResourceRepository;
import org.wisdom.oc01.repository.quiz_assessment.LessonQuestionRepository;
import org.wisdom.oc01.repository.quiz_assessment.QuestionRepository;
import org.wisdom.oc01.service.QuestionService;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final CourseRepository courseRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final LessonQuestionRepository lessonQuestionRepository;
    private final QuestionValidator validator;
    private final QuestionMapper mapper;

    // ==================== AUTHORIZATION HELPERS ====================

    private boolean isAdmin(Account account) {
        return account != null
                && account.getRole() != null
                && "ADMIN".equalsIgnoreCase(account.getRole().getRoleName());
    }

    /**
     * READ: kiểm tra current user được xem course không.
     *  - Course PUBLISHED → public (kể cả anonymous).
     *  - Course chưa PUBLISHED → chỉ owner hoặc admin. Khác → 404.
     */
    private void assertCanReadCourse(Course course) {
        if (course == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại");
        }
        if (course.getStatus() == Course.CourseStatus.PUBLISHED) {
            return;
        }

        Account current = SecurityUtils.getCurrentAccount();
        boolean allowed = current != null
                && (isAdmin(current)
                || (course.getAccount() != null
                && course.getAccount().getIdAccount()
                .equals(current.getIdAccount())));
        if (!allowed) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại");
        }
    }

    /**
     * READ: kiểm tra current user được xem resource không.
     *  - Resource PUBLISHED + Course PUBLISHED → public.
     *  - Ngược lại → chỉ owner hoặc admin. Khác → 404.
     */
    private void assertCanReadResource(CourseResource resource) {
        boolean publicViewable = resource.getStatus() == CourseResource.Status.PUBLISHED
                && resource.getCourse() != null
                && resource.getCourse().getStatus() == Course.CourseStatus.PUBLISHED;

        if (publicViewable) return;

        Account current = SecurityUtils.getCurrentAccount();
        boolean allowed = current != null
                && (isAdmin(current)
                || (resource.getCourse() != null
                && resource.getCourse().getAccount() != null
                && resource.getCourse().getAccount().getIdAccount()
                .equals(current.getIdAccount())));
        if (!allowed) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Resource không tồn tại");
        }
    }

    // ==================== CREATE ====================

    @Override
    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Khóa học không tồn tại"));
        CourseResource lesson = validateAndGetLesson(request.getLessonId(),
                course.getIdCourse());

        QuestionType type = parseQuestionType(request.getQuestionType());
        QuestionStatus status = parseQuestionStatus(request.getStatus(),
                QuestionStatus.ACTIVE);

        Question question = Question.builder()
                .course(course)
                .lesson(lesson)
                .content(request.getContent())
                .questionType(type)
                .options(request.getOptions())
                .correctAnswer(request.getCorrectAnswer())
                .explanation(request.getExplanation())
                .status(status)
                .orderIndex(request.getOrderIndex())
                .points(request.getPoints() != null
                        ? request.getPoints() : java.math.BigDecimal.ONE)
                .build();

        validator.validateForCreate(question);
        question = questionRepository.save(question);
        return mapper.toResponse(question);
    }

    // ==================== UPDATE ====================

    @Override
    @Transactional
    public QuestionResponse updateQuestion(Integer questionId, QuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Câu hỏi không tồn tại"));

        Course targetCourse = question.getCourse();
        if (request.getCourseId() != null
                && !request.getCourseId().equals(targetCourse.getIdCourse())) {
            targetCourse = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                            "Khóa học mới không tồn tại"));
            question.setCourse(targetCourse);
        }

        if (request.getLessonId() != null) {
            CourseResource lesson = validateAndGetLesson(request.getLessonId(),
                    targetCourse.getIdCourse());
            question.setLesson(lesson);
        } else {
            question.setLesson(null);
        }

        if (request.getQuestionType() != null) {
            question.setQuestionType(parseQuestionType(request.getQuestionType()));
        }
        if (request.getStatus() != null) {
            question.setStatus(parseQuestionStatus(request.getStatus(),
                    question.getStatus()));
        }

        question.setContent(request.getContent());
        question.setOptions(request.getOptions());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setExplanation(request.getExplanation());
        question.setOrderIndex(request.getOrderIndex());
        question.setPoints(request.getPoints());

        validator.validateForUpdate(question);
        question = questionRepository.save(question);
        return mapper.toResponse(question);
    }

    // ==================== DELETE ====================

    @Override
    @Transactional
    public void deleteQuestion(Integer questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Câu hỏi không tồn tại"));
        questionRepository.delete(question);
    }

    // ==================== GET — FULL VIEW (ADMIN / INSTRUCTOR) ====================

    @Override
    public QuestionResponse getQuestionById(Integer questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Câu hỏi không tồn tại"));
        return mapper.toResponse(question);
    }

    @Override
    public Page<QuestionResponse> getQuestionsByCourse(Integer courseId, Pageable pageable) {
        return questionRepository.findByCourseIdCourse(courseId, pageable)
                .map(mapper::toResponse);
    }

    @Override
    public List<QuestionResponse> getAllQuestionsByCourse(Integer courseId) {
        return questionRepository.findByCourseIdCourse(courseId).stream()
                .map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<QuestionResponse> getQuestionsByLesson(Integer lessonId) {
        return questionRepository.findByLessonIdResource(lessonId).stream()
                .map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public Page<QuestionResponse> getQuestionsByLessonPaginated(Integer lessonId,
                                                                Pageable pageable) {
        return questionRepository.findByLessonIdResource(lessonId, pageable)
                .map(mapper::toResponse);
    }

    @Override
    public List<QuestionResponse> getQuestionsByLessons(List<Integer> lessonIds) {
        if (lessonIds == null || lessonIds.isEmpty()) return List.of();
        return questionRepository.findByLessonIdResourceIn(lessonIds).stream()
                .map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<QuestionResponse> getRandomQuestionsByLessons(List<Integer> lessonIds,
                                                              Integer limit) {
        if (lessonIds == null || lessonIds.isEmpty()) return List.of();
        int validLimit = (limit == null || limit <= 0) ? 10 : limit;
        return questionRepository.findRandomQuestionsByLessons(lessonIds, validLimit).stream()
                .map(mapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<QuestionResponse> getRandomQuestions(Integer courseId, Integer limit) {
        int validLimit = (limit == null || limit <= 0) ? 10 : limit;
        return questionRepository.findRandomQuestionsByCourse(courseId, validLimit).stream()
                .map(mapper::toResponse).collect(Collectors.toList());
    }

    // ==================== GET — LEARNER VIEW (KHÔNG ĐÁP ÁN) ====================

    /**
     * Lấy câu hỏi theo lesson (phân trang) — learner view.
     * FIXED [CRITICAL]: learner view không trả đáp án.
     * FIXED [HIGH]: enforce read authorization — verify lesson thuộc course được phép xem.
     */
    @Override
    public Page<QuestionLearnerResponse> getQuestionsByLessonPaginatedLearner(
            Integer lessonId, Pageable pageable) {
        // Verify lesson tồn tại + được phép xem
        CourseResource lesson = courseResourceRepository.findById(lessonId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Bài học không tồn tại"));
        assertCanReadResource(lesson);

        return questionRepository.findByLessonIdResource(lessonId, pageable)
                .map(mapper::toLearnerResponse);
    }

    /**
     * Lấy câu hỏi của quiz — learner view.
     *
     * FIXED [CRITICAL]:
     *  - Không trả correctAnswer / explanation.
     *  FIXED [HIGH]:
     *  - Fix N+1 — batch fetch thay vì query từng câu.
     *  FIXED [CRITICAL - READ IDOR]:
     *  - Verify quiz (chính là CourseResource) tồn tại + user có quyền đọc.
     */
    @Override
    public List<QuestionLearnerResponse> getQuestionsByQuizLearner(Integer quizId) {
        // 1. Load quiz (chính là CourseResource) — verify + check quyền đọc
        CourseResource quiz = courseResourceRepository.findById(quizId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Quiz không tồn tại"));

        if (quiz.getResourceType() != ResourceType.QUIZ) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Resource không phải là quiz");
        }

        // 2. Enforce read authorization (quiz PUBLISHED + course PUBLISHED → public;
        //    ngược lại → owner/admin)
        assertCanReadResource(quiz);

        // 3. Lấy questionIds (1 query)
        List<Integer> questionIds = lessonQuestionRepository
                .findQuestionsByResource(quizId)
                .stream()
                .map(Question::getIdQuestion)
                .collect(Collectors.toList());

        if (questionIds.isEmpty()) return List.of();

        // 4. Batch load questions (1 query) + map learner view
        return questionRepository.findAllById(questionIds).stream()
                .map(mapper::toLearnerResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy câu hỏi của course (phân trang) — learner view.
     * FIXED [CRITICAL - READ IDOR]: enforce read authorization trên course.
     */
    @Override
    public Page<QuestionLearnerResponse> getQuestionsByCourseLearner(
            Integer courseId, Pageable pageable) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Khóa học không tồn tại"));
        assertCanReadCourse(course);

        return questionRepository.findByCourseIdCourse(courseId, pageable)
                .map(mapper::toLearnerResponse);
    }

    /**
     * Lấy TẤT CẢ câu hỏi của course — learner view.
     * FIXED [CRITICAL - READ IDOR]: enforce read authorization.
     */
    @Override
    public List<QuestionLearnerResponse> getAllQuestionsByCourseLearner(Integer courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Khóa học không tồn tại"));
        assertCanReadCourse(course);

        return questionRepository.findByCourseIdCourse(courseId).stream()
                .map(mapper::toLearnerResponse).collect(Collectors.toList());
    }

    /**
     * Lấy câu hỏi ngẫu nhiên của course — learner view.
     * FIXED [CRITICAL - READ IDOR]: enforce read authorization.
     */
    @Override
    public List<QuestionLearnerResponse> getRandomQuestionsLearner(Integer courseId,
                                                                   Integer limit) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Khóa học không tồn tại"));
        assertCanReadCourse(course);

        int validLimit = (limit == null || limit <= 0) ? 10 : limit;
        return questionRepository.findRandomQuestionsByCourse(courseId, validLimit).stream()
                .map(mapper::toLearnerResponse).collect(Collectors.toList());
    }

    // ==================== HELPER METHODS ====================

    private CourseResource validateAndGetLesson(Integer lessonId, Integer expectedCourseId) {
        if (lessonId == null) return null;
        CourseResource lesson = courseResourceRepository.findById(lessonId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Bài học không tồn tại"));
        if (lesson.getResourceType() != ResourceType.LESSON) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Tài nguyên chỉ định không phải là Bài học (LESSON)");
        }
        if (!lesson.getCourse().getIdCourse().equals(expectedCourseId)) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Bài học phải thuộc cùng khóa học với câu hỏi");
        }
        return lesson;
    }

    private QuestionType parseQuestionType(String rawType) {
        if (rawType == null || rawType.trim().isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Loại câu hỏi không được để trống");
        }
        try {
            return QuestionType.valueOf(rawType.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Loại câu hỏi không hợp lệ: " + rawType);
        }
    }

    private QuestionStatus parseQuestionStatus(String rawStatus,
                                               QuestionStatus defaultValue) {
        if (rawStatus == null || rawStatus.trim().isEmpty()) return defaultValue;
        try {
            return QuestionStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Trạng thái câu hỏi không hợp lệ: " + rawStatus);
        }
    }

    public List<Integer> parseLessonIdsFromHashtagFilter(String hashtagFilter) {
        if (hashtagFilter == null || hashtagFilter.trim().isEmpty()) return List.of();
        return Arrays.stream(hashtagFilter.split(","))
                .map(String::trim)
                .filter(tag -> tag.startsWith("#lesson-"))
                .map(tag -> {
                    try {
                        return Integer.parseInt(tag.substring("#lesson-".length()));
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}