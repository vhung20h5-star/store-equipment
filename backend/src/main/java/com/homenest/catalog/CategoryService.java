package com.homenest.catalog;

import java.util.List;

public interface CategoryService {

    List<CategoryResponseDTO> getAllCategories();

    CategoryResponseDTO getCategoryBySlug(String slug);
}

