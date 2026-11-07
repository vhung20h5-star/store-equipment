import React from "react";
import { Button } from "@heroui/react";
import { Sparkles, X, Loader2, Ticket, Crown } from "lucide-react";

import {
  AppliedCoupon,
  formatVNDPrice,
} from "@/components/checkout/useCheckout";
import { VoucherItem } from "@/types";

interface VoucherInputSectionProps {
  couponInput: string;
  setCouponInput: (value: string) => void;
  isApplyingCoupon: boolean;
  couponError: string | null;
  appliedCoupon: AppliedCoupon | null;
  savedVouchers?: VoucherItem[];
  totalCartPrice?: number;
  handleApplyCoupon: () => void;
  handleSelectSavedVoucher?: (voucher: VoucherItem) => void;
  handleRemoveCoupon: () => void;
}

export const VoucherInputSection: React.FC<VoucherInputSectionProps> = ({
  couponInput,
  setCouponInput,
  isApplyingCoupon,
  couponError,
  appliedCoupon,
  savedVouchers = [],
  totalCartPrice = 0,
  handleApplyCoupon,
  handleSelectSavedVoucher,
  handleRemoveCoupon,
}) => {
  return (
    <div className="pt-2 space-y-2.5">
      <label
        htmlFor="checkout-coupon-code"
        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
      >
        Mã ưu đãi / Kho Voucher của bạn
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
            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              id="checkout-coupon-code"
              type="text"
              placeholder="Nhập mã đã lưu hoặc HOMENEST30"
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

          {/* Quick Select from User's Saved Voucher Wallet */}
          {savedVouchers.length > 0 && handleSelectSavedVoucher && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-emerald-500" />
                <span>Chọn nhanh từ Kho Voucher đã lưu ({savedVouchers.length}):</span>
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {savedVouchers.map((v) => {
                  const eligible = totalCartPrice >= (v.minOrderAmount || 0);
                  return (
                    <div
                      key={v.id}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-[11px] ${
                        eligible
                          ? "bg-white dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-800/60"
                          : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-65"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {v.code}
                          </span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            -{v.discountPercent}%
                          </span>
                          {v.vipOnly && (
                            <Crown className="w-3 h-3 text-amber-500" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {eligible
                            ? v.title
                            : `Cần đơn từ ${formatVNDPrice(v.minOrderAmount)}`}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!eligible || isApplyingCoupon}
                        onClick={() => handleSelectSavedVoucher(v)}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                          eligible
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        Dùng ngay
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
