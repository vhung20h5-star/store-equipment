package com.homenest.promotion;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.homenest.common.ApiResponse;

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
            @Valid @RequestBody ValidatePromotionRequest request,
            Authentication authentication
    ) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        ValidatePromotionResponseDTO result = promotionService.validatePromotionCode(
                request.getCode(),
                request.getOrderSubtotal(),
                email
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/vouchers")
    public ResponseEntity<ApiResponse<List<VoucherDTO>>> getPublicVouchers(
            @RequestParam(required = false) String campaignType,
            Authentication authentication
    ) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        List<VoucherDTO> vouchers = promotionService.getPublicVouchers(campaignType, email);
        return ResponseEntity.ok(ApiResponse.ok(vouchers));
    }

    @GetMapping("/my-vouchers")
    public ResponseEntity<ApiResponse<List<VoucherDTO>>> getMyVouchers(Authentication authentication) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        List<VoucherDTO> myVouchers = promotionService.getMyVouchers(email);
        return ResponseEntity.ok(ApiResponse.ok(myVouchers));
    }

    @PostMapping("/vouchers/{codeOrId}/claim")
    public ResponseEntity<ApiResponse<VoucherDTO>> claimVoucher(
            @PathVariable String codeOrId,
            Authentication authentication
    ) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        VoucherDTO claimed = promotionService.claimVoucher(codeOrId, email);
        return ResponseEntity.ok(ApiResponse.ok("Lưu voucher vào kho thành công!", claimed));
    }

    @GetMapping("/vip")
    public ResponseEntity<ApiResponse<VipStatusResponseDTO>> getVipStatus(Authentication authentication) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        VipStatusResponseDTO status = promotionService.getVipStatus(email);
        return ResponseEntity.ok(ApiResponse.ok(status));
    }

    @PostMapping("/vip/subscribe")
    public ResponseEntity<ApiResponse<VipStatusResponseDTO>> subscribeVip(
            @Valid @RequestBody SubscribeVipRequest request,
            Authentication authentication
    ) {
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;
        VipStatusResponseDTO status = promotionService.subscribeVip(request, email);
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký Gói VIP thành công! Đã cộng ưu đãi và tặng bộ Voucher VIP vào kho.", status));
    }
}
