import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import {
  X,
  Ticket,
  Plus,
  Flame,
  Edit3,
  Power,
  Crown,
} from "lucide-react";

import { useShop } from "@/context/ShopContext";
import {
  createAdminPromotion,
  fetchAdminPromotions,
  toggleAdminPromotion,
  triggerAdminEventPreset,
  updateAdminPromotion,
} from "@/services/api";
import { CreatePromotionPayload, VoucherItem } from "@/types";

export const AdminPromotionModal: React.FC = () => {
  const {
    isAdminPromotionsOpen,
    setIsAdminPromotionsOpen,
    currentUser,
    showToast,
  } = useShop();

  const [promotions, setPromotions] = useState<VoucherItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState("DOUBLE_DAY");
  const [eventTag, setEventTag] = useState("11/11 Siêu Sale Ngày Đôi");
  const [discountPercent, setDiscountPercent] = useState<number>(35);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(1000000);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(1500000);
  const [totalQuantity, setTotalQuantity] = useState<number>(50);
  const [vipOnly, setVipOnly] = useState(false);

  const loadPromotions = useCallback(async () => {
    if (!isAdminPromotionsOpen || currentUser?.role !== "ROLE_ADMIN") return;
    setIsLoading(true);
    try {
      const data = await fetchAdminPromotions();
      setPromotions(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể tải danh sách voucher.";
      showToast("Lỗi tải dữ liệu", msg, "warning");
    } finally {
      setIsLoading(false);
    }
  }, [isAdminPromotionsOpen, currentUser, showToast]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  if (!isAdminPromotionsOpen || currentUser?.role !== "ROLE_ADMIN") return null;

  const formatPrice = (val?: number | null) =>
    val
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(val)
      : "0đ";

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setTitle("");
    setDescription("");
    setCampaignType("DOUBLE_DAY");
    setEventTag("11/11 Siêu Sale Ngày Đôi");
    setDiscountPercent(35);
    setMaxDiscountAmount(1000000);
    setMinOrderAmount(1500000);
    setTotalQuantity(50);
    setVipOnly(false);
  };

  const handleOpenEdit = (item: VoucherItem) => {
    setEditingId(item.id);
    setCode(item.code);
    setTitle(item.title);
    setDescription(item.description || "");
    setCampaignType(item.campaignType || "DAILY");
    setEventTag(item.eventTag || "");
    setDiscountPercent(item.discountPercent);
    setMaxDiscountAmount(item.maxDiscountAmount || 500000);
    setMinOrderAmount(item.minOrderAmount || 0);
    setTotalQuantity(item.totalQuantity || 100);
    setVipOnly(Boolean(item.vipOnly));
    setShowForm(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      showToast("Thiếu thông tin", "Vui lòng nhập mã và tiêu đề voucher.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreatePromotionPayload = {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        campaignType,
        eventTag: eventTag.trim(),
        discountPercent: Number(discountPercent),
        maxDiscountAmount: Number(maxDiscountAmount),
        minOrderAmount: Number(minOrderAmount),
        totalQuantity: Number(totalQuantity) > 0 ? Number(totalQuantity) : null,
        vipOnly: campaignType === "VIP_ONLY" ? true : vipOnly,
        requiresClaim: true,
        isActive: true,
      };

      if (editingId) {
        await updateAdminPromotion(editingId, payload);
        showToast("Đã cập nhật voucher!", `Mã ${payload.code} đã được lưu.`, "success");
      } else {
        await createAdminPromotion(payload);
        showToast("Đã tạo voucher mới!", `Mã ${payload.code} đã sẵn sàng phát hành.`, "success");
      }

      await loadPromotions();
      window.dispatchEvent(new Event("homenest:vouchers-updated"));
      setShowForm(false);
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể lưu voucher.";
      showToast("Lỗi lưu voucher", msg, "warning");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item: VoucherItem) => {
    try {
      await toggleAdminPromotion(item.id);
      await loadPromotions();
      window.dispatchEvent(new Event("homenest:vouchers-updated"));
      showToast(
        "Đã đổi trạng thái",
        `Mã ${item.code} đã ${item.isActive ? "tạm ẩn" : "mở phát hành"}.`,
        "info",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể đổi trạng thái.";
      showToast("Lỗi", msg, "warning");
    }
  };

  const handleTriggerPreset = async (preset: string, label: string) => {
    try {
      const list = await triggerAdminEventPreset(preset);
      setPromotions(list);
      window.dispatchEvent(new Event("homenest:vouchers-updated"));
      showToast(
        "Đã kích hoạt sự kiện!",
        `Chiến dịch "${label}" đã được mở và nạp lại số lượng mã!`,
        "success",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể kích hoạt sự kiện.";
      showToast("Lỗi", msg, "warning");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        role="presentation"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsAdminPromotionsOpen(false)}
      />

      <div className="relative z-10 w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Quản Trị Voucher & Chiến Dịch Sự Kiện (Admin)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Điều phối các đợt săn mã Ngày Đôi (10/10, 11/11, 12/12), Lễ Tết, Ngày thường và Đặc quyền VIP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              onPress={() => {
                resetForm();
                setShowForm(!showForm);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>{showForm ? "Đóng form" : "Tạo Voucher Mới"}</span>
            </Button>

            <button
              type="button"
              onClick={() => setIsAdminPromotionsOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Event Preset Triggers */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border border-rose-200/70 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              <Flame className="w-4 h-4" />
              <span>Kích Hoạt Nhanh Đợt Sự Kiện (Demo / Làm Mới Kho Mã)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "DOUBLE_1010", label: "🔥 Mở Đợt 10/10 (-35%)" },
                { id: "DOUBLE_1111", label: "🔥 Mở Đợt 11/11 (-40%)" },
                { id: "DOUBLE_1212", label: "🔥 Mở Đợt 12/12 (-45%)" },
                { id: "HOLIDAY_TET", label: "🎉 Mở Đợt Đại Lễ & Tết (-35%)" },
                { id: "DAILY_REFRESH", label: "☀️ Làm Mới Mã Ngày Thường" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleTriggerPreset(preset.id, preset.label)}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-rose-500 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Create / Edit Form */}
          {showForm && (
            <form
              onSubmit={handleSubmitForm}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-4"
            >
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {editingId
                  ? `Chỉnh sửa Voucher (${code})`
                  : "Tạo Chương Trình Voucher Mới"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Mã Voucher (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="VD: SALE1111"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Loại Chiến Dịch *
                  </label>
                  <select
                    value={campaignType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCampaignType(val);
                      if (val === "VIP_ONLY") setVipOnly(true);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="DOUBLE_DAY">
                      Ngày Đôi (10/10, 11/11, 12/12 - Giảm sâu, SL ít)
                    </option>
                    <option value="HOLIDAY">
                      Ngày Lễ Lớn (Tết, 30/4 - Giảm sâu, SL ít)
                    </option>
                    <option value="DAILY">
                      Ngày Thường (Giảm vừa phải, SL nhiều)
                    </option>
                    <option value="VIP_ONLY">
                      Đặc Quyền Hội Viên VIP
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Nhãn Sự Kiện (Event Tag)
                  </label>
                  <input
                    type="text"
                    value={eventTag}
                    onChange={(e) => setEventTag(e.target.value)}
                    placeholder="VD: 11/11 Siêu Sale Ngày Đôi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Tiêu đề hiển thị *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Siêu Sale 11/11 – Giảm Sâu 40%"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Mô tả chi tiết
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả điều kiện & quyền lợi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Mức giảm (%) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    required
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Giảm tối đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={maxDiscountAmount}
                    onChange={(e) =>
                      setMaxDiscountAmount(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Đơn tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Giới hạn lượt Lưu
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vipOnly || campaignType === "VIP_ONLY"}
                    onChange={(e) => setVipOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span>Chỉ dành riêng cho Hội viên VIP (VIP Only)</span>
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onPress={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isDisabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer"
                  >
                    {isSaving
                      ? "Đang lưu..."
                      : editingId
                        ? "Lưu thay đổi"
                        : "Phát hành Voucher"}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Voucher Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Danh sách các chương trình Voucher ({promotions.length})
            </h3>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {promotions.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      item.isActive
                        ? "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700"
                        : "bg-slate-100/70 dark:bg-slate-800/30 border-slate-200/50 opacity-60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400">
                          {item.code}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                          -{item.discountPercent}%
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          [{item.eventTag || item.campaignType}]
                        </span>
                        {item.vipOnly && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                            <Crown className="w-3 h-3" /> VIP
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Đơn tối thiểu: {formatPrice(item.minOrderAmount)} • Giảm
                        tối đa: {formatPrice(item.maxDiscountAmount)} • Đã lưu:{" "}
                        <strong>
                          {item.claimedQuantity}/
                          {item.totalQuantity ?? "Không giới hạn"}
                        </strong>{" "}
                        • Đã dùng: <strong>{item.usedQuantity}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => handleOpenEdit(item)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => handleToggleActive(item)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer ${
                          item.isActive
                            ? "text-rose-600 border-rose-200"
                            : "text-emerald-600 border-emerald-200"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{item.isActive ? "Tạm ẩn" : "Mở lại"}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
