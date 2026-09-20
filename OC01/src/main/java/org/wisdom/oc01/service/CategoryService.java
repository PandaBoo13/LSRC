package org.wisdom.oc01.service;

import org.wisdom.oc01.dto.request.CategoryRequest;
import org.wisdom.oc01.dto.response.CategoryResponse;
import org.wisdom.oc01.entity.Category;
import org.wisdom.oc01.generic.IService;
import java.util.List;

public interface CategoryService extends IService<Category, String> {
    Category createCategory(CategoryRequest request);
    Category updateCategory(String id, CategoryRequest request);
    List<CategoryResponse> getTree();
    List<CategoryResponse> searchByName(String keyword);
    void toggleStatus(String id);
    void deleteCategory(String id);
}