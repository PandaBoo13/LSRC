// UpdateProgressRequest.java
package org.wisdom.oc01.dto.request;

import lombok.Data;

@Data
public class UpdateProgressRequest {
    private Integer completedLessons;
    private Integer completedExams;
}