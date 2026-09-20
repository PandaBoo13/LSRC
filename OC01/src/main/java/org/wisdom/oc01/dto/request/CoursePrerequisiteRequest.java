package org.wisdom.oc01.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class CoursePrerequisiteRequest {
    private List<Integer> prerequisiteCourseIds;
}