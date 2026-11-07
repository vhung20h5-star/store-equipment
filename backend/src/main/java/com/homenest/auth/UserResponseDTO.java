package com.homenest.auth;

import java.time.LocalDateTime;

public class UserResponseDTO {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String role;
    private String vipTier;
    private LocalDateTime vipExpiresAt;
    private boolean vipActive;
    private int vipDiscountPercent;
    private long vipMaxDiscountAmount;
    private LocalDateTime createdAt;

    public UserResponseDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getVipTier() { return vipTier; }
    public void setVipTier(String vipTier) { this.vipTier = vipTier; }

    public LocalDateTime getVipExpiresAt() { return vipExpiresAt; }
    public void setVipExpiresAt(LocalDateTime vipExpiresAt) { this.vipExpiresAt = vipExpiresAt; }

    public boolean isVipActive() { return vipActive; }
    public void setVipActive(boolean vipActive) { this.vipActive = vipActive; }

    public int getVipDiscountPercent() { return vipDiscountPercent; }
    public void setVipDiscountPercent(int vipDiscountPercent) { this.vipDiscountPercent = vipDiscountPercent; }

    public long getVipMaxDiscountAmount() { return vipMaxDiscountAmount; }
    public void setVipMaxDiscountAmount(long vipMaxDiscountAmount) { this.vipMaxDiscountAmount = vipMaxDiscountAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

