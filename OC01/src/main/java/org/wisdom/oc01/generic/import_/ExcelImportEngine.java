// src/main/java/org/wisdom/oc01/generic/import_/ExcelImportEngine.java
package org.wisdom.oc01.generic.import_;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.wisdom.oc01.exception.ErrorHandler;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * ⭐ CORE ENGINE — Dùng chung cho MỌI loại import Excel.
 *
 * Trách nhiệm:
 *   1. Validate file (.xlsx/.xls, không rỗng)
 *   2. Mở Workbook, lấy Sheet[0]
 *   3. Iterate từ row 1 (bỏ header), skip row trống
 *   4. Gọi parser → validator → gom vào toSave
 *   5. Bắt exception từng row → thêm vào errors (không rollback)
 *   6. Batch save 1 lần duy nhất
 *   7. Trả về ImportResult<T> chứa success + errors
 *
 * ⚠️ Không biết gì về Question/Lesson/Student...
 *    Toàn bộ logic đặc thù nằm ở ImportConfig.
 */
@Slf4j
@Service
public class ExcelImportEngine {

    private static final int HEADER_ROW_INDEX = 0; // row 0 = header

    @Transactional
    public <T> ImportResult<T> execute(MultipartFile file, ImportConfig<T> config) {

        // ── 1. Validate input ──
        validateFile(file);

        if (config == null || config.getParser() == null) {
            throw new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                    "ImportConfig chưa được cấu hình đúng");
        }
        if (config.getBatchSaver() == null) {
            throw new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                    "ImportConfig thiếu batchSaver");
        }

        String entityName = config.getEntityName() != null ? config.getEntityName() : "Bản ghi";

        // ── 2. Chuẩn bị containers ──
        List<T> toSave = new ArrayList<>();
        List<ImportError> errors = new ArrayList<>();

        // ── 3. Đọc Excel ──
        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            if (workbook.getNumberOfSheets() == 0) {
                throw new ErrorHandler(HttpStatus.BAD_REQUEST, "File Excel không có sheet nào");
            }

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

            int lastRow = sheet.getLastRowNum();

            // Bắt đầu từ row 1 (bỏ header)
            for (int rowIdx = HEADER_ROW_INDEX + 1; rowIdx <= lastRow; rowIdx++) {
                Row row = sheet.getRow(rowIdx);
                RowContext ctx = new RowContext(rowIdx + 1, row, formatter, evaluator);

                if (ctx.isEmpty()) continue;

                try {
                    T entity = config.getParser().parse(ctx);
                    if (entity == null) continue; // parser chủ động skip

                    if (config.getValidator() != null) {
                        config.getValidator().validate(entity, ctx);
                    }
                    toSave.add(entity);

                } catch (IllegalArgumentException ex) {
                    // Lỗi dữ liệu row → log + ghi vào errors, KHÔNG fail cả file
                    errors.add(ImportError.builder()
                            .rowNumber(ctx.getRowNumber())
                            .message(ex.getMessage())
                            .build());
                } catch (Exception ex) {
                    log.error("❌ Lỗi không xác định tại row {}", ctx.getRowNumber(), ex);
                    errors.add(ImportError.builder()
                            .rowNumber(ctx.getRowNumber())
                            .message("Lỗi hệ thống: " + ex.getMessage())
                            .build());
                }
            }

        } catch (ErrorHandler e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Không đọc được file Excel", e);
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Không đọc được file Excel: " + e.getMessage());
        }

        // ── 4. Batch save (1 lần duy nhất, transactional) ──
        List<T> imported = new ArrayList<>();
        if (!toSave.isEmpty()) {
            try {
                config.getBatchSaver().accept(toSave);
                imported = toSave;
            } catch (Exception ex) {
                log.error("❌ Batch save thất bại", ex);
                throw new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lưu dữ liệu thất bại: " + ex.getMessage());
            }
        }

        log.info("✅ Import [{}]: {} thành công / {} lỗi",
                entityName, imported.size(), errors.size());

        return ImportResult.<T>builder()
                .entityName(entityName)
                .totalRows(imported.size() + errors.size())
                .successCount(imported.size())
                .failedCount(errors.size())
                .importedItems(imported)
                .errors(errors)
                .build();
    }

    // ═══════════════════════════ HELPERS ═══════════════════════════

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "File Excel không được để trống");
        }
        String name = file.getOriginalFilename();
        if (name == null) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, "File không có tên");
        }
        String lower = name.toLowerCase();
        if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Chỉ chấp nhận file .xlsx hoặc .xls");
        }
    }
}