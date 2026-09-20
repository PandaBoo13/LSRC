// dto/request/LessonOrderUpdate.java
package org.wisdom.oc01.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonOrderUpdate {
    private Integer idLesson;
    private Integer orderIndex;
}