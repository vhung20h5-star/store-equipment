import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type ProductCategory = "all" | "kitchen" | "cleaning" | "air" | "smart";

export interface Product {
  id: string;
  name: string;
  category: "kitchen" | "cleaning" | "air" | "smart";
  categoryName: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  badgeType?: "bestseller" | "sale" | "featured" | "new";
  image: string;
  gallery?: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  inStock: boolean;
  stockQuantity?: number;
}

export interface Category {
  id: string;
  slug: "kitchen" | "cleaning" | "air" | "smart";
  name: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  purchasedProduct: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: "ShieldCheck" | "Truck" | "BadgePercent" | "Headset";
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "info" | "warning";
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface FlashSalePromotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  endTime: string;
  featuredProduct?: Product;
}

export interface ValidatePromotionResult {
  code: string;
  valid: boolean;
  discountPercent: number;
  maxDiscountAmount?: number;
  message: string;
}

export interface NewsletterResponse {
  email: string;
  voucherCode: string;
  alreadySubscribed: boolean;
  message: string;
}

export type PaymentMethod = "COD" | "BANK_TRANSFER";
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";
export type OrderStatus =
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  couponCode?: string;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: number;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  userId?: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotalAmount: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode?: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  items: OrderItemResponse[];
}

export interface CancelOrderRequest {
  reason: string;
  phone?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface ServerCartItem {
  id: number;
  product: Product;
  quantity: number;
  totalPrice: number;
}

export interface ServerCartResponse {
  items: ServerCartItem[];
  totalItems: number;
  totalPrice: number;
}



