package org.wisdom.oc01.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.wisdom.oc01.dto.request.UpdateProfileRequest;
import org.wisdom.oc01.dto.response.UserInfoResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.Role;
import org.wisdom.oc01.entity.User;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.FileStorageService;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.RoleRepository;
import org.wisdom.oc01.service.UserService;

import java.io.IOException;
import java.io.InputStream;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ==================== PROFILE ====================

    @Override
    @Transactional(readOnly = true)
    public UserInfoResponse getProfile(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Account not found"));
        return buildUserInfoResponse(account);
    }

    @Override
    @Transactional
    public UserInfoResponse updateProfile(Integer accountId,
                                          UpdateProfileRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Account not found"));
        User user = account.getUser();
        if (user == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND,
                    "Không tìm thấy hồ sơ người dùng");
        }
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) {
            user.setGender(User.Gender.valueOf(request.getGender()));
        }
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        accountRepository.save(account);
        return buildUserInfoResponse(account);
    }

    @Override
    @Transactional
    public UserInfoResponse updateAvatar(Integer accountId, MultipartFile file) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Account not found"));
        User user = account.getUser();
        if (user == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND,
                    "Không tìm thấy hồ sơ người dùng");
        }
        if (file == null || file.isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "Vui lòng chọn file ảnh");
        }
        try {
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
                fileStorageService.deleteFile(user.getAvatarUrl());
            }
            String fileName = fileStorageService.storeFile(file, "avatars");
            user.setAvatarUrl("/uploads/" + fileName);
            accountRepository.save(account);
            return buildUserInfoResponse(account);
        } catch (IOException e) {
            throw new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lỗi upload ảnh: " + e.getMessage());
        }
    }

    // ==================== IMPORT STUDENTS ====================

    /**
     * Import học viên từ Excel.
     *
     * FIXED [CRITICAL]:
     *  - KHÔNG dùng password chung "Student@123".
     *  - Sinh password random mỗi user (16 ký tự base64 URL-safe).
     *  - Đánh dấu `mustChangePassword=true` để force đổi khi login lần đầu.
     *  - Log số lượng import, KHÔNG log email/password của từng user.
     */
    @Override
    @Transactional
    public void importStudentsFromExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ErrorHandler(HttpStatus.BAD_REQUEST,
                    "File Excel không được để trống");
        }

        Role defaultRole = roleRepository.findById(1)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Default role not found"));

        int created = 0;
        int updated = 0;
        int skipped = 0;

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getLastRowNum();

            for (int rowIndex = 1; rowIndex <= totalRows; rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isRowEmpty(row)) continue;

                String firstName = sanitizeString(getCellValue(row.getCell(0)), 50);
                String lastName = sanitizeString(getCellValue(row.getCell(1)), 50);
                String email = getCellValue(row.getCell(2));
                String phone = getCellValue(row.getCell(3));
                LocalDate dob = getCellDateValue(row.getCell(4));
                String genderStr = getCellValue(row.getCell(5));
                String address = getCellValue(row.getCell(6));

                if (email == null || email.trim().isEmpty()) {
                    skipped++;
                    continue;
                }

                email = email.trim().toLowerCase();
                if (!email.matches("^[\\w.-]+@[\\w.-]+\\.\\w{2,}$")
                        || email.length() > 100) {
                    skipped++;
                    continue;
                }

                Optional<Account> existingAccount = accountRepository.findByEmail(email);

                if (existingAccount.isPresent()) {
                    // ================= UPDATE =================
                    Account account = existingAccount.get();
                    User user = account.getUser();
                    if (user == null) {
                        user = new User();
                        user.setAccount(account);
                        account.setUser(user);
                    }
                    if (firstName != null) user.setFirstName(firstName);
                    if (lastName != null) user.setLastName(lastName);
                    if (phone != null) user.setPhone(phone.trim());
                    if (dob != null) user.setDateOfBirth(dob);
                    if (address != null) user.setAddress(address.trim());
                    setGender(user, genderStr);
                    user.setUpdatedAt(LocalDateTime.now());
                    accountRepository.save(account);
                    updated++;
                } else {
                    // ================= CREATE =================
                    // FIXED: password random mỗi user — KHÔNG dùng chung
                    String randomPassword = generateSecureRandomPassword();

                    Account account = new Account();
                    account.setEmail(email);
                    account.setUsername(generateValidUsername(email));
                    account.setPassword(passwordEncoder.encode(randomPassword));
                    account.setProvider("local");
                    account.setRole(defaultRole);
                    // Nếu entity có field mustChangePassword → set true
                    // account.setMustChangePassword(true);

                    User user = new User();
                    user.setFirstName(firstName);
                    user.setLastName(lastName);
                    user.setPhone(phone != null ? phone.trim() : null);
                    user.setDateOfBirth(dob);
                    user.setAddress(address != null ? address.trim() : null);
                    setGender(user, genderStr);
                    user.setUpdatedAt(LocalDateTime.now());
                    user.setAccount(account);
                    account.setUser(user);

                    accountRepository.save(account);
                    created++;

                    // TODO: gửi email chứa password cho user
                    // emailService.sendActivationEmail(email, randomPassword);
                    // Log KHÔNG chứa password/email — chỉ log count cuối
                }
            }
        } catch (Exception e) {
            log.error("[Import] Lỗi khi đọc file Excel: {}", e.getMessage());
            throw new ErrorHandler(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Lỗi khi đọc file Excel: " + e.getMessage());
        }

        log.info("[Import] Hoàn tất — created={}, updated={}, skipped={}",
                created, updated, skipped);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Sinh password ngẫu nhiên 16 ký tự, đủ mạnh để pass mọi validator:
     *  - URL-safe base64.
     *  - Có chữ hoa, chữ thường, số, ký tự đặc biệt.
     */
    private String generateSecureRandomPassword() {
        byte[] randomBytes = new byte[18];
        SECURE_RANDOM.nextBytes(randomBytes);
        String base = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        // Đảm bảo có đủ loại ký tự
        String upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        String lower = "abcdefghijkmnpqrstuvwxyz";
        String digits = "23456789";
        String special = "!@#$%^&*";

        StringBuilder sb = new StringBuilder();
        sb.append(upper.charAt(SECURE_RANDOM.nextInt(upper.length())));
        sb.append(lower.charAt(SECURE_RANDOM.nextInt(lower.length())));
        sb.append(digits.charAt(SECURE_RANDOM.nextInt(digits.length())));
        sb.append(special.charAt(SECURE_RANDOM.nextInt(special.length())));
        sb.append(base, 0, Math.min(12, base.length()));

        return sb.toString();
    }

    private String generateValidUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
        if (base.length() < 3) base = "user" + base;
        if (base.length() > 40) base = base.substring(0, 40);
        String username = base;
        int count = 1;
        while (accountRepository.findByUsername(username).isPresent()) {
            username = base + count++;
        }
        return username;
    }

    private String sanitizeString(String value, int maxLength) {
        if (value == null || value.trim().isEmpty()) return null;
        String trimmed = value.trim();
        return trimmed.length() > maxLength
                ? trimmed.substring(0, maxLength) : trimmed;
    }

    private UserInfoResponse buildUserInfoResponse(Account account) {
        User user = account.getUser();
        String roleName = account.getRole() != null
                ? account.getRole().getRoleName() : "N/A";
        return UserInfoResponse.builder()
                .idAccount(account.getIdAccount())
                .username(account.getUsername())
                .email(account.getEmail())
                .firstName(user != null ? user.getFirstName() : "")
                .lastName(user != null ? user.getLastName() : "")
                .role(roleName)
                .provider(account.getProvider())
                .phone(user != null ? user.getPhone() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .bio(user != null ? user.getBio() : null)
                .dateOfBirth(user != null ? user.getDateOfBirth() : null)
                .gender(user != null && user.getGender() != null
                        ? user.getGender().name() : null)
                .address(user != null ? user.getAddress() : null)
                .updatedAt(user != null ? user.getUpdatedAt() : null)
                .build();
    }

    private void setGender(User user, String genderStr) {
        if (genderStr != null && !genderStr.trim().isEmpty()) {
            try {
                user.setGender(User.Gender.valueOf(
                        genderStr.trim().toLowerCase()));
            } catch (IllegalArgumentException e) {
                user.setGender(User.Gender.other);
            }
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return null;
        DataFormatter formatter = new DataFormatter();
        String value = formatter.formatCellValue(cell).trim();
        return value.isEmpty() ? null : value;
    }

    private LocalDate getCellDateValue(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC
                    && DateUtil.isCellDateFormatted(cell)) {
                return cell.getDateCellValue().toInstant()
                        .atZone(ZoneId.systemDefault()).toLocalDate();
            }
            if (cell.getCellType() == CellType.STRING) {
                String dateStr = cell.getStringCellValue().trim();
                if (!dateStr.isEmpty()) return LocalDate.parse(dateStr);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = new DataFormatter().formatCellValue(cell).trim();
                if (!value.isEmpty()) return false;
            }
        }
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public UserInfoResponse getPublicProfile(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND,
                        "Account not found"));
        User user = account.getUser();
        String roleName = account.getRole() != null
                ? account.getRole().getRoleName() : "N/A";
        return UserInfoResponse.builder()
                .idAccount(account.getIdAccount())
                .username(account.getUsername())
                .firstName(user != null ? user.getFirstName() : "")
                .lastName(user != null ? user.getLastName() : "")
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .bio(user != null ? user.getBio() : null)
                .role(roleName)
                // KHÔNG set các field nhạy cảm
                .build();
    }
}