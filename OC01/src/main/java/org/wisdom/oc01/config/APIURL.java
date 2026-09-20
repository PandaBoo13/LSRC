package org.wisdom.oc01.config;

import java.util.Map;

public class APIURL {

    // ==================== CHỨC NĂNG ====================
    /*
     * Các chức năng chính:
     * - Xác thực & Tài khoản: Đăng ký, đăng nhập, đổi mật khẩu, quản lý profile
     * - Quản lý danh mục: CRUD danh mục khóa học
     * - Quản lý khóa học: CRUD khóa học, chương, tài nguyên
     * - Quản lý Quiz: Tạo, cập nhật, xóa, publish/close quiz
     * - Quản lý câu hỏi: CRUD câu hỏi, import Excel, gán câu hỏi vào quiz, lấy câu hỏi ngẫu nhiên
     * - Làm bài Quiz: Bắt đầu, lưu tạm, nộp bài, xem kết quả, lịch sử làm bài
     * - Quản lý tiến độ học: Theo dõi tiến độ khóa học và tài nguyên
     * - Quản lý đơn hàng: Tạo đơn, thanh toán, quản lý đăng ký khóa học
     * - Đánh giá & Yêu thích: Review khóa học, wishlist
     * - Hồ sơ giảng viên: CRUD thông tin giảng viên
     * - Phân quyền RBAC: Quản lý vai trò và quyền
     * - Thông báo: Gửi và quản lý thông báo
     * - Nhật ký hoạt động: Ghi log các thay đổi
     * - Thanh toán VNPay: Callback và IPN
     */

    // ==================== PUBLIC GET URLs ====================
    public static final String[] PUBLIC_GET_URLS = {
            "/",                                // Trang chủ
            "/public/**",                       // Tài nguyên public (CSS, JS, images)
            "/uploads/**",                      // File upload (ảnh, video, tài liệu)
            "/oauth2/authorization/**",         // OAuth2 login redirect (Google, Facebook)
            "/api/oauth2/**",                   // OAuth2 callback xử lý sau khi login

            "/api/courses",                     // Lấy danh sách khóa học (public)
            "/api/courses/homepage",            // Dữ liệu khóa học cho trang chủ
            "/api/courses/slug/**",             // Lấy khóa học theo slug (URL thân thiện)

            "/api/categories/**",               // Danh mục: tree, search, by id (public)

            "/api/chapters/**",                 // Chương: by id, by course (public)

            "/api/lecturer-profiles",           // Danh sách giảng viên (public)
            "/api/lecturer-profiles/search",    // Tìm kiếm giảng viên (public)
            "/api/lecturer-profiles/*",         // Hồ sơ giảng viên theo ID (public)

            "/api/reviews/course/*",            // Đánh giá của khóa học (public)
            "/api/reviews/course/*/average",    // Rating trung bình của khóa học (public)
            "/api/reviews/course/*/count",      // Đếm số đánh giá của khóa học (public)

            "/api/courses/*/quizzes",           // Danh sách quiz của khóa học (public)
            "/api/quizzes/*",                   // Chi tiết quiz (public)

            "/api/courses/*/resources",         // Tài nguyên của khóa học (public)
            "/api/resources/*",                 // Tài nguyên theo ID (public)

            "/api/orders/vnpay/callback",       // VNPay callback sau khi thanh toán (public)
            "/api/orders/vnpay/ipn",            // VNPay IPN - Instant Payment Notification (public)
            "/api/questions/lesson/*/paginated",
            "/ws/**",                           // WebSocket endpoint (public cho handshake)
    };

    // ==================== PUBLIC AUTH URLs ====================
    public static final String[] PUBLIC_AUTH_URLS = {
            "/api/auth/register",               // Đăng ký tài khoản mới - POST
            "/api/auth/login",                  // Đăng nhập - POST
            "/api/auth/refresh-token",          // Làm mới access token - POST
            "/api/auth/forgot-password",        // Quên mật khẩu, gửi OTP - POST
            "/api/auth/verify-otp",             // Xác thực OTP - POST
            "/api/auth/reset-password",         // Đặt lại mật khẩu mới - POST
            "/api/auth/check-token",            // Kiểm tra token hợp lệ - GET
    };

    // ==================== TẤT CẢ PUBLIC URLs ====================
    public static final String[] PUBLIC_URLS = combineArrays(PUBLIC_GET_URLS, PUBLIC_AUTH_URLS);

    private static String[] combineArrays(String[] arr1, String[] arr2) {
        String[] result = new String[arr1.length + arr2.length];
        System.arraycopy(arr1, 0, result, 0, arr1.length);
        System.arraycopy(arr2, 0, result, arr1.length, arr2.length);
        return result;
    }

    // ==================== RESOURCES ====================
    public static final String RESOURCE_NOTIFICATION = "NOTIFICATION";          // Quản lý thông báo
    public static final String RESOURCE_CATEGORY = "CATEGORY";                  // Quản lý danh mục
    public static final String RESOURCE_COURSE = "COURSE";                      // Quản lý khóa học
    public static final String RESOURCE_CHAPTER = "CHAPTER";                    // Quản lý chương
    public static final String RESOURCE_REVIEW = "REVIEW";                      // Quản lý đánh giá
    public static final String RESOURCE_ORDER = "ORDER";                        // Quản lý đơn hàng
    public static final String RESOURCE_USER = "USER";                          // Quản lý người dùng
    public static final String RESOURCE_ACCOUNT = "ACCOUNT";                    // Quản lý tài khoản
    public static final String RESOURCE_RBAC = "RBAC";                          // Quản lý phân quyền
    public static final String RESOURCE_PERMISSION = "PERMISSION";              // Quản lý quyền
    public static final String RESOURCE_QUESTION = "QUESTION";                  // Quản lý câu hỏi
    public static final String RESOURCE_QUIZ = "QUIZ";                          // Quản lý quiz
    public static final String RESOURCE_QUIZ_ATTEMPT = "QUIZ_ATTEMPT";          // Quản lý lượt làm bài quiz
    public static final String RESOURCE_PROGRESS = "PROGRESS";                  // Quản lý tiến độ học
    public static final String RESOURCE_AUDIT_LOG = "AUDIT_LOG";                // Quản lý nhật ký
    public static final String RESOURCE_COURSE_RESOURCE = "COURSE_RESOURCE";    // Quản lý tài nguyên khóa học
    public static final String RESOURCE_PAYMENT = "PAYMENT";                    // Quản lý thanh toán
    public static final String RESOURCE_LECTURER_PROFILE = "LECTURER_PROFILE";  // Quản lý hồ sơ giảng viên
    public static final String RESOURCE_WISHLIST = "WISHLIST";                  // Quản lý danh sách yêu thích
    public static final String RESOURCE_CHAT = "CHAT";                          // Quản lý chat

    // ==================== ACTIONS ====================
    public static final String ACTION_READ = "READ";          // Xem dữ liệu
    public static final String ACTION_CREATE = "CREATE";      // Tạo mới dữ liệu
    public static final String ACTION_UPDATE = "UPDATE";      // Cập nhật dữ liệu
    public static final String ACTION_DELETE = "DELETE";      // Xóa dữ liệu
    public static final String ACTION_EXPORT = "EXPORT";      // Xuất dữ liệu
    public static final String ACTION_MANAGE = "MANAGE";      // Quản lý toàn diện
    public static final String ACTION_UPLOAD = "UPLOAD";      // Upload file
    public static final String ACTION_PUBLISH = "PUBLISH";    // Xuất bản nội dung
    public static final String ACTION_SUBMIT = "SUBMIT";      // Nộp bài

    // ==================== PERMISSION MAP ====================
    public static final Map<String, String[]> API_PERMISSIONS = Map.ofEntries(

            // ==================== AUTH (Xác thực) ====================
            Map.entry("POST:/api/auth/logout",              new String[]{RESOURCE_ACCOUNT, ACTION_READ}),          // Đăng xuất
            Map.entry("POST:/api/auth/change-password",     new String[]{RESOURCE_ACCOUNT, ACTION_UPDATE}),        // Đổi mật khẩu

            // ==================== ACCOUNT / USER (Tài khoản & Người dùng) ====================
            Map.entry("GET:/api/accounts",                  new String[]{RESOURCE_ACCOUNT, ACTION_READ}),          // Danh sách tài khoản (admin)
            Map.entry("GET:/api/accounts/teachers",         new String[]{RESOURCE_ACCOUNT, ACTION_READ}),          // Danh sách giáo viên
            Map.entry("GET:/api/accounts/{id}",             new String[]{RESOURCE_ACCOUNT, ACTION_READ}),          // Chi tiết tài khoản
            Map.entry("GET:/api/users/profile",             new String[]{RESOURCE_USER, ACTION_READ}),             // Xem profile cá nhân
            Map.entry("PUT:/api/users/profile",             new String[]{RESOURCE_USER, ACTION_UPDATE}),           // Cập nhật profile
            Map.entry("POST:/api/users/avatar",             new String[]{RESOURCE_USER, ACTION_UPLOAD}),           // Upload avatar
            Map.entry("POST:/api/users/import-students",    new String[]{RESOURCE_USER, ACTION_CREATE}),           // Import danh sách học viên

            // ==================== RBAC (Phân quyền) ====================
            Map.entry("GET:/api/rbac/roles",                        new String[]{RESOURCE_RBAC, ACTION_READ}),     // Danh sách vai trò
            Map.entry("GET:/api/rbac/roles/{id}",                   new String[]{RESOURCE_RBAC, ACTION_READ}),     // Chi tiết vai trò
            Map.entry("POST:/api/rbac/roles",                       new String[]{RESOURCE_RBAC, ACTION_CREATE}),   // Tạo vai trò mới
            Map.entry("PUT:/api/rbac/roles/{id}",                   new String[]{RESOURCE_RBAC, ACTION_UPDATE}),   // Cập nhật vai trò
            Map.entry("DELETE:/api/rbac/roles/{id}",                new String[]{RESOURCE_RBAC, ACTION_DELETE}),   // Xóa vai trò
            Map.entry("GET:/api/rbac/roles/{roleId}/accounts",      new String[]{RESOURCE_RBAC, ACTION_READ}),     // Accounts theo vai trò

            // ✅ PATCH 2: ROLE ↔ PERMISSION (quản lý permission theo role)
            Map.entry("GET:/api/rbac/roles/{roleId}/permissions",                       new String[]{RESOURCE_RBAC, ACTION_READ}),    // Xem permission của role
            Map.entry("POST:/api/rbac/roles/{roleId}/permissions",                      new String[]{RESOURCE_RBAC, ACTION_UPDATE}),  // Gán permission vào role
            Map.entry("PUT:/api/rbac/roles/{roleId}/permissions",                       new String[]{RESOURCE_RBAC, ACTION_UPDATE}),  // Replace toàn bộ permission của role
            Map.entry("DELETE:/api/rbac/roles/{roleId}/permissions/{permissionId}",     new String[]{RESOURCE_RBAC, ACTION_UPDATE}),  // Gỡ permission khỏi role

            Map.entry("GET:/api/rbac/permissions",                  new String[]{RESOURCE_PERMISSION, ACTION_READ}),       // Danh sách quyền
            Map.entry("GET:/api/rbac/permissions/default",          new String[]{RESOURCE_PERMISSION, ACTION_READ}),       // Quyền mặc định
            Map.entry("GET:/api/rbac/permissions/{id}",             new String[]{RESOURCE_PERMISSION, ACTION_READ}),       // Chi tiết quyền
            Map.entry("POST:/api/rbac/permissions",                 new String[]{RESOURCE_PERMISSION, ACTION_CREATE}),     // Tạo quyền mới
            Map.entry("PUT:/api/rbac/permissions/{id}",             new String[]{RESOURCE_PERMISSION, ACTION_UPDATE}),     // Cập nhật quyền

            Map.entry("GET:/api/rbac/accounts/{accountId}/permissions",            new String[]{RESOURCE_RBAC, ACTION_READ}),  // Quyền của account
            Map.entry("GET:/api/rbac/accounts/{accountId}/permissions/custom",     new String[]{RESOURCE_RBAC, ACTION_READ}),  // Quyền tùy chỉnh của account
            Map.entry("POST:/api/rbac/accounts/{accountId}/permissions",            new String[]{RESOURCE_RBAC, ACTION_UPDATE}), // Gán quyền cho account
            Map.entry("POST:/api/rbac/accounts/{accountId}/permissions/batch",      new String[]{RESOURCE_RBAC, ACTION_UPDATE}), // Gán nhiều quyền cho account
            Map.entry("DELETE:/api/rbac/accounts/{accountId}/permissions/{permissionId}",       new String[]{RESOURCE_RBAC, ACTION_UPDATE}), // Xóa quyền của account
            Map.entry("PATCH:/api/rbac/accounts/{accountId}/permissions/{permissionId}/deactivate", new String[]{RESOURCE_RBAC, ACTION_UPDATE}), // Vô hiệu quyền
            Map.entry("PATCH:/api/rbac/accounts/{accountId}/permissions/{permissionId}/activate",   new String[]{RESOURCE_RBAC, ACTION_UPDATE}), // Kích hoạt quyền
            Map.entry("DELETE:/api/rbac/accounts/{accountId}/permissions",      new String[]{RESOURCE_RBAC, ACTION_DELETE}), // Xóa tất cả quyền
            Map.entry("GET:/api/rbac/accounts/{accountId}/permissions/check",   new String[]{RESOURCE_RBAC, ACTION_READ}),  // Kiểm tra quyền
            Map.entry("GET:/api/rbac/accounts/{accountId}/permissions/check-resource", new String[]{RESOURCE_RBAC, ACTION_READ}), // Kiểm tra quyền theo resource
            Map.entry("GET:/api/rbac/accounts/{accountId}/roles",              new String[]{RESOURCE_RBAC, ACTION_READ}),  // Vai trò của account
            Map.entry("PUT:/api/rbac/accounts/{accountId}/role",               new String[]{RESOURCE_RBAC, ACTION_UPDATE}), // Gán vai trò
            Map.entry("DELETE:/api/rbac/accounts/{accountId}/role",            new String[]{RESOURCE_RBAC, ACTION_UPDATE}), // Xóa vai trò
            Map.entry("GET:/api/rbac/accounts",                                 new String[]{RESOURCE_ACCOUNT, ACTION_READ}), // Danh sách accounts (RBAC)
            Map.entry("GET:/api/rbac/accounts/teachers",                        new String[]{RESOURCE_ACCOUNT, ACTION_READ}), // Giáo viên (RBAC)
            Map.entry("GET:/api/rbac/accounts/{accountId}",                     new String[]{RESOURCE_ACCOUNT, ACTION_READ}), // Chi tiết account (RBAC)

            // ==================== CATEGORY (Danh mục) ====================
            Map.entry("GET:/api/categories/tree",               new String[]{RESOURCE_CATEGORY, ACTION_READ}),     // Cây danh mục
            Map.entry("GET:/api/categories/search",             new String[]{RESOURCE_CATEGORY, ACTION_READ}),     // Tìm kiếm danh mục
            Map.entry("GET:/api/categories/{id}",               new String[]{RESOURCE_CATEGORY, ACTION_READ}),     // Chi tiết danh mục
            Map.entry("POST:/api/categories",                   new String[]{RESOURCE_CATEGORY, ACTION_CREATE}),   // Tạo danh mục
            Map.entry("PUT:/api/categories/{id}",               new String[]{RESOURCE_CATEGORY, ACTION_UPDATE}),   // Cập nhật danh mục
            Map.entry("PATCH:/api/categories/{id}/toggle-status", new String[]{RESOURCE_CATEGORY, ACTION_UPDATE}), // Bật/tắt danh mục
            Map.entry("DELETE:/api/categories/{id}",            new String[]{RESOURCE_CATEGORY, ACTION_DELETE}),   // Xóa danh mục

            // ==================== COURSE (Khóa học) ====================
            Map.entry("GET:/api/courses",                       new String[]{RESOURCE_COURSE, ACTION_READ}),       // Danh sách khóa học
            Map.entry("GET:/api/courses/{id}",                  new String[]{RESOURCE_COURSE, ACTION_READ}),       // ✅ PATCH 1: Chi tiết khóa học theo ID
            Map.entry("GET:/api/courses/slug/{slug}",           new String[]{RESOURCE_COURSE, ACTION_READ}),       // Khóa học theo slug
            Map.entry("GET:/api/courses/instructor",            new String[]{RESOURCE_COURSE, ACTION_READ}),       // Khóa học của giảng viên
            Map.entry("GET:/api/courses/homepage",              new String[]{RESOURCE_COURSE, ACTION_READ}),       // Khóa học trang chủ
            Map.entry("POST:/api/courses",                      new String[]{RESOURCE_COURSE, ACTION_CREATE}),     // Tạo khóa học
            Map.entry("PUT:/api/courses/{id}",                  new String[]{RESOURCE_COURSE, ACTION_UPDATE}),     // Cập nhật khóa học
            Map.entry("PATCH:/api/courses/{id}/status",         new String[]{RESOURCE_COURSE, ACTION_UPDATE}),     // Đổi trạng thái khóa học
            Map.entry("DELETE:/api/courses/{id}",               new String[]{RESOURCE_COURSE, ACTION_DELETE}),     // Xóa khóa học
            Map.entry("POST:/api/courses/{id}/clone",           new String[]{RESOURCE_COURSE, ACTION_CREATE}),     // Nhân bản khóa học
            Map.entry("POST:/api/courses/{id}/submit-review",   new String[]{RESOURCE_COURSE, ACTION_UPDATE}),     // Gửi khóa học để review

            // ==================== CHAPTER (Chương) ====================
            Map.entry("GET:/api/courses/{courseId}/chapters",       new String[]{RESOURCE_CHAPTER, ACTION_READ}),   // Danh sách chương của khóa học
            Map.entry("GET:/api/chapters/{id}",                     new String[]{RESOURCE_CHAPTER, ACTION_READ}),   // Chi tiết chương
            Map.entry("POST:/api/courses/{courseId}/chapters",      new String[]{RESOURCE_CHAPTER, ACTION_CREATE}), // Tạo chương mới
            Map.entry("PUT:/api/chapters/{id}",                     new String[]{RESOURCE_CHAPTER, ACTION_UPDATE}), // Cập nhật chương
            Map.entry("PATCH:/api/chapters/{id}/order",             new String[]{RESOURCE_CHAPTER, ACTION_UPDATE}), // Đổi thứ tự chương
            Map.entry("PUT:/api/chapters/batch/order",              new String[]{RESOURCE_CHAPTER, ACTION_UPDATE}), // Đổi thứ tự nhiều chương
            Map.entry("DELETE:/api/chapters/{id}",                  new String[]{RESOURCE_CHAPTER, ACTION_DELETE}), // Xóa chương

            // ==================== COURSE RESOURCE (Tài nguyên khóa học - KHÔNG bao gồm quiz) ====================
            Map.entry("GET:/api/courses/{courseId}/resources",                  new String[]{RESOURCE_COURSE_RESOURCE, ACTION_READ}),      // Tài nguyên của khóa học
            Map.entry("GET:/api/courses/{courseId}/chapters/{chapterId}/resources", new String[]{RESOURCE_COURSE_RESOURCE, ACTION_READ}),  // Tài nguyên theo chương
            Map.entry("GET:/api/resources/{resourceId}",                        new String[]{RESOURCE_COURSE_RESOURCE, ACTION_READ}),      // Chi tiết tài nguyên
            Map.entry("GET:/api/courses/{courseId}/resources/{resourceId}/children", new String[]{RESOURCE_COURSE_RESOURCE, ACTION_READ}),  // Tài nguyên con
            Map.entry("POST:/api/courses/{courseId}/resources/upload",          new String[]{RESOURCE_COURSE_RESOURCE, ACTION_UPLOAD}),    // Upload tài nguyên
            Map.entry("POST:/api/courses/{courseId}/resources/link",            new String[]{RESOURCE_COURSE_RESOURCE, ACTION_CREATE}),    // Thêm tài nguyên link
            Map.entry("PUT:/api/courses/{courseId}/resources/{resourceId}",     new String[]{RESOURCE_COURSE_RESOURCE, ACTION_UPDATE}),    // Cập nhật tài nguyên
            Map.entry("DELETE:/api/courses/{courseId}/resources/{resourceId}",  new String[]{RESOURCE_COURSE_RESOURCE, ACTION_DELETE}),    // Xóa tài nguyên
            Map.entry("PUT:/api/resources/{resourceId}/publish",                new String[]{RESOURCE_COURSE_RESOURCE, ACTION_PUBLISH}),   // Xuất bản tài nguyên
            Map.entry("PUT:/api/resources/{resourceId}/unpublish",              new String[]{RESOURCE_COURSE_RESOURCE, ACTION_UPDATE}),    // Hủy xuất bản
            Map.entry("PUT:/api/courses/{courseId}/resources/{resourceId}/chapter", new String[]{RESOURCE_COURSE_RESOURCE, ACTION_UPDATE}), // Chuyển tài nguyên sang chương

            // ==================== QUIZ MANAGEMENT (Quản lý Quiz) ====================
            Map.entry("POST:/api/courses/{courseId}/quizzes",          new String[]{RESOURCE_QUIZ, ACTION_CREATE}),    // Tạo quiz mới
            Map.entry("PUT:/api/quizzes/{quizId}",                     new String[]{RESOURCE_QUIZ, ACTION_UPDATE}),    // Cập nhật quiz
            Map.entry("DELETE:/api/quizzes/{quizId}",                  new String[]{RESOURCE_QUIZ, ACTION_DELETE}),    // Xóa quiz
            Map.entry("GET:/api/courses/{courseId}/quizzes",           new String[]{RESOURCE_QUIZ, ACTION_READ}),      // Danh sách quiz của course
            Map.entry("GET:/api/quizzes/{quizId}",                     new String[]{RESOURCE_QUIZ, ACTION_READ}),      // Chi tiết quiz
            Map.entry("PUT:/api/quizzes/{quizId}/publish",             new String[]{RESOURCE_QUIZ, ACTION_PUBLISH}),   // Publish quiz
            Map.entry("PUT:/api/quizzes/{quizId}/close",               new String[]{RESOURCE_QUIZ, ACTION_UPDATE}),    // Đóng quiz (unpublish)

            // ==================== QUESTION MANAGEMENT (Quản lý câu hỏi thuộc Quiz) ====================
            Map.entry("POST:/api/quizzes/{quizId}/questions",          new String[]{RESOURCE_QUESTION, ACTION_CREATE}),    // Tạo câu hỏi cho quiz
            Map.entry("POST:/api/questions",                           new String[]{RESOURCE_QUESTION, ACTION_CREATE}),    // Tạo câu hỏi (không gắn quiz)
            Map.entry("POST:/api/questions/import-excel",              new String[]{RESOURCE_QUESTION, ACTION_CREATE}),    // Import câu hỏi từ file Excel
            Map.entry("GET:/api/questions/import-template",            new String[]{RESOURCE_QUESTION, ACTION_READ}),      // Tải file Excel mẫu để import câu hỏi
            Map.entry("PUT:/api/questions/{questionId}",               new String[]{RESOURCE_QUESTION, ACTION_UPDATE}),    // Cập nhật câu hỏi
            Map.entry("DELETE:/api/questions/{questionId}",            new String[]{RESOURCE_QUESTION, ACTION_DELETE}),    // Xóa câu hỏi
            Map.entry("GET:/api/quizzes/{quizId}/questions",           new String[]{RESOURCE_QUESTION, ACTION_READ}),      // Danh sách câu hỏi của quiz
            Map.entry("GET:/api/courses/{courseId}/questions",         new String[]{RESOURCE_QUESTION, ACTION_READ}),      // Danh sách câu hỏi của course (phân trang)
            Map.entry("GET:/api/courses/{courseId}/questions/all",     new String[]{RESOURCE_QUESTION, ACTION_READ}),      // Tất cả câu hỏi (không phân trang)
            Map.entry("GET:/api/courses/{courseId}/questions/random",  new String[]{RESOURCE_QUESTION, ACTION_READ}),      // Câu hỏi ngẫu nhiên
            Map.entry("GET:/api/questions/lesson/{lessonId}/paginated", new String[]{RESOURCE_QUESTION, ACTION_READ}),     // Câu hỏi theo bài học có phân trang
            Map.entry("POST:/api/quizzes/{quizId}/assign-questions",   new String[]{RESOURCE_QUESTION, ACTION_UPDATE}),    // Gán câu hỏi vào quiz
            Map.entry("DELETE:/api/quizzes/{quizId}/questions/{questionId}", new String[]{RESOURCE_QUESTION, ACTION_DELETE}), // Gỡ câu hỏi khỏi quiz

            // ==================== QUIZ ATTEMPT (Làm bài Quiz) ====================
            Map.entry("POST:/api/quizzes/{quizId}/attempts",               new String[]{RESOURCE_QUIZ_ATTEMPT, ACTION_CREATE}),  // Bắt đầu làm bài
            Map.entry("PUT:/api/attempts/{attemptId}/answers",             new String[]{RESOURCE_QUIZ_ATTEMPT, ACTION_UPDATE}),  // Lưu tạm câu trả lời
            Map.entry("POST:/api/attempts/{attemptId}/submit",             new String[]{RESOURCE_QUIZ_ATTEMPT, ACTION_SUBMIT}),  // Nộp bài làm
            Map.entry("GET:/api/attempts/{attemptId}",                     new String[]{RESOURCE_QUIZ_ATTEMPT, ACTION_READ}),    // Xem kết quả
            Map.entry("GET:/api/quizzes/{quizId}/attempts/mine",           new String[]{RESOURCE_QUIZ_ATTEMPT, ACTION_READ}),    // Lịch sử làm bài của tôi
            Map.entry("GET:/api/quizzes/{quizId}/attempts",                new String[]{RESOURCE_QUIZ_ATTEMPT, ACTION_READ}),    // Danh sách attempt của quiz (teacher)

            // ==================== PROGRESS (Tiến độ học) ====================
            Map.entry("GET:/api/progress/course/{courseId}",             new String[]{RESOURCE_PROGRESS, ACTION_READ}),    // Tiến độ khóa học
            Map.entry("GET:/api/progress/my-progress",                   new String[]{RESOURCE_PROGRESS, ACTION_READ}),    // Tiến độ của tôi
            Map.entry("POST:/api/progress/course/{courseId}/start",      new String[]{RESOURCE_PROGRESS, ACTION_CREATE}),  // Bắt đầu khóa học
            Map.entry("POST:/api/progress/course/{courseId}/recalculate", new String[]{RESOURCE_PROGRESS, ACTION_UPDATE}), // Tính lại tiến độ
            Map.entry("PUT:/api/progress/course/{courseId}/time-spent",  new String[]{RESOURCE_PROGRESS, ACTION_UPDATE}),  // Cập nhật thời gian học
            Map.entry("PUT:/api/progress/course/{courseId}/complete",    new String[]{RESOURCE_PROGRESS, ACTION_UPDATE}),  // Hoàn thành khóa học
            Map.entry("GET:/api/progress/course/{courseId}/all",         new String[]{RESOURCE_PROGRESS, ACTION_READ}),    // Tiến độ tất cả học viên
            Map.entry("POST:/api/progress/resource/{resourceId}/start",  new String[]{RESOURCE_PROGRESS, ACTION_CREATE}),  // Bắt đầu học tài nguyên
            Map.entry("GET:/api/progress/resource/{resourceId}",         new String[]{RESOURCE_PROGRESS, ACTION_READ}),    // Tiến độ tài nguyên
            Map.entry("PUT:/api/progress/resource/{resourceId}",         new String[]{RESOURCE_PROGRESS, ACTION_UPDATE}),  // Cập nhật tiến độ tài nguyên
            Map.entry("PUT:/api/progress/resource/{resourceId}/time-spent", new String[]{RESOURCE_PROGRESS, ACTION_UPDATE}), // Thời gian học tài nguyên
            Map.entry("PUT:/api/progress/resource/{resourceId}/score",   new String[]{RESOURCE_PROGRESS, ACTION_UPDATE}),  // Cập nhật điểm số
            Map.entry("PUT:/api/progress/resource/{resourceId}/complete", new String[]{RESOURCE_PROGRESS, ACTION_UPDATE}), // Hoàn thành tài nguyên

            // ==================== LECTURER PROFILE (Hồ sơ giảng viên) ====================
            Map.entry("GET:/api/lecturer-profiles",                new String[]{RESOURCE_LECTURER_PROFILE, ACTION_READ}),    // Danh sách giảng viên
            Map.entry("GET:/api/lecturer-profiles/search",         new String[]{RESOURCE_LECTURER_PROFILE, ACTION_READ}),    // Tìm kiếm giảng viên
            Map.entry("GET:/api/lecturer-profiles/{id}",           new String[]{RESOURCE_LECTURER_PROFILE, ACTION_READ}),    // Chi tiết giảng viên
            Map.entry("GET:/api/lecturer-profiles/my-profile",     new String[]{RESOURCE_LECTURER_PROFILE, ACTION_READ}),    // Profile giảng viên của tôi
            Map.entry("POST:/api/lecturer-profiles",               new String[]{RESOURCE_LECTURER_PROFILE, ACTION_CREATE}),  // Tạo hồ sơ giảng viên
            Map.entry("PUT:/api/lecturer-profiles/{id}",           new String[]{RESOURCE_LECTURER_PROFILE, ACTION_UPDATE}),  // Cập nhật hồ sơ
            Map.entry("PUT:/api/lecturer-profiles/{id}/deactivate",new String[]{RESOURCE_LECTURER_PROFILE, ACTION_UPDATE}),  // Vô hiệu giảng viên
            Map.entry("PUT:/api/lecturer-profiles/{id}/activate",  new String[]{RESOURCE_LECTURER_PROFILE, ACTION_UPDATE}),  // Kích hoạt giảng viên

            // ==================== ORDER (Đơn hàng) ====================
            Map.entry("GET:/api/orders",                        new String[]{RESOURCE_ORDER, ACTION_READ}),      // Danh sách đơn hàng
            Map.entry("GET:/api/orders/admin",                  new String[]{RESOURCE_ORDER, ACTION_READ}),      // Đơn hàng (admin)
            Map.entry("GET:/api/orders/my-orders",              new String[]{RESOURCE_ORDER, ACTION_READ}),      // Đơn hàng của tôi
            Map.entry("GET:/api/orders/{id}",                   new String[]{RESOURCE_ORDER, ACTION_READ}),      // Chi tiết đơn hàng
            Map.entry("POST:/api/orders",                       new String[]{RESOURCE_ORDER, ACTION_CREATE}),    // Tạo đơn hàng
            Map.entry("POST:/api/orders/payment",               new String[]{RESOURCE_ORDER, ACTION_UPDATE}),    // Thanh toán đơn hàng
            Map.entry("PUT:/api/orders/{id}/cancel",            new String[]{RESOURCE_ORDER, ACTION_UPDATE}),    // Hủy đơn hàng

            // ==================== ORDER ITEM (Chi tiết đơn hàng) ====================
            Map.entry("GET:/api/order-items/enrolled",          new String[]{RESOURCE_ORDER, ACTION_READ}),      // Khóa học đã đăng ký
            Map.entry("GET:/api/order-items/waiting",           new String[]{RESOURCE_ORDER, ACTION_READ}),      // Khóa học chờ thanh toán
            Map.entry("GET:/api/order-items/active",            new String[]{RESOURCE_ORDER, ACTION_READ}),      // Khóa học đang học
            Map.entry("GET:/api/order-items/completed",         new String[]{RESOURCE_ORDER, ACTION_READ}),      // Khóa học đã hoàn thành
            Map.entry("GET:/api/order-items/course/{courseId}/students", new String[]{RESOURCE_ORDER, ACTION_READ}), // Học viên của khóa học
            Map.entry("GET:/api/order-items/course/{courseId}/count",    new String[]{RESOURCE_ORDER, ACTION_READ}), // Số học viên của khóa học
            Map.entry("PUT:/api/order-items/{id}/progress",     new String[]{RESOURCE_ORDER, ACTION_UPDATE}),    // Cập nhật tiến độ học viên
            Map.entry("PUT:/api/order-items/{id}/complete",     new String[]{RESOURCE_ORDER, ACTION_UPDATE}),    // Hoàn thành khóa học
            Map.entry("PUT:/api/order-items/{id}/drop",         new String[]{RESOURCE_ORDER, ACTION_UPDATE}),    // Bỏ khóa học
            Map.entry("DELETE:/api/order-items/{id}",           new String[]{RESOURCE_ORDER, ACTION_DELETE}),    // Xóa đăng ký

            // ==================== REVIEW (Đánh giá) ====================
            Map.entry("GET:/api/reviews/course/{courseId}",         new String[]{RESOURCE_REVIEW, ACTION_READ}),    // Đánh giá của khóa học
            Map.entry("GET:/api/reviews/my-reviews",                new String[]{RESOURCE_REVIEW, ACTION_READ}),    // Đánh giá của tôi
            Map.entry("GET:/api/reviews/course/{courseId}/average", new String[]{RESOURCE_REVIEW, ACTION_READ}),    // Rating trung bình
            Map.entry("GET:/api/reviews/course/{courseId}/count",   new String[]{RESOURCE_REVIEW, ACTION_READ}),    // Số lượng đánh giá
            Map.entry("POST:/api/reviews/course/{courseId}",        new String[]{RESOURCE_REVIEW, ACTION_CREATE}),  // Tạo đánh giá
            Map.entry("PUT:/api/reviews/{id}",                      new String[]{RESOURCE_REVIEW, ACTION_UPDATE}),  // Cập nhật đánh giá
            Map.entry("DELETE:/api/reviews/{id}",                   new String[]{RESOURCE_REVIEW, ACTION_DELETE}),  // Xóa đánh giá

            // ==================== WISHLIST (Yêu thích) ====================
            Map.entry("GET:/api/wishlist/my-wishlist",          new String[]{RESOURCE_WISHLIST, ACTION_READ}),     // Danh sách yêu thích
            Map.entry("GET:/api/wishlist/check/{courseId}",     new String[]{RESOURCE_WISHLIST, ACTION_READ}),     // Kiểm tra yêu thích
            Map.entry("GET:/api/wishlist/count",                new String[]{RESOURCE_WISHLIST, ACTION_READ}),     // Số lượng yêu thích
            Map.entry("POST:/api/wishlist/{courseId}",          new String[]{RESOURCE_WISHLIST, ACTION_CREATE}),   // Thêm yêu thích
            Map.entry("DELETE:/api/wishlist/{courseId}",        new String[]{RESOURCE_WISHLIST, ACTION_DELETE}),   // Xóa yêu thích

            // ==================== AUDIT LOG (Nhật ký hoạt động) ====================
            Map.entry("GET:/api/audit-logs",                        new String[]{RESOURCE_AUDIT_LOG, ACTION_READ}),   // Danh sách nhật ký
            Map.entry("GET:/api/audit-logs/entity/{entityType}/{entityId}", new String[]{RESOURCE_AUDIT_LOG, ACTION_READ}), // Nhật ký theo entity
            Map.entry("GET:/api/audit-logs/actor/{actorId}",        new String[]{RESOURCE_AUDIT_LOG, ACTION_READ}),   // Nhật ký theo người dùng
            Map.entry("DELETE:/api/audit-logs/clean",               new String[]{RESOURCE_AUDIT_LOG, ACTION_DELETE}), // Dọn dẹp nhật ký

            // ==================== CHAT (Quản lý Chat) ====================
            // Conversation APIs
            Map.entry("POST:/api/chat/conversations",                      new String[]{RESOURCE_CHAT, ACTION_CREATE}),   // Tạo conversation mới
            Map.entry("GET:/api/chat/conversations",                       new String[]{RESOURCE_CHAT, ACTION_READ}),     // Danh sách conversation của tôi
            Map.entry("GET:/api/chat/conversations/{conversationId}",      new String[]{RESOURCE_CHAT, ACTION_READ}),     // Chi tiết conversation

            // Participant APIs
            Map.entry("GET:/api/chat/conversations/{conversationId}/participants",              new String[]{RESOURCE_CHAT, ACTION_READ}),     // Danh sách thành viên
            Map.entry("POST:/api/chat/conversations/{conversationId}/participants",             new String[]{RESOURCE_CHAT, ACTION_CREATE}),   // Thêm thành viên
            Map.entry("DELETE:/api/chat/conversations/{conversationId}/participants/{accountId}", new String[]{RESOURCE_CHAT, ACTION_DELETE}), // Xóa thành viên

            // Message APIs
            Map.entry("GET:/api/chat/conversations/{conversationId}/messages",    new String[]{RESOURCE_CHAT, ACTION_READ}),     // Danh sách tin nhắn
            Map.entry("POST:/api/chat/conversations/{conversationId}/messages",   new String[]{RESOURCE_CHAT, ACTION_CREATE}),   // Gửi tin nhắn (REST fallback)
            Map.entry("PUT:/api/chat/conversations/{conversationId}/read",        new String[]{RESOURCE_CHAT, ACTION_UPDATE}),   // Đánh dấu đã đọc
            Map.entry("DELETE:/api/chat/messages/{messageId}",                    new String[]{RESOURCE_CHAT, ACTION_DELETE}),   // Xóa tin nhắn
            Map.entry("PUT:/api/chat/messages/{messageId}",                       new String[]{RESOURCE_CHAT, ACTION_UPDATE}),   // Chỉnh sửa tin nhắn

            // Phân quyền trong conversation
            Map.entry("POST:/api/chat/conversations/{conversationId}/participants/{targetId}/grant",  new String[]{RESOURCE_CHAT, ACTION_UPDATE}),  // Gán quyền cho thành viên
            Map.entry("POST:/api/chat/conversations/{conversationId}/participants/{targetId}/revoke", new String[]{RESOURCE_CHAT, ACTION_UPDATE}),  // Thu hồi quyền
            Map.entry("POST:/api/chat/conversations/{conversationId}/participants/{targetId}/mute",   new String[]{RESOURCE_CHAT, ACTION_UPDATE}),  // Mute thành viên
            Map.entry("POST:/api/chat/conversations/{conversationId}/participants/{targetId}/unmute", new String[]{RESOURCE_CHAT, ACTION_UPDATE}),  // Unmute thành viên
            Map.entry("POST:/api/chat/conversations/{conversationId}/participants/{targetId}/ban",    new String[]{RESOURCE_CHAT, ACTION_UPDATE}),  // Ban thành viên
            Map.entry("POST:/api/chat/conversations/{conversationId}/participants/{targetId}/unban",  new String[]{RESOURCE_CHAT, ACTION_UPDATE}),  // Unban thành viên
            Map.entry("POST:/api/chat/conversations/{conversationId}/transfer-ownership/{newOwnerId}", new String[]{RESOURCE_CHAT, ACTION_UPDATE}), // Chuyển quyền OWNER

            // Contact APIs
            Map.entry("GET:/api/chat/contacts/teachers",                    new String[]{RESOURCE_CHAT, ACTION_READ}),     // Danh sách giảng viên để chat
            Map.entry("GET:/api/chat/contacts/courses",                     new String[]{RESOURCE_CHAT, ACTION_READ}),     // Danh sách khóa học của tôi
            Map.entry("GET:/api/chat/contacts/courses/{courseId}/students", new String[]{RESOURCE_CHAT, ACTION_READ}),     // Danh sách học viên của khóa học

            // ==================== NOTIFICATION (Thông báo) ====================
            Map.entry("GET:/api/notifications",                        new String[]{RESOURCE_NOTIFICATION, ACTION_READ}),    // Danh sách thông báo
            Map.entry("GET:/api/notifications/unread-count",           new String[]{RESOURCE_NOTIFICATION, ACTION_READ}),    // Số thông báo chưa đọc
            Map.entry("PUT:/api/notifications/{notificationId}/read",  new String[]{RESOURCE_NOTIFICATION, ACTION_UPDATE}),  // Đánh dấu đã đọc
            Map.entry("PUT:/api/notifications/read-all",               new String[]{RESOURCE_NOTIFICATION, ACTION_UPDATE}),  // Đánh dấu tất cả đã đọc
            Map.entry("POST:/api/notifications/send",                  new String[]{RESOURCE_NOTIFICATION, ACTION_CREATE}),  // Gửi thông báo
            Map.entry("DELETE:/api/notifications/{notificationId}",    new String[]{RESOURCE_NOTIFICATION, ACTION_DELETE})   // Xóa thông báo
    );

    // ==================== ADMIN URLS ====================
    public static final String[] ADMIN_URLS = {
            "/api/admin/**",                        // Tất cả API admin
            "/api/rbac/**",                         // Quản lý phân quyền
            "/api/users/import-students",           // Import học viên
            "/api/audit-logs/**",                   // Xem nhật ký
            "/api/orders/admin/**",                 // Quản lý đơn hàng (admin)
            "/api/lecturer-profiles/*/deactivate",  // Vô hiệu giảng viên
            "/api/lecturer-profiles/*/activate",    // Kích hoạt giảng viên
    };

    // ==================== USER URLS ====================
    public static final String[] USER_URLS = {
            "/api/user/**",                          // API người dùng
            "/api/auth/me",                          // Thông tin tài khoản hiện tại
            "/api/auth/logout",                      // Đăng xuất
            "/api/auth/change-password",             // Đổi mật khẩu
            "/api/users/profile",                    // Xem profile
            "/api/users/avatar",                     // Upload avatar

            "/api/courses/{id}",                     // Chi tiết khóa học
            "/api/courses/instructor",               // Khóa học của giảng viên
            "/api/courses/{id}/clone",               // Nhân bản khóa học
            "/api/courses/{id}/submit-review",       // Gửi review khóa học

            "/api/courses/{courseId}/chapters",      // Chương của khóa học
            "/api/chapters/{id}",                    // Chi tiết chương
            "/api/chapters/batch/order",             // Sắp xếp chương

            "/api/courses/{courseId}/resources",     // Tài nguyên khóa học
            "/api/courses/{courseId}/chapters/{chapterId}/resources", // Tài nguyên theo chương
            "/api/courses/{courseId}/resources/{resourceId}/chapter", // Chuyển tài nguyên
            "/api/resources/**",                     // Tất cả API tài nguyên

            // ===== QUIZ & QUESTION & ATTEMPT (đã tách riêng, không dùng wildcard gộp) =====
            "/api/courses/{courseId}/quizzes",           // Quiz của khóa học
            "/api/quizzes/{quizId}",                     // Chi tiết quiz
            "/api/quizzes/{quizId}/publish",             // Publish quiz
            "/api/quizzes/{quizId}/close",               // Đóng quiz
            "/api/quizzes/{quizId}/questions",           // Câu hỏi của quiz
            "/api/quizzes/{quizId}/assign-questions",    // Gán câu hỏi vào quiz
            "/api/quizzes/{quizId}/questions/{questionId}", // Gỡ câu hỏi khỏi quiz
            "/api/quizzes/{quizId}/attempts",            // Bắt đầu làm bài + xem lịch sử
            "/api/quizzes/{quizId}/attempts/mine",       // Lịch sử làm bài của tôi

            "/api/courses/{courseId}/questions",         // Câu hỏi của khóa học
            "/api/courses/{courseId}/questions/all",     // Tất cả câu hỏi
            "/api/courses/{courseId}/questions/random",  // Câu hỏi ngẫu nhiên
            "/api/questions",                            // Tạo câu hỏi
            "/api/questions/import-excel",               // Import câu hỏi từ Excel
            "/api/questions/import-template",            // Tải file Excel mẫu
            "/api/questions/lesson/{lessonId}/paginated",// Câu hỏi theo lesson (phân trang)

            "/api/attempts/**",                          // Tất cả API attempt (lưu, nộp, xem kết quả)

            "/api/progress/**",                      // Tất cả API tiến độ

            "/api/orders/my-orders",                 // Đơn hàng của tôi
            "/api/orders/payment",                   // Thanh toán
            "/api/orders/{id}",                      // Chi tiết đơn hàng
            "/api/orders/{id}/cancel",               // Hủy đơn hàng
            "/api/orders",                           // Tạo đơn hàng

            "/api/order-items/**",                   // Tất cả API order items

            // ✅ PATCH 3: đã xóa 2 dòng trùng với PUBLIC_GET_URLS:
            //    "/api/lecturer-profiles"
            //    "/api/lecturer-profiles/{id}"
            "/api/lecturer-profiles/my-profile",     // Profile giảng viên của tôi

            "/api/reviews/my-reviews",               // Đánh giá của tôi
            "/api/reviews/course/{courseId}",        // Đánh giá khóa học
            "/api/reviews/{id}",                     // Chi tiết đánh giá

            "/api/wishlist/**",                      // Tất cả API yêu thích

            "/api/chat/**",                          // Chat
            "/api/notifications/**",                 // Thông báo
    };
}