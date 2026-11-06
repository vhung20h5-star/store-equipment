# Phase 1 Data Model: Order Lifecycle Management

**Feature**: `001-order-management` | **Date**: 2026-11-06

## 1. Database Schema Evolution (`V6__phase5_order_lifecycle_schema.sql`)

### Table: `orders` (Modified)

| Column | Type | Nullable | Default | Constraints / Notes |
|--------|------|----------|---------|---------------------|
| `id` | `BIGSERIAL` | `NOT NULL` | auto | Primary Key (existing) |
| `order_number` | `VARCHAR(50)` | `NOT NULL` | - | Unique `HN-YYYYMMDD-XXXX` (existing) |
| `user_id` | `BIGINT` | `NULL` | `NULL` | **NEW**: FK to `users(id) ON DELETE SET NULL` |
| `customer_name` | `VARCHAR(150)` | `NOT NULL` | - | Recipient name (existing) |
| `customer_email` | `VARCHAR(150)` | `NULL` | `NULL` | Recipient email (existing) |
| `customer_phone` | `VARCHAR(50)` | `NOT NULL` | - | Recipient phone (existing) |
| `shipping_address` | `TEXT` | `NOT NULL` | - | Delivery address (existing) |
| `notes` | `TEXT` | `NULL` | `NULL` | Customer notes (existing) |
| `payment_method` | `VARCHAR(50)` | `NOT NULL` | `'COD'` | `COD`, `BANK_TRANSFER`, `MOMO`, `VNPAY` (existing) |
| `payment_status` | `VARCHAR(50)` | `NOT NULL` | `'PENDING'` | `PENDING`, `PAID`, `REFUNDED` (existing) |
| `order_status` | `VARCHAR(50)` | `NOT NULL` | `'CONFIRMED'` | `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` (existing) |
| `subtotal_amount` | `BIGINT` | `NOT NULL` | - | Sum of item totals (existing) |
| `discount_amount` | `BIGINT` | `NOT NULL` | `0` | Promotion discount (existing) |
| `shipping_fee` | `BIGINT` | `NOT NULL` | `0` | Shipping fee (existing) |
| `total_amount` | `BIGINT` | `NOT NULL` | - | Final payable amount (existing) |
| `coupon_code` | `VARCHAR(50)` | `NULL` | `NULL` | Applied voucher code (existing) |
| `cancelled_at` | `TIMESTAMP` | `NULL` | `NULL` | **NEW**: Timestamp when order was cancelled |
| `cancelled_by` | `VARCHAR(50)` | `NULL` | `NULL` | **NEW**: Actor role (`CUSTOMER`, `GUEST`, `ADMIN`) |
| `cancel_reason` | `VARCHAR(500)` | `NULL` | `NULL` | **NEW**: Reason provided for cancellation |
| `created_at` | `TIMESTAMP` | `NULL` | `CURRENT_TIMESTAMP` | Creation timestamp (existing) |
| `updated_at` | `TIMESTAMP` | `NULL` | `CURRENT_TIMESTAMP` | Last update timestamp (existing) |

**New Indexes**:
- `idx_orders_user_id ON orders(user_id)`
- `idx_orders_order_status ON orders(order_status)`

---

## 2. State Machine & Transition Rules

### OrderStatus Transitions

| Current Status | Allowed Next Status | Allowed Actor | Side Effects |
|----------------|---------------------|---------------|--------------|
| `CONFIRMED` | `PROCESSING` | `ADMIN` | Updates `updatedAt` |
| `CONFIRMED` | `CANCELLED` | `CUSTOMER` (owner), `GUEST` (phone match), `ADMIN` | Restocks all items (`stockQuantity += qty`, `inStock = true`), sets `cancelledAt`, `cancelledBy`, `cancelReason`. If `paymentStatus == PAID`, sets `paymentStatus = REFUNDED`. |
| `PROCESSING` | `SHIPPED` | `ADMIN` | Updates `updatedAt` |
| `PROCESSING` | `CANCELLED` | `ADMIN` only | Restocks all items (`stockQuantity += qty`, `inStock = true`), sets `cancelledAt`, `cancelledBy`, `cancelReason`. If `paymentStatus == PAID`, sets `paymentStatus = REFUNDED`. |
| `SHIPPED` | `DELIVERED` | `ADMIN` | Updates `updatedAt`, sets `paymentStatus = PAID`. |
| `DELIVERED` | *(None - Terminal)* | None | Any transition throws `IllegalArgumentException` (HTTP 400). |
| `CANCELLED` | *(None - Terminal)* | None | Any transition or duplicate cancel throws `IllegalArgumentException` (HTTP 400). |

---

## 3. DTO Specifications

### `CancelOrderRequest`
- `reason` (`String`, required, `@NotBlank`, max 500 chars): Reason for cancelling the order.
- `phone` (`String`, optional, max 50 chars): Required when cancelling as an unauthenticated guest (or when the order has no `userId` matching the authenticated user); verified against `order.customerPhone`.

### `UpdateOrderStatusRequest`
- `status` (`OrderStatus`, required, `@NotNull`): Target status (`PROCESSING`, `SHIPPED`, `DELIVERED`, or `CANCELLED`).
- `reason` (`String`, optional, max 500 chars): Required if `status == OrderStatus.CANCELLED`.

### `OrderResponseDTO` (Extended)
Adds the following fields to existing `OrderResponseDTO`:
- `userId` (`Long`, nullable)
- `updatedAt` (`LocalDateTime`, nullable)
- `cancelledAt` (`LocalDateTime`, nullable)
- `cancelledBy` (`String`, nullable)
- `cancelReason` (`String`, nullable)

