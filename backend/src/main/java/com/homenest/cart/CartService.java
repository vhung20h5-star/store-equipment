package com.homenest.cart;

public interface CartService {

    CartResponseDTO getCartByUserEmail(String userEmail);

    CartResponseDTO addToCart(String userEmail, AddToCartRequest request);

    CartResponseDTO updateCartItem(String userEmail, String productId, UpdateCartItemRequest request);

    CartResponseDTO removeFromCart(String userEmail, String productId);

    CartResponseDTO clearCart(String userEmail);

    CartResponseDTO syncCart(String userEmail, SyncCartRequest request);
}

