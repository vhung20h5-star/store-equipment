import React from "react";
import { Button } from "@heroui/react";
import { Check, Copy, CreditCard, Banknote, Crown } from "lucide-react";

import { OrderResponse } from "@/types";
import { formatVNDPrice } from "@/components/checkout/useCheckout";

interface OrderSuccessViewProps {
  orderSuccess: OrderResponse;
  copiedOrderNumber: boolean;
  copiedBankInfo: boolean;
  handleCopyOrderNumber: () => void;
  handleCopyBankInfo: () => void;
  handleClose: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  orderSuccess,
  copiedOrderNumber,
  copiedBankInfo,
  handleCopyOrderNumber,
  handleCopyBankInfo,
  handleClose,
}) => {
  const voucherDisc =
    orderSuccess.voucherDiscountAmount ?? orderSuccess.discountAmount ?? 0;
  const vipDisc = orderSuccess.vipDiscountAmount ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
          Đơn hàng đã được tiếp nhận thành công!
        </h3>
        <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
          Hệ thống HomeNest đã lưu thông tin đơn hàng và sẽ liên hệ xác nhận sớm
          nhất qua số điện thoại của bạn.
        </p>

        {/* Order Number pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm">
          <span>Mã đơn hàng:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            {orderSuccess.orderNumber}
          </span>
          <button
            type="button"
            onClick={handleCopyOrderNumber}
            className="p-1 hover:text-emerald-600 text-slate-400 transition-colors"
            title="Sao chép mã đơn hàng"
          >
            {copiedOrderNumber ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
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
              <span>{formatVNDPrice(orderSuccess.subtotalAmount)}</span>
            </div>
            {voucherDisc > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Giảm giá Voucher ({orderSuccess.couponCode}):</span>
                <span>-{formatVNDPrice(voucherDisc)}</span>
              </div>
            )}
            {vipDisc > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span className="inline-flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  <span>
                    Ưu đãi{" "}
                    {orderSuccess.vipTierApplied === "VIP_YEARLY"
                      ? "VIP Năm"
                      : "VIP Tháng"}
                    :
                  </span>
                </span>
                <span>-{formatVNDPrice(vipDisc)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Tổng tiền:</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {formatVNDPrice(orderSuccess.totalAmount)}
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
              type="button"
              onClick={handleCopyBankInfo}
              className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              {copiedBankInfo ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Sao chép thông tin</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-sky-800 dark:text-sky-300">
            <div>
              <span className="text-sky-600 dark:text-sky-400">Ngân hàng:</span>{" "}
              <span className="font-semibold">
                Vietcombank (Chi nhánh Sở Giao Dịch)
              </span>
            </div>
            <div>
              <span className="text-sky-600 dark:text-sky-400">
                Số tài khoản:
              </span>{" "}
              <span className="font-mono font-bold text-sm">1029384756</span>
            </div>
            <div>
              <span className="text-sky-600 dark:text-sky-400">
                Chủ tài khoản:
              </span>{" "}
              <span className="font-semibold">
                CONG TY CO PHAN HOMENEST VIET NAM
              </span>
            </div>
            <div>
              <span className="text-sky-600 dark:text-sky-400">
                Nội dung CK:
              </span>{" "}
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {orderSuccess.orderNumber}
              </span>
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
                    {formatVNDPrice(it.price)} x {it.quantity}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0">
                {formatVNDPrice(it.totalPrice)}
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
  );
};
