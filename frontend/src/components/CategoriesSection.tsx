import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight, Sparkles, RefreshCw, AlertCircle } from "lucide-react";

import { fetchCategories } from "@/services/api";
import { CATEGORIES as FALLBACK_CATEGORIES } from "@/data/mockData";
import { useShop } from "@/context/ShopContext";
import { Category, ProductCategory } from "@/types";

export const CategoriesSection: React.FC = () => {
  const { setSelectedCategory } = useShop();
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();

      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh mục";

      setError(msg);
      // Keep using fallback categories if network fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const handleCatalogUpdated = () => {
      loadCategories();
    };
    window.addEventListener("homenest:catalog-updated", handleCatalogUpdated);
    return () =>
      window.removeEventListener(
        "homenest:catalog-updated",
        handleCatalogUpdated,
      );
  }, [loadCategories]);

  const handleSelectCategory = (slug: ProductCategory) => {
    setSelectedCategory(slug);
    const target = document.getElementById("products");

    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="py-16 sm:py-20 bg-slate-50/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60"
      id="categories"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Danh mục thiết bị</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Khám phá danh mục nổi bật
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Lựa chọn thiết bị gia dụng hàng đầu, chuẩn hóa chất lượng và thẩm mỹ
            cho từng không gian trong ngôi nhà của bạn.
          </p>

          {error && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Đang dùng dữ liệu ngoại tuyến ({error})</span>
              <button
                className="ml-2 underline font-semibold flex items-center gap-1 hover:text-amber-900 cursor-pointer"
                disabled={isLoading}
                onClick={loadCategories}
              >
                <RefreshCw
                  className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                />
                Thử lại
              </button>
            </div>
          )}
        </div>

        {/* Categories Grid (4 cols on desktop, 2 cols on mobile/tablet) */}
        {isLoading && categories.length === 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-200 dark:bg-slate-800 h-64"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                className="group relative cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500/80 transition-all duration-300 flex flex-col hover:-translate-y-1"
                onClick={() =>
                  handleSelectCategory(cat.slug as ProductCategory)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectCategory(cat.slug as ProductCategory);
                  }
                }}
              >
                {/* Category Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                    src={cat.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 backdrop-blur-xs">
                    {cat.itemCount}+ mẫu
                  </span>
                </div>

                {/* Category Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Khám phá ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
