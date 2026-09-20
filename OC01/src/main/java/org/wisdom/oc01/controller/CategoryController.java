package org.wisdom.oc01.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.dto.request.CategoryRequest;
import org.wisdom.oc01.dto.response.CategoryResponse;
import org.wisdom.oc01.entity.Category;
import org.wisdom.oc01.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<RequestResponse> create(@Valid @RequestBody CategoryRequest request) {
        categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RequestResponse("Tạo danh mục thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RequestResponse> update(@PathVariable String id,
                                                  @Valid @RequestBody CategoryRequest request) {
        categoryService.updateCategory(id, request);
        return ResponseEntity.ok(new RequestResponse("Cập nhật danh mục thành công"));
    }

    @GetMapping("/tree")
    public ResponseEntity<RequestResponse> getTree() {
        List<CategoryResponse> tree = categoryService.getTree();
        return ResponseEntity.ok(new RequestResponse(tree, "Lấy cây danh mục thành công"));
    }

    @GetMapping("/search")
    public ResponseEntity<RequestResponse> search(@RequestParam String keyword) {
        List<CategoryResponse> results = categoryService.searchByName(keyword);
        return ResponseEntity.ok(new RequestResponse(results, "Tìm kiếm danh mục thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestResponse> getById(@PathVariable String id) {
        Category category = categoryService.findOne(id);

        if (category != null) {
            return ResponseEntity.ok(new RequestResponse(category, "Lấy danh mục thành công"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new RequestResponse("Không tìm thấy danh mục"));
        }
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<RequestResponse> toggleStatus(@PathVariable String id) {
        categoryService.toggleStatus(id);
        return ResponseEntity.ok(new RequestResponse("Chuyển trạng thái danh mục thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<RequestResponse> delete(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(new RequestResponse("Xóa danh mục thành công"));
    }
}