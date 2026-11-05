import React from "react";
import { Button } from "@heroui/react";
import { Sparkles, X, Loader2 } from "lucide-react";

import { AppliedCoupon, formatVNDPrice } from "@/components/checkout/useCheckout";

interface VoucherInputSectionProps {
  couponInput: string;
  setCouponInput: (value: string) => void;
  isApplyingCoupon: boolean;
  couponError: string | null;
  appliedCoupon: AppliedCoupon | null;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
}

export const VoucherInputSection: React.FC<VoucherInputSectionProps> = ({
  couponInput,
  setCouponInput,
  isApplyingCoupon,
  couponError,
  appliedCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
}) => {
  return (
    <div className="pt-2 space-y-2">
      <label
        htmlFor="checkout-coupon-code"
        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
      >
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
                (-{appliedCoupon.discountPercent}% ~{" "}
                {formatVNDPrice(appliedCoupon.discountAmount)})
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
              id="checkout-coupon-code"
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
  );
};

