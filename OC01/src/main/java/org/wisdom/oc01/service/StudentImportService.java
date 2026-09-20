package org.wisdom.oc01.service;

import org.springframework.web.multipart.MultipartFile;

public interface StudentImportService {
    void importStudentsFromExcel(MultipartFile file);
}