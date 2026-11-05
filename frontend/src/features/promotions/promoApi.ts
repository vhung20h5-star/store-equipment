import { FlashSalePromotion, ValidatePromotionResult } from "@/types";
import { API_BASE_URL, ApiError, handleResponse } from "@/services/httpClient";

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
): Promise<ValidatePromotionResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/promotions/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code }),
    });

    return await handleResponse<ValidatePromotionResult>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể kiểm tra mã giảm giá.");
  }
}

