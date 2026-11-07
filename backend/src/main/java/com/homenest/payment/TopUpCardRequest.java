package com.homenest.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class TopUpCardRequest {

    @NotNull(message = "Vui lòng nhập số tiền cần nạp")
    @Min(value = 10000, message = "Số tiền nạp tối thiểu là 10.000 VNĐ")
    private Long amount;

    public TopUpCardRequest() {}

    public TopUpCardRequest(Long amount) {
        this.amount = amount;
    }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }
}

