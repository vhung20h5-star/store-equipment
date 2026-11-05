package com.homenest.catalog;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
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

        long count = cat.getProducts() != null ? cat.getProducts().size() : 0L;
        return new CategoryResponseDTO(
                cat.getId(),
                cat.getSlug(),
                cat.getName(),
                cat.getDescription(),
                cat.getImage(),
                count
        );
    }
}

