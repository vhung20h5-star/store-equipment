import {
  Category,
  Product,
  ApiResponse,
  PageResponse,
  Testimonial,
  FlashSalePromotion,
  ValidatePromotionResult,
  NewsletterResponse,
  CreateOrderRequest,
  OrderResponse,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ServerCartResponse,
} from "@/types";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  "http://localhost:8080/api/v1";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem("homenest_token");
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem("homenest_token", token);
    } else {
      localStorage.removeItem("homenest_token");
    }
  } catch (e) {
    console.error(e);
  }
}

function getAuthHeaders(
  extraHeaders: Record<string, string> = {},
): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...extraHeaders };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `Lỗi yêu cầu: ${response.status} ${response.statusText}`;

    try {
      const errorJson = (await response.json()) as ApiResponse<unknown>;

      if (errorJson && errorJson.message) {
        errorMsg = errorJson.message;
      }
    } catch {
      // Ignore if response body is not JSON
    }
    throw new ApiError(errorMsg, response.status);
  }

  const result = (await response.json()) as ApiResponse<T>;

  if (!result.success && result.message) {
    throw new ApiError(result.message);
  }

  return result.data;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    return await handleResponse<Category[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc máy chủ backend.",
    );
  }
}

export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/categories/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    return await handleResponse<Category>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Không tìm thấy danh mục: ${slug}`);
  }
}

export interface FetchProductsParams {
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export async function fetchProducts(
  params: FetchProductsParams = {},
): Promise<PageResponse<Product>> {
  const query = new URLSearchParams();

  if (params.category && params.category !== "all") {
    query.set("category", params.category);
  }
  if (params.search && params.search.trim().length > 0) {
    query.set("search", params.search.trim());
  }
  if (params.page !== undefined && params.page >= 0) {
    query.set("page", params.page.toString());
  }
  if (params.size !== undefined && params.size > 0) {
    query.set("size", params.size.toString());
  }
  if (params.sort) {
    query.set("sort", params.sort);
  }

  const url = `${API_BASE_URL}/products${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    return await handleResponse<PageResponse<Product>>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Không thể tải danh sách sản phẩm từ máy chủ. Vui lòng thử lại sau.",
    );
  }
}

export async function fetchProductById(id: string): Promise<Product> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/products/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    return await handleResponse<Product>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Không tìm thấy sản phẩm với mã: ${id}`);
  }
}

export async function fetchBestsellers(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/bestsellers`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    return await handleResponse<Product[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tải danh sách sản phẩm bán chạy.");
  }
}

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

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/testimonials`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    return await handleResponse<Testimonial[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tải đánh giá từ khách hàng.");
  }
}

export async function subscribeNewsletter(
  email: string,
): Promise<NewsletterResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return await handleResponse<NewsletterResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể gửi thông tin đăng ký nhận tin.");
  }
}

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

// ===== Authentication APIs =====

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    const authRes = await handleResponse<AuthResponse>(res);

    setAuthToken(authRes.token);

    return authRes;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
  }
}

export async function registerApi(
  data: RegisterRequest,
): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    const authRes = await handleResponse<AuthResponse>(res);

    setAuthToken(authRes.token);

    return authRes;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Đăng ký tài khoản không thành công.");
  }
}

export async function fetchCurrentUser(): Promise<User> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getAuthHeaders({
        Accept: "application/json",
      }),
    });

    return await handleResponse<User>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể lấy thông tin tài khoản.");
  }
}

export async function updateProfileApi(
  data: UpdateProfileRequest,
): Promise<User> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify(data),
    });

    return await handleResponse<User>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể cập nhật hồ sơ người dùng.");
  }
}

// ===== Server Persistent Cart APIs =====

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



