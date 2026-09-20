// ============================================
// ChapterServiceImpl.java - Service Implementation (FIXED IDOR + N+1)
// ============================================
package org.wisdom.oc01.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.config.SecurityUtils;
import org.wisdom.oc01.dto.request.ChapterRequest;
import org.wisdom.oc01.dto.request.UpdateOrderRequest;
import org.wisdom.oc01.dto.response.ChapterResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Chapter;
import org.wisdom.oc01.entity.Course;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.ChapterMapper;
import org.wisdom.oc01.generic.validator.ChapterValidator;
import org.wisdom.oc01.repository.ChapterRepository;
import org.wisdom.oc01.repository.CourseRepository;
import org.wisdom.oc01.service.ChapterService;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;
    private final CourseRepository courseRepository;
    private final ChapterValidator validator;
    private final ChapterMapper mapper;

    // ==================== AUTHORIZATION HELPERS ====================

    private boolean isAdmin(Account account) {
        return account != null
                && account.getRole() != null
                && "ADMIN".equalsIgnoreCase(account.getRole().getRoleName());
    }

    /**
     * Đảm bảo current user là owner của course (giảng viên tạo course) hoặc admin.
     * Ném 403 nếu không có quyền.
     */
    private void assertCourseOwnership(Course course) {
        if (course == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Khóa học không tồn tại");
        }
        Account current = SecurityUtils.requireCurrentAccount();
        if (isAdmin(current)) return;

        if (course.getAccount() == null
                || !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền thao tác trên khóa học này");
        }
    }

    /**
     * Load chapter và enforce ownership qua course.
     * Trả 404 (không phải 403) để tránh rò rỉ sự tồn tại.
     */
    private Chapter loadOwnedChapter(Integer chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Chương không tồn tại"));

        Account current = SecurityUtils.requireCurrentAccount();
        if (isAdmin(current)) return chapter;

        Course course = chapter.getCourse();
        if (course == null || course.getAccount() == null
                || !course.getAccount().getIdAccount().equals(current.getIdAccount())) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Chương không tồn tại");
        }
        return chapter;
    }

    // ==================== GET ====================

    /** Lấy danh sách chương theo course, sắp xếp theo orderIndex, kèm lessons */
    @Override
    @Transactional(readOnly = true)
    public List<ChapterResponse> getChaptersByCourse(Integer courseId) {
        return chapterRepository.findByCourseIdCourseOrderByOrderIndexAsc(courseId)
                .stream()
                .map(chapter -> mapper.toResponse(chapter, true))
                .collect(Collectors.toList());
    }

    /** Lấy chương theo ID (không kèm lessons) */
    @Override
    @Transactional(readOnly = true)
    public ChapterResponse getChapterById(Integer chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Chương không tồn tại"));
        return mapper.toResponse(chapter, false);
    }

    /** Lấy chương theo ID kèm lessons */
    @Override
    @Transactional(readOnly = true)
    public ChapterResponse getChapterWithLessons(Integer chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Chương không tồn tại"));
        return mapper.toResponse(chapter, true);
    }

    // ==================== CREATE ====================

    /**
     * Tạo chương mới.
     * FIXED [CRITICAL]: chỉ instructor của course (hoặc admin) mới được tạo chapter.
     */
    @Override
    @Transactional
    public ChapterResponse createChapter(Integer courseId, ChapterRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Khóa học không tồn tại"));

        // FIXED: enforce ownership
        assertCourseOwnership(course);

        Chapter lastChapter = chapterRepository
                .findTopByCourseIdCourseOrderByOrderIndexDesc(courseId);
        int nextOrder = (lastChapter != null) ? lastChapter.getOrderIndex() + 1 : 0;

        Chapter chapter = new Chapter();
        chapter.setTitle(request.getTitle());
        chapter.setDescription(request.getDescription());
        chapter.setCourse(course);
        chapter.setOrderIndex(request.getOrderIndex() != null
                ? request.getOrderIndex() : nextOrder);

        validator.validateForCreate(chapter);
        chapter = chapterRepository.save(chapter);

        log.info("Chapter #{} created in course #{}", chapter.getIdChapter(), courseId);
        return mapper.toResponse(chapter, false);
    }

    // ==================== UPDATE ====================

    /**
     * Cập nhật chương.
     * FIXED [CRITICAL]: enforce ownership qua loadOwnedChapter.
     */
    @Override
    @Transactional
    public ChapterResponse updateChapter(Integer chapterId, ChapterRequest request) {
        Chapter chapter = loadOwnedChapter(chapterId);

        chapter.setTitle(request.getTitle());
        chapter.setDescription(request.getDescription());
        if (request.getOrderIndex() != null) {
            chapter.setOrderIndex(request.getOrderIndex());
        }
        validator.validateForUpdate(chapter);
        chapter = chapterRepository.save(chapter);
        return mapper.toResponse(chapter, false);
    }

    // ==================== DELETE ====================

    /**
     * Xóa chương.
     * FIXED [CRITICAL]: enforce ownership.
     */
    @Override
    @Transactional
    public void deleteChapter(Integer chapterId) {
        Chapter chapter = loadOwnedChapter(chapterId);
        validator.validateForDelete(chapter);
        chapterRepository.delete(chapter);
        log.info("Chapter #{} deleted", chapterId);
    }

    // ==================== UPDATE ORDER ====================

    /**
     * Cập nhật orderIndex cho 1 chương.
     * FIXED [CRITICAL]: enforce ownership.
     */
    @Override
    @Transactional
    public ChapterResponse updateOrderIndex(Integer chapterId, Integer newOrderIndex) {
        Chapter chapter = loadOwnedChapter(chapterId);
        chapter.setOrderIndex(newOrderIndex);
        validator.validate(chapter);
        chapter = chapterRepository.save(chapter);
        return mapper.toResponse(chapter, false);
    }

    /**
     * Cập nhật orderIndex hàng loạt.
     *
     * FIXED [CRITICAL]:
     *  - Enforce ownership cho TẤT CẢ chapter.
     *  - Batch load thay vì N+1 (mỗi item 1 query).
     *  - Bỏ System.out.println → dùng log.
     *  - Batch save thay vì save từng cái.
     */
    @Override
    @Transactional
    public void updateOrderBatch(List<UpdateOrderRequest> updates) {
        if (updates == null || updates.isEmpty()) {
            return;
        }

        log.info("[updateOrderBatch] Processing {} items", updates.size());

        // 1. Gom tất cả id
        List<Integer> ids = updates.stream()
                .map(UpdateOrderRequest::getIdChapter)
                .toList();

        // 2. Batch load — 1 query duy nhất (fix N+1)
        List<Chapter> chapters = chapterRepository.findAllById(ids);
        Map<Integer, Chapter> chapterMap = chapters.stream()
                .collect(Collectors.toMap(Chapter::getIdChapter, Function.identity()));

        // 3. Verify tất cả tồn tại
        if (chapterMap.size() != ids.size()) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND,
                    "Một số chương không tồn tại");
        }

        // 4. Verify ownership — mọi chapter phải thuộc course của current user
        Account current = SecurityUtils.requireCurrentAccount();
        boolean admin = isAdmin(current);
        for (Chapter chapter : chapters) {
            Course course = chapter.getCourse();
            if (!admin && (course == null || course.getAccount() == null
                    || !course.getAccount().getIdAccount().equals(current.getIdAccount()))) {
                throw new ErrorHandler(HttpStatus.FORBIDDEN,
                        "Bạn không có quyền cập nhật chương #" + chapter.getIdChapter());
            }
        }

        // 5. Update
        for (UpdateOrderRequest update : updates) {
            Chapter chapter = chapterMap.get(update.getIdChapter());
            chapter.setOrderIndex(update.getOrderIndex());
        }

        // 6. Batch save + flush
        chapterRepository.saveAll(chapters);
        chapterRepository.flush();

        log.info("[updateOrderBatch] Done — {} chapters updated", chapters.size());
    }
}