import { CreateOrderRequest, OrderResponse } from "@/types";
import { API_BASE_URL, ApiError, handleResponse } from "@/services/httpClient";

export async function createOrder(
  data: CreateOrderRequest,
): Promise<OrderResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    return await handleResponse<OrderResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tạo đơn hàng. Vui lòng thử lại sau.");
  }
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<OrderResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/orders/${encodeURIComponent(orderNumber)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    return await handleResponse<OrderResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Không tìm thấy đơn hàng mã ${orderNumber}.`);
  }
}

export async function lookupOrdersByPhone(
  phone: string,
): Promise<OrderResponse[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/orders/lookup?phone=${encodeURIComponent(phone)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    return await handleResponse<OrderResponse[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tra cứu đơn hàng theo số điện thoại.");
  }
}

