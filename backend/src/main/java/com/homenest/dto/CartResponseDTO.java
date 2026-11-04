package com.homenest.dto;

import java.util.ArrayList;
import java.util.List;

public class CartResponseDTO {

    private List<CartItemResponseDTO> items = new ArrayList<>();
    private Integer totalItems = 0;
    private Long totalPrice = 0L;

    public CartResponseDTO() {}

    public CartResponseDTO(List<CartItemResponseDTO> items, Integer totalItems, Long totalPrice) {
        this.items = items;
        this.totalItems = totalItems;
        this.totalPrice = totalPrice;
    }

    public List<CartItemResponseDTO> getItems() { return items; }
    public void setItems(List<CartItemResponseDTO> items) { this.items = items; }

    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }

    public Long getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Long totalPrice) { this.totalPrice = totalPrice; }
}

