import { ApiResponse } from "@/types";
import { getAuthToken } from "@/services/tokenStorage";

export const API_BASE_URL: string =
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

export function getAuthHeaders(
  extraHeaders: Record<string, string> = {},
): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...extraHeaders };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function handleResponse<T>(response: Response): Promise<T> {
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

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { requiresAuth = false, headers = {}, ...restOptions } = options;

  const resolvedHeaders = requiresAuth
    ? getAuthHeaders(headers as Record<string, string>)
    : { Accept: "application/json", ...(headers as Record<string, string>) };

  if (
    restOptions.body &&
    typeof restOptions.body === "string" &&
    !resolvedHeaders["Content-Type"]
  ) {
    resolvedHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: resolvedHeaders,
  });

  return handleResponse<T>(res);
}

