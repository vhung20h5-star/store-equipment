import { Category, Product, ApiResponse, PageResponse } from "@/types";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  "http://localhost:8080/api/v1";

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
