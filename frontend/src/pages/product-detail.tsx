import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@heroui/react";
import {
  Star,
  Heart,
  ShoppingBag,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  PackageCheck,
  PackageX,
  ArrowLeft,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { QuickViewModal } from "@/components/QuickViewModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { OrderLookupModal } from "@/components/OrderLookupModal";
import { AdminOrderModal } from "@/components/AdminOrderModal";
import { AdminProductModal } from "@/components/AdminProductModal";
import { AdminPromotionModal } from "@/components/AdminPromotionModal";
import { VoucherWalletModal } from "@/components/VoucherWalletModal";
import { AuthModal } from "@/components/AuthModal";
import { ToastContainer } from "@/components/ToastContainer";
import { ProductCard } from "@/components/ProductCard";
import { fetchProductById, fetchProducts } from "@/services/api";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/data/mockData";
import { useShop } from "@/context/ShopContext";
import { Product, ProductCategory } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedCategory,
    showToast,
  } = useShop();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  const loadProductDetail = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setNotFound(false);

    try {
      const data = await fetchProductById(id);
      setProduct(data);
      const galleryList =
        data.gallery && data.gallery.length > 0 ? data.gallery : [data.image];
      setSelectedImage(galleryList[0] || data.image);
      setQty(1);

      try {
        const rel = await fetchProducts({
          category: data.category,
          page: 0,
          size: 5,
        });
        setRelatedProducts(
          rel.content.filter((item) => item.id !== data.id).slice(0, 4),
        );
      } catch {
        setRelatedProducts([]);
      }
    } catch {
      const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
      if (fallback) {
        setProduct(fallback);
        const galleryList =
          fallback.gallery && fallback.gallery.length > 0
            ? fallback.gallery
            : [fallback.image];
        setSelectedImage(galleryList[0] || fallback.image);
        setRelatedProducts(
          FALLBACK_PRODUCTS.filter(
            (p) => p.category === fallback.category && p.id !== fallback.id,
          ).slice(0, 4),
        );
      } else {
        setProduct(null);
        setNotFound(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadProductDetail();
  }, [loadProductDetail]);

  useEffect(() => {
    const handleCatalogUpdated = () => {
      loadProductDetail();
    };
    window.addEventListener("homenest:catalog-updated", handleCatalogUpdated);
    return () =>
      window.removeEventListener(
        "homenest:catalog-updated",
        handleCatalogUpdated,
      );
  }, [loadProductDetail]);

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const handleCopyShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast(
        "Đã sao chép liên kết sản phẩm!",
        "Bạn có thể dán và chia sẻ URL này cho bạn bè.",
        "success",
      );
    } catch {
      showToast("Liên kết sản phẩm", url, "info");
    }
  };

  const isDiscontinued = product?.isActive === false;
  const maxStock = product?.stockQuantity ?? 50;
  const isOutOfStock = !product?.inStock || maxStock <= 0;
  const canPurchase = !!product && !isDiscontinued && !isOutOfStock;
  const isFav = product ? isInWishlist(product.id) : false;

  const galleryImages = product
    ? product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image]
    : [];

  const specsEntries = product ? Object.entries(product.specs || {}) : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-5 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-slate-800/60 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                <div className="space-y-4">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-24 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
              </div>
            </div>
          ) : notFound || !product ? (
            /* Not Found State */
            <div className="max-w-lg mx-auto my-12 text-center bg-white dark:bg-slate-800/80 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <PackageX className="w-8 h-8" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                Không tìm thấy sản phẩm
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Sản phẩm với mã{" "}
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {id}
                </span>{" "}
                không tồn tại hoặc đường dẫn không chính xác.
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-full inline-flex items-center gap-2 cursor-pointer"
                onPress={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay về trang chủ HomeNest</span>
              </Button>
            </div>
          ) : (
            /* Product Detail Content */
            <div className="space-y-12">
              {/* Breadcrumb & Share Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <nav
                  aria-label="Breadcrumb"
                  className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400"
                >
                  <Link
                    to="/"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                  >
                    Trang chủ
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(product.category as ProductCategory);
                      navigate("/#products");
                    }}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
                  >
                    {product.categoryName}
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-xs sm:max-w-md">
                    {product.name}
                  </span>
                </nav>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer shadow-2xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Sao chép liên kết</span>
                </button>
              </div>

              {/* Discontinued Banner if isActive === false */}
              {isDiscontinued && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                        Sản phẩm đã ngừng kinh doanh
                      </h2>
                      <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                        Mẫu sản phẩm này hiện đã ngừng mở bán mới. Quý khách vẫn
                        có thể xem lại thông tin chi tiết và thông số kỹ thuật
                        để tra cứu bảo hành hoặc đơn hàng cũ.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shrink-0 cursor-pointer"
                    onPress={() => navigate("/")}
                  >
                    Xem sản phẩm đang bán
                  </Button>
                </div>
              )}

              {/* Main 2-Column Product Hero Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 bg-white dark:bg-slate-800/80 p-5 sm:p-8 lg:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 shadow-sm">
                {/* Left Column: Image Gallery (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700">
                    <img
                      src={selectedImage || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-all duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.badge && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                          {product.badge}
                        </span>
                      )}
                      {product.discountPercent > 0 && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-rose-600 text-white self-start shadow-sm">
                          -{product.discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  {galleryImages.length > 1 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {galleryImages.map((imgUrl, index) => {
                        const active =
                          (selectedImage || product.image) === imgUrl;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedImage(imgUrl)}
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                              active
                                ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-105"
                                : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`${product.name} - ảnh ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Product Info & Purchase Controls (7 cols) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {product.categoryName} • Mã SP: {product.id}
                      </span>

                      {/* Stock / Availability Status Pill */}
                      {isDiscontinued ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                          <PackageX className="w-3.5 h-3.5" />
                          <span>Ngừng kinh doanh</span>
                        </span>
                      ) : isOutOfStock ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                          <PackageX className="w-3.5 h-3.5" />
                          <span>Tạm hết hàng</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Còn hàng ({maxStock} sản phẩm)</span>
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {product.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-4 h-4 ${
                              idx < Math.floor(product.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {product.rating}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({product.reviewsCount} đánh giá từ khách hàng)
                      </span>
                    </div>

                    {/* Price Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/70 flex flex-wrap items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <>
                          <span className="text-sm sm:text-base text-slate-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                            Tiết kiệm{" "}
                            {formatPrice(product.originalPrice - product.price)}{" "}
                            (-{product.discountPercent}%)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Highlights / Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Đặc điểm & Công nghệ nổi bật
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {product.features.map((feat, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200"
                            >
                              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Purchase Controls */}
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 p-1">
                        <button
                          type="button"
                          aria-label="Giảm số lượng"
                          disabled={!canPurchase || qty <= 1}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 font-bold disabled:opacity-40 cursor-pointer"
                          onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-slate-900 dark:text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Tăng số lượng"
                          disabled={!canPurchase || qty >= maxStock}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 font-bold disabled:opacity-40 cursor-pointer"
                          onClick={() =>
                            setQty((prev) => Math.min(maxStock, prev + 1))
                          }
                        >
                          +
                        </button>
                      </div>

                      {/* Add to Cart CTA */}
                      <Button
                        isDisabled={!canPurchase}
                        className={`flex-1 font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition-all ${
                          canPurchase
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-lg shadow-emerald-600/20"
                            : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        }`}
                        onPress={() => {
                          if (canPurchase) {
                            addToCart(product, qty);
                          }
                        }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>
                          {isDiscontinued
                            ? "Sản phẩm đã ngừng kinh doanh"
                            : isOutOfStock
                              ? "Tạm hết hàng"
                              : `Thêm vào giỏ hàng (${formatPrice(product.price * qty)})`}
                        </span>
                      </Button>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        aria-label="Yêu thích"
                        onClick={() =>
                          toggleWishlist(product.id, product.name)
                        }
                        className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                          isFav
                            ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40"
                            : "border-slate-200 text-slate-400 hover:text-rose-500 dark:border-slate-700"
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            isFav ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Trust & Warranty Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Bảo hành chính hãng toàn quốc</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                        <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Miễn phí giao hàng tận nhà</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                        <RotateCcw className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>1 đổi 1 trong 30 ngày đầu</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Table */}
              {specsEntries.length > 0 && (
                <div className="bg-white dark:bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-4">
                    Thông số kỹ thuật chi tiết
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {specsEntries.map(([key, value], index) => (
                      <div
                        key={key}
                        className={`flex items-center justify-between py-3 px-4 rounded-xl text-xs sm:text-sm ${
                          index % 2 === 0
                            ? "bg-slate-50 dark:bg-slate-900/50"
                            : "bg-white dark:bg-slate-800/40"
                        }`}
                      >
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {key}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-right">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      Sản phẩm cùng danh mục {product.categoryName}
                    </h2>
                    <Link
                      to="/#products"
                      onClick={() =>
                        setSelectedCategory(product.category as ProductCategory)
                      }
                      className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Xem tất cả →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {relatedProducts.map((rel) => (
                      <ProductCard key={rel.id} product={rel} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Interactive Drawers & Overlays */}
      <CartDrawer />
      <QuickViewModal />
      <CheckoutModal />
      <OrderLookupModal />
      <AdminOrderModal />
      <AdminProductModal />
      <AdminPromotionModal />
      <VoucherWalletModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}
