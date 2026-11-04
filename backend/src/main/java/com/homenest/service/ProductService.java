package com.homenest.service;

import com.homenest.dto.PageResponse;
import com.homenest.dto.ProductResponseDTO;
import java.util.List;

public interface ProductService {

    PageResponse<ProductResponseDTO> getProducts(String category, String search, int page, int size, String sort);

    ProductResponseDTO getProductById(String id);

    List<ProductResponseDTO> getBestsellers();
}

