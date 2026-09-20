// src/test/java/org/wisdom/oc01/service/impl/CategoryServiceImplTest.java
package org.wisdom.oc01;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.wisdom.oc01.dto.request.CategoryRequest;
import org.wisdom.oc01.dto.response.CategoryResponse;
import org.wisdom.oc01.entity.Category;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.repository.CategoryRepository;
import org.wisdom.oc01.service.impl.CategoryServiceImpl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository repository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category parentCategory;
    private Category childCategory;
    private CategoryRequest createRequest;

    @BeforeEach
    void setUp() {
        parentCategory = new Category();
        parentCategory.setId("cat-1");
        parentCategory.setName("Lập trình");
        parentCategory.setSlug("lap-trinh");
        parentCategory.setLevel(0);
        parentCategory.setIsActive(true);

        childCategory = new Category();
        childCategory.setId("cat-2");
        childCategory.setName("Frontend");
        childCategory.setSlug("frontend");
        childCategory.setLevel(1);
        childCategory.setParent(parentCategory);
        childCategory.setIsActive(true);

        createRequest = new CategoryRequest();
        createRequest.setName("Backend");
        createRequest.setDescription("Khóa học Backend");
    }

    // ==================== CREATE ====================
    @Test
    void createCategory_Success() {
        when(repository.existsByNameAndParentId(anyString(), isNull())).thenReturn(false);
        when(repository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

        Category result = categoryService.createCategory(createRequest);

        assertNotNull(result);
        assertEquals("Backend", result.getName());
        assertEquals("backend", result.getSlug());
        assertEquals(0, result.getLevel());
        verify(repository).save(any(Category.class));
    }

    @Test
    void createCategory_DuplicateName_ShouldThrow() {
        when(repository.existsByNameAndParentId("Backend", null)).thenReturn(true);

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.createCategory(createRequest));
        assertEquals(HttpStatus.CONFLICT, error.getStatus());
        assertTrue(error.getMessage().contains("Tên danh mục đã tồn tại"));
        verify(repository, never()).save(any());
    }

    @Test
    void createCategory_WithParent_Success() {
        createRequest.setParentId("cat-1");
        when(repository.existsByNameAndParentId(anyString(), eq("cat-1"))).thenReturn(false);
        when(repository.findById("cat-1")).thenReturn(Optional.of(parentCategory));
        when(repository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

        Category result = categoryService.createCategory(createRequest);

        assertNotNull(result);
        assertEquals(1, result.getLevel());
        assertEquals(parentCategory, result.getParent());
    }

    @Test
    void createCategory_ParentNotFound_ShouldThrow() {
        createRequest.setParentId("invalid-id");
        when(repository.existsByNameAndParentId(anyString(), eq("invalid-id"))).thenReturn(false);
        when(repository.findById("invalid-id")).thenReturn(Optional.empty());

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.createCategory(createRequest));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
    }

    // ==================== UPDATE ====================
    @Test
    void updateCategory_Success() {
        CategoryRequest updateRequest = new CategoryRequest();
        updateRequest.setName("Lập trình Update");
        updateRequest.setDescription("Mô tả mới");

        when(repository.findById("cat-1")).thenReturn(Optional.of(parentCategory));
        when(repository.existsByNameAndParentIdAndIdNot("Lập trình Update", null, "cat-1")).thenReturn(false);
        when(repository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

        Category result = categoryService.updateCategory("cat-1", updateRequest);

        assertEquals("Lập trình Update", result.getName());
        assertEquals("lap-trinh-update", result.getSlug());
    }

    @Test
    void updateCategory_NotFound_ShouldThrow() {
        when(repository.findById("invalid")).thenReturn(Optional.empty());

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.updateCategory("invalid", createRequest));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
    }

    // ==================== GET TREE ====================
    @Test
    void getTree_Success() {
        List<Category> roots = List.of(parentCategory);
        parentCategory.setChildren(List.of(childCategory));
        when(repository.findByParentIsNull()).thenReturn(roots);

        List<CategoryResponse> result = categoryService.getTree();

        assertEquals(1, result.size());
        assertEquals("Lập trình", result.get(0).getName());
        assertEquals(1, result.get(0).getChildren().size());
        assertEquals("Frontend", result.get(0).getChildren().get(0).getName());
    }

    @Test
    void getTree_Empty() {
        when(repository.findByParentIsNull()).thenReturn(List.of());

        List<CategoryResponse> result = categoryService.getTree();

        assertTrue(result.isEmpty());
    }

    // ==================== SEARCH ====================
    @Test
    void searchByName_Success() {
        when(repository.findByNameContainingIgnoreCase("lập")).thenReturn(List.of(parentCategory));

        List<CategoryResponse> result = categoryService.searchByName("lập");

        assertEquals(1, result.size());
        assertEquals("Lập trình", result.get(0).getName());
    }

    // ==================== TOGGLE STATUS ====================
    @Test
    void toggleStatus_ActiveToInactive_Success() {
        when(repository.findById("cat-1")).thenReturn(Optional.of(parentCategory));
        when(repository.countCoursesByCategoryId("cat-1")).thenReturn(0L);
        parentCategory.setChildren(null);
        when(repository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

        categoryService.toggleStatus("cat-1");

        assertFalse(parentCategory.getIsActive());
        verify(repository).save(parentCategory);
    }

    @Test
    void toggleStatus_HasCourses_ShouldThrow() {
        parentCategory.setIsActive(true);
        when(repository.findById("cat-1")).thenReturn(Optional.of(parentCategory));
        when(repository.countCoursesByCategoryId("cat-1")).thenReturn(5L);

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.toggleStatus("cat-1"));
        assertEquals(HttpStatus.CONFLICT, error.getStatus());
        assertTrue(error.getMessage().contains("5 khóa học"));
    }

    @Test
    void toggleStatus_InactiveToActive_ParentInactive_ShouldThrow() {
        // ✅ Set child thành INACTIVE trước
        childCategory.setIsActive(false);

        // Set parent inactive
        Category inactiveParent = new Category();
        inactiveParent.setId("parent-id");
        inactiveParent.setIsActive(false);
        childCategory.setParent(inactiveParent);

        when(repository.findById("cat-2")).thenReturn(Optional.of(childCategory));

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.toggleStatus("cat-2"));
        assertEquals(HttpStatus.CONFLICT, error.getStatus());
        assertTrue(error.getMessage().contains("danh mục cha"));
    }

    @Test
    void toggleStatus_NotFound_ShouldThrow() {
        when(repository.findById("invalid")).thenReturn(Optional.empty());

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.toggleStatus("invalid"));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
    }

    // ==================== DELETE ====================
    @Test
    void deleteCategory_Success() {
        parentCategory.setChildren(null);
        when(repository.findById("cat-1")).thenReturn(Optional.of(parentCategory));
        when(repository.countCoursesByCategoryId("cat-1")).thenReturn(0L);

        categoryService.deleteCategory("cat-1");

        verify(repository).delete(parentCategory);
    }

    @Test
    void deleteCategory_HasCourses_ShouldThrow() {
        when(repository.findById("cat-1")).thenReturn(Optional.of(parentCategory));
        when(repository.countCoursesByCategoryId("cat-1")).thenReturn(3L);

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.deleteCategory("cat-1"));
        assertEquals(HttpStatus.CONFLICT, error.getStatus());
        assertTrue(error.getMessage().contains("3 khóa học"));
    }

    @Test
    void deleteCategory_HasChildren_ShouldThrow() {
        parentCategory.setChildren(List.of(childCategory));
        when(repository.findById("cat-1")).thenReturn(Optional.of(parentCategory));
        when(repository.countCoursesByCategoryId("cat-1")).thenReturn(0L);

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.deleteCategory("cat-1"));
        assertEquals(HttpStatus.CONFLICT, error.getStatus());
        assertTrue(error.getMessage().contains("danh mục con"));
    }

    @Test
    void deleteCategory_NotFound_ShouldThrow() {
        when(repository.findById("invalid")).thenReturn(Optional.empty());

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.deleteCategory("invalid"));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
    }
}