import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "@/types";
import {
  API_BASE_URL,
  ApiError,
  getAuthHeaders,
  handleResponse,
} from "@/services/httpClient";

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

    return await handleResponse<AuthResponse>(res);
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

    return await handleResponse<AuthResponse>(res);
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

