import React from "react";
import { Truck } from "lucide-react";

interface ShippingAddressFormProps {
  customerName: string;
  setCustomerName: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  shippingAddress: string;
  setShippingAddress: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

export const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
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
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
        <Truck className="w-4 h-4 text-emerald-600" />
        1. Địa chỉ giao hàng
      </h3>

      <div>
        <label
          htmlFor="checkout-customer-name"
          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Họ và tên người nhận <span className="text-rose-500">*</span>
        </label>
        <input
          id="checkout-customer-name"
          type="text"
          required
          placeholder="Ví dụ: Nguyễn Văn A"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label
          htmlFor="checkout-customer-phone"
          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Số điện thoại <span className="text-rose-500">*</span>
        </label>
        <input
          id="checkout-customer-phone"
          type="tel"
          required
          placeholder="Ví dụ: 0912345678"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label
          htmlFor="checkout-customer-email"
          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Email nhận hóa đơn (tùy chọn)
        </label>
        <input
          id="checkout-customer-email"
          type="email"
          placeholder="email@example.com"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label
          htmlFor="checkout-shipping-address"
          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Địa chỉ nhận hàng chi tiết <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="checkout-shipping-address"
          required
          rows={2}
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div>
        <label
          htmlFor="checkout-notes"
          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Ghi chú đơn hàng (nếu có)
        </label>
        <input
          id="checkout-notes"
          type="text"
          placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};

