// ============================================
// ChapterService.java - Service Interface
// ============================================
package org.wisdom.oc01.service;

import org.wisdom.oc01.dto.request.ChapterRequest;
import org.wisdom.oc01.dto.request.UpdateOrderRequest;
import org.wisdom.oc01.dto.response.ChapterResponse;
import java.util.List;

public interface ChapterService {
    // ==================== GET ====================

    /** Lấy chương của khóa học */
    List<ChapterResponse> getChaptersByCourse(Integer courseId);

    /** Lấy chương theo ID */
    ChapterResponse getChapterById(Integer chapterId);

    /** Lấy chương kèm bài học */
    ChapterResponse getChapterWithLessons(Integer chapterId);

    // ==================== CREATE ====================

    /** Tạo chương mới */
    ChapterResponse createChapter(Integer courseId, ChapterRequest request);

    // ==================== UPDATE ====================

    /** Cập nhật chương */
    ChapterResponse updateChapter(Integer chapterId, ChapterRequest request);

    /** Cập nhật thứ tự chương */
    ChapterResponse updateOrderIndex(Integer chapterId, Integer newOrderIndex);

    /** Cập nhật thứ tự hàng loạt */
    void updateOrderBatch(List<UpdateOrderRequest> updates);

    // ==================== DELETE ====================

    /** Xóa chương */
    void deleteChapter(Integer chapterId);
}