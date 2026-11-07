package com.homenest.promotion;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.homenest.auth.User;

@Entity
@Table(name = "vip_subscriptions")
public class VipSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "plan_type", nullable = false, length = 30)
    private String planType;

    @Column(name = "price_paid", nullable = false)
    private Long pricePaid;

    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;

    @Column(name = "max_discount_per_order", nullable = false)
    private Long maxDiscountPerOrder;

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod = "BANK_CARD";

    @Column(name = "bank_card_id")
    private Long bankCardId;

    @Column(name = "card_masked", length = 100)
    private String cardMasked;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public VipSubscription() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }

    public Long getPricePaid() { return pricePaid; }
    public void setPricePaid(Long pricePaid) { this.pricePaid = pricePaid; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public Long getMaxDiscountPerOrder() { return maxDiscountPerOrder; }
    public void setMaxDiscountPerOrder(Long maxDiscountPerOrder) { this.maxDiscountPerOrder = maxDiscountPerOrder; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Long getBankCardId() { return bankCardId; }
    public void setBankCardId(Long bankCardId) { this.bankCardId = bankCardId; }

    public String getCardMasked() { return cardMasked; }
    public void setCardMasked(String cardMasked) { this.cardMasked = cardMasked; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

