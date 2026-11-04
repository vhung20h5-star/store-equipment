package com.homenest.service.impl;

import com.homenest.dto.FlashSaleResponseDTO;
import com.homenest.dto.ProductResponseDTO;
import com.homenest.dto.ValidatePromotionResponseDTO;
import com.homenest.entity.Promotion;
import com.homenest.exception.ResourceNotFoundException;
import com.homenest.repository.PromotionRepository;
import com.homenest.service.ProductService;
import com.homenest.service.PromotionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductService productService;

    public PromotionServiceImpl(PromotionRepository promotionRepository, ProductService productService) {
        this.promotionRepository = promotionRepository;
        this.productService = productService;
    }

    @Override
    public FlashSaleResponseDTO getActiveFlashSale() {
        Promotion promo = promotionRepository.findFirstByIsActiveTrueOrderByStartTimeDesc()
                .orElseThrow(() -> new ResourceNotFoundException("Hiện không có chương trình Flash Sale nào đang kích hoạt"));

        ProductResponseDTO featured = null;
        if (promo.getFeaturedProduct() != null) {
            try {
                featured = productService.getProductById(promo.getFeaturedProduct().getId());
            } catch (Exception ignored) {
                // Ignore if featured product is not found
            }
        }

        return new FlashSaleResponseDTO(
                promo.getId(),
                promo.getCode(),
                promo.getTitle(),
                promo.getDescription(),
                promo.getDiscountPercent(),
                promo.getEndTime(),
                featured
        );
    }

    @Override
    public ValidatePromotionResponseDTO validatePromotionCode(String code) {
        if (code == null || code.isBlank()) {
            return ValidatePromotionResponseDTO.invalid("", "Mã voucher không được để trống");
        }

        Optional<Promotion> promoOpt = promotionRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim());
        if (promoOpt.isEmpty()) {
            return ValidatePromotionResponseDTO.invalid(code, "Mã voucher không tồn tại hoặc đã hết hiệu lực");
        }

        Promotion promo = promoOpt.get();
        if (promo.getEndTime() != null && promo.getEndTime().isBefore(LocalDateTime.now())) {
            return ValidatePromotionResponseDTO.invalid(code, "Mã voucher đã hết hạn sử dụng");
        }

        return ValidatePromotionResponseDTO.valid(
                promo.getCode(),
                promo.getDiscountPercent(),
                promo.getMaxDiscountAmount(),
                "Áp dụng mã giảm giá thành công! Giảm " + promo.getDiscountPercent() + "%"
        );
    }
}

