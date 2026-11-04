package com.homenest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class NewsletterRequest {

    @NotBlank(message = "Địa chỉ email không được để trống")
    @Email(message = "Địa chỉ email không đúng định dạng")
    private String email;

    public NewsletterRequest() {}

    public NewsletterRequest(String email) {
        this.email = email;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}

