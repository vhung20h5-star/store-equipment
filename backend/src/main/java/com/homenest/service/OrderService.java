package com.homenest.service;

import com.homenest.dto.CreateOrderRequest;
import com.homenest.dto.OrderResponseDTO;
import java.util.List;

public interface OrderService {

    OrderResponseDTO createOrder(CreateOrderRequest request);

    OrderResponseDTO getOrderByNumber(String orderNumber);

    List<OrderResponseDTO> getOrdersByPhone(String phone);
}

