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
  CreditCard,
  Plus,
  Trash2,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  AlertCircle,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";
import {
  addBankCardApi,
  deleteBankCardApi,
  fetchMyBankCards,
  fetchMyCardTransactions,
  fetchMyVouchers,
  fetchVipStatus,
  setDefaultBankCardApi,
  subscribeVipApi,
  topUpBankCardApi,
} from "@/services/api";
import {
  BankCardItem,
  CardTransactionItem,
  VipPlan,
  VipStatusResponse,
  VoucherItem,
} from "@/types";

const POPULAR_BANKS = [
  "Vietcombank",
  "Techcombank",
  "MB Bank",
  "VPBank",
  "ACB",
  "BIDV",
  "VietinBank",
  "TPBank",
];

export const VoucherWalletModal: React.FC = () => {
  const {
    isVoucherWalletOpen,
    setIsVoucherWalletOpen,
    currentUser,
    refreshCurrentUser,
    setIsAuthOpen,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<"wallet" | "vip" | "cards">(
    "wallet",
  );
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "AVAILABLE" | "USED" | "EXPIRED"
  >("ALL");
  const [myVouchers, setMyVouchers] = useState<VoucherItem[]>([]);
  const [vipStatus, setVipStatus] = useState<VipStatusResponse | null>(null);
  const [bankCards, setBankCards] = useState<BankCardItem[]>([]);
  const [cardTransactions, setCardTransactions] = useState<
    CardTransactionItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // VIP mandatory bank card payment states
  const [selectedVipPlan, setSelectedVipPlan] = useState<VipPlan | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [vipCvv, setVipCvv] = useState("");
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);
  const [vipError, setVipError] = useState<string | null>(null);

  // Add new bank card form states
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [bankName, setBankName] = useState("Vietcombank");
  const [cardBrand, setCardBrand] = useState<"VISA" | "MASTERCARD" | "NAPAS">(
    "VISA",
  );
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("12/29");
  const [newCardCvv, setNewCardCvv] = useState("");
  const [initialBalance, setInitialBalance] = useState("5000000");
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [toppingUpCardId, setToppingUpCardId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!isVoucherWalletOpen) return;
    setIsLoading(true);
    try {
      const vipData = await fetchVipStatus();
      setVipStatus(vipData);

      if (currentUser) {
        const [walletData, cardsData, txData] = await Promise.all([
          fetchMyVouchers(),
          fetchMyBankCards().catch(() => [] as BankCardItem[]),
          fetchMyCardTransactions().catch(() => [] as CardTransactionItem[]),
        ]);
        setMyVouchers(walletData);
        setBankCards(cardsData);
        setCardTransactions(txData);

        if (cardsData.length > 0) {
          const def = cardsData.find((c) => c.isDefault) || cardsData[0];
          setSelectedCardId((prev) =>
            prev && cardsData.some((c) => c.id === prev) ? prev : def.id,
          );
        } else {
          setSelectedCardId(null);
        }
      } else {
        setMyVouchers([]);
        setBankCards([]);
        setCardTransactions([]);
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

  useEffect(() => {
    if (currentUser?.fullName && !cardHolderName) {
      setCardHolderName(
        currentUser.fullName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toUpperCase(),
      );
    }
  }, [currentUser, cardHolderName]);

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

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsVoucherWalletOpen(false);
      setIsAuthOpen(true);
      return;
    }

    setIsAddingCard(true);
    try {
      const created = await addBankCardApi({
        bankName,
        cardBrand,
        cardNumber: cardNumber.replace(/\s+/g, ""),
        cardHolderName: cardHolderName.trim().toUpperCase(),
        expiryDate: expiryDate.trim(),
        cvv: newCardCvv.trim(),
        initialBalance: Math.max(0, Number(initialBalance) || 0),
        setAsDefault: true,
      });

      await loadData();
      setSelectedCardId(created.id);
      setVipCvv(newCardCvv.trim());
      setCardNumber("");
      setNewCardCvv("");
      setShowAddCardForm(false);
      window.dispatchEvent(new Event("homenest:cards-updated"));
      showToast(
        "Liên kết thẻ thành công!",
        `Đã thêm thẻ ${created.bankName} (${created.cardNumberMasked}) với số dư ${formatPrice(created.balance)}.`,
        "success",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể liên kết thẻ ngân hàng.";
      showToast("Lỗi thêm thẻ", msg, "warning");
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleTopUp = async (cardId: number, amount: number) => {
    setToppingUpCardId(cardId);
    try {
      const updated = await topUpBankCardApi(cardId, amount);
      await loadData();
      window.dispatchEvent(new Event("homenest:cards-updated"));
      showToast(
        "Nạp tiền vào thẻ thành công!",
        `Số dư hiện tại của thẻ ${updated.cardNumberMasked}: ${formatPrice(updated.balance)}`,
        "success",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể nạp tiền.";
      showToast("Lỗi nạp tiền", msg, "warning");
    } finally {
      setToppingUpCardId(null);
    }
  };

  const handleSetDefaultCard = async (cardId: number) => {
    try {
      await setDefaultBankCardApi(cardId);
      await loadData();
      window.dispatchEvent(new Event("homenest:cards-updated"));
      showToast(
        "Đã đặt thẻ mặc định",
        "Thẻ này sẽ được ưu tiên khi thanh toán VIP và đơn hàng.",
        "success",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể đổi thẻ mặc định.";
      showToast("Lỗi", msg, "warning");
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    try {
      await deleteBankCardApi(cardId);
      await loadData();
      window.dispatchEvent(new Event("homenest:cards-updated"));
      showToast("Đã hủy liên kết thẻ", "Thẻ ngân hàng đã được xóa.", "info");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể xóa thẻ.";
      showToast("Lỗi", msg, "warning");
    }
  };

  const handleConfirmVipPayment = async () => {
    if (!selectedVipPlan) return;
    if (!currentUser) {
      setIsVoucherWalletOpen(false);
      setIsAuthOpen(true);
      return;
    }

    setVipError(null);
    if (!selectedCardId) {
      setVipError(
        "Bắt buộc phải chọn thẻ ngân hàng để thanh toán gói Hội viên VIP.",
      );
      return;
    }
    if (!vipCvv.trim()) {
      setVipError("Vui lòng nhập mã bảo mật CVV của thẻ để xác nhận thanh toán.");
      return;
    }

    setSubscribingPlan(selectedVipPlan.id);
    try {
      const updated = await subscribeVipApi(
        selectedVipPlan.id,
        selectedCardId,
        vipCvv.trim(),
      );
      setVipStatus(updated);
      setSelectedVipPlan(null);
      setVipCvv("");
      await refreshCurrentUser();
      await loadData();
      window.dispatchEvent(new Event("homenest:vouchers-updated"));
      window.dispatchEvent(new Event("homenest:cards-updated"));
      showToast(
        "Thanh toán & Nâng cấp VIP thành công!",
        `Đã trừ ${formatPrice(selectedVipPlan.price)} từ thẻ ngân hàng và kích hoạt ${selectedVipPlan.name}!`,
        "success",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể thanh toán gói VIP. Vui lòng kiểm tra số dư và mã CVV.";
      setVipError(msg);
      showToast("Thanh toán thất bại", msg, "warning");
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
  const selectedCardObj =
    bankCards.find((c) => c.id === selectedCardId) || null;

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
                <span>Kho Voucher, Thẻ Ngân Hàng & VIP</span>
                {isUserVip && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                    <Crown className="w-3 h-3" />
                    {currentVipTier === "VIP_YEARLY" ? "VIP NĂM" : "VIP THÁNG"}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quản lý voucher đã lưu, thẻ ngân hàng liên kết và gói Hội viên
                VIP trả phí
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
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab("wallet")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
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
            onClick={() => setActiveTab("cards")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "cards"
                ? "border-sky-600 text-sky-600 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <CreditCard className="w-4 h-4 text-sky-500" />
            <span>Ví & Thẻ Ngân Hàng ({bankCards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vip")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
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
                Đăng nhập để mở Kho Voucher & Ví Thẻ Ngân Hàng
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Liên kết thẻ ngân hàng, lưu các mã giảm sâu 10/10, 11/11, Lễ Tết
                và đăng ký gói VIP giảm thêm đến 8% trên mọi đơn hàng.
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
            /* Tab 1: Voucher Wallet */
            <div className="space-y-4">
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
                                if (el)
                                  el.scrollIntoView({ behavior: "smooth" });
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
          ) : activeTab === "cards" ? (
            /* Tab 2: Bank Cards & Balance Management */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Thẻ Ngân Hàng Liên Kết & Thanh Toán Bảo Mật
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Dùng để thanh toán bắt buộc khi kích hoạt Gói Hội Viên VIP
                      hoặc thanh toán trực tiếp đơn hàng
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onPress={() => setShowAddCardForm((prev) => !prev)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {showAddCardForm ? "Đóng biểu mẫu" : "Thêm thẻ ngân hàng"}
                  </span>
                </Button>
              </div>

              {/* Add Bank Card Form */}
              {showAddCardForm && (
                <form
                  onSubmit={handleAddCard}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-sky-600" />
                      <span>Liên Kết Thẻ Ngân Hàng Mới</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Mã hóa chuẩn PCI-DSS mô phỏng
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Ngân hàng phát hành
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        {POPULAR_BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Loại thẻ
                      </label>
                      <select
                        value={cardBrand}
                        onChange={(e) =>
                          setCardBrand(
                            e.target.value as "VISA" | "MASTERCARD" | "NAPAS",
                          )
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="VISA">VISA Quốc Tế</option>
                        <option value="MASTERCARD">Mastercard</option>
                        <option value="NAPAS">NAPAS Nội Địa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Số dư nạp ban đầu (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Số thẻ (12 - 19 chữ số)
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 4111 2222 3333 8899"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tên in trên thẻ (Không dấu)
                      </label>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        value={cardHolderName}
                        onChange={(e) =>
                          setCardHolderName(e.target.value.toUpperCase())
                        }
                        className="w-full px-3 py-2 text-xs uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hạn thẻ (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="12/29"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mã bảo mật CVV
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="VD: 686"
                        value={newCardCvv}
                        onChange={(e) => setNewCardCvv(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <div className="col-span-2 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onPress={() => setShowAddCardForm(false)}
                        className="text-xs font-semibold text-slate-500 cursor-pointer"
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        isDisabled={isAddingCard}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2 rounded-xl cursor-pointer"
                      >
                        {isAddingCard
                          ? "Đang liên kết..."
                          : "Xác nhận liên kết thẻ"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Saved Cards List */}
              {bankCards.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                  <CreditCard className="w-9 h-9 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Bạn chưa liên kết thẻ ngân hàng nào
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Thêm thẻ ngân hàng để có thể thanh toán kích hoạt Gói Hội
                    Viên VIP (Tháng / Năm) hoặc thanh toán nhanh đơn hàng.
                  </p>
                  {!showAddCardForm && (
                    <Button
                      size="sm"
                      onPress={() => setShowAddCardForm(true)}
                      className="bg-sky-600 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                    >
                      + Liên kết thẻ ngân hàng ngay
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bankCards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white border border-slate-700 shadow-lg flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold tracking-wide text-white">
                              {card.bankName}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-black uppercase tracking-wider text-sky-300">
                              {card.cardBrand}
                            </span>
                          </div>
                          {card.isDefault ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                              <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                              Mặc định
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultCard(card.id)}
                              className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
                            >
                              Đặt mặc định
                            </button>
                          )}
                        </div>

                        <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-slate-100">
                          {card.cardNumberMasked}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <div>
                            <span className="text-[10px] uppercase text-slate-400 block">
                              Chủ thẻ
                            </span>
                            <span className="font-bold uppercase">
                              {card.cardHolderName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-slate-400 block">
                              Hết hạn
                            </span>
                            <span className="font-mono font-bold">
                              {card.expiryDate}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase text-slate-400 block">
                              Số dư khả dụng
                            </span>
                            <span className="text-sm font-black text-emerald-400">
                              {formatPrice(card.balance)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-300 mr-1">
                            Nạp nhanh:
                          </span>
                          {[500000, 2000000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              disabled={toppingUpCardId === card.id}
                              onClick={() => handleTopUp(card.id, amt)}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/30 border border-white/15 text-[11px] font-bold text-emerald-300 transition-colors cursor-pointer"
                            >
                              +{amt / 1000}k
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                          title="Xóa thẻ liên kết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Card Transaction History */}
              {cardTransactions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Lịch sử giao dịch thẻ ngân hàng</span>
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {cardTransactions.map((tx) => {
                      const isCredit =
                        tx.type === "TOP_UP" || tx.type === "REFUND";
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isCredit
                                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                                  : "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {tx.description}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {tx.bankName} ({tx.cardNumberMasked}) •{" "}
                                {new Date(tx.createdAt).toLocaleString("vi-VN")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`font-extrabold ${
                                isCredit
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {isCredit ? "+" : "-"}
                              {formatPrice(tx.amount)}
                            </span>
                            <p className="text-[10px] text-slate-400">
                              SD: {formatPrice(tx.balanceAfter)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab 3: VIP Membership Status & Mandatory Bank Card Payment */
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
                        : "Gói Hội Viên VIP Yêu Cầu Thanh Toán Qua Thẻ Ngân Hàng"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isUserVip && vipStatus?.expiresAt
                        ? `Giảm tự động thêm ${vipStatus.directDiscountPercent}% mọi đơn hàng • Hết hạn: ${new Date(
                            vipStatus.expiresAt,
                          ).toLocaleDateString("vi-VN")}`
                        : "Chọn gói VIP bên dưới và thanh toán bằng thẻ ngân hàng đã liên kết để mở khóa đặc quyền giảm thêm 5% - 8% mọi đơn hàng."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mandatory Card Checkout Box when a VIP Plan is selected */}
              {selectedVipPlan && (
                <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-400 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        Thanh Toán Bắt Buộc
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                        Thanh Toán Gói {selectedVipPlan.name} —{" "}
                        <span className="text-amber-600 dark:text-amber-400">
                          {formatPrice(selectedVipPlan.price)}
                        </span>
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVipPlan(null);
                        setVipError(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>

                  {vipError && (
                    <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{vipError}</span>
                    </div>
                  )}

                  {bankCards.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Bạn chưa có thẻ ngân hàng nào để thanh toán gói VIP này.
                        Vui lòng liên kết thẻ trước!
                      </p>
                      <Button
                        size="sm"
                        onPress={() => {
                          setActiveTab("cards");
                          setShowAddCardForm(true);
                        }}
                        className="bg-sky-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shrink-0"
                      >
                        + Thêm thẻ ngân hàng
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Chọn thẻ ngân hàng thanh toán
                        </label>
                        <select
                          value={selectedCardId ?? ""}
                          onChange={(e) =>
                            setSelectedCardId(Number(e.target.value))
                          }
                          className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          {bankCards.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.bankName} ({c.cardBrand}) •{" "}
                              {c.cardNumberMasked} — Số dư:{" "}
                              {formatPrice(c.balance)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Nhập mã CVV xác thực
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          placeholder="Nhập CVV (VD: 686)"
                          value={vipCvv}
                          onChange={(e) => setVipCvv(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {selectedCardObj &&
                    selectedCardObj.balance < selectedVipPlan.price && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 text-xs text-amber-800 dark:text-amber-200">
                        <span>
                          Số dư thẻ hiện tại (
                          {formatPrice(selectedCardObj.balance)}) chưa đủ để
                          thanh toán {formatPrice(selectedVipPlan.price)}.
                        </span>
                        <Button
                          size="sm"
                          onPress={() =>
                            handleTopUp(selectedCardObj.id, 1000000)
                          }
                          className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-lg cursor-pointer"
                        >
                          Nạp nhanh +1.000.000đ
                        </Button>
                      </div>
                    )}

                  {bankCards.length > 0 && (
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => {
                          setActiveTab("cards");
                          setShowAddCardForm(true);
                        }}
                        className="text-xs font-semibold text-sky-600 cursor-pointer"
                      >
                        + Dùng thẻ khác
                      </Button>
                      <Button
                        size="sm"
                        isDisabled={Boolean(subscribingPlan)}
                        onPress={handleConfirmVipPayment}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md"
                      >
                        {subscribingPlan
                          ? "Đang trừ tiền & kích hoạt..."
                          : `Xác nhận trả ${formatPrice(selectedVipPlan.price)} & Kích hoạt`}
                      </Button>
                    </div>
                  )}
                </div>
              )}

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
                        onPress={() => {
                          setSelectedVipPlan(plan);
                          setVipError(null);
                        }}
                        className={`w-full font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                          isYearly
                            ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>
                          {isUserVip
                            ? `Thanh toán gia hạn ${plan.name}`
                            : `Chọn mua ${plan.name} (${formatPrice(plan.price)})`}
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
                      <span>Lịch sử thanh toán Gói VIP</span>
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
                              •{" "}
                              {sub.cardMasked
                                ? `Thẻ ${sub.cardMasked}`
                                : sub.paymentMethod}{" "}
                              •{" "}
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
