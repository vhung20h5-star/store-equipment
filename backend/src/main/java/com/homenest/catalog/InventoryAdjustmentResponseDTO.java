package com.homenest.catalog;

import java.time.LocalDateTime;

public class InventoryAdjustmentResponseDTO {

    private Long id;
    private String productId;
    private Integer previousQuantity;
    private Integer quantityChange;
    private Integer newQuantity;
    private String reason;
    private String adjustedBy;
    private LocalDateTime createdAt;

    public InventoryAdjustmentResponseDTO() {}

    public InventoryAdjustmentResponseDTO(
            Long id,
            String productId,
            Integer previousQuantity,
            Integer quantityChange,
            Integer newQuantity,
            String reason,
            String adjustedBy,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.productId = productId;
        this.previousQuantity = previousQuantity;
        this.quantityChange = quantityChange;
        this.newQuantity = newQuantity;
        this.reason = reason;
        this.adjustedBy = adjustedBy;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public Integer getPreviousQuantity() { return previousQuantity; }
    public void setPreviousQuantity(Integer previousQuantity) { this.previousQuantity = previousQuantity; }

    public Integer getQuantityChange() { return quantityChange; }
    public void setQuantityChange(Integer quantityChange) { this.quantityChange = quantityChange; }

    public Integer getNewQuantity() { return newQuantity; }
    public void setNewQuantity(Integer newQuantity) { this.newQuantity = newQuantity; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getAdjustedBy() { return adjustedBy; }
    public void setAdjustedBy(String adjustedBy) { this.adjustedBy = adjustedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

