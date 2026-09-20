package org.wisdom.oc01.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HomePageCourseResponse {
    private List<CourseResponse> newestCourses;
    private List<CourseResponse> mostPopularCourses;
    private List<CourseResponse> topRatedCourses;
    private List<CourseResponse> freeCourses;
    private List<CourseResponse> discountedCourses;
    private List<CategoryCourses> coursesByCategory;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CategoryCourses {
        private String categoryId;
        private String categoryName;
        private String categorySlug;
        private List<CourseResponse> courses;
    }
}