package com.homenest.promotion;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CreatePromotionRequest {

    private String id;

    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    @NotBlank(message = "Tiêu đề voucher không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Phần trăm giảm giá không được để trống")
    @Min(value = 1, message = "Phần trăm giảm giá tối thiểu là 1%")
    @Max(value = 90, message = "Phần trăm giảm giá tối đa là 90%")
    private Integer discountPercent;

    private Long maxDiscountAmount;

    private Long minOrderAmount = 0L;

    private String campaignType = "DAILY";

    private String eventTag;

    private Integer totalQuantity;

    private Boolean vipOnly = false;

    private Boolean requiresClaim = true;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Boolean isActive = true;

    public CreatePromotionRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public Long getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(Long maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public Long getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Long minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public String getCampaignType() { return campaignType; }
    public void setCampaignType(String campaignType) { this.campaignType = campaignType; }

    public String getEventTag() { return eventTag; }
    public void setEventTag(String eventTag) { this.eventTag = eventTag; }

    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }

    public Boolean getVipOnly() { return vipOnly; }
    public void setVipOnly(Boolean vipOnly) { this.vipOnly = vipOnly; }

    public Boolean getRequiresClaim() { return requiresClaim; }
    public void setRequiresClaim(Boolean requiresClaim) { this.requiresClaim = requiresClaim; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

