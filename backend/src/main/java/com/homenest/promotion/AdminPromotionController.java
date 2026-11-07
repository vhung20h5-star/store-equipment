package com.homenest.promotion;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.homenest.common.ApiResponse;

@RestController
@RequestMapping("/api/v1/admin/promotions")
public class AdminPromotionController {

    private final PromotionService promotionService;

    public AdminPromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VoucherDTO>>> getAllPromotions() {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.getAllPromotionsForAdmin()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VoucherDTO>> createPromotion(
            @Valid @RequestBody CreatePromotionRequest request
    ) {
        VoucherDTO created = promotionService.createPromotionByAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo chương trình voucher mới thành công!", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherDTO>> updatePromotion(
            @PathVariable String id,
            @Valid @RequestBody CreatePromotionRequest request
    ) {
        VoucherDTO updated = promotionService.updatePromotionByAdmin(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật voucher thành công!", updated));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<VoucherDTO>> togglePromotion(@PathVariable String id) {
        VoucherDTO toggled = promotionService.togglePromotionActiveByAdmin(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã chuyển trạng thái kích hoạt voucher!", toggled));
    }

    @PostMapping("/trigger-event")
    public ResponseEntity<ApiResponse<List<VoucherDTO>>> triggerEventPreset(
            @Valid @RequestBody TriggerEventRequest request
    ) {
        List<VoucherDTO> updatedList = promotionService.triggerEventPresetByAdmin(request.getEventPreset());
        return ResponseEntity.ok(ApiResponse.ok("Đã kích hoạt đợt sự kiện khuyến mãi thành công!", updatedList));
    }
}

