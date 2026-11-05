import React from "react";
import { CreditCard, Banknote } from "lucide-react";

import { PaymentMethod } from "@/types";

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <div className="space-y-2">
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
          <span className="text-xs font-semibold text-center">
            Thanh toán COD
          </span>
          <span className="text-[10px] text-slate-400 text-center">
            Khi nhận hàng
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
    </div>
  );
};

