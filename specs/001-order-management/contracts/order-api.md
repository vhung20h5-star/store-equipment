# Phase 1 API Contracts: Order Lifecycle Management

**Feature**: `001-order-management` | **Base URL**: `/api/v1`

All responses use the standard `ApiResponse<T>` envelope:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "timestamp": "2026-11-06T11:20:00"
}
```

---

## 1. Customer & Guest Order Endpoints (`/api/v1/orders`)

### 1.1. Create Order (Enhanced)
- **Endpoint**: `POST /api/v1/orders`
- **Auth**: Optional (`Bearer <token>`). If authenticated, links `order.userId = currentUser.id`.
- **Response** (`201 Created`): `ApiResponse<OrderResponseDTO>` (now includes `userId`, `updatedAt`, `cancelledAt`, `cancelledBy`, `cancelReason`).

### 1.2. Get My Orders (Authenticated Customer)
- **Endpoint**: `GET /api/v1/orders/my-orders`
- **Auth**: Required (`ROLE_USER` or `ROLE_ADMIN`)
- **Query Params**:
  - `status` (optional, `OrderStatus`): Filter by order status.
- **Response** (`200 OK`): `ApiResponse<List<OrderResponseDTO>>` ordered by `createdAt DESC`.
- **Error Responses**:
  - `401 Unauthorized` / `403 Forbidden` if not authenticated.

### 1.3. Cancel Order (Customer / Guest / Admin)
- **Endpoint**: `POST /api/v1/orders/{orderNumber}/cancel`
- **Auth**: Optional (`Bearer <token>`).
  - If authenticated `ROLE_ADMIN`: Can cancel `CONFIRMED` or `PROCESSING` order (`cancelledBy = "ADMIN"`).
  - If authenticated `ROLE_USER`: Can cancel `CONFIRMED` order if `order.userId == currentUser.id` OR if `request.phone` matches `order.customerPhone` (`cancelledBy = "CUSTOMER"`).
  - If unauthenticated Guest: Must provide `request.phone` matching `order.customerPhone`, and order must be `CONFIRMED` (`cancelledBy = "GUEST"`).
- **Request Body** (`CancelOrderRequest`):
  ```json
  {
    "reason": "Đặt nhầm sản phẩm, muốn đổi mẫu khác",
    "phone": "0912345678"
  }
  ```
- **Response** (`200 OK`): `ApiResponse<OrderResponseDTO>` with `orderStatus = "CANCELLED"`, `cancelledAt`, `cancelledBy`, `cancelReason`, and product stock restored.
- **Error Responses**:
  - `400 Bad Request`: Order is already `CANCELLED`, or order is in `PROCESSING`/`SHIPPED`/`DELIVERED` (for customer/guest), or `reason` is blank.
  - `403 Forbidden`: Authenticated user does not own the order and phone does not match, or guest phone verification failed.
  - `404 Not Found`: Order number does not exist.

---

## 2. Administrator Order Endpoints (`/api/v1/admin/orders`)

### 2.1. List & Filter All Orders (Admin)
- **Endpoint**: `GET /api/v1/admin/orders`
- **Auth**: Required (`ROLE_ADMIN`)
- **Query Params**:
  - `status` (optional, `OrderStatus`): Filter by status (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - `search` (optional, `String`): Case-insensitive substring match on `orderNumber`, `customerPhone`, or `customerName`.
  - `page` (optional, `int`, default `0`)
  - `size` (optional, `int`, default `20`)
- **Response** (`200 OK`): `ApiResponse<PageResponse<OrderResponseDTO>>` ordered by `createdAt DESC`.
- **Error Responses**:
  - `401 Unauthorized` / `403 Forbidden`: Caller is not `ROLE_ADMIN`.

### 2.2. Update Order Status (Admin)
- **Endpoint**: `PATCH /api/v1/admin/orders/{orderNumber}/status`
- **Auth**: Required (`ROLE_ADMIN`)
- **Request Body** (`UpdateOrderStatusRequest`):
  ```json
  {
    "status": "PROCESSING",
    "reason": "Optional note or required reason when status is CANCELLED"
  }
  ```
- **Allowed Transitions**:
  - `CONFIRMED` → `PROCESSING` | `CANCELLED`
  - `PROCESSING` → `SHIPPED` | `CANCELLED`
  - `SHIPPED` → `DELIVERED` (sets `paymentStatus = PAID`)
- **Response** (`200 OK`): `ApiResponse<OrderResponseDTO>`
- **Error Responses**:
  - `400 Bad Request`: Invalid status transition (e.g., `DELIVERED` → `CANCELLED`, `SHIPPED` → `CANCELLED`, `CONFIRMED` → `DELIVERED` skipping steps) or missing cancellation reason when target status is `CANCELLED`.
  - `403 Forbidden`: Caller does not have `ROLE_ADMIN`.
  - `404 Not Found`: Order number does not exist.

