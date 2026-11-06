package com.homenest.order;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.homenest.common.ApiResponse;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication
    ) {
        String authenticatedEmail = extractEmail(authentication);
        OrderResponseDTO createdOrder = orderService.createOrder(request, authenticatedEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Đặt hàng thành công", createdOrder));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getMyOrders(
            @RequestParam(required = false) OrderStatus status,
            Authentication authentication
    ) {
        String authenticatedEmail = extractEmail(authentication);
        List<OrderResponseDTO> orders = orderService.getMyOrders(authenticatedEmail, status);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/lookup")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> lookupOrders(
            @RequestParam String phone
    ) {
        List<OrderResponseDTO> orders = orderService.getOrdersByPhone(phone);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderByNumber(
            @PathVariable String orderNumber
    ) {
        OrderResponseDTO order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @PostMapping("/{orderNumber}/cancel")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> cancelOrder(
            @PathVariable String orderNumber,
            @Valid @RequestBody CancelOrderRequest request,
            Authentication authentication
    ) {
        String authenticatedEmail = extractEmail(authentication);
        boolean isAdmin = hasAdminRole(authentication);
        OrderResponseDTO cancelledOrder = orderService.cancelOrder(orderNumber, request, authenticatedEmail, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Đã hủy đơn hàng thành công", cancelledOrder));
    }

    private String extractEmail(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName();
        }
        return null;
    }

    private boolean hasAdminRole(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if ("ROLE_ADMIN".equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
