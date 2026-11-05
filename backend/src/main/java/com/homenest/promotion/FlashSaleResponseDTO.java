package com.homenest.promotion;

import java.time.LocalDateTime;

import com.homenest.catalog.ProductResponseDTO;

public class FlashSaleResponseDTO {

    private String id;
    private String code;
    private String title;
    private String description;
    private Integer discountPercent;
    private LocalDateTime endTime;
    private ProductResponseDTO featuredProduct;

    public FlashSaleResponseDTO() {}

    public FlashSaleResponseDTO(String id, String code, String title, String description, Integer discountPercent, LocalDateTime endTime, ProductResponseDTO featuredProduct) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.description = description;
        this.discountPercent = discountPercent;
        this.endTime = endTime;
        this.featuredProduct = featuredProduct;
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

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public ProductResponseDTO getFeaturedProduct() { return featuredProduct; }
    public void setFeaturedProduct(ProductResponseDTO featuredProduct) { this.featuredProduct = featuredProduct; }
}

