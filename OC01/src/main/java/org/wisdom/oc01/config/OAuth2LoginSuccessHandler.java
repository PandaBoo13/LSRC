//package org.wisdom.oc01.config;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
//import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//import org.wisdom.oc01.entity.Account;
//import org.wisdom.oc01.entity.Role;
//import org.wisdom.oc01.repository.AccountRepository;
//import org.wisdom.oc01.repository.RoleRepository;
//
//import java.io.IOException;
//import java.util.Map;
//
///**
// * Xử lý sự kiện khi người dùng đăng nhập thành công bằng OAuth2 (Google, Facebook, v.v.).
// * - Kiểm tra xem tài khoản đã tồn tại trong hệ thống hay chưa.
// * - Nếu có, cập nhật thông tin tài khoản (nếu cần).
// * - Nếu chưa có, tạo tài khoản mới và gán quyền mặc định.
// * - Chuyển hướng đến trang thông báo đăng nhập thành công.
// */
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
//
//    private final AccountRepository accountRepository; // Repository để truy vấn và lưu tài khoản
//    private final RoleRepository roleRepository; // Repository để truy vấn quyền (role)
//    private Role cachedUserRole; // Cache role USER để tránh truy vấn lặp lại
//
//    /**
//     * Phương thức này được gọi khi người dùng đăng nhập OAuth2 thành công.
//     */
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
//            throws IOException {
//
//        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
//        Map<String, Object> attributes = token.getPrincipal().getAttributes();
//
//        // Lấy thông tin từ OAuth2 provider (Google, Facebook, ...)
//        String provider = token.getAuthorizedClientRegistrationId(); // Tên provider (ví dụ: "google", "facebook")
//        String email = (String) attributes.getOrDefault("email", provider + "_" + attributes.get("id") + "@generated.com"); // Lấy email hoặc tạo email giả nếu không có
//        String name = (String) attributes.getOrDefault("name", email); // Lấy tên hiển thị hoặc dùng email nếu không có
//
//        // Cache role "USER" để tránh truy vấn database nhiều lần
//        if (cachedUserRole == null) {
//            cachedUserRole = roleRepository.findByRoleName("USER");
//        }
//
//        // Kiểm tra tài khoản đã tồn tại hay chưa
//        accountRepository.findByEmail(email).ifPresentOrElse(
//                account -> updateAccount(account, name, provider), // Nếu có, cập nhật thông tin
//                () -> createNewAccount(email, name, provider) // Nếu chưa có, tạo tài khoản mới
//        );
//
//        log.info("OAuth2 login thành công với email: {}", email);
//        getRedirectStrategy().sendRedirect(request, response, "/api/account/oauth2/success"); // Chuyển hướng sau khi đăng nhập thành công
//    }
//
//    /**
//     * Cập nhật thông tin tài khoản nếu có thay đổi.
//     */
//    private void updateAccount(Account account, String name, String provider) {
//        boolean updated = false;
//
//        // Cập nhật tên người dùng nếu khác với dữ liệu hiện tại
//        if (!account.getUsername().equals(name)) {
//            account.setUsername(name);
//            updated = true;
//        }
//
//        // Cập nhật provider nếu khác
//        if (!account.getProvider().equals(provider)) {
//            account.setProvider(provider);
//            updated = true;
//        }
//
//        // Nếu có thay đổi, lưu lại vào database
//        if (updated) {
//            accountRepository.save(account);
//            log.info("Cập nhật tài khoản: {}", account.getEmail());
//        }
//    }
//
//    /**
//     * Tạo tài khoản mới cho người dùng nếu chưa có trong hệ thống.
//     */
//    private void createNewAccount(String email, String name, String provider) {
//        Account newAccount = new Account();
//        newAccount.setEmail(email);
//        newAccount.setUsername(name);
//        newAccount.setProvider(provider);
//        newAccount.setRole(cachedUserRole); // Gán quyền mặc định là "USER"
//
//        accountRepository.save(newAccount);
//        log.info("Tạo tài khoản mới: {}", email);
//    }
//}
