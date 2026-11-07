package com.homenest.promotion;

import java.util.List;

public interface PromotionService {

    FlashSaleResponseDTO getActiveFlashSale();

    ValidatePromotionResponseDTO validatePromotionCode(String code);

    ValidatePromotionResponseDTO validatePromotionCode(String code, Long orderSubtotal, String authenticatedEmail);

    List<VoucherDTO> getPublicVouchers(String campaignType, String authenticatedEmail);

    List<VoucherDTO> getMyVouchers(String authenticatedEmail);

    VoucherDTO claimVoucher(String codeOrId, String authenticatedEmail);

    VipStatusResponseDTO getVipStatus(String authenticatedEmail);

    VipStatusResponseDTO subscribeVip(SubscribeVipRequest request, String authenticatedEmail);

    List<VoucherDTO> getAllPromotionsForAdmin();

    VoucherDTO createPromotionByAdmin(CreatePromotionRequest request);

    VoucherDTO updatePromotionByAdmin(String id, CreatePromotionRequest request);

    VoucherDTO togglePromotionActiveByAdmin(String id);

    List<VoucherDTO> triggerEventPresetByAdmin(String eventPreset);
}
