// src/main/java/org/wisdom/oc01/controller/chat/ChatContactController.java
package org.wisdom.oc01.controller.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.service.ChatService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat/contacts")
@RequiredArgsConstructor
public class ChatContactController {

    private final ChatService chatService;

    /**
     * Lấy danh sách giảng viên để bắt đầu chat
     * GET /api/chat/contacts/teachers
     */
    @GetMapping("/teachers")
    public ResponseEntity<RequestResponse> getTeachers() {
        List<Map<String, Object>> teachers = chatService.getTeachers();
        return ResponseEntity.ok(new RequestResponse(teachers, "Lấy danh sách giảng viên thành công"));
    }

    /**
     * Lấy danh sách khóa học theo role
     * GET /api/chat/contacts/courses
     */
    @GetMapping("/courses")
    public ResponseEntity<RequestResponse> getMyCourses() {
        List<Map<String, Object>> courses = chatService.getMyCourses();
        return ResponseEntity.ok(new RequestResponse(courses, "Lấy danh sách khóa học thành công"));
    }

    /**
     * Lấy danh sách học viên của khóa học
     * GET /api/chat/contacts/courses/{courseId}/students
     */
    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<RequestResponse> getStudentsByCourse(@PathVariable Integer courseId) {
        List<Map<String, Object>> students = chatService.getStudentsByCourse(courseId);
        return ResponseEntity.ok(new RequestResponse(students, "Lấy danh sách học viên thành công"));
    }
}