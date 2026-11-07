import React, { useState, useEffect, useCallback } from "react";
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
  XCircle,
  UserCheck,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";
import {
  cancelOrder,
  getMyOrders,
  getOrderByNumber,
  lookupOrdersByPhone,
} from "@/services/api";
import { OrderResponse, OrderStatus } from "@/types";

const LIFECYCLE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "CONFIRMED", label: "Đã xác nhận" },
  { status: "PROCESSING", label: "Đang đóng gói" },
  { status: "SHIPPED", label: "Đang giao" },
  { status: "DELIVERED", label: "Hoàn tất" },
];

const QUICK_CANCEL_REASONS = [
  "Đặt nhầm sản phẩm / số lượng",
  "Muốn thay đổi địa chỉ hoặc SĐT nhận hàng",
  "Muốn áp dụng mã giảm giá khác",
  "Tìm thấy sản phẩm khác phù hợp hơn",
];

export const OrderLookupModal: React.FC = () => {
  const { isLookupOpen, setIsLookupOpen, currentUser, showToast } = useShop();

  const [lookupType, setLookupType] = useState<"my" | "number" | "phone">(
    currentUser ? "my" : "number",
  );
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<OrderResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Cancel order inline dialog state
  const [cancellingOrderNumber, setCancellingOrderNumber] = useState<
    string | null
  >(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelPhone, setCancelPhone] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadMyOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const orders = await getMyOrders();
      setResults(orders);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Không thể tải lịch sử đơn hàng của bạn.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLookupOpen) {
      if (currentUser) {
        setLookupType("my");
        loadMyOrders();
      } else {
        setLookupType((prev) => (prev === "my" ? "number" : prev));
      }
    }
  }, [isLookupOpen, currentUser, loadMyOrders]);

  if (!isLookupOpen) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
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

  const getStepIndex = (status: OrderStatus): number => {
    return LIFECYCLE_STEPS.findIndex((s) => s.status === status);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setHasSearched(true);
    setResults([]);
    setCancellingOrderNumber(null);

    try {
      if (lookupType === "number") {
        const order = await getOrderByNumber(searchValue.trim());
        setResults([order]);
      } else if (lookupType === "phone") {
        const orders = await lookupOrdersByPhone(searchValue.trim());
        setResults(orders);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(
          "Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại thông tin nhập.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openCancelDialog = (order: OrderResponse) => {
    setCancellingOrderNumber(order.orderNumber);
    setCancelReason("");
    setCancelPhone(
      lookupType === "phone" && searchValue.trim() ? searchValue.trim() : "",
    );
    setCancelError(null);
  };

  const handleConfirmCancel = async (order: OrderResponse) => {
    if (!cancelReason.trim()) {
      setCancelError("Vui lòng nhập hoặc chọn lý do hủy đơn hàng.");
      return;
    }

    const isOwnerAuthenticated =
      Boolean(currentUser) && order.userId === currentUser?.id;

    if (!isOwnerAuthenticated && !cancelPhone.trim()) {
      setCancelError(
        "Vui lòng nhập số điện thoại đặt hàng để xác thực quyền hủy đơn.",
      );
      return;
    }

    setIsCancelling(true);
    setCancelError(null);

    try {
      const updated = await cancelOrder(order.orderNumber, {
        reason: cancelReason.trim(),
        phone: cancelPhone.trim() || undefined,
      });

      setResults((prev) =>
        prev.map((item) =>
          item.orderNumber === updated.orderNumber ? updated : item,
        ),
      );
      setCancellingOrderNumber(null);
      window.dispatchEvent(new Event("homenest:vouchers-updated"));
      showToast(
        "Đã hủy đơn hàng",
        updated.couponCode
          ? `Đơn hàng ${updated.orderNumber} đã hủy. Mã voucher ${updated.couponCode} đã được hoàn lại vào Kho Voucher!`
          : `Đơn hàng ${updated.orderNumber} đã được hủy và hoàn lại kho.`,
        "info",
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCancelError(err.message);
      } else {
        setCancelError("Không thể hủy đơn hàng. Vui lòng thử lại.");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        role="presentation"
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
                Quản Lý & Tra Cứu Đơn Hàng
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theo dõi tiến độ giao hàng hoặc yêu cầu hủy đơn khi chờ xử lý
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
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    setLookupType("my");
                    setCancellingOrderNumber(null);
                    loadMyOrders();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    lookupType === "my"
                      ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Đơn hàng của tôi</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setLookupType("number");
                  setSearchValue("");
                  setResults([]);
                  setHasSearched(false);
                  setErrorMsg(null);
                  setCancellingOrderNumber(null);
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
                  setCancellingOrderNumber(null);
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

            {lookupType !== "my" && (
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type={lookupType === "phone" ? "tel" : "text"}
                  required
                  placeholder={
                    lookupType === "number"
                      ? "Nhập mã đơn hàng (ví dụ: HN-20261106-1234)"
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
              </form>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </p>
            </div>
          )}

          {/* Loading State for My Orders */}
          {isLoading && lookupType === "my" && (
            <div className="flex items-center justify-center py-10 gap-2 text-sm text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Đang tải đơn hàng của bạn...</span>
            </div>
          )}

          {/* Empty Results */}
          {hasSearched && !isLoading && results.length === 0 && !errorMsg && (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">
                {lookupType === "my"
                  ? "Bạn chưa có đơn hàng nào gắn với tài khoản"
                  : "Không tìm thấy đơn hàng nào"}
              </p>
              <p className="text-xs max-w-sm mx-auto">
                {lookupType === "my"
                  ? "Khi đặt hàng trong lúc đăng nhập, mọi đơn hàng sẽ tự động lưu tại đây."
                  : "Vui lòng kiểm tra lại thông tin mã đơn hàng hoặc số điện thoại bạn đã sử dụng khi đặt hàng."}
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tìm thấy {results.length} đơn hàng
              </p>

              {results.map((order) => {
                const currentStepIdx = getStepIndex(order.orderStatus);
                const isOwnerAuthenticated =
                  Boolean(currentUser) && order.userId === currentUser?.id;
                const isCancelFormOpen =
                  cancellingOrderNumber === order.orderNumber;

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4"
                  >
                    {/* Order Card Top */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                      <div>
                        <span className="text-xs text-slate-400">
                          Mã đơn hàng:
                        </span>
                        <h3 className="font-mono font-bold text-slate-900 dark:text-white text-base">
                          {order.orderNumber}
                        </h3>
                      </div>
                      {getStatusBadge(order.orderStatus)}
                    </div>

                    {/* Lifecycle Progress Stepper or Cancelled Notice */}
                    {order.orderStatus === "CANCELLED" ? (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 text-xs space-y-1">
                        <div className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>
                            Đơn hàng đã bị hủy
                            {order.cancelledBy === "ADMIN"
                              ? " bởi Quản trị viên"
                              : " theo yêu cầu khách hàng"}
                          </span>
                        </div>
                        {order.cancelReason && (
                          <p className="text-rose-600 dark:text-rose-400">
                            Lý do: {order.cancelReason}
                          </p>
                        )}
                        {order.cancelledAt && (
                          <p className="text-[11px] text-rose-500">
                            Thời gian hủy: {formatDate(order.cancelledAt)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {LIFECYCLE_STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStepIdx;
                          return (
                            <div
                              key={step.status}
                              className="flex flex-col items-center text-center gap-1"
                            >
                              <div
                                className={`w-full h-1.5 rounded-full transition-colors ${
                                  isCompleted
                                    ? "bg-emerald-500"
                                    : "bg-slate-200 dark:bg-slate-700"
                                }`}
                              />
                              <span
                                className={`text-[11px] font-medium ${
                                  isCompleted
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>
                          {order.customerName} ({order.customerPhone})
                        </span>
                      </div>
                      <div className="flex items-start gap-2 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{order.shippingAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        {order.paymentMethod === "COD" ? (
                          <>
                            <Banknote className="w-4 h-4 text-emerald-600" />
                            <span>
                              Thanh toán khi nhận hàng (COD) —{" "}
                              {order.paymentStatus === "PAID"
                                ? "Đã thanh toán"
                                : "Chưa thanh toán"}
                            </span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 text-sky-600" />
                            <span>
                              Chuyển khoản ngân hàng (
                              {order.paymentStatus === "PAID"
                                ? "Đã thanh toán"
                                : order.paymentStatus === "REFUNDED"
                                  ? "Đã hoàn tiền"
                                  : "Chờ thanh toán"}
                              )
                            </span>
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
                              {item.productName}{" "}
                              <span className="text-slate-400">
                                x{item.quantity}
                              </span>
                            </span>
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white shrink-0 ml-2">
                            {formatPrice(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total & Action Bar */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap justify-between items-center gap-2 text-sm">
                      <div>
                        {order.discountAmount > 0 ? (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            Đã giảm {formatPrice(order.discountAmount)} (
                            {order.couponCode})
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Miễn phí giao hàng
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-xs text-slate-500 mr-1.5">
                            Tổng tiền:
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>

                        {order.orderStatus === "CONFIRMED" &&
                          !isCancelFormOpen && (
                            <button
                              type="button"
                              onClick={() => openCancelDialog(order)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            >
                              Hủy đơn hàng
                            </button>
                          )}
                      </div>
                    </div>

                    {/* Inline Cancel Order Form */}
                    {isCancelFormOpen && (
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Xác nhận hủy đơn hàng {order.orderNumber}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setCancellingOrderNumber(null)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            Đóng
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_CANCEL_REASONS.map((reasonOption) => (
                            <button
                              key={reasonOption}
                              type="button"
                              onClick={() => setCancelReason(reasonOption)}
                              className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                                cancelReason === reasonOption
                                  ? "bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-700 dark:text-rose-300 font-semibold"
                                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                              }`}
                            >
                              {reasonOption}
                            </button>
                          ))}
                        </div>

                        <input
                          type="text"
                          placeholder="Nhập lý do hủy đơn hàng (bắt buộc)..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />

                        {!isOwnerAuthenticated && (
                          <input
                            type="tel"
                            placeholder="Nhập số điện thoại đặt hàng để xác thực..."
                            value={cancelPhone}
                            onChange={(e) => setCancelPhone(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        )}

                        {cancelError && (
                          <p className="text-xs text-rose-600 dark:text-rose-400">
                            {cancelError}
                          </p>
                        )}

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setCancellingOrderNumber(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Giữ lại đơn
                          </button>
                          <button
                            type="button"
                            disabled={isCancelling}
                            onClick={() => handleConfirmCancel(order)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            {isCancelling && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            )}
                            <span>Xác nhận hủy đơn</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
