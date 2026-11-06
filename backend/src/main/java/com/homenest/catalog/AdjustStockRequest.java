package com.homenest.catalog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdjustStockRequest {

    @NotNull(message = "Số lượng điều chỉnh không được để trống")
    private Integer quantityChange;

    @NotBlank(message = "Lý do điều chỉnh kho không được để trống")
    private String reason;

    public AdjustStockRequest() {}

    public AdjustStockRequest(Integer quantityChange, String reason) {
        this.quantityChange = quantityChange;
        this.reason = reason;
    }

    public Integer getQuantityChange() { return quantityChange; }
    public void setQuantityChange(Integer quantityChange) { this.quantityChange = quantityChange; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

