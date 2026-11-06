package com.homenest.catalog;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CreateProductRequest {

    private String id;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @NotBlank(message = "Danh mục không được để trống")
    private String categorySlug;

    @NotNull(message = "Giá bán không được để trống")
    @Min(value = 1, message = "Giá bán phải lớn hơn 0")
    private Long price;

    @NotNull(message = "Giá gốc không được để trống")
    @Min(value = 1, message = "Giá gốc phải lớn hơn 0")
    private Long originalPrice;

    private String badge;
    private String badgeType;

    @NotBlank(message = "Ảnh đại diện không được để trống")
    private String image;

    private List<String> gallery = new ArrayList<>();

    @NotBlank(message = "Mô tả sản phẩm không được để trống")
    private String description;

    private List<String> features = new ArrayList<>();
    private Map<String, String> specs = new HashMap<>();

    @Min(value = 0, message = "Tồn kho khởi tạo không được âm")
    private Integer initialStockQuantity = 0;

    private Boolean isActive = true;

    public CreateProductRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategorySlug() { return categorySlug; }
    public void setCategorySlug(String categorySlug) { this.categorySlug = categorySlug; }

    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }

    public Long getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Long originalPrice) { this.originalPrice = originalPrice; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getBadgeType() { return badgeType; }
    public void setBadgeType(String badgeType) { this.badgeType = badgeType; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public List<String> getGallery() { return gallery; }
    public void setGallery(List<String> gallery) { this.gallery = gallery; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }

    public Map<String, String> getSpecs() { return specs; }
    public void setSpecs(Map<String, String> specs) { this.specs = specs; }

    public Integer getInitialStockQuantity() { return initialStockQuantity; }
    public void setInitialStockQuantity(Integer initialStockQuantity) { this.initialStockQuantity = initialStockQuantity; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

