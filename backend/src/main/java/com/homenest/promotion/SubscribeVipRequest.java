package com.homenest.promotion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SubscribeVipRequest {

    @NotBlank(message = "Vui lòng chọn gói VIP (MONTHLY hoặc YEARLY)")
    private String planType;

    @NotNull(message = "Gói Hội viên VIP bắt buộc thanh toán. Vui lòng chọn thẻ ngân hàng đã liên kết.")
    private Long cardId;

    @NotBlank(message = "Vui lòng nhập mã bảo mật CVV/PIN của thẻ để xác thực thanh toán.")
    private String cvv;

    public SubscribeVipRequest() {}

    public SubscribeVipRequest(String planType, Long cardId, String cvv) {
        this.planType = planType;
        this.cardId = cardId;
        this.cvv = cvv;
    }

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }

    public Long getCardId() { return cardId; }
    public void setCardId(Long cardId) { this.cardId = cardId; }

    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }
}
