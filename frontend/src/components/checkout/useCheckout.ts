import React, { useState, useEffect, useCallback, useMemo } from "react";

import { useShop } from "@/context/ShopContext";
import {
  createOrder,
  fetchMyVouchers,
  validatePromotionCode,
} from "@/services/api";
import { PaymentMethod, OrderResponse, VoucherItem } from "@/types";

export interface AppliedCoupon {
  code: string;
  discountPercent: number;
  discountAmount: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
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

  // Saved vouchers from user wallet
  const [savedVouchers, setSavedVouchers] = useState<VoucherItem[]>([]);

  // Auto-fill from logged in user & load saved vouchers
  useEffect(() => {
    if (currentUser && isCheckoutOpen) {
      if (currentUser.fullName) setCustomerName(currentUser.fullName);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.email) setCustomerEmail(currentUser.email);
      if (currentUser.address) setShippingAddress(currentUser.address);

      fetchMyVouchers()
        .then((list) => {
          setSavedVouchers(
            list.filter((v) => v.userVoucherStatus === "AVAILABLE"),
          );
        })
        .catch(() => {
          setSavedVouchers([]);
        });
    } else if (!currentUser) {
      setSavedVouchers([]);
    }
  }, [currentUser, isCheckoutOpen]);

  // Voucher states
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<OrderResponse | null>(null);

  // Copy states
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);

  // Tier 1: Voucher discount
  const voucherDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    let calc = Math.round(
      (totalCartPrice * appliedCoupon.discountPercent) / 100,
    );
    if (
      appliedCoupon.maxDiscountAmount &&
      calc > appliedCoupon.maxDiscountAmount
    ) {
      calc = appliedCoupon.maxDiscountAmount;
    }
    return calc;
  }, [appliedCoupon, totalCartPrice]);

  // Tier 2: Stacked VIP direct discount (applied on amount after voucher discount)
  const vipDiscountPercent = currentUser?.vipActive
    ? currentUser.vipDiscountPercent || 0
    : 0;
  const vipMaxDiscountAmount = currentUser?.vipActive
    ? currentUser.vipMaxDiscountAmount || 0
    : 0;
  const vipTierApplied = currentUser?.vipActive
    ? currentUser.vipTier || "NONE"
    : "NONE";

  const vipDiscountAmount = useMemo(() => {
    if (!currentUser?.vipActive || vipDiscountPercent <= 0) return 0;
    const afterVoucher = Math.max(0, totalCartPrice - voucherDiscountAmount);
    let calc = Math.round((afterVoucher * vipDiscountPercent) / 100);
    if (vipMaxDiscountAmount > 0 && calc > vipMaxDiscountAmount) {
      calc = vipMaxDiscountAmount;
    }
    return calc;
  }, [
    currentUser?.vipActive,
    vipDiscountPercent,
    vipMaxDiscountAmount,
    totalCartPrice,
    voucherDiscountAmount,
  ]);

  const discountAmount = voucherDiscountAmount + vipDiscountAmount;
  const finalTotal = Math.max(0, totalCartPrice - discountAmount);

  const applyCodeInternal = useCallback(
    async (rawCode: string) => {
      if (!rawCode.trim()) {
        setCouponError("Vui lòng nhập hoặc chọn mã giảm giá");
        return;
      }
      setIsApplyingCoupon(true);
      setCouponError(null);
      try {
        const code = rawCode.trim().toUpperCase();
        const res = await validatePromotionCode(code, totalCartPrice);

        if (res.valid) {
          let calcDiscount = Math.round(
            (totalCartPrice * res.discountPercent) / 100,
          );

          if (res.maxDiscountAmount && calcDiscount > res.maxDiscountAmount) {
            calcDiscount = res.maxDiscountAmount;
          }
          setCouponInput(res.code);
          setAppliedCoupon({
            code: res.code,
            discountPercent: res.discountPercent,
            discountAmount: calcDiscount,
            maxDiscountAmount: res.maxDiscountAmount,
            minOrderAmount: res.minOrderAmount,
          });
          showToast(
            "Áp dụng mã giảm giá thành công!",
            `Giảm ${res.discountPercent}% (${formatVNDPrice(calcDiscount)}) cho đơn hàng`,
            "success",
          );
        } else {
          setCouponError(
            res.message || "Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện.",
          );
        }
      } catch {
        setCouponError("Không thể kiểm tra mã giảm giá vào lúc này.");
      } finally {
        setIsApplyingCoupon(false);
      }
    },
    [totalCartPrice, showToast],
  );

  const handleApplyCoupon = useCallback(async () => {
    await applyCodeInternal(couponInput);
  }, [applyCodeInternal, couponInput]);

  const handleSelectSavedVoucher = useCallback(
    async (voucher: VoucherItem) => {
      await applyCodeInternal(voucher.code);
    },
    [applyCodeInternal],
  );

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
        window.dispatchEvent(new Event("homenest:vouchers-updated"));
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
    savedVouchers,
    handleApplyCoupon,
    handleSelectSavedVoucher,
    handleRemoveCoupon,
    voucherDiscountAmount,
    vipDiscountAmount,
    vipDiscountPercent,
    vipTierApplied,
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
