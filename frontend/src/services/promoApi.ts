import {
  CreatePromotionPayload,
  FlashSalePromotion,
  ValidatePromotionResult,
  VipStatusResponse,
  VoucherItem,
} from "@/types";
import {
  API_BASE_URL,
  ApiError,
  getAuthHeaders,
  handleResponse,
} from "@/services/httpClient";

export const FALLBACK_VOUCHERS: VoucherItem[] = [
  {
    id: "promo-double-1111",
    code: "MEGA1111",
    title: "Siêu Sale 11/11 – Giảm Sâu 40%",
    description:
      "Voucher đặc biệt đợt 11/11 giảm tới 40% (tối đa 1.200.000đ) cho đơn từ 2.000.000đ. Số lượng phát hành cực kỳ giới hạn!",
    discountPercent: 40,
    maxDiscountAmount: 1200000,
    minOrderAmount: 2000000,
    campaignType: "DOUBLE_DAY",
    eventTag: "11/11 Siêu Sale Ngày Đôi",
    totalQuantity: 50,
    claimedQuantity: 42,
    remainingQuantity: 8,
    usedQuantity: 18,
    vipOnly: false,
    requiresClaim: true,
    startTime: "2026-01-01T00:00:00",
    endTime: "2027-12-31T23:59:59",
    isActive: true,
    claimed: false,
    userVoucherStatus: null,
  },
  {
    id: "promo-double-1010",
    code: "SALE1010",
    title: "Đại Tiệc 10/10 – Giảm Sốc 35%",
    description:
      "Săn mã ngày đôi 10/10 giảm ngay 35% (tối đa 900.000đ) cho đơn hàng thiết bị gia dụng từ 1.500.000đ.",
    discountPercent: 35,
    maxDiscountAmount: 900000,
    minOrderAmount: 1500000,
    campaignType: "DOUBLE_DAY",
    eventTag: "10/10 Đại Tiệc Ngày Đôi",
    totalQuantity: 60,
    claimedQuantity: 52,
    remainingQuantity: 8,
    usedQuantity: 24,
    vipOnly: false,
    requiresClaim: true,
    startTime: "2026-01-01T00:00:00",
    endTime: "2027-12-31T23:59:59",
    isActive: true,
    claimed: false,
    userVoucherStatus: null,
  },
  {
    id: "promo-double-1212",
    code: "SALE1212",
    title: "Lễ Hội 12/12 – Ưu Đãi Đỉnh Điểm 45%",
    description:
      "Siêu voucher ngày đôi 12/12 giảm tới 45% (tối đa 1.500.000đ) cho đơn hàng từ 3.000.000đ. Chỉ 30 suất duy nhất!",
    discountPercent: 45,
    maxDiscountAmount: 1500000,
    minOrderAmount: 3000000,
    campaignType: "DOUBLE_DAY",
    eventTag: "12/12 Sale Cuối Năm",
    totalQuantity: 30,
    claimedQuantity: 26,
    remainingQuantity: 4,
    usedQuantity: 12,
    vipOnly: false,
    requiresClaim: true,
    startTime: "2026-01-01T00:00:00",
    endTime: "2027-12-31T23:59:59",
    isActive: true,
    claimed: false,
    userVoucherStatus: null,
  },
  {
    id: "promo-holiday-tet",
    code: "LEHOI35",
    title: "Mừng Đại Lễ & Tết – Giảm 35%",
    description:
      "Ưu đãi dịp Lễ lớn tân trang tổ ấm: Giảm 35% (tối đa 1.000.000đ) cho đơn từ 2.000.000đ.",
    discountPercent: 35,
    maxDiscountAmount: 1000000,
    minOrderAmount: 2000000,
    campaignType: "HOLIDAY",
    eventTag: "Đặc Biệt Ngày Lễ",
    totalQuantity: 80,
    claimedQuantity: 68,
    remainingQuantity: 12,
    usedQuantity: 30,
    vipOnly: false,
    requiresClaim: true,
    startTime: "2026-01-01T00:00:00",
    endTime: "2027-12-31T23:59:59",
    isActive: true,
    claimed: false,
    userVoucherStatus: null,
  },
  {
    id: "promo-holiday-25",
    code: "NGAYLE25",
    title: "Tuần Lễ Vàng Ngày Lễ – Giảm 25%",
    description:
      "Tri ân khách hàng dịp lễ: Giảm 25% (tối đa 600.000đ) cho mọi đơn hàng từ 1.000.000đ.",
    discountPercent: 25,
    maxDiscountAmount: 600000,
    minOrderAmount: 1000000,
    campaignType: "HOLIDAY",
    eventTag: "Đặc Biệt Ngày Lễ",
    totalQuantity: 100,
    claimedQuantity: 74,
    remainingQuantity: 26,
    usedQuantity: 40,
    vipOnly: false,
    requiresClaim: true,
    startTime: "2026-01-01T00:00:00",
    endTime: "2027-12-31T23:59:59",
    isActive: true,
    claimed: false,
    userVoucherStatus: null,
  },
  {
    id: "promo-daily-10",
    code: "DAILY10",
    title: "Ưu Đãi Ngày Thường – Giảm 10%",
    description:
      "Mã giảm giá hàng ngày dành cho mọi khách hàng: Giảm 10% (tối đa 150.000đ) cho đơn từ 500.000đ.",
    discountPercent: 10,
    maxDiscountAmount: 150000,
    minOrderAmount: 500000,
    campaignType: "DAILY",
    eventTag: "Ưu Đãi Hàng Ngày",
    totalQuantity: 500,
    claimedQuantity: 145,
    remainingQuantity: 355,
    usedQuantity: 80,
    vipOnly: false,
    requiresClaim: true,
    startTime: "2026-01-01T00:00:00",
    endTime: "2027-12-31T23:59:59",
    isActive: true,
    claimed: false,
    userVoucherStatus: null,
  },
  {
    id: "promo-daily-12",
    code: "DAILY12",
    title: "Tiện Nghi Mỗi Ngày – Giảm 12%",
    description:
      "Voucher mua sắm ngày thường tiết kiệm 12% (tối đa 250.000đ) cho đơn từ 1.200.000đ.",
    discountPercent: 12,
    maxDiscountAmount: 250000,
    minOrderAmount: 1200000,
    campaignType: "DAILY",
    eventTag: "Ưu Đãi Hàng Ngày",
    totalQuantity: 300,
    claimedQuantity: 92,
    remainingQuantity: 208,
    usedQuantity: 45,
    vipOnly: false,
    requiresClaim: true,
    startTime: "2026-01-01T00:00:00",
    endTime: "2027-12-31T23:59:59",
    isActive: true,
    claimed: false,
    userVoucherStatus: null,
  },
  {
    id: "promo-vip-25",
    code: "VIPCLUB25",
    title: "Đặc Quyền Hội Viên VIP – Giảm 25%",
    description:
      "Voucher độc quyền dành riêng cho Hội viên VIP Tháng & VIP Năm: Giảm 25% (tối đa 800.000đ) cho đơn từ 1.000.000đ, cộng dồn thêm ưu đãi % hạng thẻ VIP!",
    discountPercent: 25,
    maxDiscountAmount: 800000,
    minOrderAmount: 1000000,
    campaignType: "VIP_ONLY",
    eventTag: "Đặc Quyền Hội Viên VIP",
    totalQuantity: 200,
    claimedQuantity: 35,
    remainingQuantity: 165,
    usedQuantity: 15,
    vipOnly: true,
    requiresClaim: true,
    startTime: "2026-01-01T00:00:00",
    endTime: "2027-12-31T23:59:59",
    isActive: true,
    claimed: false,
    userVoucherStatus: null,
  },
  {
    id: "promo-vip-35",
    code: "VIPDIAMOND35",
    title: "Siêu Đặc Quyền VIP – Giảm 35%",
    description:
      "Mã giảm giá sâu dành riêng cho thành viên VIP HomeNest: Giảm 35% (tối đa 1.500.000đ) cho đơn từ 2.500.000đ.",
    discountPercent: 35,
    maxDiscountAmount: 1500000,
    minOrderAmount: 2500000,
    campaignType: "VIP_ONLY",
    eventTag: "Đặc Quyền Hội Viên VIP",
    totalQuantity: 100,
    claimedQuantity: 28,
    remainingQuantity: 72,
    usedQuantity: 10,
    vipOnly: true,
    requiresClaim: true,
    startTime: "2026-01-01T00:00:00",
    endTime: "2027-12-31T23:59:59",
    isActive: true,
    claimed: false,
    userVoucherStatus: null,
  },
];

export const FALLBACK_VIP_STATUS: VipStatusResponse = {
  active: false,
  tier: "NONE",
  directDiscountPercent: 0,
  maxDiscountPerOrder: 0,
  plans: [
    {
      id: "MONTHLY",
      name: "HomeNest VIP Tháng",
      badge: "Linh hoạt",
      price: 99000,
      originalPrice: 149000,
      durationDays: 30,
      directDiscountPercent: 5,
      maxDiscountPerOrder: 300000,
      benefits: [
        "Giảm trực tiếp thêm 5% (tối đa 300.000đ) cho mọi đơn hàng",
        "Cộng dồn trực tiếp với mã Voucher sự kiện 10/10, 11/11, Lễ Tết",
        "Mở khóa lưu & sử dụng kho Voucher Độc Quyền VIP giảm đến 35%",
        "Tặng ngay bộ mã VIPCLUB25 & VIPDIAMOND35 vào Kho Voucher cá nhân",
      ],
      giftVoucherCodes: ["VIPCLUB25", "VIPDIAMOND35"],
    },
    {
      id: "YEARLY",
      name: "HomeNest VIP Năm (Gold)",
      badge: "Tiết kiệm 25% • Phổ biến nhất",
      price: 890000,
      originalPrice: 1188000,
      durationDays: 365,
      directDiscountPercent: 8,
      maxDiscountPerOrder: 600000,
      benefits: [
        "Giảm trực tiếp thêm 8% (tối đa 600.000đ) cho mọi đơn hàng suốt 365 ngày",
        "Cộng dồn 2 tầng ưu đãi: Trừ Voucher trước + Trừ thêm 8% đặc quyền VIP Năm",
        "Toàn quyền săn mọi mã Voucher Độc Quyền VIP & Ưu tiên sự kiện Ngày Đôi",
        "Tặng ngay trọn bộ mã VIP giảm sâu vào Kho Voucher & Huy hiệu VIP Gold",
      ],
      giftVoucherCodes: ["VIPCLUB25", "VIPDIAMOND35"],
    },
  ],
  subscriptions: [],
};

export async function fetchFlashSale(): Promise<FlashSalePromotion> {
  try {
    const res = await fetch(`${API_BASE_URL}/promotions/flash-sale`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    return await handleResponse<FlashSalePromotion>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tải thông tin khuyến mãi Flash Sale.");
  }
}

export async function validatePromotionCode(
  code: string,
  orderSubtotal?: number,
): Promise<ValidatePromotionResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/promotions/validate`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({ code, orderSubtotal }),
    });

    return await handleResponse<ValidatePromotionResult>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể kiểm tra mã giảm giá.");
  }
}

export async function fetchPublicVouchers(
  campaignType?: string,
): Promise<VoucherItem[]> {
  try {
    const query =
      campaignType && campaignType !== "ALL"
        ? `?campaignType=${encodeURIComponent(campaignType)}`
        : "";
    const res = await fetch(`${API_BASE_URL}/promotions/vouchers${query}`, {
      method: "GET",
      headers: getAuthHeaders({ Accept: "application/json" }),
    });

    return await handleResponse<VoucherItem[]>(res);
  } catch {
    if (!campaignType || campaignType === "ALL") {
      return FALLBACK_VOUCHERS;
    }
    return FALLBACK_VOUCHERS.filter((v) => v.campaignType === campaignType);
  }
}

export async function fetchMyVouchers(): Promise<VoucherItem[]> {
  const res = await fetch(`${API_BASE_URL}/promotions/my-vouchers`, {
    method: "GET",
    headers: getAuthHeaders({ Accept: "application/json" }),
  });

  return await handleResponse<VoucherItem[]>(res);
}

export async function claimVoucherApi(codeOrId: string): Promise<VoucherItem> {
  const res = await fetch(
    `${API_BASE_URL}/promotions/vouchers/${encodeURIComponent(codeOrId)}/claim`,
    {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
    },
  );

  return await handleResponse<VoucherItem>(res);
}

export async function fetchVipStatus(): Promise<VipStatusResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/promotions/vip`, {
      method: "GET",
      headers: getAuthHeaders({ Accept: "application/json" }),
    });

    return await handleResponse<VipStatusResponse>(res);
  } catch {
    return FALLBACK_VIP_STATUS;
  }
}

export async function subscribeVipApi(
  planType: string,
  paymentMethod: string = "QR_INSTANT",
): Promise<VipStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/promotions/vip/subscribe`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    body: JSON.stringify({ planType, paymentMethod }),
  });

  return await handleResponse<VipStatusResponse>(res);
}

export async function fetchAdminPromotions(): Promise<VoucherItem[]> {
  const res = await fetch(`${API_BASE_URL}/admin/promotions`, {
    method: "GET",
    headers: getAuthHeaders({ Accept: "application/json" }),
  });

  return await handleResponse<VoucherItem[]>(res);
}

export async function createAdminPromotion(
  payload: CreatePromotionPayload,
): Promise<VoucherItem> {
  const res = await fetch(`${API_BASE_URL}/admin/promotions`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return await handleResponse<VoucherItem>(res);
}

export async function updateAdminPromotion(
  id: string,
  payload: CreatePromotionPayload,
): Promise<VoucherItem> {
  const res = await fetch(
    `${API_BASE_URL}/admin/promotions/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify(payload),
    },
  );

  return await handleResponse<VoucherItem>(res);
}

export async function toggleAdminPromotion(id: string): Promise<VoucherItem> {
  const res = await fetch(
    `${API_BASE_URL}/admin/promotions/${encodeURIComponent(id)}/toggle`,
    {
      method: "PATCH",
      headers: getAuthHeaders({ Accept: "application/json" }),
    },
  );

  return await handleResponse<VoucherItem>(res);
}

export async function triggerAdminEventPreset(
  eventPreset: string,
): Promise<VoucherItem[]> {
  const res = await fetch(`${API_BASE_URL}/admin/promotions/trigger-event`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    body: JSON.stringify({ eventPreset }),
  });

  return await handleResponse<VoucherItem[]>(res);
}
