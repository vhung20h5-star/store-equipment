package com.homenest.promotion;

import java.util.List;

public class VipPlanDTO {

    private String id;
    private String name;
    private String badge;
    private Long price;
    private Long originalPrice;
    private Integer durationDays;
    private Integer directDiscountPercent;
    private Long maxDiscountPerOrder;
    private List<String> benefits;
    private List<String> giftVoucherCodes;

    public VipPlanDTO() {}

    public VipPlanDTO(
            String id,
            String name,
            String badge,
            Long price,
            Long originalPrice,
            Integer durationDays,
            Integer directDiscountPercent,
            Long maxDiscountPerOrder,
            List<String> benefits,
            List<String> giftVoucherCodes
    ) {
        this.id = id;
        this.name = name;
        this.badge = badge;
        this.price = price;
        this.originalPrice = originalPrice;
        this.durationDays = durationDays;
        this.directDiscountPercent = directDiscountPercent;
        this.maxDiscountPerOrder = maxDiscountPerOrder;
        this.benefits = benefits;
        this.giftVoucherCodes = giftVoucherCodes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }

    public Long getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Long originalPrice) { this.originalPrice = originalPrice; }

    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }

    public Integer getDirectDiscountPercent() { return directDiscountPercent; }
    public void setDirectDiscountPercent(Integer directDiscountPercent) { this.directDiscountPercent = directDiscountPercent; }

    public Long getMaxDiscountPerOrder() { return maxDiscountPerOrder; }
    public void setMaxDiscountPerOrder(Long maxDiscountPerOrder) { this.maxDiscountPerOrder = maxDiscountPerOrder; }

    public List<String> getBenefits() { return benefits; }
    public void setBenefits(List<String> benefits) { this.benefits = benefits; }

    public List<String> getGiftVoucherCodes() { return giftVoucherCodes; }
    public void setGiftVoucherCodes(List<String> giftVoucherCodes) { this.giftVoucherCodes = giftVoucherCodes; }
}

