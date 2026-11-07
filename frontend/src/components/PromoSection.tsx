import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import {
  Flame,
  Clock,
  Copy,
  Check,
  ArrowRight,
  Ticket,
  Crown,
  Sparkles,
  CalendarHeart,
  Sun,
  Lock,
  CheckCircle2,
  Wallet,
  Zap,
  CreditCard,
  Plus,
  AlertCircle,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";
import {
  addBankCardApi,
  claimVoucherApi,
  fetchFlashSale,
  fetchMyBankCards,
  fetchPublicVouchers,
  fetchVipStatus,
  subscribeVipApi,
  topUpBankCardApi,
} from "@/services/api";
import {
  BankCardItem,
  CampaignType,
  FlashSalePromotion,
  VipPlan,
  VipStatusResponse,
  VoucherItem,
} from "@/types";

export const PromoSection: React.FC = () => {
  const {
    showToast,
    currentUser,
    refreshCurrentUser,
    setIsAuthOpen,
    setIsVoucherWalletOpen,
  } = useShop();

  const [copied, setCopied] = useState(false);
  const [promo, setPromo] = useState<FlashSalePromotion | null>(null);

  // Voucher Hub states
  const [activeTab, setActiveTab] = useState<CampaignType>("ALL");
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // VIP Club states
  const [vipStatus, setVipStatus] = useState<VipStatusResponse | null>(null);
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<VipPlan | null>(null);

  // Bank Card states for mandatory VIP payment
  const [bankCards, setBankCards] = useState<BankCardItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [vipCvv, setVipCvv] = useState("");
  const [vipError, setVipError] = useState<string | null>(null);
  const [showAddCardInline, setShowAddCardInline] = useState(false);
  const [newBankName, setNewBankName] = useState("Vietcombank");
  const [newCardBrand, setNewCardBrand] = useState<
    "VISA" | "MASTERCARD" | "NAPAS"
  >("VISA");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardHolder, setNewCardHolder] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("12/29");
  const [newCardCvv, setNewCardCvv] = useState("");
  const [newInitialBalance, setNewInitialBalance] = useState("5000000");
  const [isAddingInlineCard, setIsAddingInlineCard] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 36,
    seconds: 45,
  });

  const loadPromoHubData = useCallback(async () => {
    setIsLoadingVouchers(true);
    try {
      const [voucherList, vipData] = await Promise.all([
        fetchPublicVouchers("ALL"),
        fetchVipStatus(),
      ]);
      setVouchers(voucherList);
      setVipStatus(vipData);
    } catch {
      // Fallbacks handled inside promoApi
    } finally {
      setIsLoadingVouchers(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadFlashSale = async () => {
      try {
        const data = await fetchFlashSale();
        if (isMounted && data) {
          setPromo(data);
        }
      } catch {
        // Keep fallback data if offline
      }
    };
    loadFlashSale();
    loadPromoHubData();

    const handleUpdated = () => {
      loadPromoHubData();
    };
    window.addEventListener("homenest:vouchers-updated", handleUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener("homenest:vouchers-updated", handleUpdated);
    };
  }, [loadPromoHubData, currentUser]);

  // Calculate live countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (promo && promo.endTime) {
        const end = new Date(promo.endTime).getTime();
        const now = Date.now();
        const diff = Math.max(0, end - now);

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          return { hours, minutes, seconds };
        }
      }
      return null;
    };

    const timer = setInterval(() => {
      const live = calculateTimeLeft();
      if (live) {
        setTimeLeft(live);
      } else {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else if (prev.hours > 0) {
            return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
          } else {
            return { hours: 24, minutes: 0, seconds: 0 };
          }
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [promo]);

  const voucherCode = promo?.code || "HOMENEST30";
  const discountPercent = promo?.discountPercent || 30;

  const handleCopyCode = (codeToCopy: string, percent: number) => {
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    showToast(
      "Đã sao chép mã!",
      `Mã ${codeToCopy} giảm ${percent}% đã sẵn sàng.`,
      "success",
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToProducts = () => {
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToVipSection = () => {
    const el = document.getElementById("vip-club-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const handleClaimVoucher = async (voucher: VoucherItem) => {
    if (!currentUser) {
      showToast(
        "Cần đăng nhập",
        "Vui lòng đăng nhập tài khoản để lưu voucher vào Kho cá nhân!",
        "warning",
      );
      setIsAuthOpen(true);
      return;
    }

    const isUserVip = Boolean(currentUser.vipActive || vipStatus?.active);
    if (voucher.vipOnly && !isUserVip) {
      showToast(
        "Đặc quyền Hội viên VIP",
        "Hãy đăng ký Gói VIP Tháng hoặc Năm bên dưới để mở khóa mã giảm sâu này!",
        "warning",
      );
      scrollToVipSection();
      return;
    }

    setClaimingId(voucher.id);
    try {
      const claimed = await claimVoucherApi(voucher.code);
      setVouchers((prev) =>
        prev.map((item) => (item.id === claimed.id ? claimed : item)),
      );
      window.dispatchEvent(new Event("homenest:vouchers-updated"));
      showToast(
        "Đã lưu vào Kho Voucher!",
        `Mã ${claimed.code} (-${claimed.discountPercent}%) đã được giữ suất trong kho của bạn.`,
        "success",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể lưu voucher lúc này.";
      showToast("Không thể lưu mã", msg, "warning");
    } finally {
      setClaimingId(null);
    }
  };

  const loadUserCards = useCallback(async () => {
    if (!currentUser) {
      setBankCards([]);
      setSelectedCardId(null);
      return;
    }
    try {
      const cards = await fetchMyBankCards();
      setBankCards(cards);
      if (cards.length > 0) {
        const def = cards.find((c) => c.isDefault) || cards[0];
        setSelectedCardId((prev) =>
          prev && cards.some((c) => c.id === prev) ? prev : def.id,
        );
        setShowAddCardInline(false);
      } else {
        setSelectedCardId(null);
        setShowAddCardInline(true);
      }
    } catch {
      setBankCards([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (confirmPlan && currentUser) {
      setVipError(null);
      loadUserCards();
      if (currentUser.fullName && !newCardHolder) {
        setNewCardHolder(
          currentUser.fullName
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toUpperCase(),
        );
      }
    }
  }, [confirmPlan, currentUser, loadUserCards, newCardHolder]);

  const handleInlineAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setVipError(null);
    setIsAddingInlineCard(true);
    try {
      const created = await addBankCardApi({
        bankName: newBankName,
        cardBrand: newCardBrand,
        cardNumber: newCardNumber.replace(/\s+/g, ""),
        cardHolderName: newCardHolder.trim().toUpperCase(),
        expiryDate: newExpiryDate.trim(),
        cvv: newCardCvv.trim(),
        initialBalance: Math.max(0, Number(newInitialBalance) || 0),
        setAsDefault: true,
      });
      await loadUserCards();
      setSelectedCardId(created.id);
      setVipCvv(newCardCvv.trim());
      setNewCardNumber("");
      setNewCardCvv("");
      setShowAddCardInline(false);
      window.dispatchEvent(new Event("homenest:cards-updated"));
      showToast(
        "Liên kết thẻ thành công!",
        `Đã thêm thẻ ${created.bankName} (${created.cardNumberMasked}).`,
        "success",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể liên kết thẻ ngân hàng.";
      setVipError(msg);
    } finally {
      setIsAddingInlineCard(false);
    }
  };

  const handleQuickTopUp = async (cardId: number, amount: number) => {
    try {
      const updated = await topUpBankCardApi(cardId, amount);
      await loadUserCards();
      window.dispatchEvent(new Event("homenest:cards-updated"));
      showToast(
        "Nạp tiền thành công!",
        `Số dư thẻ ${updated.cardNumberMasked} hiện tại: ${formatPrice(updated.balance)}`,
        "success",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể nạp tiền.";
      setVipError(msg);
    }
  };

  const handleConfirmSubscribeVip = async () => {
    if (!confirmPlan) return;
    if (!currentUser) {
      setConfirmPlan(null);
      setIsAuthOpen(true);
      return;
    }

    setVipError(null);
    if (!selectedCardId) {
      setVipError(
        "Gói Hội viên VIP bắt buộc thanh toán qua thẻ ngân hàng. Vui lòng chọn hoặc liên kết thẻ!",
      );
      return;
    }
    if (!vipCvv.trim()) {
      setVipError("Vui lòng nhập mã bảo mật CVV của thẻ để xác thực thanh toán.");
      return;
    }

    setSubscribingPlan(confirmPlan.id);
    try {
      const updatedVip = await subscribeVipApi(
        confirmPlan.id,
        selectedCardId,
        vipCvv.trim(),
      );
      setVipStatus(updatedVip);
      await refreshCurrentUser();
      await loadPromoHubData();
      window.dispatchEvent(new Event("homenest:vouchers-updated"));
      window.dispatchEvent(new Event("homenest:cards-updated"));
      setConfirmPlan(null);
      setVipCvv("");
      showToast(
        "Thanh toán & Kích hoạt Hội viên VIP thành công!",
        `Đã trừ ${formatPrice(confirmPlan.price)} từ thẻ ngân hàng, kích hoạt ưu đãi -${updatedVip.directDiscountPercent}% & tặng trọn bộ Voucher VIP vào kho!`,
        "success",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể thanh toán gói VIP. Vui lòng kiểm tra số dư thẻ hoặc mã CVV.";
      setVipError(msg);
      showToast("Thanh toán thất bại", msg, "warning");
    } finally {
      setSubscribingPlan(null);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (activeTab === "ALL") return true;
    return v.campaignType === activeTab;
  });

  const campaignTabs: {
    id: CampaignType;
    label: string;
    badge?: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "ALL",
      label: "Tất cả mã",
      icon: <Ticket className="w-4 h-4" />,
    },
    {
      id: "DOUBLE_DAY",
      label: "Ngày Đôi 10/10 • 11/11 • 12/12",
      badge: "Giảm đến 45%",
      icon: <Flame className="w-4 h-4 text-rose-500" />,
    },
    {
      id: "HOLIDAY",
      label: "Đại Lễ & Tết",
      badge: "Giới hạn",
      icon: <CalendarHeart className="w-4 h-4 text-amber-500" />,
    },
    {
      id: "DAILY",
      label: "Ưu Đãi Ngày Thường",
      icon: <Sun className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: "VIP_ONLY",
      label: "Đặc Quyền VIP",
      badge: "VIP",
      icon: <Crown className="w-4 h-4 text-amber-400" />,
    },
  ];

  // Featured product details
  const featured = promo?.featuredProduct;
  const featuredImage =
    featured?.image ||
    "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80";
  const featuredName = featured?.name || "Nồi chiên không dầu DualZone 6.5L";
  const featuredPrice = featured?.price || 1990000;
  const featuredOriginalPrice = featured?.originalPrice || 2890000;
  const featuredDiscount = featured?.discountPercent || 31;

  const isUserVip = Boolean(currentUser?.vipActive || vipStatus?.active);
  const currentVipTier = vipStatus?.tier || currentUser?.vipTier || "NONE";

  return (
    <section className="py-16 sm:py-24 overflow-hidden space-y-16" id="promotions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Part 1: Hero Flash Sale Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white shadow-2xl border border-emerald-800/40 p-8 sm:p-12 lg:p-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>
                  {promo?.title ||
                    `Flash Sale Có Hạn – Giảm Đến ${discountPercent}%`}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Ưu đãi đặc biệt dành cho{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-orange-400 bg-clip-text text-transparent">
                  ngôi nhà của bạn
                </span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                {promo?.description ||
                  "Cơ hội sở hữu trọn bộ thiết bị gia dụng nhà bếp, robot lau dọn thông minh và máy lọc không khí cao cấp với mức giá tốt nhất trong tháng."}
              </p>

              {/* Countdown Timer */}
              <div className="pt-2">
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5 mb-3">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Thời gian ưu đãi kết thúc sau:</span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-300">
                      Giờ
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-slate-400">:</span>
                  <div className="flex flex-col items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-300">
                      Phút
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-slate-400">:</span>
                  <div className="flex flex-col items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-300">
                      Giây
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <span className="text-xs text-slate-300">Mã công khai:</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm tracking-wider">
                    {voucherCode}
                  </span>
                  <button
                    className="p-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors ml-1 cursor-pointer"
                    title="Sao chép mã"
                    onClick={() => handleCopyCode(voucherCode, discountPercent)}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-7 py-3 rounded-full flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/30 transition-all"
                  onPress={scrollToProducts}
                >
                  <span>Mua ngay kẻo lỡ</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-5 py-3 rounded-full flex items-center gap-2 cursor-pointer"
                  onPress={() => setIsVoucherWalletOpen(true)}
                >
                  <Wallet className="w-4 h-4 text-emerald-300" />
                  <span>Kho Voucher Của Tôi</span>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 group">
                <img
                  alt={featuredName}
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  src={featuredImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-sm shadow-md">
                  Giảm {featuredDiscount}%
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs uppercase text-emerald-400 font-semibold tracking-wider">
                    Sản phẩm tiêu biểu
                  </p>
                  <p className="text-base font-bold text-white">
                    {featuredName}
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Chỉ từ {formatPrice(featuredPrice)} (Giá gốc:{" "}
                    {formatPrice(featuredOriginalPrice)})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Voucher Hunting Station (10/10, 11/11, Lễ Tết, Ngày thường, VIP) */}
        <div className="space-y-8" id="voucher-station">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
                <Ticket className="w-3.5 h-3.5" />
                <span>Trạm Săn Voucher & Sự Kiện Đặc Biệt</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Lưu Voucher Ngay – Giữ Suất Giảm Sâu Ngày Đôi & Lễ Lớn
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Các đợt <strong>10/10, 11/11, 12/12</strong> và{" "}
                <strong>Ngày Lễ</strong> tung mã giảm giá lên tới 45% nhưng số
                lượng cực kỳ có hạn. Bấm <strong>Lưu Voucher</strong> để giữ
                chắc suất trong Kho Voucher cá nhân!
              </p>
            </div>

            <Button
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 self-start md:self-auto cursor-pointer"
              onPress={() => setIsVoucherWalletOpen(true)}
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Mở Kho Voucher & Thẻ VIP</span>
            </Button>
          </div>

          {/* Campaign Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {campaignTabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Vouchers Grid */}
          {isLoadingVouchers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVouchers.map((v) => {
                const isDoubleOrHoliday =
                  v.campaignType === "DOUBLE_DAY" ||
                  v.campaignType === "HOLIDAY";
                const isVipVoucher = v.vipOnly || v.campaignType === "VIP_ONLY";
                const totalQty = v.totalQuantity ?? null;
                const claimedQty = v.claimedQuantity ?? 0;
                const remainingQty =
                  totalQty !== null
                    ? Math.max(0, totalQty - claimedQty)
                    : null;
                const claimedPercent =
                  totalQty && totalQty > 0
                    ? Math.min(100, Math.round((claimedQty / totalQty) * 100))
                    : 25;
                const isSoldOut = remainingQty !== null && remainingQty <= 0;
                const isAlreadyClaimed = v.claimed;
                const isUsed = v.userVoucherStatus === "USED";

                return (
                  <div
                    key={v.id}
                    className={`relative rounded-2xl border overflow-hidden transition-all flex flex-col justify-between p-5 shadow-sm hover:shadow-md ${
                      isVipVoucher
                        ? "bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 dark:from-slate-800 dark:via-slate-900 dark:to-amber-950/30 border-amber-300 dark:border-amber-700/70"
                        : isDoubleOrHoliday
                          ? "bg-gradient-to-br from-rose-50/70 via-white to-orange-50/40 dark:from-slate-800 dark:via-slate-900 dark:to-rose-950/20 border-rose-200 dark:border-rose-800/60"
                          : "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top row: Event Tag & Discount Pill */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isVipVoucher
                              ? "bg-amber-500 text-slate-950"
                              : isDoubleOrHoliday
                                ? "bg-rose-600 text-white"
                                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {isVipVoucher ? (
                            <Crown className="w-3 h-3" />
                          ) : isDoubleOrHoliday ? (
                            <Flame className="w-3 h-3" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          <span>{v.eventTag || v.campaignType}</span>
                        </span>

                        <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-dashed border-slate-300 dark:border-slate-700">
                          {v.code}
                        </span>
                      </div>

                      {/* Main Title & Discount */}
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-2xl sm:text-3xl font-black ${
                            isVipVoucher
                              ? "text-amber-600 dark:text-amber-400"
                              : isDoubleOrHoliday
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          -{v.discountPercent}%
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                          {v.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {v.description}
                      </p>

                      {/* Conditions */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {v.maxDiscountAmount && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900/70 font-medium">
                            Giảm tối đa {formatPrice(v.maxDiscountAmount)}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900/70 font-medium">
                          {v.minOrderAmount > 0
                            ? `Đơn từ ${formatPrice(v.minOrderAmount)}`
                            : "Mọi đơn hàng"}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Progress Bar & Claim Button */}
                    <div className="pt-4 mt-4 border-t border-dashed border-slate-200 dark:border-slate-700/80 space-y-3">
                      {totalQty !== null && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span
                              className={
                                remainingQty !== null && remainingQty <= 15
                                  ? "text-rose-600 dark:text-rose-400 font-bold"
                                  : "text-slate-500 dark:text-slate-400"
                              }
                            >
                              {isSoldOut
                                ? "Đã hết lượt lưu"
                                : remainingQty !== null && remainingQty <= 15
                                  ? `🔥 Sắp cháy mã! Chỉ còn ${remainingQty} suất`
                                  : `Còn lại ${remainingQty}/${totalQty} mã`}
                            </span>
                            <span className="text-slate-400">
                              Đã lưu {claimedPercent}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isVipVoucher
                                  ? "bg-amber-500"
                                  : isDoubleOrHoliday
                                    ? "bg-gradient-to-r from-orange-500 to-rose-600"
                                    : "bg-emerald-500"
                              }`}
                              style={{ width: `${claimedPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        {isAlreadyClaimed ? (
                          <Button
                            size="sm"
                            isDisabled={isUsed}
                            onPress={scrollToProducts}
                            className={`w-full font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
                              isUsed
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-500"
                                : "bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {isUsed
                                ? "Đã sử dụng"
                                : "Đã lưu trong kho • Mua sắm ngay"}
                            </span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            isDisabled={isSoldOut || claimingId === v.id}
                            onPress={() => handleClaimVoucher(v)}
                            className={`w-full font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                              isSoldOut
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                                : isVipVoucher
                                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                                  : isDoubleOrHoliday
                                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            {isVipVoucher && !isUserVip ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Mở khóa với Gói VIP</span>
                              </>
                            ) : (
                              <>
                                <Ticket className="w-3.5 h-3.5" />
                                <span>
                                  {claimingId === v.id
                                    ? "Đang lưu mã..."
                                    : isSoldOut
                                      ? "Hết lượt lưu"
                                      : "Lưu Voucher Ngay"}
                                </span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Part 3: HomeNest VIP Club (Gói Tháng & Gói Năm) */}
        <div
          id="vip-club-section"
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/90 text-white border border-amber-500/30 p-8 sm:p-12 shadow-2xl"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>HomeNest VIP Club • Đặc Quyền Mua Sắm Đỉnh Cao</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
                  Nâng Cấp Hội Viên VIP –{" "}
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                    Cộng Dồn 2 Tầng Giảm Giá
                  </span>
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Trở thành Hội viên VIP Tháng hoặc VIP Năm để được{" "}
                  <strong className="text-amber-300">
                    giảm trực tiếp thêm 5% – 8% trên mọi đơn hàng
                  </strong>{" "}
                  (cộng dồn sau khi đã trừ Voucher), đồng thời nhận ngay trọn bộ
                  Voucher Độc Quyền VIP giảm sâu tới 35%!
                </p>
              </div>

              {isUserVip && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center gap-4 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      Trạng thái hội viên của bạn
                    </span>
                    <p className="text-base font-extrabold text-white">
                      {currentVipTier === "VIP_YEARLY"
                        ? "Hội Viên VIP Năm (Gold -8%)"
                        : "Hội Viên VIP Tháng (-5%)"}
                    </p>
                    {vipStatus?.expiresAt && (
                      <p className="text-xs text-slate-300">
                        Hiệu lực đến:{" "}
                        {new Date(vipStatus.expiresAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* VIP Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(vipStatus?.plans || []).map((plan) => {
                const isYearly = plan.id === "YEARLY";
                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between border transition-all ${
                      isYearly
                        ? "bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-amber-900/30 border-amber-400/60 shadow-xl shadow-amber-500/10"
                        : "bg-white/5 border-white/15"
                    }`}
                  >
                    <div className="space-y-5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 ${
                              isYearly
                                ? "bg-amber-400 text-slate-950"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {plan.badge}
                          </span>
                          <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                            {plan.name}
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl sm:text-3xl font-black text-amber-400">
                            {formatPrice(plan.price)}
                          </div>
                          <div className="text-xs text-slate-400 line-through">
                            {formatPrice(plan.originalPrice)}
                          </div>
                          <div className="text-[11px] text-emerald-400 font-semibold">
                            / {plan.durationDays} ngày
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-300">
                          Ưu đãi tự động mọi đơn hàng:
                        </span>
                        <span className="font-extrabold text-amber-300">
                          Giảm thêm {plan.directDiscountPercent}% (tối đa{" "}
                          {formatPrice(plan.maxDiscountPerOrder)}/đơn)
                        </span>
                      </div>

                      <ul className="space-y-2.5">
                        {plan.benefits.map((b, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200"
                          >
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/10">
                      <Button
                        onPress={() => {
                          if (!currentUser) {
                            showToast(
                              "Vui lòng đăng nhập",
                              "Đăng nhập tài khoản để đăng ký gói Hội viên VIP HomeNest.",
                              "info",
                            );
                            setIsAuthOpen(true);
                            return;
                          }
                          setConfirmPlan(plan);
                        }}
                        className={`w-full font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm ${
                          isYearly
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25"
                            : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>
                          {isUserVip
                            ? `Gia hạn thêm ${plan.name}`
                            : `Đăng ký ${plan.name} ngay`}
                        </span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Bank Card VIP Payment Confirmation Modal */}
      {confirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            role="presentation"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !subscribingPlan && setConfirmPlan(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Thanh Toán Kích Hoạt {confirmPlan.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gói Hội viên VIP bắt buộc thanh toán bằng thẻ ngân hàng liên kết
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gói đăng ký:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {confirmPlan.name} ({confirmPlan.durationDays} ngày)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đặc quyền đơn hàng:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Giảm thêm {confirmPlan.directDiscountPercent}% mọi đơn hàng
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quà tặng kèm:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  Tặng mã {confirmPlan.giftVoucherCodes.join(", ")} vào kho
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-extrabold">
                <span>Số tiền cần thanh toán:</span>
                <span className="text-amber-600 dark:text-amber-400">
                  {formatPrice(confirmPlan.price)}
                </span>
              </div>
            </div>

            {vipError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{vipError}</span>
              </div>
            )}

            {/* Card Selection or Inline Add Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-sky-600" />
                  <span>Thẻ Ngân Hàng Thanh Toán</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddCardInline((prev) => !prev)}
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {showAddCardInline
                      ? "Chọn thẻ đã lưu"
                      : "Thêm thẻ ngân hàng mới"}
                  </span>
                </button>
              </div>

              {showAddCardInline || bankCards.length === 0 ? (
                <form
                  onSubmit={handleInlineAddCard}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-sky-200 dark:border-sky-800/60 space-y-3"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Liên kết thẻ ngân hàng mới để thanh toán gói VIP
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Ngân hàng
                      </label>
                      <select
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        {[
                          "Vietcombank",
                          "Techcombank",
                          "MB Bank",
                          "VPBank",
                          "ACB",
                          "BIDV",
                        ].map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Loại thẻ
                      </label>
                      <select
                        value={newCardBrand}
                        onChange={(e) =>
                          setNewCardBrand(
                            e.target.value as "VISA" | "MASTERCARD" | "NAPAS",
                          )
                        }
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <option value="VISA">VISA</option>
                        <option value="MASTERCARD">Mastercard</option>
                        <option value="NAPAS">NAPAS</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Số thẻ (12 - 19 chữ số)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 4111 2222 3333 8899"
                      value={newCardNumber}
                      onChange={(e) => setNewCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Chủ thẻ (In hoa)
                      </label>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        value={newCardHolder}
                        onChange={(e) =>
                          setNewCardHolder(e.target.value.toUpperCase())
                        }
                        className="w-full px-3 py-2 text-xs uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Số dư nạp ban đầu (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={100000}
                        value={newInitialBalance}
                        onChange={(e) => setNewInitialBalance(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Hạn thẻ (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="12/29"
                        value={newExpiryDate}
                        onChange={(e) => setNewExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Mã bảo mật CVV
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="VD: 686"
                        value={newCardCvv}
                        onChange={(e) => setNewCardCvv(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    isDisabled={isAddingInlineCard}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2 rounded-xl cursor-pointer"
                  >
                    {isAddingInlineCard
                      ? "Đang liên kết thẻ..."
                      : "Lưu & Sử dụng thẻ này"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Chọn thẻ đã liên kết
                    </label>
                    <select
                      value={selectedCardId ?? ""}
                      onChange={(e) =>
                        setSelectedCardId(Number(e.target.value))
                      }
                      className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      {bankCards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.bankName} ({c.cardBrand}) • {c.cardNumberMasked} —
                          Số dư: {formatPrice(c.balance)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Nhập mã bảo mật CVV của thẻ để xác nhận trừ tiền
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Nhập 3-6 chữ số CVV (VD: 686)"
                      value={vipCvv}
                      onChange={(e) => setVipCvv(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  {(() => {
                    const currentCard = bankCards.find(
                      (c) => c.id === selectedCardId,
                    );
                    if (currentCard && currentCard.balance < confirmPlan.price) {
                      return (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                          <span>
                            Số dư thẻ ({formatPrice(currentCard.balance)}) không
                            đủ để thanh toán {formatPrice(confirmPlan.price)}.
                          </span>
                          <Button
                            size="sm"
                            onPress={() =>
                              handleQuickTopUp(currentCard.id, 1000000)
                            }
                            className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-lg cursor-pointer shrink-0"
                          >
                            Nạp +1.000.000đ
                          </Button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="ghost"
                isDisabled={Boolean(subscribingPlan)}
                onPress={() => setConfirmPlan(null)}
                className="text-xs font-semibold text-slate-500 cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                isDisabled={Boolean(subscribingPlan) || bankCards.length === 0}
                onPress={handleConfirmSubscribeVip}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md disabled:opacity-50"
              >
                {subscribingPlan
                  ? "Đang thanh toán..."
                  : `Trả ${formatPrice(confirmPlan.price)} & Kích hoạt VIP`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
