package com.homenest.catalog;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.homenest.common.ApiResponse;
import com.homenest.common.PageResponse;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminProductController {

    private final ProductService productService;
    private final CategoryService categoryService;

    public AdminProductController(ProductService productService, CategoryService categoryService) {
        this.productService = productService;
        this.categoryService = categoryService;
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponseDTO>>> getAdminProducts(
            @RequestParam(required = false, defaultValue = "all") String category,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        PageResponse<ProductResponseDTO> response = productService.getAdminProducts(
                category,
                search,
                isActive,
                inStock,
                page,
                size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> createProduct(
            @Valid @RequestBody CreateProductRequest request,
            Authentication authentication
    ) {
        String adminEmail = authentication != null ? authentication.getName() : "admin";
        ProductResponseDTO created = productService.createProduct(request, adminEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo sản phẩm mới thành công", created));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        ProductResponseDTO updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật sản phẩm thành công", updated));
    }

    @PatchMapping("/products/{id}/visibility")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> updateProductVisibility(
            @PathVariable String id,
            @Valid @RequestBody UpdateProductVisibilityRequest request
    ) {
        ProductResponseDTO updated = productService.updateProductVisibility(id, request.getIsActive());
        String msg = Boolean.TRUE.equals(request.getIsActive())
                ? "Đã mở bán lại sản phẩm"
                : "Đã ẩn/ngừng bán sản phẩm";
        return ResponseEntity.ok(ApiResponse.ok(msg, updated));
    }

    @PostMapping("/products/{id}/stock-adjustments")
    public ResponseEntity<ApiResponse<InventoryAdjustmentResponseDTO>> adjustStock(
            @PathVariable String id,
            @Valid @RequestBody AdjustStockRequest request,
            Authentication authentication
    ) {
        String adminEmail = authentication != null ? authentication.getName() : "admin";
        InventoryAdjustmentResponseDTO adjustment = productService.adjustStock(id, request, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok("Điều chỉnh tồn kho thành công", adjustment));
    }

    @GetMapping("/products/{id}/stock-adjustments")
    public ResponseEntity<ApiResponse<List<InventoryAdjustmentResponseDTO>>> getStockAdjustments(
            @PathVariable String id
    ) {
        List<InventoryAdjustmentResponseDTO> adjustments = productService.getStockAdjustments(id);
        return ResponseEntity.ok(ApiResponse.ok(adjustments));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        CategoryResponseDTO created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo danh mục mới thành công", created));
    }
}

