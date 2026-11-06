package com.homenest.order;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateOrderStatusRequest {

    @NotNull(message = "Trạng thái đơn hàng mới không được để trống")
    private OrderStatus status;

    @Size(max = 500, message = "Lý do cập nhật/hủy không được vượt quá 500 ký tự")
    private String reason;

    public UpdateOrderStatusRequest() {}

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

