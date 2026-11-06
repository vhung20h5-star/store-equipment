import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@heroui/react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCartPrice,
    totalCartItems,
    showToast,
  } = useShop();

  if (!isCartOpen) return null;

  const unavailableItems = cart.filter(
    (item) =>
      item.product.isActive === false ||
      !item.product.inStock ||
      (item.product.stockQuantity !== undefined &&
        item.product.stockQuantity <= 0),
  );
  const hasUnavailableItems = unavailableItems.length > 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (hasUnavailableItems) {
      showToast(
        "Giỏ hàng có sản phẩm ngừng bán hoặc hết hàng",
        "Vui lòng xóa các sản phẩm không khả dụng trước khi đặt hàng.",
        "warning",
      );
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        role="presentation"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Giỏ hàng của bạn
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
              {totalCartItems}
            </span>
          </div>
          <button
            aria-label="Đóng giỏ hàng"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setIsCartOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Giỏ hàng đang trống
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                Chưa có sản phẩm nào trong giỏ hàng. Khám phá các thiết bị gia
                dụng thông minh ngay hôm nay!
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-full cursor-pointer transition-colors"
                onPress={() => {
                  setIsCartOpen(false);
                  const el = document.getElementById("products");

                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Khám phá sản phẩm
              </Button>
            </div>
          ) : (
            cart.map((item) => {
              const isDiscontinued = item.product.isActive === false;
              const isOutOfStock =
                !item.product.inStock ||
                (item.product.stockQuantity !== undefined &&
                  item.product.stockQuantity <= 0);
              const isItemUnavailable = isDiscontinued || isOutOfStock;

              return (
                <div
                  key={item.product.id}
                  className={`flex gap-4 p-3 rounded-xl border transition-all ${
                    isItemUnavailable
                      ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                  }`}
                >
                  <img
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
                    src={item.product.image}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/products/${item.product.id}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatPrice(item.product.price)}
                        </p>
                        {isDiscontinued ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Ngừng kinh doanh
                          </span>
                        ) : (
                          isOutOfStock && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Tạm hết hàng
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                        <button
                          aria-label="Giảm số lượng"
                          className="p-1 hover:text-emerald-600 text-slate-500 transition-colors"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          aria-label="Tăng số lượng"
                          disabled={isItemUnavailable}
                          className="p-1 hover:text-emerald-600 text-slate-500 transition-colors disabled:opacity-40"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete button */}
                      <button
                        aria-label="Xóa sản phẩm"
                        className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            {hasUnavailableItems && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Giỏ hàng có sản phẩm đã ngừng kinh doanh hoặc tạm hết hàng.
                  Vui lòng xóa sản phẩm không khả dụng để tiếp tục đặt hàng.
                </span>
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Tạm tính</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {formatPrice(totalCartPrice)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Vận chuyển toàn quốc</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Miễn phí
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-base font-bold text-slate-900 dark:text-white">
                <span>Tổng thanh toán</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatPrice(totalCartPrice)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                isDisabled={hasUnavailableItems}
                className={`w-full font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  hasUnavailableItems
                    ? "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-lg shadow-emerald-600/20"
                }`}
                onPress={handleCheckout}
              >
                <span>Tiến hành đặt hàng ({totalCartItems})</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <button
                className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 text-center py-1 transition-colors"
                onClick={clearCart}
              >
                Xóa tất cả sản phẩm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
