package com.homenest.controller;

import com.homenest.dto.ApiResponse;
import com.homenest.dto.CreateOrderRequest;
import com.homenest.dto.OrderResponseDTO;
import com.homenest.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(
            @Valid @RequestBody CreateOrderRequest request
    ) {
        OrderResponseDTO createdOrder = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Đặt hàng thành công", createdOrder));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderByNumber(
            @PathVariable String orderNumber
    ) {
        OrderResponseDTO order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @GetMapping("/lookup")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> lookupOrders(
            @RequestParam String phone
    ) {
        List<OrderResponseDTO> orders = orderService.getOrdersByPhone(phone);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }
}

