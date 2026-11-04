import React from "react";
import { Button } from "@heroui/react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Zap,
  RotateCcw,
  Award,
} from "lucide-react";

export const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-100/50 via-teal-50/30 to-amber-100/30 dark:from-emerald-950/20 dark:via-slate-900/10 dark:to-teal-950/20 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typography & CTAs (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Thế hệ thiết bị gia dụng thông minh 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Gia dụng thông minh –{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                Nâng tầm cuộc sống
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              Khám phá những sản phẩm gia dụng hiện đại, tiện nghi và chất lượng,
              giúp công việc nhà trở nên đơn giản hơn mỗi ngày. Tận hưởng không gian sống đẳng cấp cùng HomeNest.
            </p>

            {/* Two CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-full flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5"
                onPress={() => scrollTo("products")}
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                onClick={() => scrollTo("promotions")}
                className="px-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base backdrop-blur-sm transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
              >
                Xem ưu đãi
              </button>
            </div>

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800 w-full text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-medium">100% Chính hãng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600">
                  <Award className="w-4 h-4" />
                </div>
                <span className="font-medium">Bảo hành 24 tháng</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <span className="font-medium">Đổi mới 30 ngày</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual with Floating Badges (5 cols on lg) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Visual Container */}
            <div className="relative w-full max-w-md lg:max-w-none">
              {/* Back Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl transform rotate-3" />

              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 group">
                <img
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80"
                  alt="Không gian bếp hiện đại cùng thiết bị gia dụng HomeNest"
                  className="w-full h-[400px] sm:h-[480px] object-cover group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-xs uppercase font-semibold text-emerald-300 tracking-wider">
                    Không gian sống thông minh
                  </p>
                  <p className="text-base sm:text-lg font-bold">
                    Tiện nghi trong từng khoảnh khắc
                  </p>
                </div>
              </div>

              {/* Floating Badge 1: "Bán chạy" (Top Left) */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 animate-float-slow">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Bán chạy số #1
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                      HOT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Đánh giá 4.9/5 (10k+ lượt mua)
                  </p>
                </div>
              </div>

              {/* Floating Badge 2: "Tiết kiệm 30% điện năng" (Bottom Right) */}
              <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 animate-float-slow [animation-delay:1.5s]">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                  <Zap className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Tiết kiệm điện 30%
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Công nghệ Inverter AI
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

