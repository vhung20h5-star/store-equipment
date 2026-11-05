package com.homenest.promotion;

public class ValidatePromotionResponseDTO {

    private String code;
    private boolean valid;
    private Integer discountPercent;
    private Long maxDiscountAmount;
    private String message;

    public ValidatePromotionResponseDTO() {}

    public ValidatePromotionResponseDTO(String code, boolean valid, Integer discountPercent, Long maxDiscountAmount, String message) {
        this.code = code;
        this.valid = valid;
        this.discountPercent = discountPercent;
        this.maxDiscountAmount = maxDiscountAmount;
        this.message = message;
    }

    public static ValidatePromotionResponseDTO valid(String code, Integer discountPercent, Long maxDiscountAmount, String message) {
        return new ValidatePromotionResponseDTO(code, true, discountPercent, maxDiscountAmount, message);
    }

    public static ValidatePromotionResponseDTO invalid(String code, String message) {
        return new ValidatePromotionResponseDTO(code, false, 0, 0L, message);
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public Long getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(Long maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

