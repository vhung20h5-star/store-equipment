package com.homenest.order;

import java.util.List;
import com.homenest.common.PageResponse;

public interface OrderService {

    OrderResponseDTO createOrder(CreateOrderRequest request);

    OrderResponseDTO createOrder(CreateOrderRequest request, String authenticatedEmail);

    OrderResponseDTO getOrderByNumber(String orderNumber);

    List<OrderResponseDTO> getOrdersByPhone(String phone);

    List<OrderResponseDTO> getMyOrders(String authenticatedEmail, OrderStatus status);

    OrderResponseDTO cancelOrder(
            String orderNumber,
            CancelOrderRequest request,
            String authenticatedEmail,
            boolean isAdmin
    );

    PageResponse<OrderResponseDTO> getAllOrdersForAdmin(
            OrderStatus status,
            String search,
            int page,
            int size
    );

    OrderResponseDTO updateOrderStatusByAdmin(
            String orderNumber,
            UpdateOrderStatusRequest request
    );
}
