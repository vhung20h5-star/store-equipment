import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Flame, Clock, Copy, Check, ArrowRight } from "lucide-react";

import { useShop } from "@/context/ShopContext";
import { fetchFlashSale } from "@/services/api";
import { FlashSalePromotion } from "@/types";

export const PromoSection: React.FC = () => {
  const { showToast } = useShop();
  const [copied, setCopied] = useState(false);
  const [promo, setPromo] = useState<FlashSalePromotion | null>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 36,
    seconds: 45,
  });

  // Load flash sale promotion from Backend
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
    return () => {
      isMounted = false;
    };
  }, []);

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
        // Fallback simulated decrement
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    showToast(
      "Đã sao chép mã!",
      `Mã ${voucherCode} giảm ${discountPercent}% đã sẵn sàng.`,
      "success",
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToProducts = () => {
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  // Featured product details
  const featured = promo?.featuredProduct;
  const featuredImage =
    featured?.image ||
    "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80";
  const featuredName =
    featured?.name || "Nồi chiên không dầu DualZone 6.5L";
  const featuredPrice = featured?.price || 1990000;
  const featuredOriginalPrice = featured?.originalPrice || 2890000;
  const featuredDiscount = featured?.discountPercent || 31;

  return (
    <section className="py-16 sm:py-24 overflow-hidden" id="promotions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white shadow-2xl border border-emerald-800/40 p-8 sm:p-12 lg:p-16">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>
                  {promo?.title || `Flash Sale Có Hạn – Giảm Đến ${discountPercent}%`}
                </span>
              </div>

              {/* Title */}
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

              {/* Voucher Code Box & CTA */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                {/* Copy Voucher */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <span className="text-xs text-slate-300">Mã giảm:</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm tracking-wider">
                    {voucherCode}
                  </span>
                  <button
                    className="p-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors ml-1 cursor-pointer"
                    title="Sao chép mã"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Primary CTA */}
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-7 py-3 rounded-full flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/30 transition-all hover:scale-102"
                  onPress={scrollToProducts}
                >
                  <span>Mua ngay kẻo lỡ</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Visual Image (5 cols) */}
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
      </div>
    </section>
  );
};
