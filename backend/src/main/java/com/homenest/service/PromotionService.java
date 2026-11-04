package com.homenest.service;

import com.homenest.dto.FlashSaleResponseDTO;
import com.homenest.dto.ValidatePromotionResponseDTO;

public interface PromotionService {

    FlashSaleResponseDTO getActiveFlashSale();

    ValidatePromotionResponseDTO validatePromotionCode(String code);
}

