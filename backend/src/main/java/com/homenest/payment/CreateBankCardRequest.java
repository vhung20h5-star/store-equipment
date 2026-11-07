package com.homenest.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CreateBankCardRequest {

    @NotBlank(message = "Tên ngân hàng không được để trống")
    private String bankName;

    private String cardBrand = "VISA";

    @NotBlank(message = "Số thẻ ngân hàng không được để trống")
    private String cardNumber;

    @NotBlank(message = "Tên chủ thẻ không được để trống")
    private String cardHolderName;

    @NotBlank(message = "Ngày hết hạn (MM/YY) không được để trống")
    private String expiryDate;

    @NotBlank(message = "Mã bảo mật CVV/PIN không được để trống")
    private String cvv;

    @Min(value = 0, message = "Số dư khởi tạo không được âm")
    private Long initialBalance = 5000000L;

    private Boolean setAsDefault = true;

    public CreateBankCardRequest() {}

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getCardBrand() { return cardBrand; }
    public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getCardHolderName() { return cardHolderName; }
    public void setCardHolderName(String cardHolderName) { this.cardHolderName = cardHolderName; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }

    public Long getInitialBalance() { return initialBalance; }
    public void setInitialBalance(Long initialBalance) { this.initialBalance = initialBalance; }

    public Boolean getSetAsDefault() { return setAsDefault; }
    public void setSetAsDefault(Boolean setAsDefault) { this.setAsDefault = setAsDefault; }
}

