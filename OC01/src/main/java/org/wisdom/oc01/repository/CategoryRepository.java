package org.wisdom.oc01.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wisdom.oc01.entity.Category;
import org.wisdom.oc01.generic.IRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends IRepository<Category, String> {

    Optional<Category> findById(String id);
    List<Category> findByParentIsNull();

    List<Category> findByParentId(String parentId);

    Optional<Category> findBySlug(String slug);

    List<Category> findByNameContainingIgnoreCase(String keyword);

    boolean existsByNameAndParentId(String name, String parentId);

    boolean existsByNameAndParentIdAndIdNot(String name, String parentId, String id);

    List<Category> findByIsActiveTrue();


    @Query("SELECT COUNT(c) FROM Course c WHERE c.category.id = :categoryId")
    long countCoursesByCategoryId(@Param("categoryId") String categoryId);

    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.children")
    List<Category> findAllWithChildren();
}