package com.homenest.cart;

import com.homenest.catalog.ProductResponseDTO;

public class CartItemResponseDTO {

    private Long id;
    private ProductResponseDTO product;
    private Integer quantity;
    private Long totalPrice;

    public CartItemResponseDTO() {}

    public CartItemResponseDTO(Long id, ProductResponseDTO product, Integer quantity, Long totalPrice) {
        this.id = id;
        this.product = product;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProductResponseDTO getProduct() { return product; }
    public void setProduct(ProductResponseDTO product) { this.product = product; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Long getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Long totalPrice) { this.totalPrice = totalPrice; }
}

