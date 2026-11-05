import React, { useState, useEffect, useCallback } from "react";

import { useShop } from "@/context/ShopContext";
import { createOrder, validatePromotionCode } from "@/services/api";
import { PaymentMethod, OrderResponse } from "@/types";

export interface AppliedCoupon {
  code: string;
  discountPercent: number;
  discountAmount: number;
}

export const formatVNDPrice = (val: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

export const useCheckout = () => {
  const {
    cart,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    showToast,
    totalCartPrice,
    totalCartItems,
    currentUser,
  } = useShop();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  // Auto-fill from logged in user
  useEffect(() => {
    if (currentUser && isCheckoutOpen) {
      if (currentUser.fullName) setCustomerName(currentUser.fullName);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.email) setCustomerEmail(currentUser.email);
      if (currentUser.address) setShippingAddress(currentUser.address);
    }
  }, [currentUser, isCheckoutOpen]);

  // Voucher states
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<OrderResponse | null>(null);

  // Copy states
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, totalCartPrice - discountAmount);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponInput.trim()) {
      setCouponError("Vui lòng nhập mã giảm giá");

      return;
    }
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const code = couponInput.trim().toUpperCase();
      const res = await validatePromotionCode(code);

      if (res.valid) {
        let calcDiscount = Math.round(
          (totalCartPrice * res.discountPercent) / 100,
        );

        if (res.maxDiscountAmount && calcDiscount > res.maxDiscountAmount) {
          calcDiscount = res.maxDiscountAmount;
        }
        setAppliedCoupon({
          code: res.code,
          discountPercent: res.discountPercent,
          discountAmount: calcDiscount,
        });
        showToast(
          "Áp dụng mã giảm giá thành công!",
          `Giảm ${res.discountPercent}% cho đơn hàng`,
          "success",
        );
      } else {
        setCouponError(
          res.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.",
        );
      }
    } catch {
      setCouponError("Không thể kiểm tra mã giảm giá vào lúc này.");
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponInput, totalCartPrice, showToast]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }, []);

  const handleSubmitOrder = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      // Validation
      if (!customerName.trim()) {
        setSubmitError("Vui lòng nhập họ và tên của bạn.");

        return;
      }
      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

      if (!customerPhone.trim() || !phoneRegex.test(customerPhone.trim())) {
        setSubmitError(
          "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (ví dụ: 0912345678).",
        );

        return;
      }
      if (!shippingAddress.trim()) {
        setSubmitError("Vui lòng nhập địa chỉ nhận hàng chi tiết.");

        return;
      }
      if (cart.length === 0) {
        setSubmitError("Giỏ hàng đang trống, không thể tiến hành đặt hàng.");

        return;
      }

      setIsSubmitting(true);
      try {
        const orderData = {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          shippingAddress: shippingAddress.trim(),
          notes: notes.trim() || undefined,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        };

        const res = await createOrder(orderData);

        setOrderSuccess(res);
        clearCart();
        showToast(
          "Đặt hàng thành công!",
          `Mã đơn hàng của bạn là: ${res.orderNumber}`,
          "success",
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setSubmitError(err.message);
        } else {
          setSubmitError(
            "Đã có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.",
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      notes,
      paymentMethod,
      appliedCoupon,
      cart,
      clearCart,
      showToast,
    ],
  );

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setIsCheckoutOpen(false);
    if (orderSuccess) {
      setTimeout(() => {
        setOrderSuccess(null);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setShippingAddress("");
        setNotes("");
        setAppliedCoupon(null);
        setCouponInput("");
        setSubmitError(null);
      }, 300);
    }
  }, [isSubmitting, setIsCheckoutOpen, orderSuccess]);

  const handleCopyOrderNumber = useCallback(() => {
    if (orderSuccess) {
      navigator.clipboard.writeText(orderSuccess.orderNumber);
      setCopiedOrderNumber(true);
      setTimeout(() => setCopiedOrderNumber(false), 2000);
    }
  }, [orderSuccess]);

  const handleCopyBankInfo = useCallback(() => {
    if (orderSuccess) {
      const bankText = `1029384756 | Vietcombank | Cú pháp: ${orderSuccess.orderNumber}`;

      navigator.clipboard.writeText(bankText);
      setCopiedBankInfo(true);
      setTimeout(() => setCopiedBankInfo(false), 2000);
    }
  }, [orderSuccess]);

  return {
    isCheckoutOpen,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerEmail,
    setCustomerEmail,
    shippingAddress,
    setShippingAddress,
    notes,
    setNotes,
    paymentMethod,
    setPaymentMethod,
    couponInput,
    setCouponInput,
    isApplyingCoupon,
    couponError,
    appliedCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    discountAmount,
    finalTotal,
    totalCartPrice,
    totalCartItems,
    isSubmitting,
    submitError,
    orderSuccess,
    handleSubmitOrder,
    handleClose,
    copiedOrderNumber,
    copiedBankInfo,
    handleCopyOrderNumber,
    handleCopyBankInfo,
  };
};

