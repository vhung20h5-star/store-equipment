package com.homenest.controller;

import com.homenest.dto.ApiResponse;
import com.homenest.dto.FlashSaleResponseDTO;
import com.homenest.dto.ValidatePromotionRequest;
import com.homenest.dto.ValidatePromotionResponseDTO;
import com.homenest.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping("/flash-sale")
    public ResponseEntity<ApiResponse<FlashSaleResponseDTO>> getActiveFlashSale() {
        FlashSaleResponseDTO flashSale = promotionService.getActiveFlashSale();
        return ResponseEntity.ok(ApiResponse.ok(flashSale));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ValidatePromotionResponseDTO>> validatePromotionCode(
            @Valid @RequestBody ValidatePromotionRequest request
    ) {
        ValidatePromotionResponseDTO result = promotionService.validatePromotionCode(request.getCode());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}

