// src/test/java/org/wisdom/oc01/CategoryServiceImplIntegrationTest.java
package org.wisdom.oc01;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.wisdom.oc01.dto.request.CategoryRequest;
import org.wisdom.oc01.dto.response.CategoryResponse;
import org.wisdom.oc01.entity.Category;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.repository.CategoryRepository;
import org.wisdom.oc01.service.impl.CategoryServiceImpl;

import jakarta.transaction.Transactional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CategoryServiceImplIntegrationTest {

    @Autowired
    private CategoryServiceImpl categoryService;

    @Autowired
    private CategoryRepository categoryRepository;

    @BeforeEach
    void cleanUp() {
        categoryRepository.deleteAll();
        categoryRepository.flush();
    }

    @Test
    @Order(1)
    void createAndGetTree_Success() {
        CategoryRequest parentReq = new CategoryRequest();
        parentReq.setName("Lập trình");
        parentReq.setDescription("Danh mục lập trình");
        Category parent = categoryService.createCategory(parentReq);

        CategoryRequest childReq = new CategoryRequest();
        childReq.setName("Frontend");
        childReq.setParentId(parent.getId());
        categoryService.createCategory(childReq);

        List<CategoryResponse> tree = categoryService.getTree();
        assertEquals(1, tree.size());
        assertEquals("Lập trình", tree.get(0).getName());
        assertEquals(1, tree.get(0).getChildren().size());
        assertEquals("Frontend", tree.get(0).getChildren().get(0).getName());
    }

    @Test
    @Order(2)
    void toggleStatus_Success() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Thiết kế");
        Category category = categoryService.createCategory(req);
        assertTrue(category.getIsActive());

        categoryService.toggleStatus(category.getId());
        Category updated = categoryRepository.findById(category.getId()).orElseThrow();
        assertFalse(updated.getIsActive());

        categoryService.toggleStatus(category.getId());
        Category reactivated = categoryRepository.findById(category.getId()).orElseThrow();
        assertTrue(reactivated.getIsActive());
    }

    @Test
    @Order(3)
    void deleteCategory_WithoutChildren_Success() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Danh mục xóa");
        Category category = categoryService.createCategory(req);

        categoryService.deleteCategory(category.getId());
        assertTrue(categoryRepository.findById(category.getId()).isEmpty());
    }

    @Test
    @Order(4)
    void deleteCategory_WithChildren_ShouldThrow() {
        CategoryRequest parentReq = new CategoryRequest();
        parentReq.setName("Cha");
        Category parent = categoryService.createCategory(parentReq);

        CategoryRequest childReq = new CategoryRequest();
        childReq.setName("Con");
        childReq.setParentId(parent.getId());
        categoryService.createCategory(childReq);

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.deleteCategory(parent.getId()));
        assertEquals(HttpStatus.CONFLICT, error.getStatus());
    }

    @Test
    @Order(5)
    void searchByName_Success() {
        categoryService.createCategory(new CategoryRequest() {{ setName("ReactJS"); }});
        categoryService.createCategory(new CategoryRequest() {{ setName("React Native"); }});
        categoryService.createCategory(new CategoryRequest() {{ setName("Angular"); }});

        List<CategoryResponse> result = categoryService.searchByName("react");
        assertEquals(2, result.size());
    }

    @Test
    @Order(6)
    void createDuplicateName_SameLevel_ShouldThrow() {
        CategoryRequest req1 = new CategoryRequest();
        req1.setName("Duplicate");
        categoryService.createCategory(req1);

        CategoryRequest req2 = new CategoryRequest();
        req2.setName("Duplicate");

        ErrorHandler error = assertThrows(ErrorHandler.class, () -> categoryService.createCategory(req2));
        assertEquals(HttpStatus.CONFLICT, error.getStatus());
    }
}