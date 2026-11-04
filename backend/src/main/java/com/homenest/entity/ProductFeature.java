package com.homenest.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "product_features")
public class ProductFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "feature_text", nullable = false, length = 500)
    private String featureText;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    public ProductFeature() {}

    public ProductFeature(Product product, String featureText, Integer displayOrder) {
        this.product = product;
        this.featureText = featureText;
        this.displayOrder = displayOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getFeatureText() { return featureText; }
    public void setFeatureText(String featureText) { this.featureText = featureText; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}

