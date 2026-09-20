// ============================================
// CourseResourceController.java - Controller
// ============================================
package org.wisdom.oc01.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.resource.CourseResourceRequest;
import org.wisdom.oc01.dto.response.CourseResourceResponse;
import org.wisdom.oc01.service.CourseResourceService;

import java.util.List;
import java.util.Map;

/**
 * ============================================================
 * COURSE RESOURCE CONTROLLER - QUẢN LÝ TÀI NGUYÊN HỌC TẬP
 * ============================================================
 *
 * 1. [ALL] Lấy danh sách resource của khóa học
 * 2. [ALL] Lấy danh sách resource theo chương
 * 3. [ALL] Lấy danh sách resource con (thuộc lesson)
 * 4. [ALL] Lấy resource theo ID
 * 5. [TEACHER/ADMIN] Upload resource
 * 6. [TEACHER/ADMIN] Thêm resource bằng link
 * 7. [TEACHER/ADMIN] Cập nhật resource
 * 8. [TEACHER/ADMIN] Xóa resource
 * 9. [TEACHER/ADMIN] Xuất bản resource
 * 10. [TEACHER/ADMIN] Chuyển resource về nháp
 * 11. [TEACHER/ADMIN] Cập nhật chapter cho resource
 * ============================================================
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseResourceController {

    private final CourseResourceService resourceService;

    // ==================== GET ====================

    // 1. LẤY DANH SÁCH RESOURCE CỦA KHÓA HỌC
    @GetMapping("/courses/{courseId}/resources")
    public ResponseEntity<RequestResponse> getByCourse(@PathVariable Integer courseId) {
        List<CourseResourceResponse> resources = resourceService.getResourcesByCourse(courseId);
        return ResponseEntity.ok(new RequestResponse(resources, "Lấy danh sách resource thành công"));
    }

    // 2. LẤY DANH SÁCH RESOURCE THEO CHƯƠNG
    @GetMapping("/courses/{courseId}/chapters/{chapterId}/resources")
    public ResponseEntity<RequestResponse> getByChapter(
            @PathVariable Integer courseId,
            @PathVariable Integer chapterId) {
        List<CourseResourceResponse> resources = resourceService.getResourcesByChapter(courseId, chapterId);
        return ResponseEntity.ok(new RequestResponse(resources, "Lấy danh sách resource theo chương thành công"));
    }

    // 3. LẤY DANH SÁCH RESOURCE CON (THUỘC LESSON)
    @GetMapping("/courses/{courseId}/resources/{resourceId}/children")
    public ResponseEntity<RequestResponse> getByParent(
            @PathVariable Integer courseId,
            @PathVariable Integer resourceId) {
        List<CourseResourceResponse> resources = resourceService.getResourcesByParent(courseId, resourceId);
        return ResponseEntity.ok(new RequestResponse(resources, "Lấy danh sách resource con thành công"));
    }

    // 4. LẤY RESOURCE THEO ID
    @GetMapping("/resources/{resourceId}")
    public ResponseEntity<RequestResponse> getById(@PathVariable Integer resourceId) {
        CourseResourceResponse resource = resourceService.getResourceById(resourceId);
        return ResponseEntity.ok(new RequestResponse(resource, "Lấy resource thành công"));
    }

    // ==================== CREATE ====================

    // 5. UPLOAD RESOURCE
    @PostMapping("/courses/{courseId}/resources/upload")
    public ResponseEntity<RequestResponse> upload(
            @PathVariable Integer courseId,
            @ModelAttribute CourseResourceRequest request) {
        CourseResourceResponse resource = resourceService.uploadResource(courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(resource, "Upload resource thành công"));
    }

    // 6. THÊM RESOURCE BẰNG LINK
    @PostMapping("/courses/{courseId}/resources/link")
    public ResponseEntity<RequestResponse> addByLink(
            @PathVariable Integer courseId,
            @RequestBody CourseResourceRequest request) {
        CourseResourceResponse resource = resourceService.addResourceByLink(courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse(resource, "Thêm resource bằng link thành công"));
    }

    // ==================== UPDATE ====================

    // 7. CẬP NHẬT RESOURCE
    @PutMapping("/courses/{courseId}/resources/{resourceId}")
    public ResponseEntity<RequestResponse> update(
            @PathVariable Integer courseId,
            @PathVariable Integer resourceId,
            @ModelAttribute CourseResourceRequest request) {
        CourseResourceResponse resource = resourceService.updateResource(resourceId, request);
        return ResponseEntity.ok(new RequestResponse(resource, "Cập nhật resource thành công"));
    }

    // 11. CẬP NHẬT CHAPTER CHO RESOURCE
    @PutMapping("/courses/{courseId}/resources/{resourceId}/chapter")
    public ResponseEntity<RequestResponse> updateResourceChapter(
            @PathVariable Integer courseId,
            @PathVariable Integer resourceId,
            @RequestBody Map<String, Object> body) {

        Integer chapterId = null;
        if (body.get("chapterId") != null) {
            chapterId = Integer.parseInt(body.get("chapterId").toString());
        }

        CourseResourceResponse resource = resourceService.updateResourceChapter(resourceId, chapterId);
        return ResponseEntity.ok(new RequestResponse(resource, "Cập nhật chapter thành công"));
    }

    // 9. XUẤT BẢN RESOURCE
    @PutMapping("/resources/{resourceId}/publish")
    public ResponseEntity<RequestResponse> publish(@PathVariable Integer resourceId) {
        CourseResourceResponse resource = resourceService.publishResource(resourceId);
        return ResponseEntity.ok(new RequestResponse(resource, "Xuất bản resource thành công"));
    }

    // 10. CHUYỂN RESOURCE VỀ NHÁP
    @PutMapping("/resources/{resourceId}/unpublish")
    public ResponseEntity<RequestResponse> unpublish(@PathVariable Integer resourceId) {
        CourseResourceResponse resource = resourceService.unpublishResource(resourceId);
        return ResponseEntity.ok(new RequestResponse(resource, "Chuyển resource về nháp thành công"));
    }

    // ==================== DELETE ====================

    // 8. XÓA RESOURCE
    @DeleteMapping("/courses/{courseId}/resources/{resourceId}")
    public ResponseEntity<RequestResponse> delete(
            @PathVariable Integer courseId,
            @PathVariable Integer resourceId) {
        resourceService.deleteResource(resourceId);
        return ResponseEntity.ok(new RequestResponse("Xóa resource thành công"));
    }
}