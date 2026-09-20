package org.wisdom.oc01.generic;

import io.jsonwebtoken.io.IOException;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.passay.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.wisdom.oc01.exception.ErrorHandler;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
public class GeneralService {

    // ==================== FILE OPERATIONS ====================

    /**
     * Lưu file vào thư mục chỉ định
     */
    public String saveFile(MultipartFile file, String subDirectory)
            throws IOException, java.io.IOException {

        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        String uploadDir = System.getProperty("user.dir")
                + "/src/main/resources/static/" + subDirectory;

        log.info("📁 Upload file: {} → {}", fileName, uploadDir);

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("📁 Tạo thư mục: {}", uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        file.transferTo(filePath.toFile());

        String relativePath = "/" + subDirectory + fileName;
        log.info("✅ File đã lưu: {}", relativePath);
        return relativePath;
    }

    // ==================== PASSWORD VALIDATION ====================

    /** Xác thực mật khẩu dựa trên các quy tắc bảo mật */
    public void validatePassword(String password) {
        log.info("🔐 Kiểm tra mật khẩu...");

        PasswordValidator validator = new PasswordValidator(
                List.of(
                        new LengthRule(6, 128),
                        new CharacterRule(EnglishCharacterData.UpperCase, 1),
                        new CharacterRule(EnglishCharacterData.LowerCase, 1),
                        new CharacterRule(EnglishCharacterData.Digit, 1),
                        new CharacterRule(EnglishCharacterData.Special, 1),
                        new WhitespaceRule()
                )
        );

        RuleResult result = validator.validate(new PasswordData(password));
        if (!result.isValid()) {
            String messages = String.join(", ", validator.getMessages(result));
            log.warn("⚠️ Mật khẩu không hợp lệ: {}", messages);
            throw new ErrorHandler(HttpStatus.BAD_REQUEST, messages);
        }
        log.info("✅ Mật khẩu hợp lệ");
    }

    // ==================== FILE PATH OPERATIONS ====================

    /** Lấy đường dẫn đầy đủ từ đường dẫn tương đối */
    public Path getFullPathFromLink(String link) {
        String filePath = System.getProperty("user.dir")
                + "/src/main/resources/static" + link;
        log.info("📁 Full path: {}", filePath);
        return Paths.get(filePath);
    }

    /** Kiểm tra file có tồn tại hay không */
    public void validateFileExists(Path path) {
        if (!Files.exists(path)) {
            log.error("❌ File không tồn tại: {}", path);
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "File not found");
        }
        log.info("✅ File tồn tại: {}", path);
    }

    /** Đọc nội dung file và xác định loại MIME */
    public FileData getFileData(Path path) throws IOException, java.io.IOException {
        String mimeType = Files.probeContentType(path);
        if (mimeType == null) {
            mimeType = "application/octet-stream";
        }
        byte[] fileContent = Files.readAllBytes(path);

        log.info("📄 Đọc file: {} (MIME: {}, Size: {} bytes)",
                path.getFileName(), mimeType, fileContent.length);

        return new FileData(mimeType, fileContent, path.getFileName().toString());
    }

    // ==================== GENERIC CONVERTER ====================

    public Integer toInteger(Object value) {
        if (value == null) return null;
        try {
            return Integer.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public Integer toInteger(Object value, Integer defaultValue) {
        Integer result = toInteger(value);
        return result != null ? result : defaultValue;
    }

    public Long toLong(Object value) {
        if (value == null) return null;
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public Long toLong(Object value, Long defaultValue) {
        Long result = toLong(value);
        return result != null ? result : defaultValue;
    }

    public String toStringValue(Object value) {
        return value != null ? value.toString() : null;
    }

    public String toStringValue(Object value, String defaultValue) {
        String result = toStringValue(value);
        return result != null ? result : defaultValue;
    }

    public BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    public BigDecimal toBigDecimal(Object value, BigDecimal defaultValue) {
        BigDecimal result = toBigDecimal(value);
        return result.compareTo(BigDecimal.ZERO) != 0 ? result : defaultValue;
    }

    public Double toDouble(Object value) {
        if (value == null) return null;
        try {
            return Double.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public Double toDouble(Object value, Double defaultValue) {
        Double result = toDouble(value);
        return result != null ? result : defaultValue;
    }

    public Boolean toBoolean(Object value) {
        if (value == null) return null;
        try {
            return Boolean.valueOf(value.toString());
        } catch (Exception e) {
            return null;
        }
    }

    public Boolean toBoolean(Object value, Boolean defaultValue) {
        Boolean result = toBoolean(value);
        return result != null ? result : defaultValue;
    }

    public LocalDateTime toLocalDateTime(Object value) {
        if (value == null) return null;

        if (value instanceof java.sql.Timestamp ts) return ts.toLocalDateTime();
        if (value instanceof LocalDateTime ldt) return ldt;

        if (value instanceof String s && !s.isEmpty()) {
            try {
                return LocalDateTime.parse(s);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    public LocalDate toLocalDate(Object value) {
        if (value == null) return null;

        if (value instanceof java.sql.Date d) return d.toLocalDate();
        if (value instanceof LocalDate ld) return ld;

        if (value instanceof String s && !s.isEmpty()) {
            try {
                return LocalDate.parse(s);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    // ==================== INNER CLASS ====================

    @Getter
    @Setter
    public static final class FileData {
        private final String mimeType;
        private final byte[] content;
        private final String fileName;

        public FileData(String mimeType, byte[] content, String fileName) {
            this.mimeType = mimeType;
            this.content = content;
            this.fileName = fileName;
        }

        public String mimeType() { return mimeType; }
        public byte[] content() { return content; }
        public String fileName() { return fileName; }

        @Override
        public boolean equals(Object obj) {
            if (obj == this) return true;
            if (obj == null || obj.getClass() != this.getClass()) return false;
            var that = (FileData) obj;
            return Objects.equals(this.mimeType, that.mimeType)
                    && Arrays.equals(this.content, that.content)
                    && Objects.equals(this.fileName, that.fileName);
        }

        @Override
        public int hashCode() {
            return Objects.hash(mimeType, Arrays.hashCode(content), fileName);
        }

        @Override
        public String toString() {
            return "FileData[" +
                    "mimeType=" + mimeType + ", " +
                    "content=" + Arrays.toString(content) + ", " +
                    "fileName=" + fileName + ']';
        }
    }
}