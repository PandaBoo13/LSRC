package org.wisdom.oc01.service;

import org.wisdom.oc01.dto.request.resource.CourseResourceRequest;
import org.wisdom.oc01.dto.response.CourseResourceResponse;
import java.util.List;

public interface CourseResourceService {
    // GET
    List<CourseResourceResponse> getResourcesByCourse(Integer courseId);
    List<CourseResourceResponse> getResourcesByChapter(Integer courseId, Integer chapterId);
    List<CourseResourceResponse> getResourcesByParent(Integer courseId, Integer parentId);
    CourseResourceResponse getResourceById(Integer resourceId);

    // CREATE
    CourseResourceResponse uploadResource(Integer courseId, CourseResourceRequest request);
    CourseResourceResponse addResourceByLink(Integer courseId, CourseResourceRequest request);

    // UPDATE
    CourseResourceResponse updateResource(Integer resourceId, CourseResourceRequest request);
    /** Cập nhật chapter cho resource */
    CourseResourceResponse updateResourceChapter(Integer resourceId, Integer chapterId);

    // DELETE
    void deleteResource(Integer resourceId);

    // STATUS
    CourseResourceResponse publishResource(Integer resourceId);
    CourseResourceResponse unpublishResource(Integer resourceId);
}