import React, { useState } from "react";
import { Button } from "@heroui/react";
import {
  X,
  Search,
  Package,
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Banknote,
  Loader2,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";
import { getOrderByNumber, lookupOrdersByPhone } from "@/services/api";
import { OrderResponse, OrderStatus } from "@/types";

export const OrderLookupModal: React.FC = () => {
  const { isLookupOpen, setIsLookupOpen } = useShop();

  const [lookupType, setLookupType] = useState<"number" | "phone">("number");
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<OrderResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isLookupOpen) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Đã xác nhận
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
            <Clock className="w-3 h-3" />
            Đang đóng gói
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
            <Truck className="w-3 h-3" />
            Đang giao hàng
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300">
            <CheckCircle2 className="w-3 h-3" />
            Đã giao hàng
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
            <AlertCircle className="w-3 h-3" />
            Đã hủy
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setHasSearched(true);
    setResults([]);

    try {
      if (lookupType === "number") {
        const order = await getOrderByNumber(searchValue.trim());
        setResults([order]);
      } else {
        const orders = await lookupOrdersByPhone(searchValue.trim());
        setResults(orders);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại thông tin nhập.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsLookupOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Tra Cứu Đơn Hàng
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kiểm tra tiến độ giao hàng và thông tin chi tiết đơn hàng của bạn
              </p>
            </div>
          </div>
          <button
            aria-label="Đóng cửa sổ tra cứu"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setIsLookupOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Lookup Toggle & Form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
              <button
                type="button"
                onClick={() => {
                  setLookupType("number");
                  setSearchValue("");
                  setResults([]);
                  setHasSearched(false);
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  lookupType === "number"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Theo mã đơn hàng (HN-...)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLookupType("phone");
                  setSearchValue("");
                  setResults([]);
                  setHasSearched(false);
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  lookupType === "phone"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Theo số điện thoại
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type={lookupType === "phone" ? "tel" : "text"}
                required
                placeholder={
                  lookupType === "number"
                    ? "Nhập mã đơn hàng (ví dụ: HN-20261104-1234)"
                    : "Nhập số điện thoại đặt hàng (ví dụ: 0912345678)"
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button
                type="submit"
                isDisabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Tra cứu</span>
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 dark:text-rose-300">{errorMsg}</p>
            </div>
          )}

          {/* Results List */}
          {hasSearched && !isLoading && results.length === 0 && !errorMsg && (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">Không tìm thấy đơn hàng nào</p>
              <p className="text-xs max-w-sm mx-auto">
                Vui lòng kiểm tra lại thông tin mã đơn hàng hoặc số điện thoại bạn đã sử dụng khi đặt hàng.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tìm thấy {results.length} đơn hàng
              </p>

              {results.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4"
                >
                  {/* Order Card Top */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                    <div>
                      <span className="text-xs text-slate-400">Mã đơn hàng:</span>
                      <h3 className="font-mono font-bold text-slate-900 dark:text-white text-base">
                        {order.orderNumber}
                      </h3>
                    </div>
                    {getStatusBadge(order.orderStatus)}
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{order.customerName} ({order.customerPhone})</span>
                    </div>
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{order.shippingAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      {order.paymentMethod === "COD" ? (
                        <>
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Thanh toán khi nhận hàng (COD)</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 text-sky-600" />
                          <span>Chuyển khoản ngân hàng ({order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"})</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-8 h-8 rounded object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <span className="truncate text-slate-800 dark:text-slate-200">
                            {item.productName} <span className="text-slate-400">x{item.quantity}</span>
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white shrink-0 ml-2">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total & Summary */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex justify-between items-center text-sm">
                    {order.discountAmount > 0 ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        Đã giảm {formatPrice(order.discountAmount)} ({order.couponCode})
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Miễn phí giao hàng</span>
                    )}
                    <div className="text-right">
                      <span className="text-xs text-slate-500 mr-2">Tổng tiền:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
