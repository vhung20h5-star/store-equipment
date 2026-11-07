package com.homenest.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.homenest.auth.User;
import com.homenest.auth.UserRepository;
import com.homenest.catalog.Product;
import com.homenest.catalog.ProductRepository;
import com.homenest.common.PageResponse;
import com.homenest.exception.AccessDeniedException;
import com.homenest.exception.InsufficientStockException;
import com.homenest.exception.ResourceNotFoundException;
import com.homenest.promotion.Promotion;
import com.homenest.promotion.PromotionRepository;
import com.homenest.promotion.UserVoucher;
import com.homenest.promotion.UserVoucherRepository;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PromotionRepository promotionRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    public OrderServiceImpl(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            PromotionRepository promotionRepository,
            UserVoucherRepository userVoucherRepository,
            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.promotionRepository = promotionRepository;
        this.userVoucherRepository = userVoucherRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrder(CreateOrderRequest request) {
        return createOrder(request, null);
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrder(CreateOrderRequest request, String authenticatedEmail) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng không được để trống");
        }

        Order order = new Order();
        User currentUser = null;
        if (authenticatedEmail != null && !authenticatedEmail.trim().isEmpty()) {
            currentUser = userRepository.findByEmail(authenticatedEmail.trim().toLowerCase()).orElse(null);
            if (currentUser != null) {
                order.setUserId(currentUser.getId());
            }
        }

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

            if (Boolean.FALSE.equals(product.getIsActive())) {
                throw new IllegalArgumentException(
                        "Sản phẩm '" + product.getName() + "' hiện đã ngừng kinh doanh."
                );
            }

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

        // Generate unique order number first so it can be linked to UserVoucher usage
        String generatedOrderNumber = generateOrderNumber();
        order.setOrderNumber(generatedOrderNumber);

        // 1. Calculate voucher discount (and mark claimed voucher as USED)
        long voucherDiscountAmount = 0L;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            String code = request.getCouponCode().trim();
            Optional<Promotion> promoOpt = promotionRepository.findByCodeIgnoreCaseAndIsActiveTrue(code);
            if (promoOpt.isPresent()) {
                Promotion promo = promoOpt.get();
                LocalDateTime now = LocalDateTime.now();
                if (now.isAfter(promo.getStartTime()) && now.isBefore(promo.getEndTime())) {
                    long minOrder = promo.getMinOrderAmount() != null ? promo.getMinOrderAmount() : 0L;
                    if (minOrder > 0 && subtotal < minOrder) {
                        throw new IllegalArgumentException(
                                "Đơn hàng chưa đạt giá trị tối thiểu (" + minOrder + "đ) để áp dụng mã voucher " + promo.getCode() + "."
                        );
                    }

                    if (Boolean.TRUE.equals(promo.getVipOnly())) {
                        if (currentUser == null || !currentUser.hasActiveVip()) {
                            throw new IllegalArgumentException(
                                    "Mã voucher " + promo.getCode() + " chỉ dành riêng cho Hội viên VIP đang hoạt động."
                            );
                        }
                    }

                    if (currentUser != null) {
                        Optional<UserVoucher> uvOpt = userVoucherRepository.findByUserIdAndPromotionId(
                                currentUser.getId(),
                                promo.getId()
                        );
                        if (uvOpt.isEmpty() && Boolean.TRUE.equals(promo.getRequiresClaim())) {
                            throw new IllegalArgumentException(
                                    "Bạn chưa lưu mã " + promo.getCode() + " vào Kho Voucher cá nhân. Vui lòng bấm 'Lưu Voucher' trước khi sử dụng!"
                            );
                        }
                        if (uvOpt.isPresent()) {
                            UserVoucher uv = uvOpt.get();
                            if ("USED".equalsIgnoreCase(uv.getStatus())) {
                                throw new IllegalArgumentException(
                                        "Bạn đã sử dụng mã voucher " + promo.getCode() + " ở đơn hàng trước đó."
                                );
                            }
                            uv.setStatus("USED");
                            uv.setUsedAt(now);
                            uv.setOrderNumber(generatedOrderNumber);
                            userVoucherRepository.save(uv);
                        }
                    } else if (Boolean.TRUE.equals(promo.getRequiresClaim())) {
                        throw new IllegalArgumentException(
                                "Vui lòng đăng nhập và lưu mã voucher " + promo.getCode() + " vào Kho Voucher để sử dụng."
                        );
                    }

                    long calculatedDiscount = (subtotal * promo.getDiscountPercent()) / 100L;
                    if (promo.getMaxDiscountAmount() != null && calculatedDiscount > promo.getMaxDiscountAmount()) {
                        calculatedDiscount = promo.getMaxDiscountAmount();
                    }
                    voucherDiscountAmount = calculatedDiscount;
                    order.setCouponCode(promo.getCode());

                    int used = promo.getUsedQuantity() != null ? promo.getUsedQuantity() : 0;
                    promo.setUsedQuantity(used + 1);
                    promotionRepository.save(promo);
                }
            }
        }

        // 2. Calculate stacked VIP membership direct discount (applied on amount after voucher discount)
        long vipDiscountAmount = 0L;
        if (currentUser != null && currentUser.hasActiveVip()) {
            long afterVoucher = Math.max(0L, subtotal - voucherDiscountAmount);
            int vipPercent = currentUser.getActiveVipDiscountPercent();
            long vipMax = currentUser.getActiveVipMaxDiscount();
            long calcVip = (afterVoucher * vipPercent) / 100L;
            if (vipMax > 0 && calcVip > vipMax) {
                calcVip = vipMax;
            }
            vipDiscountAmount = calcVip;
            order.setVipTierApplied(currentUser.getVipTier());
        }

        long discountAmount = voucherDiscountAmount + vipDiscountAmount;
        order.setVoucherDiscountAmount(voucherDiscountAmount);
        order.setVipDiscountAmount(vipDiscountAmount);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(0L); // Free nationwide shipping
        long totalAmount = Math.max(0L, subtotal - discountAmount);
        order.setTotalAmount(totalAmount);

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

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getMyOrders(String authenticatedEmail, OrderStatus status) {
        if (authenticatedEmail == null || authenticatedEmail.trim().isEmpty()) {
            throw new AccessDeniedException("Vui lòng đăng nhập để xem lịch sử đơn hàng cá nhân.");
        }
        User user = userRepository.findByEmail(authenticatedEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + authenticatedEmail));

        List<Order> orders = (status != null)
                ? orderRepository.findByUserIdAndOrderStatusOrderByCreatedAtDesc(user.getId(), status)
                : orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return orders.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponseDTO cancelOrder(
            String orderNumber,
            CancelOrderRequest request,
            String authenticatedEmail,
            boolean isAdmin
    ) {
        if (request == null || request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập lý do hủy đơn hàng.");
        }

        Order order = orderRepository.findByOrderNumberWithLock(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với mã: " + orderNumber));

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Đơn hàng này đã được hủy trước đó.");
        }

        String actor;
        if (isAdmin) {
            if (order.getOrderStatus() != OrderStatus.CONFIRMED && order.getOrderStatus() != OrderStatus.PROCESSING) {
                throw new IllegalArgumentException(
                        "Không thể hủy đơn hàng ở trạng thái " + order.getOrderStatus()
                                + ". Quản trị viên chỉ có thể hủy đơn khi ở trạng thái CONFIRMED hoặc PROCESSING."
                );
            }
            actor = "ADMIN";
        } else {
            User currentUser = null;
            if (authenticatedEmail != null && !authenticatedEmail.trim().isEmpty()) {
                currentUser = userRepository.findByEmail(authenticatedEmail.trim().toLowerCase()).orElse(null);
            }

            if (order.getUserId() != null) {
                if (currentUser != null && order.getUserId().equals(currentUser.getId())) {
                    actor = "CUSTOMER";
                } else if (request.getPhone() != null && request.getPhone().trim().equals(order.getCustomerPhone().trim())) {
                    actor = currentUser != null ? "CUSTOMER" : "GUEST";
                } else {
                    throw new AccessDeniedException("Bạn không có quyền hủy đơn hàng này.");
                }
            } else {
                // Guest order: require matching customer phone
                if (request.getPhone() == null || !request.getPhone().trim().equals(order.getCustomerPhone().trim())) {
                    throw new AccessDeniedException("Số điện thoại xác thực không khớp với thông tin đặt hàng.");
                }
                actor = currentUser != null ? "CUSTOMER" : "GUEST";
            }

            if (order.getOrderStatus() != OrderStatus.CONFIRMED) {
                throw new IllegalArgumentException(
                        "Chỉ có thể tự hủy đơn hàng khi đơn đang ở trạng thái Đã xác nhận (CONFIRMED). "
                                + "Đơn hàng hiện tại đang ở trạng thái " + order.getOrderStatus()
                                + ", vui lòng liên hệ hotline HomeNest để được hỗ trợ."
                );
            }
        }

        // Concurrency-safe inventory restock
        restockOrderItems(order);

        LocalDateTime now = LocalDateTime.now();

        // Automatically restore claimed voucher to user's wallet if order had a coupon and promo is still unexpired
        if (order.getUserId() != null && order.getCouponCode() != null && !order.getCouponCode().isBlank()) {
            userVoucherRepository.findByUserIdAndPromotionCodeIgnoreCase(order.getUserId(), order.getCouponCode())
                    .ifPresent(uv -> {
                        if ("USED".equalsIgnoreCase(uv.getStatus())) {
                            Promotion promo = uv.getPromotion();
                            boolean unexpired = promo.getEndTime() == null || promo.getEndTime().isAfter(now);
                            uv.setStatus(unexpired ? "AVAILABLE" : "EXPIRED");
                            uv.setUsedAt(null);
                            uv.setOrderNumber(null);
                            userVoucherRepository.save(uv);

                            if (promo.getUsedQuantity() != null && promo.getUsedQuantity() > 0) {
                                promo.setUsedQuantity(promo.getUsedQuantity() - 1);
                                promotionRepository.save(promo);
                            }
                        }
                    });
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        order.setCancelledAt(now);
        order.setCancelledBy(actor);
        order.setCancelReason(request.getReason().trim());
        order.setUpdatedAt(now);

        Order savedOrder = orderRepository.save(order);
        return mapToDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponseDTO> getAllOrdersForAdmin(
            OrderStatus status,
            String search,
            int page,
            int size
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));
        Pageable pageable = PageRequest.of(safePage, safeSize);
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<Order> orderPage = orderRepository.searchOrders(status, trimmedSearch, pageable);
        List<OrderResponseDTO> content = orderPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.isLast()
        );
    }

    @Override
    @Transactional
    public OrderResponseDTO updateOrderStatusByAdmin(
            String orderNumber,
            UpdateOrderStatusRequest request
    ) {
        if (request == null || request.getStatus() == null) {
            throw new IllegalArgumentException("Trạng thái đơn hàng mới không được để trống.");
        }

        OrderStatus targetStatus = request.getStatus();
        if (targetStatus == OrderStatus.CANCELLED) {
            String reason = (request.getReason() != null && !request.getReason().trim().isEmpty())
                    ? request.getReason().trim()
                    : "Hủy bởi Quản trị viên";
            CancelOrderRequest cancelReq = new CancelOrderRequest();
            cancelReq.setReason(reason);
            return cancelOrder(orderNumber, cancelReq, null, true);
        }

        Order order = orderRepository.findByOrderNumberWithLock(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với mã: " + orderNumber));

        OrderStatus currentStatus = order.getOrderStatus();
        if (!isValidForwardTransition(currentStatus, targetStatus)) {
            throw new IllegalArgumentException(
                    "Không thể chuyển trạng thái đơn hàng từ " + currentStatus + " sang " + targetStatus + "."
            );
        }

        order.setOrderStatus(targetStatus);
        if (targetStatus == OrderStatus.DELIVERED) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);
        return mapToDTO(savedOrder);
    }

    private boolean isValidForwardTransition(OrderStatus current, OrderStatus target) {
        if (current == null || target == null) {
            return false;
        }
        return switch (current) {
            case CONFIRMED -> target == OrderStatus.PROCESSING;
            case PROCESSING -> target == OrderStatus.SHIPPED;
            case SHIPPED -> target == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    private void restockOrderItems(Order order) {
        for (OrderItem item : order.getItems()) {
            productRepository.findByIdWithLock(item.getProductId()).ifPresent(product -> {
                int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                int restoredStock = currentStock + item.getQuantity();
                product.setStockQuantity(restoredStock);
                product.setInStock(restoredStock > 0);
                product.setUpdatedAt(LocalDateTime.now());
                productRepository.save(product);
            });
        }
    }

    private String generateOrderNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // YYYYMMDD
        String candidate;
        do {
            int randomSuffix = 1000 + random.nextInt(9000); // 1000 to 9999
            candidate = "HN-" + datePrefix + "-" + randomSuffix;
        } while (orderRepository.findByOrderNumber(candidate).isPresent());
        return candidate;
    }

    private OrderResponseDTO mapToDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUserId());
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
        dto.setVoucherDiscountAmount(order.getVoucherDiscountAmount() != null ? order.getVoucherDiscountAmount() : order.getDiscountAmount());
        dto.setVipDiscountAmount(order.getVipDiscountAmount() != null ? order.getVipDiscountAmount() : 0L);
        dto.setVipTierApplied(order.getVipTierApplied());
        dto.setShippingFee(order.getShippingFee());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCouponCode(order.getCouponCode());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setCancelledAt(order.getCancelledAt());
        dto.setCancelledBy(order.getCancelledBy());
        dto.setCancelReason(order.getCancelReason());

        List<OrderItemResponseDTO> itemDTOs = order.getItems().stream().map(item -> {
            OrderItemResponseDTO itemDto = new OrderItemResponseDTO();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProductId());
            itemDto.setProductName(item.getProductName());
            itemDto.setProductImage(item.getProductImage());
            itemDto.setPrice(item.getPrice());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setTotalPrice(item.getTotalPrice());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }
}
