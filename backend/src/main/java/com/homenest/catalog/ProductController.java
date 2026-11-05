package com.homenest.catalog;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.homenest.common.ApiResponse;
import com.homenest.common.PageResponse;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponseDTO>>> getProducts(
            @RequestParam(required = false, defaultValue = "all") String category,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size,
            @RequestParam(required = false, defaultValue = "id") String sort
    ) {
        PageResponse<ProductResponseDTO> response = productService.getProducts(category, search, page, size, sort);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> getProductById(@PathVariable String id) {
        ProductResponseDTO product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @GetMapping("/bestsellers")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getBestsellers() {
        List<ProductResponseDTO> bestsellers = productService.getBestsellers();
        return ResponseEntity.ok(ApiResponse.ok(bestsellers));
    }
}

