import {
  CancelOrderRequest,
  CreateOrderRequest,
  OrderResponse,
  OrderStatus,
  PageResponse,
  UpdateOrderStatusRequest,
} from "@/types";
import {
  API_BASE_URL,
  ApiError,
  getAuthHeaders,
  handleResponse,
} from "@/services/httpClient";

export async function createOrder(
  data: CreateOrderRequest,
): Promise<OrderResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
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

export async function getMyOrders(
  status?: OrderStatus,
): Promise<OrderResponse[]> {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const res = await fetch(`${API_BASE_URL}/orders/my-orders${query}`, {
      method: "GET",
      headers: getAuthHeaders({
        Accept: "application/json",
      }),
    });

    return await handleResponse<OrderResponse[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tải danh sách đơn hàng của bạn.");
  }
}

export async function cancelOrder(
  orderNumber: string,
  data: CancelOrderRequest,
): Promise<OrderResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/orders/${encodeURIComponent(orderNumber)}/cancel`,
      {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
        body: JSON.stringify(data),
      },
    );

    return await handleResponse<OrderResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
  }
}

export async function getAdminOrders(params?: {
  status?: OrderStatus;
  search?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<OrderResponse>> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.status) searchParams.set("status", params.status);
    if (params?.search?.trim()) searchParams.set("search", params.search.trim());
    if (params?.page !== undefined) searchParams.set("page", String(params.page));
    if (params?.size !== undefined) searchParams.set("size", String(params.size));

    const qs = searchParams.toString();
    const res = await fetch(
      `${API_BASE_URL}/admin/orders${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
        headers: getAuthHeaders({
          Accept: "application/json",
        }),
      },
    );

    return await handleResponse<PageResponse<OrderResponse>>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tải danh sách đơn hàng quản trị.");
  }
}

export async function updateOrderStatusAdmin(
  orderNumber: string,
  data: UpdateOrderStatusRequest,
): Promise<OrderResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/orders/${encodeURIComponent(orderNumber)}/status`,
      {
        method: "PATCH",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
        body: JSON.stringify(data),
      },
    );

    return await handleResponse<OrderResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể cập nhật trạng thái đơn hàng.");
  }
}
