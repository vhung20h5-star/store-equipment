import { ServerCartResponse } from "@/types";
import {
  API_BASE_URL,
  ApiError,
  getAuthHeaders,
  handleResponse,
} from "@/services/httpClient";

export async function fetchServerCart(): Promise<ServerCartResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: "GET",
      headers: getAuthHeaders({
        Accept: "application/json",
      }),
    });

    return await handleResponse<ServerCartResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tải giỏ hàng từ máy chủ.");
  }
}

export async function addServerCartItem(
  productId: string,
  quantity = 1,
): Promise<ServerCartResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/items`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({ productId, quantity }),
    });

    return await handleResponse<ServerCartResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể thêm sản phẩm vào giỏ hàng trên máy chủ.");
  }
}

export async function updateServerCartItem(
  productId: string,
  quantity: number,
): Promise<ServerCartResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/cart/items/${encodeURIComponent(productId)}`,
      {
        method: "PUT",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
        body: JSON.stringify({ quantity }),
      },
    );

    return await handleResponse<ServerCartResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể cập nhật giỏ hàng trên máy chủ.");
  }
}

export async function removeServerCartItem(
  productId: string,
): Promise<ServerCartResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/cart/items/${encodeURIComponent(productId)}`,
      {
        method: "DELETE",
        headers: getAuthHeaders({
          Accept: "application/json",
        }),
      },
    );

    return await handleResponse<ServerCartResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể xóa sản phẩm khỏi giỏ hàng trên máy chủ.");
  }
}

export async function clearServerCart(): Promise<ServerCartResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: "DELETE",
      headers: getAuthHeaders({
        Accept: "application/json",
      }),
    });

    return await handleResponse<ServerCartResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể làm trống giỏ hàng trên máy chủ.");
  }
}

export async function syncServerCart(
  items: { productId: string; quantity: number }[],
): Promise<ServerCartResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/sync`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({ items }),
    });

    return await handleResponse<ServerCartResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể đồng bộ giỏ hàng lên máy chủ.");
  }
}

