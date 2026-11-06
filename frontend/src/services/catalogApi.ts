import {
  AdjustStockRequest,
  Category,
  CreateCategoryRequest,
  CreateProductRequest,
  InventoryAdjustment,
  PageResponse,
  Product,
  UpdateProductRequest,
} from "@/types";
import {
  API_BASE_URL,
  ApiError,
  getAuthHeaders,
  handleResponse,
} from "@/services/httpClient";

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

export interface AdminProductsFilterParams {
  category?: string;
  search?: string;
  isActive?: boolean;
  inStock?: boolean;
  page?: number;
  size?: number;
}

export async function getAdminProducts(
  params: AdminProductsFilterParams = {},
): Promise<PageResponse<Product>> {
  try {
    const query = new URLSearchParams();

    if (params.category && params.category !== "all") {
      query.set("category", params.category);
    }
    if (params.search && params.search.trim().length > 0) {
      query.set("search", params.search.trim());
    }
    if (params.isActive !== undefined) {
      query.set("isActive", String(params.isActive));
    }
    if (params.inStock !== undefined) {
      query.set("inStock", String(params.inStock));
    }
    if (params.page !== undefined && params.page >= 0) {
      query.set("page", String(params.page));
    }
    if (params.size !== undefined && params.size > 0) {
      query.set("size", String(params.size));
    }

    const qs = query.toString();
    const res = await fetch(
      `${API_BASE_URL}/admin/products${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
        headers: getAuthHeaders({
          Accept: "application/json",
        }),
      },
    );

    return await handleResponse<PageResponse<Product>>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tải danh sách sản phẩm quản trị.");
  }
}

export async function createProductAdmin(
  data: CreateProductRequest,
): Promise<Product> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/products`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify(data),
    });

    return await handleResponse<Product>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tạo sản phẩm mới.");
  }
}

export async function updateProductAdmin(
  id: string,
  data: UpdateProductRequest,
): Promise<Product> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/products/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
        body: JSON.stringify(data),
      },
    );

    return await handleResponse<Product>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể cập nhật thông tin sản phẩm.");
  }
}

export async function updateProductVisibilityAdmin(
  id: string,
  isActive: boolean,
): Promise<Product> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/products/${encodeURIComponent(id)}/visibility`,
      {
        method: "PATCH",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
        body: JSON.stringify({ isActive }),
      },
    );

    return await handleResponse<Product>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể cập nhật trạng thái hiển thị sản phẩm.");
  }
}

export async function adjustProductStockAdmin(
  id: string,
  data: AdjustStockRequest,
): Promise<InventoryAdjustment> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/products/${encodeURIComponent(id)}/stock-adjustments`,
      {
        method: "POST",
        headers: getAuthHeaders({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
        body: JSON.stringify(data),
      },
    );

    return await handleResponse<InventoryAdjustment>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể điều chỉnh tồn kho sản phẩm.");
  }
}

export async function getProductStockAdjustmentsAdmin(
  id: string,
): Promise<InventoryAdjustment[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/products/${encodeURIComponent(id)}/stock-adjustments`,
      {
        method: "GET",
        headers: getAuthHeaders({
          Accept: "application/json",
        }),
      },
    );

    return await handleResponse<InventoryAdjustment[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tải lịch sử điều chỉnh tồn kho.");
  }
}

export async function createCategoryAdmin(
  data: CreateCategoryRequest,
): Promise<Category> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify(data),
    });

    return await handleResponse<Category>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Không thể tạo danh mục mới.");
  }
}
