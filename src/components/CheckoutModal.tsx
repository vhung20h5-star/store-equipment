import React, { useState } from "react";
import { Button } from "@heroui/react";
import {
  X,
  ShoppingBag,
  CheckCircle2,
  Truck,
  CreditCard,
  Banknote,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";
import { createOrder, validatePromotionCode } from "@/services/api";
import { PaymentMethod, OrderResponse } from "@/types";

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    showToast,
    totalCartPrice,
    totalCartItems,
  } = useShop();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  // Voucher states
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
  } | null>(null);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<OrderResponse | null>(null);

  // Copy states
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);

  if (!isCheckoutOpen) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, totalCartPrice - discountAmount);

  const handleApplyCoupon = async () => {
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
        let calcDiscount = Math.round((totalCartPrice * res.discountPercent) / 100);
        if (res.maxDiscountAmount && calcDiscount > res.maxDiscountAmount) {
          calcDiscount = res.maxDiscountAmount;
        }
        setAppliedCoupon({
          code: res.code,
          discountPercent: res.discountPercent,
          discountAmount: calcDiscount,
        });
        showToast("Áp dụng mã giảm giá thành công!", `Giảm ${res.discountPercent}% cho đơn hàng`, "success");
      } else {
        setCouponError(res.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.");
      }
    } catch {
      setCouponError("Không thể kiểm tra mã giảm giá vào lúc này.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!customerName.trim()) {
      setSubmitError("Vui lòng nhập họ và tên của bạn.");
      return;
    }
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!customerPhone.trim() || !phoneRegex.test(customerPhone.trim())) {
      setSubmitError("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (ví dụ: 0912345678).");
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
      showToast("Đặt hàng thành công!", `Mã đơn hàng của bạn là: ${res.orderNumber}`, "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Đã có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsCheckoutOpen(false);
    // Reset state after slight delay if order was completed
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
  };

  const handleCopyOrderNumber = () => {
    if (orderSuccess) {
      navigator.clipboard.writeText(orderSuccess.orderNumber);
      setCopiedOrderNumber(true);
      setTimeout(() => setCopiedOrderNumber(false), 2000);
    }
  };

  const handleCopyBankInfo = () => {
    if (orderSuccess) {
      const bankText = `1029384756 | Vietcombank | Cú pháp: ${orderSuccess.orderNumber}`;
      navigator.clipboard.writeText(bankText);
      setCopiedBankInfo(true);
      setTimeout(() => setCopiedBankInfo(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              {orderSuccess ? <CheckCircle2 className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {orderSuccess ? "Đặt Hàng Thành Công!" : "Thông Tin Thanh Toán & Giao Hàng"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {orderSuccess
                  ? "Cảm ơn bạn đã lựa chọn thiết bị gia dụng HomeNest"
                  : `Đơn hàng gồm ${totalCartItems} sản phẩm`}
              </p>
            </div>
          </div>
          <button
            aria-label="Đóng cửa sổ thanh toán"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {orderSuccess ? (
            /* ===== ORDER SUCCESS VIEW ===== */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                  Đơn hàng đã được tiếp nhận thành công!
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                  Hệ thống HomeNest đã lưu thông tin đơn hàng và sẽ liên hệ xác nhận sớm nhất qua số điện thoại của bạn.
                </p>

                {/* Order Number pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm">
                  <span>Mã đơn hàng:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {orderSuccess.orderNumber}
                  </span>
                  <button
                    onClick={handleCopyOrderNumber}
                    className="p-1 hover:text-emerald-600 text-slate-400 transition-colors"
                    title="Sao chép mã đơn hàng"
                  >
                    {copiedOrderNumber ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Order Details Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Thông tin nhận hàng
                  </h4>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {orderSuccess.customerName} - {orderSuccess.customerPhone}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {orderSuccess.shippingAddress}
                  </p>
                  {orderSuccess.customerEmail && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Email: {orderSuccess.customerEmail}
                    </p>
                  )}
                  {orderSuccess.notes && (
                    <p className="text-xs text-slate-500 italic">
                      Ghi chú: {orderSuccess.notes}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phương thức & Thanh toán
                  </h4>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {orderSuccess.paymentMethod === "COD" ? (
                      <>
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Thanh toán khi nhận hàng (COD)</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-sky-600" />
                        <span>Chuyển khoản ngân hàng 24/7</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span>{formatPrice(orderSuccess.subtotalAmount)}</span>
                    </div>
                    {orderSuccess.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Giảm giá ({orderSuccess.couponCode}):</span>
                        <span>-{formatPrice(orderSuccess.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>Tổng tiền:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {formatPrice(orderSuccess.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Instructions */}
              {orderSuccess.paymentMethod === "BANK_TRANSFER" && (
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      Thông tin chuyển khoản ngân hàng
                    </h4>
                    <button
                      onClick={handleCopyBankInfo}
                      className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                    >
                      {copiedBankInfo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Sao chép thông tin</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-sky-800 dark:text-sky-300">
                    <div>
                      <span className="text-sky-600 dark:text-sky-400">Ngân hàng:</span>{" "}
                      <span className="font-semibold">Vietcombank (Chi nhánh Sở Giao Dịch)</span>
                    </div>
                    <div>
                      <span className="text-sky-600 dark:text-sky-400">Số tài khoản:</span>{" "}
                      <span className="font-mono font-bold text-sm">1029384756</span>
                    </div>
                    <div>
                      <span className="text-sky-600 dark:text-sky-400">Chủ tài khoản:</span>{" "}
                      <span className="font-semibold">CONG TY CO PHAN HOMENEST VIET NAM</span>
                    </div>
                    <div>
                      <span className="text-sky-600 dark:text-sky-400">Nội dung CK:</span>{" "}
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{orderSuccess.orderNumber}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Items List Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sản phẩm đã đặt ({orderSuccess.items.length})
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {orderSuccess.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={it.productImage}
                          alt={it.productName}
                          className="w-10 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                            {it.productName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {formatPrice(it.price)} x {it.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0">
                        {formatPrice(it.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                  onPress={handleClose}
                >
                  Tiếp tục mua sắm
                </Button>
              </div>
            </div>
          ) : (
            /* ===== CHECKOUT FORM VIEW ===== */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {submitError && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs text-rose-700 dark:text-rose-300">
                    <p className="font-semibold mb-0.5">Không thể tạo đơn hàng</p>
                    <p>{submitError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: Contact & Shipping */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    1. Địa chỉ giao hàng
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Họ và tên người nhận <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0912345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email nhận hóa đơn (tùy chọn)
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Địa chỉ nhận hàng chi tiết <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ghi chú đơn hàng (nếu có)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Right column: Payment method & Order summary */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    2. Phương thức thanh toán
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === "COD"
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="sr-only"
                      />
                      <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                      <span className="text-xs font-semibold text-center">Thanh toán COD</span>
                      <span className="text-[10px] text-slate-400 text-center">Khi nhận hàng</span>
                    </label>

                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === "BANK_TRANSFER"
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="BANK_TRANSFER"
                        checked={paymentMethod === "BANK_TRANSFER"}
                        onChange={() => setPaymentMethod("BANK_TRANSFER")}
                        className="sr-only"
                      />
                      <CreditCard className="w-5 h-5 mb-1 text-sky-600" />
                      <span className="text-xs font-semibold text-center">Chuyển khoản</span>
                      <span className="text-[10px] text-slate-400 text-center">Ngân hàng 24/7</span>
                    </label>
                  </div>

                  {/* Voucher Section */}
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mã ưu đãi / Voucher
                    </label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                              {appliedCoupon.code}
                            </span>
                            <span className="text-slate-500 ml-2">
                              (-{appliedCoupon.discountPercent}% ~ {formatPrice(appliedCoupon.discountAmount)})
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nhập FLASHSALE30 hoặc mã khác"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <Button
                            type="button"
                            size="sm"
                            isDisabled={isApplyingCoupon}
                            onPress={handleApplyCoupon}
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold px-4 rounded-xl cursor-pointer disabled:opacity-50"
                          >
                            {isApplyingCoupon ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "Áp dụng"
                            )}
                          </Button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] text-rose-500">{couponError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Totals Summary */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Tạm tính ({totalCartItems} món):</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatPrice(totalCartPrice)}
                      </span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Giảm giá ({appliedCoupon.code}):</span>
                        <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Vận chuyển toàn quốc:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Miễn phí (HomeNest Care)
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                      <span>Tổng thanh toán:</span>
                      <span className="text-base text-emerald-600 dark:text-emerald-400 font-extrabold">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Bảo hành chính hãng 24 tháng & đổi mới trong 30 ngày.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onPress={handleClose}
                  className="text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Quay lại giỏ hàng
                </Button>

                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý đơn hàng...</span>
                    </>
                  ) : (
                    <>
                      <span>Xác nhận đặt hàng</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
