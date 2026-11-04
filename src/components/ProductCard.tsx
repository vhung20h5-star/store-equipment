import React from "react";
import { Button } from "@heroui/react";
import { Star, Heart, ShoppingBag, Eye } from "lucide-react";

import { Product } from "@/types";
import { useShop } from "@/context/ShopContext";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } =
    useShop();

  const isFav = isInWishlist(product.id);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const getBadgeStyle = () => {
    switch (product.badgeType) {
      case "bestseller":
        return "bg-amber-500 text-white shadow-amber-500/30";
      case "sale":
        return "bg-rose-500 text-white shadow-rose-500/30";
      case "featured":
        return "bg-emerald-600 text-white shadow-emerald-600/30";
      case "new":
        return "bg-indigo-500 text-white shadow-indigo-500/30";
      default:
        return "bg-slate-700 text-white";
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600/60 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-700/50">
        <img
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          src={product.image}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm ${getBadgeStyle()}`}
            >
              {product.badge}
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-md bg-rose-600 text-white self-start shadow-sm">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          aria-label="Yêu thích"
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md shadow-md transition-all duration-200 ${
            isFav
              ? "bg-rose-50 dark:bg-rose-950/80 text-rose-500"
              : "bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-rose-500"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isFav ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Quick View Button (hover overlay) */}
        <div className="absolute inset-x-0 bottom-3 px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none group-hover:pointer-events-auto">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md shadow-lg transition-transform hover:scale-105"
            onClick={() => setQuickViewProduct(product)}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem nhanh</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {product.categoryName}
          </span>

          {/* Title */}
          <h3
            className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 mt-1 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
            title={product.name}
            onClick={() => setQuickViewProduct(product)}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {product.rating}
            </span>
            <span className="text-[11px] text-slate-400">
              ({product.reviewsCount})
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transition-colors shadow-sm hover:shadow-emerald-600/30"
            onPress={() => addToCart(product, 1)}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Thêm giỏ hàng</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
