package com.homenest.order;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.orderNumber = :orderNumber")
    Optional<Order> findByOrderNumberWithLock(@Param("orderNumber") String orderNumber);

    List<Order> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByUserIdAndOrderStatusOrderByCreatedAtDesc(Long userId, OrderStatus orderStatus);

    @Query("""
            SELECT o FROM Order o
            WHERE (:status IS NULL OR o.orderStatus = :status)
              AND (:search IS NULL OR :search = ''
                   OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY o.createdAt DESC
            """)
    Page<Order> searchOrders(
            @Param("status") OrderStatus status,
            @Param("search") String search,
            Pageable pageable
    );
}
