package com.homenest.order;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.homenest.common.ApiResponse;
import com.homenest.common.PageResponse;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponseDTO>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<OrderResponseDTO> orders = orderService.getAllOrdersForAdmin(status, search, page, size);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @PatchMapping("/{orderNumber}/status")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> updateOrderStatus(
            @PathVariable String orderNumber,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderResponseDTO updated = orderService.updateOrderStatusByAdmin(orderNumber, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái đơn hàng thành công", updated));
    }
}

