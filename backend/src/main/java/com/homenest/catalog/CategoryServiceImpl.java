package com.homenest.catalog;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import com.homenest.exception.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<CategoryResponseDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<Object[]> counts = categoryRepository.countProductsGroupedBySlug();
        Map<String, Long> countMap = new HashMap<>();
        for (Object[] row : counts) {
            String slug = (String) row[0];
            Long count = (Long) row[1];
            countMap.put(slug, count);
        }

        return categories.stream().map(cat -> {
            long itemCount = countMap.getOrDefault(cat.getSlug(), 0L);
            return new CategoryResponseDTO(
                    cat.getId(),
                    cat.getSlug(),
                    cat.getName(),
                    cat.getDescription(),
                    cat.getImage(),
                    itemCount
            );
        }).collect(Collectors.toList());
    }

    @Override
    public CategoryResponseDTO getCategoryBySlug(String slug) {
        Category cat = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));

        long count = cat.getProducts() != null
                ? cat.getProducts().stream().filter(p -> Boolean.TRUE.equals(p.getIsActive())).count()
                : 0L;
        return new CategoryResponseDTO(
                cat.getId(),
                cat.getSlug(),
                cat.getName(),
                cat.getDescription(),
                cat.getImage(),
                count
        );
    }

    @Override
    @Transactional
    public CategoryResponseDTO createCategory(CreateCategoryRequest request) {
        String normalizedSlug = slugify(request.getSlug());
        if (normalizedSlug.isEmpty()) {
            throw new IllegalArgumentException("Slug danh mục không hợp lệ.");
        }
        if (categoryRepository.findBySlug(normalizedSlug).isPresent()) {
            throw new IllegalArgumentException("Danh mục với slug '" + normalizedSlug + "' đã tồn tại.");
        }

        String categoryId = (request.getId() != null && !request.getId().isBlank())
                ? slugify(request.getId())
                : "cat-" + normalizedSlug;
        if (categoryRepository.existsById(categoryId)) {
            throw new IllegalArgumentException("Mã danh mục đã tồn tại: " + categoryId);
        }

        Category category = new Category(
                categoryId,
                normalizedSlug,
                request.getName().trim(),
                request.getDescription() != null ? request.getDescription().trim() : "",
                request.getImage().trim()
        );
        Category saved = categoryRepository.save(category);
        return new CategoryResponseDTO(
                saved.getId(),
                saved.getSlug(),
                saved.getName(),
                saved.getDescription(),
                saved.getImage(),
                0L
        );
    }

    private String slugify(String input) {
        if (input == null) {
            return "";
        }
        return Normalizer.normalize(input.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'd')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }
}
