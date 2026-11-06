package com.homenest.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CancelOrderRequest {

    @NotBlank(message = "Vui lòng nhập lý do hủy đơn hàng")
    @Size(max = 500, message = "Lý do hủy đơn không được vượt quá 500 ký tự")
    private String reason;

    @Size(max = 50, message = "Số điện thoại không hợp lệ")
    private String phone;

    public CancelOrderRequest() {}

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}

