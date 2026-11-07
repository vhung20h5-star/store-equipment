import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type ProductCategory = "all" | "kitchen" | "cleaning" | "air" | "smart" | (string & {});

export interface Product {
  id: string;
  name: string;
  category: "kitchen" | "cleaning" | "air" | "smart" | (string & {});
  categoryName: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  badgeType?: "bestseller" | "sale" | "featured" | "new" | (string & {});
  image: string;
  gallery?: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  inStock: boolean;
  stockQuantity?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  slug: "kitchen" | "cleaning" | "air" | "smart" | (string & {});
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
  minOrderAmount?: number;
  vipOnly?: boolean;
  message: string;
}

export type CampaignType =
  | "ALL"
  | "DOUBLE_DAY"
  | "HOLIDAY"
  | "DAILY"
  | "VIP_ONLY"
  | "FLASH_SALE";

export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  campaignType: CampaignType | string;
  eventTag?: string;
  totalQuantity?: number | null;
  claimedQuantity: number;
  remainingQuantity?: number | null;
  usedQuantity: number;
  vipOnly: boolean;
  requiresClaim: boolean;
  startTime: string;
  endTime: string;
  isActive: boolean;
  claimed: boolean;
  userVoucherStatus?: "AVAILABLE" | "USED" | "EXPIRED" | null;
  claimedAt?: string;
  usedAt?: string;
  orderNumber?: string;
}

export interface VipPlan {
  id: "MONTHLY" | "YEARLY" | string;
  name: string;
  badge: string;
  price: number;
  originalPrice: number;
  durationDays: number;
  directDiscountPercent: number;
  maxDiscountPerOrder: number;
  benefits: string[];
  giftVoucherCodes: string[];
}

export interface VipSubscriptionRecord {
  id: number;
  planType: string;
  pricePaid: number;
  discountPercent: number;
  maxDiscountPerOrder: number;
  paymentMethod: string;
  bankCardId?: number;
  cardMasked?: string;
  status: string;
  startedAt: string;
  expiresAt: string;
}

export interface BankCardItem {
  id: number;
  bankName: string;
  cardBrand: "VISA" | "MASTERCARD" | "NAPAS" | string;
  cardLast4: string;
  cardNumberMasked: string;
  cardHolderName: string;
  expiryDate: string;
  balance: number;
  isDefault: boolean;
  createdAt: string;
}

export interface CardTransactionItem {
  id: number;
  cardId: number;
  bankName: string;
  cardNumberMasked: string;
  type: "TOP_UP" | "VIP_PAYMENT" | "ORDER_PAYMENT" | "REFUND" | string;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceCode?: string;
  createdAt: string;
}

export interface CreateBankCardPayload {
  bankName: string;
  cardBrand: "VISA" | "MASTERCARD" | "NAPAS" | string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  initialBalance?: number;
  setAsDefault?: boolean;
}

export interface VipStatusResponse {
  user?: User;
  active: boolean;
  tier: "NONE" | "VIP_MONTHLY" | "VIP_YEARLY" | string;
  expiresAt?: string;
  directDiscountPercent: number;
  maxDiscountPerOrder: number;
  plans: VipPlan[];
  subscriptions: VipSubscriptionRecord[];
}

export interface CreatePromotionPayload {
  id?: string;
  code: string;
  title: string;
  description?: string;
  discountPercent: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  campaignType: string;
  eventTag?: string;
  totalQuantity?: number | null;
  vipOnly?: boolean;
  requiresClaim?: boolean;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export interface NewsletterResponse {
  email: string;
  voucherCode: string;
  alreadySubscribed: boolean;
  message: string;
}

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "BANK_CARD";
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
  bankCardId?: number;
  cardCvv?: string;
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
  bankCardId?: number;
  cardMasked?: string;
  orderStatus: OrderStatus;
  subtotalAmount: number;
  discountAmount: number;
  voucherDiscountAmount?: number;
  vipDiscountAmount?: number;
  vipTierApplied?: string;
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
  vipTier?: "NONE" | "VIP_MONTHLY" | "VIP_YEARLY" | string;
  vipExpiresAt?: string;
  vipActive?: boolean;
  vipDiscountPercent?: number;
  vipMaxDiscountAmount?: number;
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

export interface CreateProductRequest {
  id?: string;
  name: string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  badge?: string;
  badgeType?: string;
  image: string;
  gallery?: string[];
  description: string;
  features?: string[];
  specs?: Record<string, string>;
  initialStockQuantity?: number;
  isActive?: boolean;
}

export type UpdateProductRequest = Omit<CreateProductRequest, "id" | "initialStockQuantity">;

export interface AdjustStockRequest {
  quantityChange: number;
  reason: string;
}

export interface InventoryAdjustment {
  id: number;
  productId: string;
  previousQuantity: number;
  quantityChange: number;
  newQuantity: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  image: string;
}




