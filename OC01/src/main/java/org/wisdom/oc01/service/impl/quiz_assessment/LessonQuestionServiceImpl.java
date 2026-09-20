package org.wisdom.oc01.service.impl.quiz_assessment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.dto.request.question.LessonQuestionRequest;
import org.wisdom.oc01.dto.response.question.LessonQuestionResponse;
import org.wisdom.oc01.entity.CourseResource;
import org.wisdom.oc01.entity.LessonQuestion;
import org.wisdom.oc01.entity.Question;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.LessonQuestionMapper;
import org.wisdom.oc01.generic.validator.LessonQuestionValidator;
import org.wisdom.oc01.repository.CourseResourceRepository;
import org.wisdom.oc01.repository.quiz_assessment.LessonQuestionRepository;
import org.wisdom.oc01.repository.quiz_assessment.QuestionRepository;
import org.wisdom.oc01.service.LessonQuestionService;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j @Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class LessonQuestionServiceImpl implements LessonQuestionService {
    private final LessonQuestionRepository lessonQuestionRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final QuestionRepository questionRepository;
    private final LessonQuestionMapper mapper;
    private final LessonQuestionValidator validator;

    // ==================== GET QUERIES (ReadOnly) ====================

    /** Lấy danh sách câu hỏi theo resource, sắp xếp theo orderIndex */
    @Override
    public List<LessonQuestionResponse> getQuestionsByResource(Integer resourceId) {
        return lessonQuestionRepository.findByResourceIdResourceOrderByOrderIndexAsc(resourceId).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    /** Lấy danh sách resource theo question */
    @Override
    public List<LessonQuestionResponse> getResourcesByQuestion(Integer questionId) {
        return lessonQuestionRepository.findByQuestionIdQuestion(questionId).stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    /** Lấy danh sách câu hỏi đầy đủ (entity) theo resource */
    @Override
    public List<Question> getFullQuestionsByResource(Integer resourceId) {
        return lessonQuestionRepository.findQuestionsByResource(resourceId);
    }

    // ==================== ASSIGN ====================

    /** Gán 1 câu hỏi vào resource */
    @Override @Transactional
    public LessonQuestionResponse assignQuestion(LessonQuestionRequest request) {
        CourseResource resource = courseResourceRepository.findById(request.getResourceId()).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Resource không tồn tại"));
        Question question = questionRepository.findById(request.getQuestionId()).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Câu hỏi không tồn tại"));
        // Kiểm tra ràng buộc: câu hỏi và resource phải thuộc cùng khóa học
        validateSameCourse(resource, question);
        if (lessonQuestionRepository.existsByResourceIdResourceAndQuestionIdQuestion(request.getResourceId(), request.getQuestionId())) {
            throw new ErrorHandler(HttpStatus.CONFLICT, "Câu hỏi đã được gán vào resource này rồi");
        }
        LessonQuestion lessonQuestion = mapper.toEntity(request);
        validator.validateForCreate(lessonQuestion);
        lessonQuestion = lessonQuestionRepository.save(lessonQuestion);
        return mapper.toResponse(lessonQuestion);
    }

    /** Gán nhiều câu hỏi vào resource cùng lúc */
    @Override @Transactional
    public List<LessonQuestionResponse> assignQuestions(Integer resourceId, List<Integer> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "Danh sách câu hỏi không được để trống");
        }
        CourseResource resource = courseResourceRepository.findById(resourceId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Resource không tồn tại"));
        // Batch query 1 lần lấy tất cả câu hỏi thay vì N+1 queries trong loop
        List<Integer> distinctInputIds = questionIds.stream().distinct().collect(Collectors.toList());
        List<Question> questions = questionRepository.findAllById(distinctInputIds);
        if (questions.size() != distinctInputIds.size()) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Một hoặc nhiều câu hỏi không tồn tại trong hệ thống");
        }
        // Validate tất cả câu hỏi phải thuộc cùng Course với Resource
        for (Question question : questions) {
            validateSameCourse(resource, question);
        }
        // Lấy danh sách gán hiện tại để kiểm tra trùng lặp và tính orderIndex bắt đầu
        List<LessonQuestion> existingAssignments = lessonQuestionRepository.findByResourceIdResourceOrderByOrderIndexAsc(resourceId);
        Set<Integer> existingQuestionIds = existingAssignments.stream().map(lq -> lq.getQuestion().getIdQuestion()).collect(Collectors.toSet());
        Map<Integer, Question> questionMap = questions.stream().collect(Collectors.toMap(Question::getIdQuestion, q -> q));
        int nextOrderIndex = existingAssignments.size();
        List<LessonQuestion> newAssignments = new ArrayList<>();
        // Giữ đúng thứ tự từ danh sách questionIds gửi lên
        for (Integer qId : questionIds) {
            if (!existingQuestionIds.contains(qId)) {
                Question question = questionMap.get(qId);
                if (question != null) {
                    LessonQuestion lessonQuestion = LessonQuestion.builder().resource(resource).question(question).orderIndex(nextOrderIndex++).points(java.math.BigDecimal.ONE).build();
                    validator.validateForCreate(lessonQuestion);
                    newAssignments.add(lessonQuestion);
                    existingQuestionIds.add(qId); // Chống trùng lặp nếu input có ID lặp lại
                }
            }
        }
        // Batch save toàn bộ bằng saveAll
        if (!newAssignments.isEmpty()) {
            lessonQuestionRepository.saveAll(newAssignments);
        }
        return getQuestionsByResource(resourceId);
    }

    // ==================== UPDATE ====================

    /** Cập nhật assignment (orderIndex, points, ...) */
    @Override @Transactional
    public LessonQuestionResponse updateAssignment(Integer id, LessonQuestionRequest request) {
        LessonQuestion lessonQuestion = lessonQuestionRepository.findById(id).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Assignment không tồn tại"));
        mapper.updateEntity(lessonQuestion, request);
        validator.validateForUpdate(lessonQuestion);
        lessonQuestion = lessonQuestionRepository.save(lessonQuestion);
        return mapper.toResponse(lessonQuestion);
    }

    // ==================== UNASSIGN ====================

    /** Bỏ gán 1 câu hỏi khỏi resource và re-index lại orderIndex */
    @Override @Transactional
    public void unassignQuestion(Integer resourceId, Integer questionId) {
        // Truy vấn danh sách 1 lần duy nhất
        List<LessonQuestion> assignments = lessonQuestionRepository.findByResourceIdResourceOrderByOrderIndexAsc(resourceId);
        LessonQuestion targetToDelete = assignments.stream().filter(lq -> lq.getQuestion().getIdQuestion().equals(questionId)).findFirst().orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Câu hỏi chưa được gán vào resource này"));
        // Xóa bản ghi được chỉ định
        lessonQuestionRepository.delete(targetToDelete);
        assignments.remove(targetToDelete);
        // Re-index trực tiếp trên memory và batch update bằng saveAll
        int newIndex = 0;
        for (LessonQuestion lq : assignments) {
            lq.setOrderIndex(newIndex++);
        }
        if (!assignments.isEmpty()) {
            lessonQuestionRepository.saveAll(assignments);
        }
    }

    /** Xóa toàn bộ câu hỏi đã gán khỏi resource */
    @Override @Transactional
    public void removeAllQuestionsFromResource(Integer resourceId) {
        lessonQuestionRepository.deleteByResourceIdResource(resourceId);
    }

    // ==================== HELPER METHODS ====================

    /** Validate câu hỏi và resource phải thuộc cùng một khóa học */
    private void validateSameCourse(CourseResource resource, Question question) {
        if (resource.getCourse() == null || question.getCourse() == null || !resource.getCourse().getIdCourse().equals(question.getCourse().getIdCourse())) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, String.format("Câu hỏi (ID: %d) và Bài học/Quiz phải thuộc cùng một khóa học", question.getIdQuestion()));
        }
    }
}