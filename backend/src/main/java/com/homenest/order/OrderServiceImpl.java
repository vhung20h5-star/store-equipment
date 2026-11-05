package com.homenest.order;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.homenest.catalog.Product;
import com.homenest.catalog.ProductRepository;
import com.homenest.exception.InsufficientStockException;
import com.homenest.exception.ResourceNotFoundException;
import com.homenest.promotion.Promotion;
import com.homenest.promotion.PromotionRepository;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PromotionRepository promotionRepository;
    private final SecureRandom random = new SecureRandom();

    public OrderServiceImpl(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            PromotionRepository promotionRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.promotionRepository = promotionRepository;
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrder(CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng không được để trống");
        }

        Order order = new Order();
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerPhone(request.getCustomerPhone().trim());
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().trim().isEmpty()) {
            order.setCustomerEmail(request.getCustomerEmail().trim());
        }
        order.setShippingAddress(request.getShippingAddress().trim());
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            order.setNotes(request.getNotes().trim());
        }
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.COD);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setOrderStatus(OrderStatus.CONFIRMED);

        long subtotal = 0L;

        for (OrderItemRequest itemReq : request.getItems()) {
            // Concurrency-safe pessimistic lock
            Product product = productRepository.findByIdWithLock(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với mã: " + itemReq.getProductId()));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new InsufficientStockException(
                        "Sản phẩm '" + product.getName() + "' không đủ số lượng trong kho (còn " + product.getStockQuantity() + " sản phẩm)."
                );
            }

            if (!product.getInStock()) {
                throw new InsufficientStockException("Sản phẩm '" + product.getName() + "' hiện đã hết hàng.");
            }

            // Deduct stock
            int updatedStock = product.getStockQuantity() - itemReq.getQuantity();
            product.setStockQuantity(updatedStock);
            if (updatedStock == 0) {
                product.setInStock(false);
            }
            productRepository.save(product);

            // Create Order Item
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setProductImage(product.getImage());
            orderItem.setPrice(product.getPrice());
            orderItem.setQuantity(itemReq.getQuantity());
            long itemTotalPrice = product.getPrice() * itemReq.getQuantity();
            orderItem.setTotalPrice(itemTotalPrice);

            order.addItem(orderItem);
            subtotal += itemTotalPrice;
        }

        order.setSubtotalAmount(subtotal);

        // Calculate promotion discount
        long discountAmount = 0L;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            String code = request.getCouponCode().trim();
            Optional<Promotion> promoOpt = promotionRepository.findByCodeIgnoreCaseAndIsActiveTrue(code);
            if (promoOpt.isPresent()) {
                Promotion promo = promoOpt.get();
                LocalDateTime now = LocalDateTime.now();
                if (now.isAfter(promo.getStartTime()) && now.isBefore(promo.getEndTime())) {
                    long calculatedDiscount = (subtotal * promo.getDiscountPercent()) / 100L;
                    if (promo.getMaxDiscountAmount() != null && calculatedDiscount > promo.getMaxDiscountAmount()) {
                        calculatedDiscount = promo.getMaxDiscountAmount();
                    }
                    discountAmount = calculatedDiscount;
                    order.setCouponCode(promo.getCode());
                }
            }
        }

        order.setDiscountAmount(discountAmount);
        order.setShippingFee(0L); // Free nationwide shipping
        long totalAmount = Math.max(0L, subtotal - discountAmount);
        order.setTotalAmount(totalAmount);

        // Generate unique order number
        order.setOrderNumber(generateOrderNumber());

        Order savedOrder = orderRepository.save(order);
        return mapToDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với mã: " + orderNumber));
        return mapToDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByPhone(String phone) {
        return orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(phone.trim())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private String generateOrderNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // YYYYMMDD
        String candidate;
        do {
            int randomSuffix = 1000 + random.nextInt(9000); // 4-digit random number
            candidate = "HN-" + datePrefix + "-" + randomSuffix;
        } while (orderRepository.findByOrderNumber(candidate).isPresent());
        return candidate;
    }

    private OrderResponseDTO mapToDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setNotes(order.getNotes());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setSubtotalAmount(order.getSubtotalAmount());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setShippingFee(order.getShippingFee());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCouponCode(order.getCouponCode());
        dto.setCreatedAt(order.getCreatedAt());

        if (order.getItems() != null) {
            List<OrderItemResponseDTO> items = order.getItems().stream().map(item -> {
                OrderItemResponseDTO itemDTO = new OrderItemResponseDTO();
                itemDTO.setId(item.getId());
                itemDTO.setProductId(item.getProductId());
                itemDTO.setProductName(item.getProductName());
                itemDTO.setProductImage(item.getProductImage());
                itemDTO.setPrice(item.getPrice());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setTotalPrice(item.getTotalPrice());
                return itemDTO;
            }).collect(Collectors.toList());
            dto.setItems(items);
        }

        return dto;
    }
}

