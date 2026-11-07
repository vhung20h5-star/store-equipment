import React from "react";
import { CreditCard, Banknote, ShieldCheck, Plus } from "lucide-react";

import { BankCardItem, PaymentMethod } from "@/types";
import { formatVNDPrice } from "@/components/checkout/useCheckout";

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  bankCards?: BankCardItem[];
  selectedCardId?: number | null;
  setSelectedCardId?: (id: number) => void;
  cardCvv?: string;
  setCardCvv?: (cvv: string) => void;
  openWalletCards?: () => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  setPaymentMethod,
  bankCards = [],
  selectedCardId = null,
  setSelectedCardId,
  cardCvv = "",
  setCardCvv,
  openWalletCards,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-emerald-600" />
        2. Phương thức thanh toán
      </h3>

      <div className="grid grid-cols-3 gap-2.5">
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
          <span className="text-xs font-semibold text-center">
            Thanh toán COD
          </span>
          <span className="text-[10px] text-slate-400 text-center">
            Khi nhận hàng
          </span>
        </label>

        <label
          className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
            paymentMethod === "BANK_CARD"
              ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400"
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="BANK_CARD"
            checked={paymentMethod === "BANK_CARD"}
            onChange={() => setPaymentMethod("BANK_CARD")}
            className="sr-only"
          />
          <ShieldCheck className="w-5 h-5 mb-1 text-amber-500" />
          <span className="text-xs font-semibold text-center">
            Thẻ Ngân Hàng
          </span>
          <span className="text-[10px] text-slate-400 text-center">
            Trừ tiền ngay
          </span>
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
          <span className="text-xs font-semibold text-center">
            Chuyển khoản
          </span>
          <span className="text-[10px] text-slate-400 text-center">
            Ngân hàng 24/7
          </span>
        </label>
      </div>

      {/* Bank Card Selection Box */}
      {paymentMethod === "BANK_CARD" && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Chọn thẻ ngân hàng đã liên kết
            </span>
            {openWalletCards && (
              <button
                type="button"
                onClick={openWalletCards}
                className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm / Nạp tiền thẻ</span>
              </button>
            )}
          </div>

          {bankCards.length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Bạn chưa có thẻ ngân hàng nào được liên kết. Vui lòng bấm{" "}
              <button
                type="button"
                onClick={openWalletCards}
                className="font-bold text-sky-600 underline cursor-pointer"
              >
                Thêm / Nạp tiền thẻ
              </button>{" "}
              để liên kết thẻ!
            </div>
          ) : (
            <div className="space-y-2">
              <select
                value={selectedCardId ?? ""}
                onChange={(e) =>
                  setSelectedCardId && setSelectedCardId(Number(e.target.value))
                }
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {bankCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.bankName} ({c.cardBrand}) • {c.cardNumberMasked} — SD:{" "}
                    {formatVNDPrice(c.balance)}
                  </option>
                ))}
              </select>

              <div>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Nhập mã bảo mật CVV của thẻ (VD: 686)"
                  value={cardCvv}
                  onChange={(e) => setCardCvv && setCardCvv(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
