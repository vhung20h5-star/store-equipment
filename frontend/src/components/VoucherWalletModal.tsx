import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import {
  X,
  Ticket,
  Crown,
  Check,
  Copy,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Zap,
  Clock,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";
import {
  fetchMyVouchers,
  fetchVipStatus,
  subscribeVipApi,
} from "@/services/api";
import { VipStatusResponse, VoucherItem } from "@/types";

export const VoucherWalletModal: React.FC = () => {
  const {
    isVoucherWalletOpen,
    setIsVoucherWalletOpen,
    currentUser,
    refreshCurrentUser,
    setIsAuthOpen,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<"wallet" | "vip">("wallet");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "AVAILABLE" | "USED" | "EXPIRED"
  >("ALL");
  const [myVouchers, setMyVouchers] = useState<VoucherItem[]>([]);
  const [vipStatus, setVipStatus] = useState<VipStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isVoucherWalletOpen) return;
    setIsLoading(true);
    try {
      const vipData = await fetchVipStatus();
      setVipStatus(vipData);

      if (currentUser) {
        const walletData = await fetchMyVouchers();
        setMyVouchers(walletData);
      } else {
        setMyVouchers([]);
      }
    } catch {
      // Ignore if unauthenticated
    } finally {
      setIsLoading(false);
    }
  }, [isVoucherWalletOpen, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isVoucherWalletOpen) return null;

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(
      "Đã sao chép mã!",
      `Bạn có thể áp dụng mã ${code} khi thanh toán.`,
      "success",
    );
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubscribe = async (planId: string) => {
    if (!currentUser) {
      setIsVoucherWalletOpen(false);
      setIsAuthOpen(true);
      return;
    }

    setSubscribingPlan(planId);
    try {
      const updated = await subscribeVipApi(planId, "QR_INSTANT");
      setVipStatus(updated);
      await refreshCurrentUser();
      await loadData();
      window.dispatchEvent(new Event("homenest:vouchers-updated"));
      showToast(
        "Nâng cấp Hội viên VIP thành công!",
        `Đã kích hoạt gói ${planId === "YEARLY" ? "VIP Năm (-8%)" : "VIP Tháng (-5%)"} và tặng bộ Voucher VIP vào kho!`,
        "success",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể đăng ký gói VIP.";
      showToast("Lỗi đăng ký", msg, "warning");
    } finally {
      setSubscribingPlan(null);
    }
  };

  const filteredVouchers = myVouchers.filter((v) => {
    if (statusFilter === "ALL") return true;
    return (v.userVoucherStatus || "AVAILABLE") === statusFilter;
  });

  const isUserVip = Boolean(currentUser?.vipActive || vipStatus?.active);
  const currentVipTier = vipStatus?.tier || currentUser?.vipTier || "NONE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        role="presentation"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsVoucherWalletOpen(false)}
      />

      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Kho Voucher & Thẻ Hội Viên VIP</span>
                {isUserVip && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                    <Crown className="w-3 h-3" />
                    {currentVipTier === "VIP_YEARLY" ? "VIP NĂM" : "VIP THÁNG"}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quản lý các mã giảm giá đã lưu và đặc quyền mua sắm VIP của bạn
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Đóng Kho Voucher"
            onClick={() => setIsVoucherWalletOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab("wallet")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "wallet"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Kho Voucher Đã Lưu ({myVouchers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vip")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "vip"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Gói Hội Viên VIP (Tháng / Năm)</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!currentUser ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Đăng nhập để mở Kho Voucher cá nhân
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Lưu trữ các mã giảm sâu ngày đôi 10/10, 11/11, Lễ Tết và kích
                hoạt đặc quyền VIP giảm thêm đến 8% trên mọi đơn hàng.
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer"
                onPress={() => {
                  setIsVoucherWalletOpen(false);
                  setIsAuthOpen(true);
                }}
              >
                Đăng nhập / Đăng ký ngay
              </Button>
            </div>
          ) : activeTab === "wallet" ? (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(
                    [
                      { id: "ALL", label: "Tất cả" },
                      { id: "AVAILABLE", label: "Còn hiệu lực" },
                      { id: "USED", label: "Đã sử dụng" },
                      { id: "EXPIRED", label: "Hết hạn" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setStatusFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        statusFilter === f.id
                          ? "bg-slate-900 dark:bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                  onPress={() => {
                    setIsVoucherWalletOpen(false);
                    const el = document.getElementById("promotions");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  + Săn thêm mã sự kiện 10/10 • 11/11
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredVouchers.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                  <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Chưa có mã voucher nào trong mục này
                  </p>
                  <p className="text-xs text-slate-500">
                    Hãy ghé Trạm Săn Voucher trên trang chủ để lưu ngay các mã
                    giảm sâu!
                  </p>
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white font-semibold px-5 py-2 rounded-xl cursor-pointer"
                    onPress={() => {
                      setIsVoucherWalletOpen(false);
                      const el = document.getElementById("promotions");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Đến Trạm Săn Voucher
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVouchers.map((v) => {
                    const status = v.userVoucherStatus || "AVAILABLE";
                    const isAvailable = status === "AVAILABLE";
                    return (
                      <div
                        key={v.id}
                        className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                          isAvailable
                            ? "bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800/60 shadow-2xs"
                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-75"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              {v.eventTag || v.campaignType}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                status === "AVAILABLE"
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : status === "USED"
                                    ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                    : "bg-rose-100 text-rose-600"
                              }`}
                            >
                              {status === "AVAILABLE"
                                ? "Sẵn sàng sử dụng"
                                : status === "USED"
                                  ? `Đã dùng (${v.orderNumber || ""})`
                                  : "Hết hạn"}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                              -{v.discountPercent}%
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                              {v.title}
                            </h4>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Đơn tối thiểu: {formatPrice(v.minOrderAmount)}
                            {v.maxDiscountAmount
                              ? ` • Giảm tối đa ${formatPrice(v.maxDiscountAmount)}`
                              : ""}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-extrabold px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                              {v.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(v.code)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 cursor-pointer"
                              title="Sao chép mã"
                            >
                              {copiedCode === v.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {isAvailable && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                              onPress={() => {
                                setIsVoucherWalletOpen(false);
                                const el = document.getElementById("products");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Dùng mua sắm</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: VIP Membership Status & Plans */
            <div className="space-y-6">
              {/* Current VIP Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isUserVip
                    ? "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-emerald-500/10 border-amber-400/50"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isUserVip
                        ? "bg-amber-400 text-slate-950 shadow-md"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {isUserVip
                        ? currentVipTier === "VIP_YEARLY"
                          ? "Hội Viên VIP Năm (Gold) Đang Hoạt Động"
                          : "Hội Viên VIP Tháng Đang Hoạt Động"
                        : "Bạn chưa kích hoạt Gói Hội Viên VIP"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isUserVip && vipStatus?.expiresAt
                        ? `Giảm tự động thêm ${vipStatus.directDiscountPercent}% mọi đơn hàng • Hết hạn: ${new Date(
                            vipStatus.expiresAt,
                          ).toLocaleDateString("vi-VN")}`
                        : "Nâng cấp ngay để được giảm trực tiếp thêm 5% - 8% trên mọi đơn hàng và mở khóa Kho Voucher VIP!"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plans Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(vipStatus?.plans || []).map((plan) => {
                  const isYearly = plan.id === "YEARLY";
                  return (
                    <div
                      key={plan.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                        isYearly
                          ? "border-amber-400 bg-amber-50/30 dark:bg-amber-950/20"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isYearly
                                ? "bg-amber-400 text-slate-950"
                                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            }`}
                          >
                            {plan.badge}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(plan.originalPrice)}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between">
                          <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                            {plan.name}
                          </h4>
                          <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                            {formatPrice(plan.price)}
                            <span className="text-xs font-normal text-slate-500">
                              /{plan.durationDays} ngày
                            </span>
                          </span>
                        </div>

                        <ul className="space-y-2 pt-2">
                          {plan.benefits.map((b, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        isDisabled={subscribingPlan === plan.id}
                        onPress={() => handleSubscribe(plan.id)}
                        className={`w-full font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                          isYearly
                            ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>
                          {subscribingPlan === plan.id
                            ? "Đang kích hoạt..."
                            : isUserVip
                              ? `Gia hạn thêm ${plan.name}`
                              : `Đăng ký ${plan.name}`}
                        </span>
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Subscription History */}
              {vipStatus?.subscriptions &&
                vipStatus.subscriptions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Lịch sử đăng ký Gói VIP</span>
                    </h4>
                    <div className="space-y-2">
                      {vipStatus.subscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              Gói{" "}
                              {sub.planType === "YEARLY"
                                ? "VIP Năm (-8%)"
                                : "VIP Tháng (-5%)"}
                            </span>
                            <span className="text-slate-400 ml-2">
                              • Đăng ký ngày{" "}
                              {new Date(sub.startedAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {formatPrice(sub.pricePaid)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

