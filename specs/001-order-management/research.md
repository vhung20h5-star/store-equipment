# Phase 0 Research: Order Lifecycle Management

**Feature**: `001-order-management` | **Date**: 2026-11-06

## 1. Linking Orders to Authenticated Users While Supporting Guest Checkout

- **Decision**: Add a nullable `user_id` foreign key (`BIGINT NULL`, `ON DELETE SET NULL`) to the `orders` table in Flyway migration `V6__phase5_order_lifecycle_schema.sql`. In `OrderController.createOrder`, inspect `SecurityContextHolder.getContext().getAuthentication()` (or `Authentication` parameter); if an authenticated user principal (email) is present, resolve the `User` from `UserRepository` and attach `user.getId()` to `Order.userId`.
- **Rationale**: Preserves 100% backward compatibility with unauthenticated guest checkout (`POST /api/v1/orders` remains `permitAll()`), while automatically linking orders when the `Authorization: Bearer <token>` header is sent by logged-in users.
- **Alternatives considered**:
  - Separate `/api/v1/user/orders` creation endpoint: Rejected because it duplicates checkout logic and breaks the unified checkout modal flow.
  - Matching orders solely by `customerEmail` or `customerPhone`: Rejected because phone numbers or emails entered for shipping recipient can differ from the account holder's email/phone, and could leak orders across accounts.

## 2. Concurrency-Safe Order Cancellation & Inventory Restock

- **Decision**: Implement `cancelOrder` inside `@Transactional` in `OrderServiceImpl`. Acquire a pessimistic write lock on the `Order` (`OrderRepository.findByOrderNumberWithLock`) or validate order status inside the transaction, and for each `OrderItem`, acquire a pessimistic write lock on the `Product` via existing `ProductRepository.findByIdWithLock(item.getProductId())`. Increment `product.stockQuantity += item.quantity`, and if `product.stockQuantity > 0`, set `product.inStock = true`.
- **Rationale**: Matches the existing concurrency model in `OrderServiceImpl.createOrder` (which already uses `ProductRepository.findByIdWithLock`). Locking the order and products prevents double-restock race conditions if two cancellation requests arrive simultaneously.
- **Alternatives considered**:
  - Optimistic locking (`@Version`): Rejected because introducing a version column to `products` and `orders` would require handling `OptimisticLockingFailureException` retries across existing catalog/order code, whereas `PESSIMISTIC_WRITE` is already proven and tested in this codebase.

## 3. Role-Based Access Control (`ROLE_ADMIN` vs `ROLE_USER` vs Guest)

- **Decision**:
  - Configure `SecurityConfig` so `/api/v1/admin/**` requires `.hasAuthority("ROLE_ADMIN")` (since `JwtAuthenticationFilter` populates `SimpleGrantedAuthority(role)` where `role` is `"ROLE_ADMIN"` or `"ROLE_USER"`), and `/api/v1/orders/my-orders` requires `.authenticated()`.
  - Keep `POST /api/v1/orders/{orderNumber}/cancel` accessible to both authenticated users and guests, with strict ownership verification in `OrderServiceImpl`:
    - If caller is `ROLE_ADMIN`: allowed to cancel `CONFIRMED` or `PROCESSING` orders.
    - If caller is authenticated `ROLE_USER` and `order.userId != null && order.userId.equals(currentUser.id)`: allowed to cancel `CONFIRMED` orders (or if guest order has matching `customerPhone`).
    - If caller is unauthenticated Guest (or order has no `userId`): caller MUST supply `phone` in `CancelOrderRequest` matching `order.customerPhone` (normalized/trimmed), and order MUST be in `CONFIRMED` status.
  - Seed a default demo administrator (`admin@homenest.vn` / `Admin@123`, role `ROLE_ADMIN`) in `AuthServiceImpl.initDefaultDemoUsers()` alongside the existing `demo@homenest.vn` user so admin functionality is immediately testable in local dev and integration tests.
- **Rationale**: Provides defense-in-depth at both the Spring Security filter chain level and domain service level without breaking guest self-service cancellation.
- **Alternatives considered**:
  - Allowing unauthenticated cancellation with only `orderNumber`: Rejected because order numbers follow a predictable date pattern (`HN-YYYYMMDD-XXXX`) and could be guessed without phone verification.

