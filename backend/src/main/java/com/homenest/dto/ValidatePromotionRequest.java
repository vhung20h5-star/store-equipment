package com.homenest.dto;

import jakarta.validation.constraints.NotBlank;

public class ValidatePromotionRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    public ValidatePromotionRequest() {}

    public ValidatePromotionRequest(String code) {
        this.code = code;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}

