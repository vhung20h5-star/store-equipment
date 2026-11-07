import React from "react";
import { ShieldCheck, Crown } from "lucide-react";

import {
  AppliedCoupon,
  formatVNDPrice,
} from "@/components/checkout/useCheckout";

interface CheckoutOrderSummaryProps {
  totalCartItems: number;
  totalCartPrice: number;
  appliedCoupon: AppliedCoupon | null;
  voucherDiscountAmount?: number;
  vipDiscountAmount?: number;
  vipDiscountPercent?: number;
  vipTierApplied?: string;
  discountAmount: number;
  finalTotal: number;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  totalCartItems,
  totalCartPrice,
  appliedCoupon,
  voucherDiscountAmount,
  vipDiscountAmount = 0,
  vipDiscountPercent = 0,
  vipTierApplied,
  discountAmount,
  finalTotal,
}) => {
  const effectiveVoucherDiscount =
    voucherDiscountAmount !== undefined ? voucherDiscountAmount : discountAmount;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>Tạm tính ({totalCartItems} món):</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {formatVNDPrice(totalCartPrice)}
          </span>
        </div>

        {appliedCoupon && effectiveVoucherDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Giảm giá Voucher ({appliedCoupon.code}):</span>
            <span className="font-semibold">
              -{formatVNDPrice(effectiveVoucherDiscount)}
            </span>
          </div>
        )}

        {vipDiscountAmount > 0 && (
          <div className="flex justify-between text-amber-600 dark:text-amber-400">
            <span className="inline-flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              <span>
                Đặc quyền{" "}
                {vipTierApplied === "VIP_YEARLY" ? "VIP Năm" : "VIP Tháng"} (-
                {vipDiscountPercent}%):
              </span>
            </span>
            <span className="font-semibold">
              -{formatVNDPrice(vipDiscountAmount)}
            </span>
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
            {formatVNDPrice(finalTotal)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Bảo hành chính hãng 24 tháng & đổi mới trong 30 ngày.</span>
      </div>
    </div>
  );
};
