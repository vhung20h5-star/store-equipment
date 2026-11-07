package com.homenest.promotion;

import java.time.LocalDateTime;

public class VoucherDTO {

    private String id;
    private String code;
    private String title;
    private String description;
    private Integer discountPercent;
    private Long maxDiscountAmount;
    private Long minOrderAmount;
    private String campaignType;
    private String eventTag;
    private Integer totalQuantity;
    private Integer claimedQuantity;
    private Integer remainingQuantity;
    private Integer usedQuantity;
    private Boolean vipOnly;
    private Boolean requiresClaim;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isActive;
    private boolean claimed;
    private String userVoucherStatus;
    private LocalDateTime claimedAt;
    private LocalDateTime usedAt;
    private String orderNumber;

    public VoucherDTO() {}

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

    public Integer getClaimedQuantity() { return claimedQuantity; }
    public void setClaimedQuantity(Integer claimedQuantity) { this.claimedQuantity = claimedQuantity; }

    public Integer getRemainingQuantity() { return remainingQuantity; }
    public void setRemainingQuantity(Integer remainingQuantity) { this.remainingQuantity = remainingQuantity; }

    public Integer getUsedQuantity() { return usedQuantity; }
    public void setUsedQuantity(Integer usedQuantity) { this.usedQuantity = usedQuantity; }

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

    public boolean isClaimed() { return claimed; }
    public void setClaimed(boolean claimed) { this.claimed = claimed; }

    public String getUserVoucherStatus() { return userVoucherStatus; }
    public void setUserVoucherStatus(String userVoucherStatus) { this.userVoucherStatus = userVoucherStatus; }

    public LocalDateTime getClaimedAt() { return claimedAt; }
    public void setClaimedAt(LocalDateTime claimedAt) { this.claimedAt = claimedAt; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
}

