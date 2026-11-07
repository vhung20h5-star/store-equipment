package com.homenest.promotion;

import jakarta.validation.constraints.NotBlank;

public class SubscribeVipRequest {

    @NotBlank(message = "Vui lòng chọn gói VIP (MONTHLY hoặc YEARLY)")
    private String planType;

    private String paymentMethod = "QR_INSTANT";

    public SubscribeVipRequest() {}

    public SubscribeVipRequest(String planType, String paymentMethod) {
        this.planType = planType;
        this.paymentMethod = paymentMethod;
    }

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}

