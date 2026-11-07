package com.homenest.promotion;

import java.time.LocalDateTime;
import java.util.List;

import com.homenest.auth.UserResponseDTO;

public class VipStatusResponseDTO {

    private UserResponseDTO user;
    private boolean active;
    private String tier;
    private LocalDateTime expiresAt;
    private int directDiscountPercent;
    private long maxDiscountPerOrder;
    private List<VipPlanDTO> plans;
    private List<VipSubscriptionDTO> subscriptions;

    public VipStatusResponseDTO() {}

    public static class VipSubscriptionDTO {
        private Long id;
        private String planType;
        private Long pricePaid;
        private Integer discountPercent;
        private Long maxDiscountPerOrder;
        private String paymentMethod;
        private String status;
        private LocalDateTime startedAt;
        private LocalDateTime expiresAt;

        public VipSubscriptionDTO() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

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

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDateTime getStartedAt() { return startedAt; }
        public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

        public LocalDateTime getExpiresAt() { return expiresAt; }
        public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    }

    public UserResponseDTO getUser() { return user; }
    public void setUser(UserResponseDTO user) { this.user = user; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public int getDirectDiscountPercent() { return directDiscountPercent; }
    public void setDirectDiscountPercent(int directDiscountPercent) { this.directDiscountPercent = directDiscountPercent; }

    public long getMaxDiscountPerOrder() { return maxDiscountPerOrder; }
    public void setMaxDiscountPerOrder(long maxDiscountPerOrder) { this.maxDiscountPerOrder = maxDiscountPerOrder; }

    public List<VipPlanDTO> getPlans() { return plans; }
    public void setPlans(List<VipPlanDTO> plans) { this.plans = plans; }

    public List<VipSubscriptionDTO> getSubscriptions() { return subscriptions; }
    public void setSubscriptions(List<VipSubscriptionDTO> subscriptions) { this.subscriptions = subscriptions; }
}

