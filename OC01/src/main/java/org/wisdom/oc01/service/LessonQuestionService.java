// ============================================
// LessonQuestionService.java - Service Interface
// ============================================
package org.wisdom.oc01.service;



import org.wisdom.oc01.dto.request.question.LessonQuestionRequest;
import org.wisdom.oc01.dto.response.question.LessonQuestionResponse;

import java.util.List;

public interface LessonQuestionService {

    // Lấy tất cả câu hỏi của 1 resource (lesson/quiz)
    List<LessonQuestionResponse> getQuestionsByResource(Integer resourceId);

    // Lấy tất cả resources chứa 1 question
    List<LessonQuestionResponse> getResourcesByQuestion(Integer questionId);

    // Gán câu hỏi vào resource
    LessonQuestionResponse assignQuestion(LessonQuestionRequest request);

    // Gán nhiều câu hỏi vào resource
    List<LessonQuestionResponse> assignQuestions(Integer resourceId, List<Integer> questionIds);

    // Cập nhật thông tin gán (orderIndex, points)
    LessonQuestionResponse updateAssignment(Integer id, LessonQuestionRequest request);

    // Bỏ gán câu hỏi khỏi resource
    void unassignQuestion(Integer resourceId, Integer questionId);

    // Xóa tất cả câu hỏi của resource
    void removeAllQuestionsFromResource(Integer resourceId);

    // Lấy danh sách câu hỏi đầy đủ (Question entity) của resource
    List<org.wisdom.oc01.entity.Question> getFullQuestionsByResource(Integer resourceId);
}