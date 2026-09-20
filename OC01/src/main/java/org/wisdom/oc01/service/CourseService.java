package org.wisdom.oc01.service;

import org.springframework.data.domain.Page;
import org.wisdom.oc01.dto.request.CourseRequest;
import org.wisdom.oc01.dto.request.CourseSearchRequest;
import org.wisdom.oc01.dto.response.CourseResponse;
import org.wisdom.oc01.dto.response.HomePageCourseResponse;
import org.wisdom.oc01.entity.Course;

public interface CourseService {
    Course createCourse(CourseRequest request, Integer accountId);
    Course updateCourse(Integer id, CourseRequest request);
    void deleteCourse(Integer id);
    CourseResponse getCourseById(Integer id);
    CourseResponse getCourseBySlug(String slug);
    Page<CourseResponse> getAllCourses(CourseSearchRequest searchRequest);
    Page<CourseResponse> getCoursesByInstructor(Integer accountId, CourseSearchRequest searchRequest);
    void updateStatus(Integer id, String status);
    CourseResponse cloneCourse(Integer courseId, Integer accountId);

    // ====== Prerequisite (1-1 thay vì nhiều-nhiều) ======
    Course setPrerequisite(Integer courseId, Integer prerequisiteCourseId);
    Course removePrerequisite(Integer courseId);
    CourseResponse getPrerequisite(Integer courseId);

    HomePageCourseResponse getHomePageCourses();
}