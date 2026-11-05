import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { fetchProducts } from "@/services/api";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/data/mockData";
import { useShop } from "@/context/ShopContext";
import { ProductCard } from "@/components/ProductCard";
import { Product, ProductCategory } from "@/types";

export const ProductsSection: React.FC = () => {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } =
    useShop();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const pageSize = 8;
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0); // Reset to page 0 on search input change
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Reset page when category changes
  useEffect(() => {
    setPage(0);
  }, [selectedCategory]);

  const categories: { label: string; value: ProductCategory }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Thiết bị nhà bếp", value: "kitchen" },
    { label: "Thiết bị vệ sinh", value: "cleaning" },
    { label: "Chăm sóc không khí", value: "air" },
    { label: "Gia dụng thông minh", value: "smart" },
  ];

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchProducts({
        category: selectedCategory,
        search: debouncedSearch,
        page,
        size: pageSize,
      });

      setProducts(res.content);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Lỗi khi tải dữ liệu sản phẩm";

      setError(msg);

      // Fallback to local filtering if backend is not running yet
      const filtered = FALLBACK_PRODUCTS.filter((item) => {
        const matchCategory =
          selectedCategory === "all" || item.category === selectedCategory;
        const matchSearch =
          debouncedSearch.trim() === "" ||
          item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.categoryName
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          item.description
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase());

        return matchCategory && matchSearch;
      });

      const start = page * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      setProducts(paginated);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
      setTotalElements(filtered.length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, debouncedSearch, page]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setPage(0);
  };

  return (
    <section className="py-16 sm:py-24" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Top Sellers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sản phẩm được yêu thích nhất
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Những thiết bị gia dụng được săn đón và đánh giá cao nhất, mang đến
            giải pháp tiện nghi hoàn hảo cho ngôi nhà.
          </p>

          {/* Connection status banner if server is offline */}
          {error && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chế độ ngoại tuyến ({error})</span>
              <button
                className="ml-2 font-bold underline flex items-center gap-1 hover:text-amber-900 cursor-pointer"
                disabled={isLoading}
                onClick={loadProducts}
              >
                <RefreshCw
                  className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                />
                Thử lại
              </button>
            </div>
          )}
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-2 md:pb-0 w-full md:w-auto">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.value;

              return (
                <button
                  key={cat.value}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                  }`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Section Search input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-500 transition-all"
              placeholder="Lọc nhanh sản phẩm..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                aria-label="Xóa từ khóa tìm kiếm"
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(selectedCategory !== "all" || searchQuery.trim() !== "") && (
          <div className="flex items-center gap-2 mb-6 text-xs text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đang lọc:</span>
            {selectedCategory !== "all" && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-medium">
                {categories.find((c) => c.value === selectedCategory)?.label}
              </span>
            )}
            {searchQuery.trim() !== "" && (
              <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                &quot;{searchQuery}&quot;
              </span>
            )}
            <button
              className="ml-2 text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
              onClick={handleResetFilters}
            >
              <RotateCcw className="w-3 h-3" />
              Đặt lại
            </button>
          </div>
        )}

        {/* Product Grid Area with Loading, Empty and Content States */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3"
              >
                <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl mt-2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              Không tìm thấy sản phẩm phù hợp
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để hiển thị
              toàn bộ sản phẩm.
            </p>
            <button
              className="px-5 py-2 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
              onClick={handleResetFilters}
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hiển thị{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {products.length}
                  </span>{" "}
                  /{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {totalElements}
                  </span>{" "}
                  sản phẩm (Trang {page + 1}/{totalPages})
                </p>

                <div className="flex items-center gap-2">
                  <button
                    aria-label="Trang trước"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    disabled={page === 0}
                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          page === i
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                        onClick={() => setPage(i)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    aria-label="Trang sau"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    disabled={page >= totalPages - 1}
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages - 1, prev + 1))
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom Disclaimer */}
        <div className="mt-12 text-center text-xs text-slate-400 italic">
          * Dữ liệu sản phẩm được đồng bộ từ cơ sở dữ liệu PostgreSQL qua REST
          API Spring Boot.
        </div>
      </div>
    </section>
  );
};
