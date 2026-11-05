package com.homenest.cart;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import com.homenest.common.ApiResponse;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponseDTO>> getCart(Principal principal) {
        CartResponseDTO cart = cartService.getCartByUserEmail(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponseDTO>> addToCart(
            Principal principal,
            @Valid @RequestBody AddToCartRequest request
    ) {
        CartResponseDTO updatedCart = cartService.addToCart(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đã thêm vào giỏ hàng", updatedCart));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponseDTO>> updateQuantity(
            Principal principal,
            @PathVariable String productId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        CartResponseDTO updatedCart = cartService.updateCartItem(principal.getName(), productId, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật số lượng", updatedCart));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponseDTO>> removeFromCart(
            Principal principal,
            @PathVariable String productId
    ) {
        CartResponseDTO updatedCart = cartService.removeFromCart(principal.getName(), productId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa khỏi giỏ hàng", updatedCart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<CartResponseDTO>> clearCart(Principal principal) {
        CartResponseDTO cleared = cartService.clearCart(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Đã làm trống giỏ hàng", cleared));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<CartResponseDTO>> syncCart(
            Principal principal,
            @RequestBody SyncCartRequest request
    ) {
        CartResponseDTO syncedCart = cartService.syncCart(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đã đồng bộ giỏ hàng", syncedCart));
    }
}

