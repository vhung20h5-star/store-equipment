package com.homenest.promotion;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.homenest.catalog.Product;

@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent = 10;

    @Column(name = "max_discount_amount")
    private Long maxDiscountAmount;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "featured_product_id")
    private Product featuredProduct;

    @Column(name = "campaign_type", nullable = false, length = 50)
    private String campaignType = "FLASH_SALE";

    @Column(name = "event_tag", length = 100)
    private String eventTag = "Flash Sale";

    @Column(name = "min_order_amount", nullable = false)
    private Long minOrderAmount = 0L;

    @Column(name = "total_quantity")
    private Integer totalQuantity;

    @Column(name = "claimed_quantity", nullable = false)
    private Integer claimedQuantity = 0;

    @Column(name = "used_quantity", nullable = false)
    private Integer usedQuantity = 0;

    @Column(name = "vip_only", nullable = false)
    private Boolean vipOnly = false;

    @Column(name = "requires_claim", nullable = false)
    private Boolean requiresClaim = true;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Promotion() {}

    public Integer getRemainingQuantity() {
        if (totalQuantity == null) {
            return null;
        }
        int claimed = claimedQuantity != null ? claimedQuantity : 0;
        return Math.max(0, totalQuantity - claimed);
    }

    public boolean isSoldOut() {
        if (totalQuantity == null) {
            return false;
        }
        int claimed = claimedQuantity != null ? claimedQuantity : 0;
        return claimed >= totalQuantity;
    }

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

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Product getFeaturedProduct() { return featuredProduct; }
    public void setFeaturedProduct(Product featuredProduct) { this.featuredProduct = featuredProduct; }

    public String getCampaignType() { return campaignType; }
    public void setCampaignType(String campaignType) { this.campaignType = campaignType; }

    public String getEventTag() { return eventTag; }
    public void setEventTag(String eventTag) { this.eventTag = eventTag; }

    public Long getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Long minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }

    public Integer getClaimedQuantity() { return claimedQuantity; }
    public void setClaimedQuantity(Integer claimedQuantity) { this.claimedQuantity = claimedQuantity; }

    public Integer getUsedQuantity() { return usedQuantity; }
    public void setUsedQuantity(Integer usedQuantity) { this.usedQuantity = usedQuantity; }

    public Boolean getVipOnly() { return vipOnly; }
    public void setVipOnly(Boolean vipOnly) { this.vipOnly = vipOnly; }

    public Boolean getRequiresClaim() { return requiresClaim; }
    public void setRequiresClaim(Boolean requiresClaim) { this.requiresClaim = requiresClaim; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

