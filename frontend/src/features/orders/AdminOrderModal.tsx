import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import {
  X,
  Search,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Loader2,
  ArrowRight,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  Package,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";
import { getAdminOrders, updateOrderStatusAdmin } from "@/services/api";
import { OrderResponse, OrderStatus } from "@/types";

const STATUS_FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: "Tất cả", value: undefined },
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Đang đóng gói", value: "PROCESSING" },
  { label: "Đang giao", value: "SHIPPED" },
  { label: "Đã giao", value: "DELIVERED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export const AdminOrderModal: React.FC = () => {
  const {
    isAdminOrdersOpen,
    setIsAdminOrdersOpen,
    currentUser,
    showToast,
  } = useShop();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(
    undefined,
  );
  const [searchInput, setSearchInput] = useState("");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingOrderNumber, setUpdatingOrderNumber] = useState<string | null>(
    null,
  );
  const [cancellingOrderNumber, setCancellingOrderNumber] = useState<
    string | null
  >(null);
  const [adminCancelReason, setAdminCancelReason] = useState("");

  const fetchOrders = useCallback(
    async (statusFilter?: OrderStatus, searchKeyword?: string) => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const pageRes = await getAdminOrders({
          status: statusFilter,
          search: searchKeyword,
          page: 0,
          size: 50,
        });
        setOrders(pageRes.content);
        setTotalElements(pageRes.totalElements);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("Không thể tải danh sách đơn hàng quản trị.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (isAdminOrdersOpen && currentUser?.role === "ROLE_ADMIN") {
      fetchOrders(selectedStatus, searchInput);
    }
  }, [isAdminOrdersOpen, currentUser, selectedStatus, fetchOrders]);

  if (!isAdminOrdersOpen) return null;

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dateStr));
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
            CONFIRMED (Đã xác nhận)
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
            <Clock className="w-3 h-3" />
            PROCESSING (Đang đóng gói)
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
            <Truck className="w-3 h-3" />
            SHIPPED (Đang giao)
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300">
            <CheckCircle2 className="w-3 h-3" />
            DELIVERED (Đã giao)
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
            <AlertCircle className="w-3 h-3" />
            CANCELLED (Đã hủy)
          </span>
        );
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  const getNextStatusAction = (
    status: OrderStatus,
  ): { next: OrderStatus; label: string } | null => {
    switch (status) {
      case "CONFIRMED":
        return {
          next: "PROCESSING",
          label: "Xác nhận & Đóng gói (PROCESSING)",
        };
      case "PROCESSING":
        return { next: "SHIPPED", label: "Bàn giao Vận chuyển (SHIPPED)" };
      case "SHIPPED":
        return { next: "DELIVERED", label: "Xác nhận Đã giao (DELIVERED)" };
      default:
        return null;
    }
  };

  const handleAdvanceStatus = async (
    orderNumber: string,
    targetStatus: OrderStatus,
  ) => {
    setUpdatingOrderNumber(orderNumber);
    try {
      const updated = await updateOrderStatusAdmin(orderNumber, {
        status: targetStatus,
      });
      setOrders((prev) =>
        prev.map((o) => (o.orderNumber === orderNumber ? updated : o)),
      );
      showToast(
        "Cập nhật trạng thái thành công",
        `Đơn hàng ${orderNumber} → ${targetStatus}`,
        "success",
      );
    } catch (err: unknown) {
      showToast(
        "Lỗi cập nhật trạng thái",
        err instanceof Error ? err.message : "Vui lòng thử lại",
        "warning",
      );
    } finally {
      setUpdatingOrderNumber(null);
    }
  };

  const handleAdminCancelOrder = async (orderNumber: string) => {
    if (!adminCancelReason.trim()) {
      showToast("Thiếu lý do hủy", "Vui lòng nhập lý do hủy đơn hàng", "warning");
      return;
    }

    setUpdatingOrderNumber(orderNumber);
    try {
      const updated = await updateOrderStatusAdmin(orderNumber, {
        status: "CANCELLED",
        reason: adminCancelReason.trim(),
      });
      setOrders((prev) =>
        prev.map((o) => (o.orderNumber === orderNumber ? updated : o)),
      );
      setCancellingOrderNumber(null);
      setAdminCancelReason("");
      showToast(
        "Đã hủy đơn & hoàn kho",
        `Đơn ${orderNumber} đã chuyển sang CANCELLED và cộng lại tồn kho.`,
        "info",
      );
    } catch (err: unknown) {
      showToast(
        "Không thể hủy đơn",
        err instanceof Error ? err.message : "Vui lòng thử lại",
        "warning",
      );
    } finally {
      setUpdatingOrderNumber(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(selectedStatus, searchInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        role="presentation"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsAdminOrdersOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden my-8 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Quản Trị Vòng Đời Đơn Hàng (Admin)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tổng số: {totalElements} đơn hàng • Điều phối trạng thái & hoàn
                kho tự động
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchOrders(selectedStatus, searchInput)}
              className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Làm mới danh sách"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              aria-label="Đóng bảng quản trị"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsAdminOrdersOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => {
              const active = selectedStatus === f.value;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setSelectedStatus(f.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn (HN-...), tên khách hàng, hoặc số điện thoại..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Button
              type="submit"
              isDisabled={isLoading}
              className="bg-slate-900 dark:bg-emerald-600 text-white text-xs font-semibold px-4 rounded-xl cursor-pointer"
            >
              Lọc đơn
            </Button>
          </form>
        </div>

        {/* Orders List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-14 gap-2 text-sm text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Đang tải danh sách đơn hàng...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">
                Không có đơn hàng nào khớp bộ lọc
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const nextAction = getNextStatusAction(order.orderStatus);
              const canAdminCancel =
                order.orderStatus === "CONFIRMED" ||
                order.orderStatus === "PROCESSING";
              const isBusy = updatingOrderNumber === order.orderNumber;
              const isCancelOpen = cancellingOrderNumber === order.orderNumber;

              return (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/70 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {order.userId ? `User #${order.userId}` : "Khách vãng lai"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : order.paymentStatus === "REFUNDED"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </div>
                    {getStatusBadge(order.orderStatus)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {order.customerName} ({order.customerPhone})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{order.shippingAddress}</span>
                    </div>
                  </div>

                  {/* Items compact */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.productName}
                        </span>
                        <span className="text-emerald-600 font-bold">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.orderStatus === "CANCELLED" && order.cancelReason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>
                        Đã hủy bởi <strong>{order.cancelledBy}</strong>:{" "}
                        {order.cancelReason}
                      </span>
                    </div>
                  )}

                  {/* Bottom bar: Total + Lifecycle Controls */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-slate-500 mr-1.5">
                        Tổng thanh toán:
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {canAdminCancel && !isCancelOpen && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            setCancellingOrderNumber(order.orderNumber);
                            setAdminCancelReason("");
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Hủy đơn & Hoàn kho
                        </button>
                      )}

                      {nextAction && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            handleAdvanceStatus(
                              order.orderNumber,
                              nextAction.next,
                            )
                          }
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                          <span>{nextAction.label}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Admin Cancel Reason Input */}
                  {isCancelOpen && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Nhập lý do hủy đơn (ví dụ: Khách gọi báo hủy / Hết hàng)..."
                        value={adminCancelReason}
                        onChange={(e) => setAdminCancelReason(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setCancellingOrderNumber(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Đóng
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            handleAdminCancelOrder(order.orderNumber)
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-50"
                        >
                          Xác nhận hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

