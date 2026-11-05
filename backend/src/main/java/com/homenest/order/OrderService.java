package com.homenest.order;

import java.util.List;

public interface OrderService {

    OrderResponseDTO createOrder(CreateOrderRequest request);

    OrderResponseDTO getOrderByNumber(String orderNumber);

    List<OrderResponseDTO> getOrdersByPhone(String phone);
}

