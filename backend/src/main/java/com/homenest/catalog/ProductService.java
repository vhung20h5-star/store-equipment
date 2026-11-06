package com.homenest.catalog;

import java.util.List;

import com.homenest.common.PageResponse;

public interface ProductService {

    PageResponse<ProductResponseDTO> getProducts(String category, String search, int page, int size, String sort);

    ProductResponseDTO getProductById(String id);

    List<ProductResponseDTO> getBestsellers();

    PageResponse<ProductResponseDTO> getAdminProducts(
            String category,
            String search,
            Boolean isActive,
            Boolean inStock,
            int page,
            int size
    );

    ProductResponseDTO createProduct(CreateProductRequest request, String adminEmail);

    ProductResponseDTO updateProduct(String id, UpdateProductRequest request);

    ProductResponseDTO updateProductVisibility(String id, boolean isActive);

    InventoryAdjustmentResponseDTO adjustStock(String id, AdjustStockRequest request, String adminEmail);

    List<InventoryAdjustmentResponseDTO> getStockAdjustments(String id);
}
