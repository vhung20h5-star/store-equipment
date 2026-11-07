package com.homenest.promotion;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.homenest.auth.User;

@Entity
@Table(
    name = "user_vouchers",
    uniqueConstraints = @UniqueConstraint(name = "uq_user_voucher_claim", columnNames = {"user_id", "promotion_id"})
)
public class UserVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    @Column(nullable = false, length = 30)
    private String status = "AVAILABLE";

    @Column(name = "claimed_at", nullable = false, updatable = false)
    private LocalDateTime claimedAt = LocalDateTime.now();

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "order_number", length = 50)
    private String orderNumber;

    public UserVoucher() {}

    public UserVoucher(User user, Promotion promotion) {
        this.user = user;
        this.promotion = promotion;
        this.status = "AVAILABLE";
        this.claimedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Promotion getPromotion() { return promotion; }
    public void setPromotion(Promotion promotion) { this.promotion = promotion; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getClaimedAt() { return claimedAt; }
    public void setClaimedAt(LocalDateTime claimedAt) { this.claimedAt = claimedAt; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
}

