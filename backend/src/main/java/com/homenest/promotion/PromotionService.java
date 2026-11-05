package com.homenest.promotion;

public interface PromotionService {

    FlashSaleResponseDTO getActiveFlashSale();

    ValidatePromotionResponseDTO validatePromotionCode(String code);
}

