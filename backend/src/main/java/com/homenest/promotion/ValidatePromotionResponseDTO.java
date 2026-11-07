package com.homenest.promotion;

public class ValidatePromotionResponseDTO {

    private String code;
    private boolean valid;
    private Integer discountPercent;
    private Long maxDiscountAmount;
    private Long minOrderAmount;
    private Boolean vipOnly;
    private String message;

    public ValidatePromotionResponseDTO() {}

    public ValidatePromotionResponseDTO(
            String code,
            boolean valid,
            Integer discountPercent,
            Long maxDiscountAmount,
            Long minOrderAmount,
            Boolean vipOnly,
            String message
    ) {
        this.code = code;
        this.valid = valid;
        this.discountPercent = discountPercent;
        this.maxDiscountAmount = maxDiscountAmount;
        this.minOrderAmount = minOrderAmount;
        this.vipOnly = vipOnly;
        this.message = message;
    }

    public static ValidatePromotionResponseDTO valid(
            String code,
            Integer discountPercent,
            Long maxDiscountAmount,
            String message
    ) {
        return new ValidatePromotionResponseDTO(code, true, discountPercent, maxDiscountAmount, 0L, false, message);
    }

    public static ValidatePromotionResponseDTO valid(
            String code,
            Integer discountPercent,
            Long maxDiscountAmount,
            Long minOrderAmount,
            Boolean vipOnly,
            String message
    ) {
        return new ValidatePromotionResponseDTO(code, true, discountPercent, maxDiscountAmount, minOrderAmount, vipOnly, message);
    }

    public static ValidatePromotionResponseDTO invalid(String code, String message) {
        return new ValidatePromotionResponseDTO(code, false, 0, 0L, 0L, false, message);
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public Long getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(Long maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public Long getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Long minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public Boolean getVipOnly() { return vipOnly; }
    public void setVipOnly(Boolean vipOnly) { this.vipOnly = vipOnly; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
