package com.homenest.promotion;

import jakarta.validation.constraints.NotBlank;

public class ValidatePromotionRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    private Long orderSubtotal;

    public ValidatePromotionRequest() {}

    public ValidatePromotionRequest(String code) {
        this.code = code;
    }

    public ValidatePromotionRequest(String code, Long orderSubtotal) {
        this.code = code;
        this.orderSubtotal = orderSubtotal;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Long getOrderSubtotal() { return orderSubtotal; }
    public void setOrderSubtotal(Long orderSubtotal) { this.orderSubtotal = orderSubtotal; }
}
