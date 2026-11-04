import React from "react";
import { Button } from "@heroui/react";
import { ArrowRight, ShoppingBag, Grid } from "lucide-react";

export const CTASection: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-8 sm:p-14 lg:p-20 text-center flex flex-col items-center border border-emerald-700/40">
          {/* Background image overlay */}
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80')",
            }}
          />

          {/* Decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/20 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Biến ngôi nhà của bạn trở nên{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                tiện nghi hơn ngay hôm nay!
              </span>
            </h2>

            <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
              Khám phá bộ sưu tập thiết bị gia dụng hiện đại, chất lượng vượt trội và dịch vụ tận tâm tại HomeNest. Nâng tầm phong cách sống cho cả gia đình.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-3.5 rounded-full flex items-center gap-2 cursor-pointer shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
                onPress={() => scrollTo("products")}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Mua sắm ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                onClick={() => scrollTo("categories")}
                className="px-7 py-3.5 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Grid className="w-4 h-4" />
                <span>Khám phá danh mục</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

