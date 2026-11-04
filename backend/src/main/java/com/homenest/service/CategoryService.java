package com.homenest.service;

import com.homenest.dto.CategoryResponseDTO;
import java.util.List;

public interface CategoryService {

    List<CategoryResponseDTO> getAllCategories();

    CategoryResponseDTO getCategoryBySlug(String slug);
}

