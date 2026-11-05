import { Category, Product, PageResponse } from "@/types";
import { API_BASE_URL, ApiError, handleResponse } from "@/services/httpClient";

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

