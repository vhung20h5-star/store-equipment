import { Testimonial, NewsletterResponse } from "@/types";
import { API_BASE_URL, ApiError, handleResponse } from "@/services/httpClient";

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

