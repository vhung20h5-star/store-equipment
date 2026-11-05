import React from "react";
import { Button } from "@heroui/react";
import {
  X,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useCheckout } from "@/components/checkout/useCheckout";
import { ShippingAddressForm } from "@/components/checkout/ShippingAddressForm";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { VoucherInputSection } from "@/components/checkout/VoucherInputSection";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { OrderSuccessView } from "@/components/checkout/OrderSuccessView";

export const CheckoutModal: React.FC = () => {
  const {
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
  } = useCheckout();

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        role="presentation"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              {orderSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ShoppingBag className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {orderSuccess
                  ? "Đặt Hàng Thành Công!"
                  : "Thông Tin Thanh Toán & Giao Hàng"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {orderSuccess
                  ? "Cảm ơn bạn đã lựa chọn thiết bị gia dụng HomeNest"
                  : `Đơn hàng gồm ${totalCartItems} sản phẩm`}
              </p>
            </div>
          </div>
          <button
            type="button"
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
            <OrderSuccessView
              orderSuccess={orderSuccess}
              copiedOrderNumber={copiedOrderNumber}
              copiedBankInfo={copiedBankInfo}
              handleCopyOrderNumber={handleCopyOrderNumber}
              handleCopyBankInfo={handleCopyBankInfo}
              handleClose={handleClose}
            />
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {submitError && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs text-rose-700 dark:text-rose-300">
                    <p className="font-semibold mb-0.5">
                      Không thể tạo đơn hàng
                    </p>
                    <p>{submitError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: Contact & Shipping */}
                <ShippingAddressForm
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  customerPhone={customerPhone}
                  setCustomerPhone={setCustomerPhone}
                  customerEmail={customerEmail}
                  setCustomerEmail={setCustomerEmail}
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                  notes={notes}
                  setNotes={setNotes}
                />

                {/* Right column: Payment method, Voucher & Order summary */}
                <div className="space-y-4">
                  <PaymentMethodSelector
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                  />

                  <VoucherInputSection
                    couponInput={couponInput}
                    setCouponInput={setCouponInput}
                    isApplyingCoupon={isApplyingCoupon}
                    couponError={couponError}
                    appliedCoupon={appliedCoupon}
                    handleApplyCoupon={handleApplyCoupon}
                    handleRemoveCoupon={handleRemoveCoupon}
                  />

                  <CheckoutOrderSummary
                    totalCartItems={totalCartItems}
                    totalCartPrice={totalCartPrice}
                    appliedCoupon={appliedCoupon}
                    discountAmount={discountAmount}
                    finalTotal={finalTotal}
                  />
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
