// ============================================
// LecturerProfileServiceImpl.java - Service Implementation
// ============================================
package org.wisdom.oc01.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wisdom.oc01.dto.request.LecturerProfileRequest;
import org.wisdom.oc01.dto.response.LecturerProfileResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.LecturerProfile;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.mapper.LecturerProfileMapper;
import org.wisdom.oc01.repository.AccountRepository;
import org.wisdom.oc01.repository.LecturerProfileRepository;
import org.wisdom.oc01.service.LecturerProfileService;
import org.wisdom.oc01.generic.validator.LecturerProfileValidator;

@Service @RequiredArgsConstructor public class LecturerProfileServiceImpl implements LecturerProfileService {
    private final LecturerProfileRepository profileRepository;
    private final AccountRepository accountRepository;
    private final LecturerProfileValidator validator;
    private final LecturerProfileMapper mapper;

    // ==================== CREATE ====================

    /** Tạo hồ sơ giảng viên mới cho account, validate trùng hồ sơ */
    @Override @Transactional
    public LecturerProfileResponse createProfile(Integer accountId, LecturerProfileRequest request) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Tài khoản không tồn tại"));
        LecturerProfile profile = LecturerProfile.builder()
                .account(account)
                .specialties(request.getSpecialties())
                .expertise(request.getExpertise())
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0)
                .education(request.getEducation())
                .website(request.getWebsite())
                .linkedin(request.getLinkedin())
                .isActive(true)
                .build();
        validator.validateForCreate(profile, profileRepository.existsByAccountIdAccount(accountId));
        profile = profileRepository.save(profile);
        return mapper.toResponse(profile);
    }

    // ==================== UPDATE ====================

    /** Cập nhật hồ sơ giảng viên theo ID */
    @Override @Transactional
    public LecturerProfileResponse updateProfile(Integer profileId, LecturerProfileRequest request) {
        LecturerProfile profile = profileRepository.findById(profileId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Hồ sơ không tồn tại"));
        profile.setSpecialties(request.getSpecialties());
        profile.setExpertise(request.getExpertise());
        profile.setExperienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : profile.getExperienceYears());
        profile.setEducation(request.getEducation());
        profile.setWebsite(request.getWebsite());
        profile.setLinkedin(request.getLinkedin());
        validator.validateForUpdate(profile);
        profile = profileRepository.save(profile);
        return mapper.toResponse(profile);
    }

    // ==================== GET ====================

    /** Lấy hồ sơ giảng viên theo accountId */
    @Override
    public LecturerProfileResponse getProfileByAccount(Integer accountId) {
        LecturerProfile profile = profileRepository.findByAccountIdAccount(accountId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Giảng viên chưa có hồ sơ"));
        return mapper.toResponse(profile);
    }

    /** Lấy hồ sơ giảng viên theo profileId */
    @Override
    public LecturerProfileResponse getProfileById(Integer profileId) {
        LecturerProfile profile = profileRepository.findById(profileId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Hồ sơ không tồn tại"));
        return mapper.toResponse(profile);
    }

    /** Lấy danh sách giảng viên đang active, có phân trang */
    @Override
    public Page<LecturerProfileResponse> getActiveLecturers(Pageable pageable) {
        return profileRepository.findByIsActiveTrue(pageable).map(mapper::toResponse);
    }

    /** Tìm kiếm giảng viên theo keyword, có phân trang */
    @Override
    public Page<LecturerProfileResponse> searchLecturers(String keyword, Pageable pageable) {
        return profileRepository.searchByKeyword(keyword, pageable).map(mapper::toResponse);
    }

    // ==================== DEACTIVATE/ACTIVATE ====================

    /** Vô hiệu hóa hồ sơ giảng viên */
    @Override @Transactional
    public void deactivateLecturer(Integer profileId) {
        LecturerProfile profile = profileRepository.findById(profileId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Hồ sơ không tồn tại"));
        profile.setIsActive(false);
        profileRepository.save(profile);
    }

    /** Kích hoạt hồ sơ giảng viên */
    @Override @Transactional
    public void activateLecturer(Integer profileId) {
        LecturerProfile profile = profileRepository.findById(profileId).orElseThrow(() -> new ErrorHandler(HttpStatus.NOT_FOUND, "Hồ sơ không tồn tại"));
        profile.setIsActive(true);
        profileRepository.save(profile);
    }
}