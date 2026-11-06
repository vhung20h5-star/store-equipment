import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import {
  X,
  Search,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Package,
  RefreshCw,
  AlertCircle,
  Loader2,
  Trash2,
  History,
  FolderPlus,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  ArrowUpDown,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useShop } from "@/context/ShopContext";
import {
  fetchCategories,
  getAdminProducts,
  createProductAdmin,
  updateProductAdmin,
  updateProductVisibilityAdmin,
  adjustProductStockAdmin,
  getProductStockAdjustmentsAdmin,
  createCategoryAdmin,
} from "@/services/api";
import {
  Category,
  CreateProductRequest,
  InventoryAdjustment,
  Product,
} from "@/types";

type ActiveTab = "list" | "form" | "stock" | "category";

interface SpecRow {
  key: string;
  value: string;
}

const REASON_PRESETS = [
  "Nhập thêm lô hàng mới từ nhà cung cấp",
  "Kiểm kê kho định kỳ",
  "Trừ hàng lỗi / hư hỏng khi vận chuyển",
  "Xuất hàng trưng bày showroom",
];

export const AdminProductModal: React.FC = () => {
  const {
    isAdminProductsOpen,
    setIsAdminProductsOpen,
    currentUser,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<ActiveTab>("list");

  // Catalog state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<
    "all" | "active" | "hidden"
  >("all");
  const [stockFilter, setStockFilter] = useState<"all" | "instock" | "out">(
    "all",
  );

  // Product Form State (Create / Edit)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategorySlug, setFormCategorySlug] = useState("kitchen");
  const [formPrice, setFormPrice] = useState<string>("1000000");
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>("1200000");
  const [formInitialStock, setFormInitialStock] = useState<string>("20");
  const [formBadge, setFormBadge] = useState("");
  const [formBadgeType, setFormBadgeType] = useState<string>("");
  const [formImage, setFormImage] = useState("");
  const [formGallery, setFormGallery] = useState<string[]>([""]);
  const [formDescription, setFormDescription] = useState("");
  const [formFeatures, setFormFeatures] = useState<string[]>([""]);
  const [formSpecs, setFormSpecs] = useState<SpecRow[]>([
    { key: "Công suất", value: "" },
    { key: "Bảo hành", value: "24 tháng" },
  ]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Stock Adjustment State
  const [stockTargetProduct, setStockTargetProduct] = useState<Product | null>(
    null,
  );
  const [quantityChangeInput, setQuantityChangeInput] = useState<string>("10");
  const [stockReasonInput, setStockReasonInput] = useState("");
  const [stockAdjustments, setStockAdjustments] = useState<
    InventoryAdjustment[]
  >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  // New Category State
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catImage, setCatImage] = useState("");
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const notifyCatalogUpdated = () => {
    window.dispatchEvent(new CustomEvent("homenest:catalog-updated"));
  };

  const loadCategoriesList = useCallback(async () => {
    try {
      const cats = await fetchCategories();
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    } catch {
      // ignore if offline
    }
  }, []);

  const loadAdminProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const isActiveParam =
        visibilityFilter === "all"
          ? undefined
          : visibilityFilter === "active";
      const inStockParam =
        stockFilter === "all" ? undefined : stockFilter === "instock";

      const res = await getAdminProducts({
        category: categoryFilter,
        search: searchInput,
        isActive: isActiveParam,
        inStock: inStockParam,
        page: 0,
        size: 50,
      });
      setProducts(res.content);
      setTotalElements(res.totalElements);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách sản phẩm quản trị.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, searchInput, visibilityFilter, stockFilter]);

  useEffect(() => {
    if (isAdminProductsOpen && currentUser?.role === "ROLE_ADMIN") {
      loadCategoriesList();
      loadAdminProducts();
    }
  }, [
    isAdminProductsOpen,
    currentUser,
    loadCategoriesList,
    loadAdminProducts,
  ]);

  if (!isAdminProductsOpen) return null;

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const openCreateProductForm = () => {
    setEditingProduct(null);
    setFormId("");
    setFormName("");
    setFormCategorySlug(categories[0]?.slug || "kitchen");
    setFormPrice("1500000");
    setFormOriginalPrice("2000000");
    setFormInitialStock("20");
    setFormBadge("");
    setFormBadgeType("");
    setFormImage("");
    setFormGallery([""]);
    setFormDescription("");
    setFormFeatures(["Thiết kế hiện đại, tiết kiệm điện năng"]);
    setFormSpecs([
      { key: "Công suất", value: "" },
      { key: "Bảo hành", value: "24 tháng" },
    ]);
    setFormIsActive(true);
    setFormError(null);
    setActiveTab("form");
  };

  const openEditProductForm = (product: Product) => {
    setEditingProduct(product);
    setFormId(product.id);
    setFormName(product.name);
    setFormCategorySlug(product.category || "kitchen");
    setFormPrice(String(product.price));
    setFormOriginalPrice(String(product.originalPrice));
    setFormInitialStock(String(product.stockQuantity ?? 0));
    setFormBadge(product.badge || "");
    setFormBadgeType(product.badgeType || "");
    setFormImage(product.image);
    setFormGallery(
      product.gallery && product.gallery.length > 0
        ? [...product.gallery]
        : [product.image],
    );
    setFormDescription(product.description || "");
    setFormFeatures(
      product.features && product.features.length > 0
        ? [...product.features]
        : [""],
    );
    const specEntries = Object.entries(product.specs || {});
    setFormSpecs(
      specEntries.length > 0
        ? specEntries.map(([key, value]) => ({ key, value }))
        : [{ key: "", value: "" }],
    );
    setFormIsActive(product.isActive !== false);
    setFormError(null);
    setActiveTab("form");
  };

  const openStockModal = async (product: Product) => {
    setStockTargetProduct(product);
    setQuantityChangeInput("10");
    setStockReasonInput("");
    setStockError(null);
    setActiveTab("stock");
    setIsLoadingHistory(true);
    try {
      const history = await getProductStockAdjustmentsAdmin(product.id);
      setStockAdjustments(history);
    } catch (err: unknown) {
      setStockError(
        err instanceof Error
          ? err.message
          : "Không thể tải lịch sử điều chỉnh kho.",
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    const nextActive = product.isActive === false;
    try {
      const updated = await updateProductVisibilityAdmin(
        product.id,
        nextActive,
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? updated : p)),
      );
      notifyCatalogUpdated();
      showToast(
        nextActive ? "Đã mở bán lại sản phẩm" : "Đã ẩn / ngừng bán sản phẩm",
        `${updated.name} (${updated.id})`,
        "info",
      );
    } catch (err: unknown) {
      showToast(
        "Lỗi cập nhật hiển thị",
        err instanceof Error ? err.message : "Vui lòng thử lại",
        "warning",
      );
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedPrice = Number(formPrice);
    const parsedOriginalPrice = Number(formOriginalPrice);
    const parsedInitialStock = Number(formInitialStock);

    if (!formName.trim()) {
      setFormError("Vui lòng nhập tên sản phẩm.");
      return;
    }
    if (!formCategorySlug.trim()) {
      setFormError("Vui lòng chọn danh mục sản phẩm.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormError("Giá bán phải lớn hơn 0.");
      return;
    }
    if (
      !Number.isFinite(parsedOriginalPrice) ||
      parsedOriginalPrice < parsedPrice
    ) {
      setFormError("Giá gốc phải lớn hơn hoặc bằng giá bán.");
      return;
    }
    if (!formImage.trim()) {
      setFormError("Vui lòng nhập URL ảnh đại diện sản phẩm.");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Vui lòng nhập mô tả sản phẩm.");
      return;
    }

    const cleanGallery = formGallery
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    const cleanFeatures = formFeatures
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    const cleanSpecs: Record<string, string> = {};
    for (const row of formSpecs) {
      if (row.key.trim() && row.value.trim()) {
        cleanSpecs[row.key.trim()] = row.value.trim();
      }
    }

    setIsSubmittingForm(true);
    try {
      if (editingProduct) {
        const updated = await updateProductAdmin(editingProduct.id, {
          name: formName.trim(),
          categorySlug: formCategorySlug,
          price: parsedPrice,
          originalPrice: parsedOriginalPrice,
          badge: formBadge.trim() || undefined,
          badgeType: formBadgeType.trim() || undefined,
          image: formImage.trim(),
          gallery: cleanGallery,
          description: formDescription.trim(),
          features: cleanFeatures,
          specs: cleanSpecs,
          isActive: formIsActive,
        });
        showToast(
          "Cập nhật sản phẩm thành công",
          `Đã lưu thay đổi cho "${updated.name}"`,
          "success",
        );
      } else {
        const payload: CreateProductRequest = {
          id: formId.trim() || undefined,
          name: formName.trim(),
          categorySlug: formCategorySlug,
          price: parsedPrice,
          originalPrice: parsedOriginalPrice,
          badge: formBadge.trim() || undefined,
          badgeType: formBadgeType.trim() || undefined,
          image: formImage.trim(),
          gallery: cleanGallery,
          description: formDescription.trim(),
          features: cleanFeatures,
          specs: cleanSpecs,
          initialStockQuantity: Number.isFinite(parsedInitialStock)
            ? Math.max(0, parsedInitialStock)
            : 0,
          isActive: formIsActive,
        };
        const created = await createProductAdmin(payload);
        showToast(
          "Tạo sản phẩm mới thành công",
          `Đã thêm "${created.name}" (${created.id})`,
          "success",
        );
      }

      notifyCatalogUpdated();
      await loadCategoriesList();
      await loadAdminProducts();
      setActiveTab("list");
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Không thể lưu thông tin sản phẩm.",
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleAdjustStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockTargetProduct) return;
    setStockError(null);

    const delta = parseInt(quantityChangeInput, 10);
    if (!Number.isFinite(delta) || delta === 0) {
      setStockError("Số lượng điều chỉnh phải là số nguyên khác 0.");
      return;
    }
    const currentStock = stockTargetProduct.stockQuantity ?? 0;
    if (currentStock + delta < 0) {
      setStockError(
        `Tồn kho sau điều chỉnh không được âm (Tồn hiện tại: ${currentStock}).`,
      );
      return;
    }
    if (!stockReasonInput.trim()) {
      setStockError("Vui lòng nhập lý do điều chỉnh tồn kho.");
      return;
    }

    setIsSubmittingStock(true);
    try {
      const adjustment = await adjustProductStockAdmin(stockTargetProduct.id, {
        quantityChange: delta,
        reason: stockReasonInput.trim(),
      });
      setStockAdjustments((prev) => [adjustment, ...prev]);
      const updatedStock = adjustment.newQuantity;
      const updatedProduct: Product = {
        ...stockTargetProduct,
        stockQuantity: updatedStock,
        inStock: updatedStock > 0,
      };
      setStockTargetProduct(updatedProduct);
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
      );
      setStockReasonInput("");
      notifyCatalogUpdated();
      showToast(
        "Điều chỉnh tồn kho thành công",
        `${stockTargetProduct.name}: ${adjustment.previousQuantity} → ${adjustment.newQuantity} sản phẩm`,
        "success",
      );
    } catch (err: unknown) {
      setStockError(
        err instanceof Error ? err.message : "Không thể điều chỉnh tồn kho.",
      );
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);

    if (!catName.trim() || !catSlug.trim() || !catImage.trim()) {
      setCategoryError(
        "Vui lòng điền đầy đủ Tên danh mục, Slug và URL ảnh đại diện.",
      );
      return;
    }

    setIsSubmittingCategory(true);
    try {
      const created = await createCategoryAdmin({
        name: catName.trim(),
        slug: catSlug.trim().toLowerCase(),
        description: catDescription.trim(),
        image: catImage.trim(),
      });
      await loadCategoriesList();
      setFormCategorySlug(created.slug);
      setCatName("");
      setCatSlug("");
      setCatDescription("");
      setCatImage("");
      notifyCatalogUpdated();
      showToast(
        "Đã tạo danh mục mới",
        `Danh mục "${created.name}" (${created.slug}) đã sẵn sàng.`,
        "success",
      );
      setActiveTab("list");
    } catch (err: unknown) {
      setCategoryError(
        err instanceof Error ? err.message : "Không thể tạo danh mục mới.",
      );
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const previewDiscountPercent = (() => {
    const p = Number(formPrice);
    const orig = Number(formOriginalPrice);
    if (Number.isFinite(p) && Number.isFinite(orig) && orig > p && orig > 0) {
      return Math.round(((orig - p) * 100) / orig);
    }
    return 0;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        role="presentation"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsAdminProductsOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Quản Trị Sản Phẩm & Kho Hàng (Admin)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tổng số: {totalElements} sản phẩm • Thêm/sửa thông tin, ẩn/mở
                bán & kiểm soát tồn kho
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab !== "list" && (
              <Button
                className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer"
                onPress={() => setActiveTab("list")}
              >
                ← Danh sách sản phẩm
              </Button>
            )}
            <Button
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              onPress={() => {
                setCategoryError(null);
                setActiveTab("category");
              }}
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Danh mục</span>
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              onPress={openCreateProductForm}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm sản phẩm</span>
            </Button>
            <button
              type="button"
              onClick={loadAdminProducts}
              className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Làm mới danh sách"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              aria-label="Đóng quản trị sản phẩm"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsAdminProductsOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: PRODUCT LIST */}
        {activeTab === "list" && (
          <>
            {/* Filter Toolbar */}
            <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã (prod-...), tên sản phẩm, danh mục..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  aria-label="Lọc theo danh mục"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Lọc theo trạng thái hiển thị"
                  value={visibilityFilter}
                  onChange={(e) =>
                    setVisibilityFilter(
                      e.target.value as "all" | "active" | "hidden",
                    )
                  }
                  className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">Mọi trạng thái bán</option>
                  <option value="active">Đang mở bán</option>
                  <option value="hidden">Đã ẩn / Ngừng bán</option>
                </select>

                <select
                  aria-label="Lọc theo tồn kho"
                  value={stockFilter}
                  onChange={(e) =>
                    setStockFilter(e.target.value as "all" | "instock" | "out")
                  }
                  className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">Mọi tồn kho</option>
                  <option value="instock">Còn hàng (&gt;0)</option>
                  <option value="out">Hết hàng (0)</option>
                </select>
              </div>
            </div>

            {/* Product List Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 dark:text-rose-300">
                    {errorMsg}
                  </p>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-14 gap-2 text-sm text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  <span>Đang tải danh sách sản phẩm...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-semibold">
                    Không tìm thấy sản phẩm nào khớp bộ lọc
                  </p>
                </div>
              ) : (
                products.map((prod) => {
                  const isHidden = prod.isActive === false;
                  const stockQty = prod.stockQuantity ?? 0;

                  return (
                    <div
                      key={prod.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isHidden
                          ? "bg-slate-100/70 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700 opacity-85"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                              {prod.id}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                              {prod.categoryName}
                            </span>
                            {isHidden ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                                Đã ẩn / Ngừng bán
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                                Đang mở bán
                              </span>
                            )}
                            {stockQty > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                                Tồn kho: {stockQty}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                                Hết hàng (0)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {prod.name}
                            </h3>
                            <Link
                              to={`/products/${prod.id}`}
                              onClick={() => setIsAdminProductsOpen(false)}
                              className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                              title="Xem trang chi tiết sản phẩm"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                          <div className="flex items-baseline gap-2 text-xs">
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                              {formatPrice(prod.price)}
                            </span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-slate-400 line-through">
                                {formatPrice(prod.originalPrice)}
                              </span>
                            )}
                            {prod.discountPercent > 0 && (
                              <span className="text-rose-500 font-bold">
                                (-{prod.discountPercent}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Row Actions */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => openStockModal(prod)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span>Kho ({stockQty})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditProductForm(prod)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200/80 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(prod)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isHidden
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {isHidden ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Mở bán</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Ẩn</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* TAB 2: CREATE / EDIT PRODUCT FORM */}
        {activeTab === "form" && (
          <form
            onSubmit={handleSaveProduct}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingProduct
                  ? `Chỉnh sửa sản phẩm: ${editingProduct.name} (${editingProduct.id})`
                  : "Thêm sản phẩm mới vào danh mục"}
              </h3>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Hiển thị mở bán ngay</span>
              </label>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="admin-prod-id"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Mã sản phẩm (tùy chọn)
                </label>
                <input
                  id="admin-prod-id"
                  type="text"
                  disabled={!!editingProduct}
                  placeholder="Tự động tạo nếu để trống (vd: prod-15)"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-60"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="admin-prod-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Tên sản phẩm *
                </label>
                <input
                  id="admin-prod-name"
                  type="text"
                  required
                  placeholder="Ví dụ: Nồi Chiên Không Dầu Hơi Nước HomeNest Pro 7L"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="admin-prod-category"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Danh mục *
                </label>
                <select
                  id="admin-prod-category"
                  value={formCategorySlug}
                  onChange={(e) => setFormCategorySlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="admin-prod-price"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Giá bán (VNĐ) *
                </label>
                <input
                  id="admin-prod-price"
                  type="number"
                  min={1}
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-prod-orig-price"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Giá gốc (VNĐ) *{" "}
                  <span className="text-emerald-600 font-bold">
                    (-{previewDiscountPercent}%)
                  </span>
                </label>
                <input
                  id="admin-prod-orig-price"
                  type="number"
                  min={1}
                  required
                  value={formOriginalPrice}
                  onChange={(e) => setFormOriginalPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {!editingProduct ? (
                <div>
                  <label
                    htmlFor="admin-prod-init-stock"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Tồn kho ban đầu
                  </label>
                  <input
                    id="admin-prod-init-stock"
                    type="number"
                    min={0}
                    value={formInitialStock}
                    onChange={(e) => setFormInitialStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              ) : (
                <div>
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tồn kho hiện tại
                  </span>
                  <div className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>{editingProduct.stockQuantity ?? 0} sp</span>
                    <button
                      type="button"
                      onClick={() => openStockModal(editingProduct)}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Điều chỉnh kho
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="admin-prod-badge"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Nhãn nổi bật (Badge)
                </label>
                <input
                  id="admin-prod-badge"
                  type="text"
                  placeholder="Ví dụ: Bán chạy nhất, Giảm sâu, Mới ra mắt..."
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-prod-badge-type"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Kiểu nhãn (Badge Type)
                </label>
                <select
                  id="admin-prod-badge-type"
                  value={formBadgeType}
                  onChange={(e) => setFormBadgeType(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">Không có</option>
                  <option value="bestseller">Bestseller (Cam/Vàng)</option>
                  <option value="sale">Sale (Đỏ)</option>
                  <option value="featured">Featured (Xanh ngọc)</option>
                  <option value="new">New (Tím Indigo)</option>
                </select>
              </div>
            </div>

            {/* Image URL + Live Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                  <label
                    htmlFor="admin-prod-image"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    URL Ảnh đại diện chính *
                  </label>
                  <input
                    id="admin-prod-image"
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div className="w-20 h-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                  {formImage.trim() ? (
                    <img
                      src={formImage.trim()}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  )}
                </div>
              </div>

              {/* Gallery URLs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Bộ sưu tập ảnh phụ (Gallery URLs)
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormGallery((prev) => [...prev, ""])}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    + Thêm URL ảnh
                  </button>
                </div>
                {formGallery.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={url}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormGallery((prev) =>
                          prev.map((item, i) => (i === idx ? val : item)),
                        );
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    {url.trim() && (
                      <img
                        src={url.trim()}
                        alt={`Gallery ${idx + 1}`}
                        className="w-8 h-8 rounded object-cover border border-slate-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setFormGallery((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="admin-prod-desc"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Mô tả chi tiết sản phẩm *
              </label>
              <textarea
                id="admin-prod-desc"
                rows={3}
                required
                placeholder="Mô tả công năng, thiết kế và lợi ích nổi bật của sản phẩm..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            {/* Features & Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Features */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Đặc điểm nổi bật (Features)
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormFeatures((prev) => [...prev, ""])}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    + Thêm dòng
                  </button>
                </div>
                {formFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Điểm nổi bật #${idx + 1}`}
                      value={feat}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormFeatures((prev) =>
                          prev.map((item, i) => (i === idx ? val : item)),
                        );
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormFeatures((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Technical Specs */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Thông số kỹ thuật (Specs)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormSpecs((prev) => [...prev, { key: "", value: "" }])
                    }
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    + Thêm thông số
                  </button>
                </div>
                {formSpecs.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tên (vd: Công suất)"
                      value={row.key}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormSpecs((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, key: val } : item,
                          ),
                        );
                      }}
                      className="w-2/5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Giá trị (vd: 1800W)"
                      value={row.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormSpecs((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, value: val } : item,
                          ),
                        );
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormSpecs((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                onPress={() => setActiveTab("list")}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                isDisabled={isSubmittingForm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl cursor-pointer shadow-md shadow-emerald-600/20"
              >
                {isSubmittingForm
                  ? "Đang lưu..."
                  : editingProduct
                    ? "Lưu cập nhật sản phẩm"
                    : "Tạo sản phẩm mới"}
              </Button>
            </div>
          </form>
        )}

        {/* TAB 3: STOCK ADJUSTMENT & AUDIT LOG */}
        {activeTab === "stock" && stockTargetProduct && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <img
                  src={stockTargetProduct.image}
                  alt={stockTargetProduct.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <span className="font-mono text-xs text-slate-400">
                    {stockTargetProduct.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {stockTargetProduct.name}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">
                  Tồn kho hiện tại
                </span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {stockTargetProduct.stockQuantity ?? 0} sản phẩm
                </span>
              </div>
            </div>

            {/* Adjust Stock Form */}
            <form
              onSubmit={handleAdjustStockSubmit}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
            >
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-emerald-600" />
                <span>Tạo phiếu điều chỉnh tồn kho</span>
              </h4>

              {stockError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{stockError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="admin-stock-delta"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Số lượng thay đổi (+ nhập / - xuất) *
                  </label>
                  <input
                    id="admin-stock-delta"
                    type="number"
                    required
                    value={quantityChangeInput}
                    onChange={(e) => setQuantityChangeInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[+5, +10, +20, -1, -5, -10].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantityChangeInput(String(preset))}
                        className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300"
                      >
                        {preset > 0 ? `+${preset}` : preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="admin-stock-reason"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Lý do điều chỉnh kho (bắt buộc) *
                  </label>
                  <input
                    id="admin-stock-reason"
                    type="text"
                    required
                    placeholder="Nhập lý do nhập/xuất kho để lưu lịch sử kiểm toán..."
                    value={stockReasonInput}
                    onChange={(e) => setStockReasonInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {REASON_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setStockReasonInput(preset)}
                        className="px-2 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Tồn kho dự kiến sau điều chỉnh:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {(stockTargetProduct.stockQuantity ?? 0) +
                      (parseInt(quantityChangeInput, 10) || 0)}
                  </strong>
                </span>
                <Button
                  type="submit"
                  isDisabled={isSubmittingStock}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2 rounded-xl cursor-pointer"
                >
                  {isSubmittingStock
                    ? "Đang cập nhật..."
                    : "Xác nhận điều chỉnh kho"}
                </Button>
              </div>
            </form>

            {/* Audit History Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Lịch sử biến động tồn kho ({stockAdjustments.length})</span>
              </h4>

              {isLoadingHistory ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Đang tải lịch sử kiểm toán kho...</span>
                </div>
              ) : stockAdjustments.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">
                  Chưa có bản ghi điều chỉnh thủ công nào cho sản phẩm này.
                </p>
              ) : (
                <div className="space-y-2">
                  {stockAdjustments.map((adj) => (
                    <div
                      key={adj.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              adj.quantityChange > 0
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            }`}
                          >
                            {adj.quantityChange > 0
                              ? `+${adj.quantityChange}`
                              : adj.quantityChange}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {adj.previousQuantity} → {adj.newQuantity} sản phẩm
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          Lý do: <strong>{adj.reason}</strong>
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-slate-400">
                        <div>Thực hiện: {adj.adjustedBy}</div>
                        <div>{formatDate(adj.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CREATE NEW CATEGORY */}
        {activeTab === "category" && (
          <form
            onSubmit={handleCreateCategorySubmit}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 max-w-xl mx-auto w-full"
          >
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm danh mục sản phẩm mới
              </h3>
            </div>

            {categoryError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{categoryError}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="admin-cat-name"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Tên danh mục *
              </label>
              <input
                id="admin-cat-name"
                type="text"
                required
                placeholder="Ví dụ: Thiết bị phòng tắm thông minh"
                value={catName}
                onChange={(e) => {
                  const val = e.target.value;
                  setCatName(val);
                  if (!catSlug) {
                    setCatSlug(
                      val
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[đĐ]/g, "d")
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, ""),
                    );
                  }
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label
                htmlFor="admin-cat-slug"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Slug định danh (URL-friendly) *
              </label>
              <input
                id="admin-cat-slug"
                type="text"
                required
                placeholder="Ví dụ: bathroom"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="admin-cat-image"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                URL ảnh đại diện danh mục *
              </label>
              <input
                id="admin-cat-image"
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={catImage}
                onChange={(e) => setCatImage(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label
                htmlFor="admin-cat-desc"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Mô tả ngắn
              </label>
              <textarea
                id="admin-cat-desc"
                rows={3}
                placeholder="Mô tả ngắn gọn về dòng thiết bị trong danh mục này..."
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                onPress={() => setActiveTab("list")}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                isDisabled={isSubmittingCategory}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmittingCategory ? "Đang tạo..." : "Tạo danh mục"}
                </span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
