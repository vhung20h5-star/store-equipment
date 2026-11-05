package com.homenest.catalog;

import java.util.List;

import com.homenest.common.PageResponse;

public interface ProductService {

    PageResponse<ProductResponseDTO> getProducts(String category, String search, int page, int size, String sort);

    ProductResponseDTO getProductById(String id);

    List<ProductResponseDTO> getBestsellers();
}

