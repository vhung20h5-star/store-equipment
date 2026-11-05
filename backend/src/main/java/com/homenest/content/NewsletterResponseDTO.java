package com.homenest.content;

public class NewsletterResponseDTO {

    private String email;
    private String voucherCode;
    private boolean alreadySubscribed;
    private String message;

    public NewsletterResponseDTO() {}

    public NewsletterResponseDTO(String email, String voucherCode, boolean alreadySubscribed, String message) {
        this.email = email;
        this.voucherCode = voucherCode;
        this.alreadySubscribed = alreadySubscribed;
        this.message = message;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }

    public boolean isAlreadySubscribed() { return alreadySubscribed; }
    public void setAlreadySubscribed(boolean alreadySubscribed) { this.alreadySubscribed = alreadySubscribed; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

