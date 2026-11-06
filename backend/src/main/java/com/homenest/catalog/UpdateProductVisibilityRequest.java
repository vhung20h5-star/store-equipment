package com.homenest.catalog;

import jakarta.validation.constraints.NotNull;

public class UpdateProductVisibilityRequest {

    @NotNull(message = "Trạng thái hiển thị không được để trống")
    private Boolean isActive;

    public UpdateProductVisibilityRequest() {}

    public UpdateProductVisibilityRequest(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

