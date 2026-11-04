package com.homenest.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_subscribers")
public class NewsletterSubscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "voucher_code", length = 50)
    private String voucherCode;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "subscribed_at", updatable = false)
    private LocalDateTime subscribedAt = LocalDateTime.now();

    public NewsletterSubscriber() {}

    public NewsletterSubscriber(String email, String voucherCode) {
        this.email = email;
        this.voucherCode = voucherCode;
        this.isActive = true;
        this.subscribedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public LocalDateTime getSubscribedAt() { return subscribedAt; }
    public void setSubscribedAt(LocalDateTime subscribedAt) { this.subscribedAt = subscribedAt; }
}

