package org.wisdom.oc01.service.impl;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.wisdom.oc01.dto.request.CategoryRequest;
import org.wisdom.oc01.dto.response.CategoryResponse;
import org.wisdom.oc01.entity.Category;
import org.wisdom.oc01.exception.ErrorHandler;
import org.wisdom.oc01.generic.ServiceImpl;
import org.wisdom.oc01.repository.CategoryRepository;
import org.wisdom.oc01.service.CategoryService;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl extends ServiceImpl<Category, String, CategoryRepository> implements CategoryService {
    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public CategoryServiceImpl(CategoryRepository repository) {
        super(repository);
    }

    /** Tạo danh mục mới, kiểm tra trùng tên cùng cấp và gán parent + level nếu có */
    @Override @Transactional
    public Category createCategory(CategoryRequest request) {
        // Kiểm tra trùng tên trong cùng cấp
        if (repository.existsByNameAndParentId(request.getName(), request.getParentId())) {
            throw new ErrorHandler(HttpStatus.CONFLICT, "Tên danh mục đã tồn tại trong cùng cấp");
        }
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(toSlug(request.getName()));
        category.setDescription(request.getDescription());
        if (request.getParentId() != null) {
            Category parent = findOne(request.getParentId());
            if (parent == null) {
                throw new ErrorHandler(HttpStatus.NOT_FOUND, "Danh mục cha không tồn tại");
            }
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(0);
        }
        return repository.save(category);
    }

    /** Cập nhật danh mục, kiểm tra trùng tên (loại trừ chính nó) và cập nhật parent + level */
    @Override @Transactional
    public Category updateCategory(String id, CategoryRequest request) {
        Category category = findOne(id);
        if (category == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Danh mục không tồn tại");
        }
        // Kiểm tra trùng tên (loại trừ chính nó)
        if (repository.existsByNameAndParentIdAndIdNot(request.getName(), request.getParentId(), id)) {
            throw new ErrorHandler(HttpStatus.CONFLICT, "Tên danh mục đã tồn tại trong cùng cấp");
        }
        category.setName(request.getName());
        category.setSlug(toSlug(request.getName()));
        category.setDescription(request.getDescription());
        if (request.getParentId() != null && !request.getParentId().equals(id)) {
            Category parent = findOne(request.getParentId());
            if (parent == null) {
                throw new ErrorHandler(HttpStatus.NOT_FOUND, "Danh mục cha không tồn tại");
            }
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        }
        return repository.save(category);
    }

    /** Lấy cây danh mục từ các root */
    @Override
    public List<CategoryResponse> getTree() {
        List<Category> roots = repository.findByParentIsNull();
        return roots.stream().map(this::buildTree).collect(Collectors.toList());
    }

    /** Build đệ quy cây category, set children rỗng nếu không có con */
    private CategoryResponse buildTree(Category category) {
        CategoryResponse response = mapToResponse(category);
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            response.setChildren(category.getChildren().stream().map(this::buildTree).collect(Collectors.toList()));
        } else {
            response.setChildren(new ArrayList<>()); // Set empty list
        }
        return response;
    }

    /** Tìm danh mục theo tên (không phân biệt hoa thường) */
    @Override
    public List<CategoryResponse> searchByName(String keyword) {
        List<Category> categories = repository.findByNameContainingIgnoreCase(keyword);
        return categories.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Đảo trạng thái active: chỉ cho phép khi không vi phạm ràng buộc cha/con/course */
    @Override @Transactional
    public void toggleStatus(String id) {
        Category category = findOne(id);
        if (category == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Danh mục không tồn tại");
        }
        // Nếu đang Active → sắp chuyển sang Inactive: kiểm tra có course đang dùng không
        if (category.getIsActive()) {
            long courseCount = repository.countCoursesByCategoryId(id);
            if (courseCount > 0) {
                throw new ErrorHandler(HttpStatus.CONFLICT, "Không thể vô hiệu hóa danh mục đang được " + courseCount + " khóa học sử dụng");
            }
            // Kiểm tra danh mục con có đang active không
            if (category.getChildren() != null && !category.getChildren().isEmpty()) {
                long activeChildren = category.getChildren().stream().filter(Category::getIsActive).count();
                if (activeChildren > 0) {
                    throw new ErrorHandler(HttpStatus.CONFLICT, "Không thể vô hiệu hóa danh mục đang có " + activeChildren + " danh mục con đang hoạt động");
                }
            }
        }
        // Nếu đang Inactive → sắp chuyển sang Active: kiểm tra danh mục cha có active không
        else {
            if (category.getParent() != null && !category.getParent().getIsActive()) {
                throw new ErrorHandler(HttpStatus.CONFLICT, "Không thể kích hoạt danh mục con khi danh mục cha đang bị vô hiệu hóa");
            }
        }
        category.setIsActive(!category.getIsActive());
        repository.save(category);
    }

    /** Xóa danh mục: chỉ cho phép khi không có course dùng và không có danh mục con */
    @Override @Transactional
    public void deleteCategory(String id) {
        Category category = findOne(id);
        if (category == null) {
            throw new ErrorHandler(HttpStatus.NOT_FOUND, "Danh mục không tồn tại");
        }
        // Không cho xóa nếu đang có khóa học sử dụng
        long courseCount = repository.countCoursesByCategoryId(id);
        if (courseCount > 0) {
            throw new ErrorHandler(HttpStatus.CONFLICT, "Không thể xóa danh mục đang được " + courseCount + " khóa học sử dụng");
        }
        // Không cho xóa nếu có danh mục con
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            throw new ErrorHandler(HttpStatus.CONFLICT, "Không thể xóa danh mục đang có " + category.getChildren().size() + " danh mục con");
        }
        repository.delete(category);
    }

    /** Map Category → CategoryResponse */
    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .level(category.getLevel())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    /** Chuyển chuỗi thành slug (bỏ dấu, thay space bằng -, chỉ giữ chữ/số/-) */
    private String toSlug(String input) {
        String noWhiteSpace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(noWhiteSpace, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-+", "-");
    }
}