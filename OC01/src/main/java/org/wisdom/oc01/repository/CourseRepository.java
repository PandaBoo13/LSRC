package org.wisdom.oc01.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Course;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer>, JpaSpecificationExecutor<Course> {

    // ==================== BASIC QUERIES ====================

    Optional<Course> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByTitleAndAccountIdAccount(String title, Integer accountId);

    // Lấy tất cả courses active (không phân trang)
    @Query("SELECT c FROM Course c WHERE c.deletedAt IS NULL")
    List<Course> findAllActive();

    // Lấy tất cả courses active (có phân trang)
    @Query("SELECT c FROM Course c WHERE c.deletedAt IS NULL")
    Page<Course> findAllActive(Pageable pageable);

    // Lấy courses theo account (có phân trang)
    @Query("SELECT c FROM Course c WHERE c.account.idAccount = :accountId AND c.deletedAt IS NULL")
    Page<Course> findByAccountId(@Param("accountId") Integer accountId, Pageable pageable);

    // Lấy courses theo status (có phân trang)
    @Query("SELECT c FROM Course c WHERE c.status = :status AND c.deletedAt IS NULL")
    Page<Course> findByStatus(@Param("status") Course.CourseStatus status, Pageable pageable);

    // Lấy courses published theo category (có phân trang)
    @Query("SELECT c FROM Course c WHERE c.category.id = :categoryId AND c.status = 'PUBLISHED' AND c.deletedAt IS NULL")
    Page<Course> findPublishedByCategoryId(@Param("categoryId") String categoryId, Pageable pageable);

    // Tìm kiếm courses theo keyword
    @Query("SELECT c FROM Course c WHERE c.deletedAt IS NULL AND " +
            "(:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Course> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Đếm courses theo account
    @Query("SELECT COUNT(c) FROM Course c WHERE c.account.idAccount = :accountId AND c.deletedAt IS NULL")
    Long countByAccountId(@Param("accountId") Integer accountId);

    // ==================== HOMEPAGE QUERIES ====================

    // Courses mới nhất
    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' AND c.deletedAt IS NULL " +
            "ORDER BY c.publishedAt DESC")
    List<Course> findNewestCourses(Pageable pageable);

    // Courses phổ biến nhất (dựa trên số lượng order items)
    @Query("SELECT c, COUNT(oi.id) as orderCount FROM Course c " +
            "LEFT JOIN OrderItem oi ON oi.course = c " +
            "WHERE c.status = 'PUBLISHED' AND c.deletedAt IS NULL " +
            "GROUP BY c.idCourse " +
            "ORDER BY orderCount DESC")
    List<Course> findMostPopularCourses(Pageable pageable);

    // Courses được đánh giá cao nhất
    @Query("SELECT c, AVG(COALESCE(r.rating, 0)) as avgRating FROM Course c " +
            "LEFT JOIN c.reviews r " +
            "WHERE c.status = 'PUBLISHED' AND c.deletedAt IS NULL " +
            "GROUP BY c.idCourse " +
            "HAVING COUNT(r.idReview) > 0 " +
            "ORDER BY avgRating DESC")
    List<Course> findTopRatedCourses(Pageable pageable);

    // Courses miễn phí
    @Query("SELECT c FROM Course c WHERE c.isFree = true AND c.status = 'PUBLISHED' AND c.deletedAt IS NULL " +
            "ORDER BY c.publishedAt DESC")
    List<Course> findFreeCourses(Pageable pageable);

    // Courses đang giảm giá
    @Query("SELECT c FROM Course c WHERE c.oldPrice IS NOT NULL AND c.oldPrice > c.price " +
            "AND c.status = 'PUBLISHED' AND c.deletedAt IS NULL " +
            "ORDER BY (c.oldPrice - c.price) DESC")
    List<Course> findDiscountedCourses(Pageable pageable);

    // Courses theo category
    @Query("SELECT c FROM Course c WHERE c.category.id = :categoryId AND c.status = 'PUBLISHED' AND c.deletedAt IS NULL " +
            "ORDER BY c.publishedAt DESC")
    List<Course> findByCategoryId(@Param("categoryId") String categoryId, Pageable pageable);

    // ==================== SORTING QUERIES ====================

    // Tất cả courses sắp xếp theo số lượng học viên
    @Query("SELECT c, COUNT(oi.id) as studentCount FROM Course c " +
            "LEFT JOIN OrderItem oi ON oi.course = c " +
            "WHERE c.deletedAt IS NULL " +
            "GROUP BY c.idCourse " +
            "ORDER BY studentCount DESC")
    Page<Course> findAllSortedByStudents(Pageable pageable);

    // Tất cả courses sắp xếp theo rating
    @Query("SELECT c, AVG(COALESCE(r.rating, 0)) as avgRating FROM Course c " +
            "LEFT JOIN c.reviews r " +
            "WHERE c.deletedAt IS NULL " +
            "GROUP BY c.idCourse " +
            "ORDER BY avgRating DESC")
    Page<Course> findAllSortedByRating(Pageable pageable);

    // Courses theo account (không phân trang)
    @Query("SELECT c FROM Course c WHERE c.account.idAccount = :accountId AND c.deletedAt IS NULL " +
            "ORDER BY c.createdAt DESC")
    List<Course> findByAccountIdAccount(@Param("accountId") Integer accountId);

    // ==================== ADDITIONAL QUERIES ====================

    // Lấy courses theo danh sách IDs
    @Query("SELECT c FROM Course c WHERE c.idCourse IN :ids AND c.deletedAt IS NULL")
    List<Course> findByIds(@Param("ids") List<Integer> ids);

    // Lấy courses theo level và status
    @Query("SELECT c FROM Course c WHERE c.level = :level AND c.status = 'PUBLISHED' AND c.deletedAt IS NULL")
    Page<Course> findByLevelAndPublished(@Param("level") Course.Level level, Pageable pageable);

    // Lấy courses có certificate
    @Query("SELECT c FROM Course c WHERE c.hasCertificate = true AND c.status = 'PUBLISHED' AND c.deletedAt IS NULL")
    Page<Course> findCoursesWithCertificate(Pageable pageable);

    // Tìm courses liên quan (cùng category, khác course)
    @Query("SELECT c FROM Course c WHERE c.category.id = :categoryId " +
            "AND c.idCourse != :courseId " +
            "AND c.status = 'PUBLISHED' AND c.deletedAt IS NULL " +
            "ORDER BY c.publishedAt DESC")
    List<Course> findRelatedCourses(@Param("categoryId") String categoryId,
                                    @Param("courseId") Integer courseId,
                                    Pageable pageable);

    // Lấy courses đang pending review (cho admin)
    @Query("SELECT c FROM Course c WHERE c.status = 'PENDING_REVIEW' AND c.deletedAt IS NULL " +
            "ORDER BY c.createdAt ASC")
    Page<Course> findPendingReviewCourses(Pageable pageable);

    // Đếm courses theo status
    @Query("SELECT COUNT(c) FROM Course c WHERE c.status = :status AND c.deletedAt IS NULL")
    Long countByStatus(@Param("status") Course.CourseStatus status);

    // Lấy courses theo language
    @Query("SELECT c FROM Course c WHERE c.language = :language AND c.status = 'PUBLISHED' AND c.deletedAt IS NULL")
    Page<Course> findByLanguage(@Param("language") String language, Pageable pageable);

    // Lấy courses theo prerequisite
    @Query("SELECT c FROM Course c WHERE c.prerequisiteCourse.idCourse = :prerequisiteId AND c.deletedAt IS NULL")
    List<Course> findByPrerequisiteCourseId(@Param("prerequisiteId") Integer prerequisiteId);

    // Lấy courses không có prerequisite
    @Query("SELECT c FROM Course c WHERE c.prerequisiteCourse IS NULL AND c.status = 'PUBLISHED' AND c.deletedAt IS NULL")
    List<Course> findCoursesWithoutPrerequisite(Pageable pageable);

    // Tìm courses theo nhiều tiêu chí (dùng cho filter nâng cao)
    @Query("SELECT c FROM Course c WHERE c.deletedAt IS NULL AND " +
            "(:categoryId IS NULL OR c.category.id = :categoryId) AND " +
            "(:level IS NULL OR c.level = :level) AND " +
            "(:isFree IS NULL OR c.isFree = :isFree) AND " +
            "(:language IS NULL OR c.language = :language) AND " +
            "(:minPrice IS NULL OR c.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR c.price <= :maxPrice) AND " +
            "c.status = 'PUBLISHED'")
    Page<Course> findWithFilters(@Param("categoryId") String categoryId,
                                 @Param("level") Course.Level level,
                                 @Param("isFree") Boolean isFree,
                                 @Param("language") String language,
                                 @Param("minPrice") java.math.BigDecimal minPrice,
                                 @Param("maxPrice") java.math.BigDecimal maxPrice,
                                 Pageable pageable);


    // ✅ THÊM METHOD NÀY - Lấy tất cả courses active (không phân trang)
    @Query("SELECT c FROM Course c WHERE c.deletedAt IS NULL")
    List<Course> findAllActiveCourses();
}