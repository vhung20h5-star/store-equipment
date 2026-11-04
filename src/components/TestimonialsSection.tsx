import React, { useState, useEffect } from "react";
import { Star, Quote, Sparkles, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";

import { TESTIMONIALS as FALLBACK_TESTIMONIALS } from "@/data/mockData";
import { fetchTestimonials } from "@/services/api";
import { Testimonial } from "@/types";

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTestimonials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTestimonials();
      if (data && data.length > 0) {
        setTestimonials(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tải đánh giá";
      setError(msg);
      // Fallback kept
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Trải nghiệm khách hàng</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Khách hàng nói gì về HomeNest?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Sự tin cậy và niềm vui của hàng chục nghìn gia đình Việt là động lực
            lớn nhất của chúng tôi mỗi ngày.
          </p>

          {error && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Đang dùng dữ liệu ngoại tuyến ({error})</span>
              <button
                onClick={loadTestimonials}
                disabled={isLoading}
                className="ml-2 underline font-semibold flex items-center gap-1 hover:text-amber-900 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                Thử lại
              </button>
            </div>
          )}
        </div>

        {/* Testimonials Grid (3 cols) with Loading Skeleton */}
        {isLoading && testimonials.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-64 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Quote Icon & Stars */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Quote className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>

                {/* Author & Product */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <img
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/30"
                    loading="lazy"
                    src={t.avatar}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {t.name}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {t.location}
                    </p>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                      Đã mua: {t.purchasedProduct}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <p className="mt-8 text-center text-xs text-slate-400 italic">
          * Đánh giá thực tế từ khách hàng đã mua sắm thiết bị tại hệ thống HomeNest.
        </p>
      </div>
    </section>
  );
};
