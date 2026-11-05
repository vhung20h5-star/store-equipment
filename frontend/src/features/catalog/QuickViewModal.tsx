import React, { useState } from "react";
import { Button } from "@heroui/react";
import {
  X,
  Star,
  Heart,
  Check,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useShop();

  const [qty, setQty] = useState(1);

  if (!quickViewProduct) return null;

  const isFav = isInWishlist(quickViewProduct.id);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const handleAddToCart = () => {
    addToCart(quickViewProduct, qty);
    setQuickViewProduct(null);
    setQty(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        role="presentation"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setQuickViewProduct(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          aria-label="Đóng"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm transition-colors"
          onClick={() => setQuickViewProduct(null)}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Product Image Column */}
          <div className="relative bg-slate-50 dark:bg-slate-800/50 p-8 flex items-center justify-center">
            <img
              alt={quickViewProduct.name}
              className="w-full max-h-80 object-cover rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60"
              src={quickViewProduct.image}
            />
            {quickViewProduct.badge && (
              <span className="absolute top-6 left-6 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500 text-white shadow-md">
                {quickViewProduct.badge}
              </span>
            )}
          </div>

          {/* Product Info Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {quickViewProduct.categoryName}
              </span>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 mb-2">
                {quickViewProduct.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < Math.floor(quickViewProduct.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {quickViewProduct.rating}
                </span>
                <span className="text-xs text-slate-400">
                  ({quickViewProduct.reviewsCount} đánh giá)
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(quickViewProduct.price)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(quickViewProduct.originalPrice)}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  -{quickViewProduct.discountPercent}%
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {quickViewProduct.description}
              </p>

              {/* Key Features */}
              <div className="mb-4 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Đặc điểm nổi bật:
                </p>
                {quickViewProduct.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Specs */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-6">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(quickViewProduct.specs).map(
                    ([key, value]) => (
                      <div key={key}>
                        <span className="text-slate-400 block">{key}:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-1">
                  <button
                    aria-label="Giảm"
                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-emerald-600 font-bold transition-colors"
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-slate-100">
                    {qty}
                  </span>
                  <button
                    aria-label="Tăng"
                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-emerald-600 font-bold transition-colors"
                    onClick={() => setQty((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-600/20"
                  onPress={handleAddToCart}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Thêm vào giỏ ({formatPrice(quickViewProduct.price * qty)})
                  </span>
                </Button>

                {/* Wishlist button */}
                <button
                  aria-label="Yêu thích"
                  className={`p-3 rounded-xl border transition-colors ${
                    isFav
                      ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40"
                      : "border-slate-200 text-slate-400 hover:text-rose-500 dark:border-slate-700 dark:hover:text-rose-400"
                  }`}
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                >
                  <Heart
                    className={`w-5 h-5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`}
                  />
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Chính
                  hãng 100%
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-500" /> Miễn phí
                  vận chuyển
                </span>
                <span>Đổi trả 30 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
