---

description: "Actionable, dependency-ordered task list for Order Lifecycle Management"
---

# Tasks: Order Lifecycle Management

**Input**: Design documents from `/specs/001-order-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/order-api.md

**Tests**: Automated integration tests in `backend/src/test/java/com/homenest/order/OrderControllerTest.java` and frontend lint/build verification are included per project constitution.

**Organization**: Tasks are grouped by user story (`US1`, `US2`, `US3`) to enable independent implementation and testing of each increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Includes exact file paths and data model constraints in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and shared exception/security foundation

- [X] T001 Create Flyway migration `V6__phase5_order_lifecycle_schema.sql` in `backend/src/main/resources/db/migration/V6__phase5_order_lifecycle_schema.sql` adding `user_id BIGINT NULL` (`REFERENCES users(id) ON DELETE SET NULL`), `cancelled_at TIMESTAMP NULL`, `cancelled_by VARCHAR(50) NULL`, `cancel_reason VARCHAR(500) NULL`, and indexes `idx_orders_user_id` and `idx_orders_order_status`
- [X] T002 [P] Create `AccessDeniedException` in `backend/src/main/java/com/homenest/exception/AccessDeniedException.java` and register a `403 FORBIDDEN` handler in `backend/src/main/java/com/homenest/exception/GlobalExceptionHandler.java`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Entity, DTOs, Security rules, and Demo Admin seeding that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Update `Order` entity in `backend/src/main/java/com/homenest/order/Order.java` with `userId` (`BIGINT NULL`), `cancelledAt` (`TIMESTAMP NULL`), `cancelledBy` (`VARCHAR(50) NULL`), and `cancelReason` (`VARCHAR(500) NULL`)
- [X] T004 [P] Update `OrderResponseDTO` in `backend/src/main/java/com/homenest/order/OrderResponseDTO.java` to expose `userId`, `updatedAt`, `cancelledAt`, `cancelledBy`, and `cancelReason`
- [X] T005 [P] Create `CancelOrderRequest` (`reason` `@NotBlank` max 500 chars, optional `phone` max 50 chars) in `backend/src/main/java/com/homenest/order/CancelOrderRequest.java` and `UpdateOrderStatusRequest` (`status` `@NotNull`, optional `reason` max 500 chars) in `backend/src/main/java/com/homenest/order/UpdateOrderStatusRequest.java`
- [X] T006 [P] Update `SecurityConfig` in `backend/src/main/java/com/homenest/security/SecurityConfig.java` to require `hasAuthority("ROLE_ADMIN")` for `/api/v1/admin/**` and `authenticated()` for `/api/v1/orders/my-orders`
- [X] T007 [P] Seed default demo administrator `admin@homenest.vn` (`Admin@123`, `ROLE_ADMIN`) in `backend/src/main/java/com/homenest/auth/AuthServiceImpl.java`

**Checkpoint**: Foundation ready - user story implementation can now proceed

---

## Phase 3: User Story 1 - Customer & Guest Order Visibility & Ownership (Priority: P1) 🎯 MVP

**Goal**: Link orders placed by authenticated users to their `userId` and allow signed-in customers to view their personal order history (`GET /api/v1/orders/my-orders`) while maintaining guest checkout & lookup.

**Independent Test**: Place an order with a valid JWT token, verify `userId` is populated on the order, fetch `GET /api/v1/orders/my-orders`, and verify only that user's orders are returned.

### Implementation for User Story 1

- [X] T008 [US1] Add `findByUserIdOrderByCreatedAtDesc(Long userId)` and `findByUserIdAndOrderStatusOrderByCreatedAtDesc(Long userId, OrderStatus status)` in `backend/src/main/java/com/homenest/order/OrderRepository.java`
- [X] T009 [US1] Update `OrderService` (`backend/src/main/java/com/homenest/order/OrderService.java`) and `OrderServiceImpl` (`backend/src/main/java/com/homenest/order/OrderServiceImpl.java`) to link `userId` during `createOrder` when an authenticated user email is present and implement `getMyOrders(String userEmail, OrderStatus status)`
- [X] T010 [US1] Update `OrderController` in `backend/src/main/java/com/homenest/order/OrderController.java` to pass authenticated principal to `createOrder` and expose `GET /api/v1/orders/my-orders`
- [X] T011 [P] [US1] Add integration tests for authenticated order creation (`userId` linkage), `GET /api/v1/orders/my-orders`, and user isolation in `backend/src/test/java/com/homenest/order/OrderControllerTest.java`

**Checkpoint**: User Story 1 is functional and independently verified

---

## Phase 4: User Story 2 - Self-Service Order Cancellation & Inventory Restock (Priority: P1)

**Goal**: Allow customers (owners) and guests (verified by phone) to cancel `CONFIRMED` orders with a required reason, atomically restoring product `stockQuantity` and `inStock` status with pessimistic locking and idempotency.

**Independent Test**: Cancel a `CONFIRMED` order as customer or guest with matching phone, verify status becomes `CANCELLED`, audit fields are saved, product stock is incremented, `inStock` recovers from `false` to `true`, and duplicate/invalid cancellations are rejected.

### Implementation for User Story 2

- [X] T012 [US2] Add pessimistic lock query `findByOrderNumberWithLock(String orderNumber)` (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) in `backend/src/main/java/com/homenest/order/OrderRepository.java`
- [X] T013 [US2] Implement `cancelOrder(String orderNumber, CancelOrderRequest request, String authenticatedEmail, boolean isAdmin)` with ownership/phone verification, state validation, and atomic inventory restock in `backend/src/main/java/com/homenest/order/OrderServiceImpl.java`
- [X] T014 [US2] Expose `POST /api/v1/orders/{orderNumber}/cancel` in `backend/src/main/java/com/homenest/order/OrderController.java`
- [X] T015 [P] [US2] Add integration tests for customer cancellation, guest phone-verified cancellation, wrong-phone rejection (`403`), non-CONFIRMED cancellation rejection (`400`), double-cancel idempotency (`400`), and out-of-stock (`inStock = true`) restoration in `backend/src/test/java/com/homenest/order/OrderControllerTest.java`

**Checkpoint**: User Stories 1 and 2 are functional and independently verified

---

## Phase 5: User Story 3 - Administrator Order Lifecycle & Fulfillment Management (Priority: P2)

**Goal**: Provide `ROLE_ADMIN` endpoints and UI to view/filter/search all orders, transition orders through `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`, and cancel `CONFIRMED` or `PROCESSING` orders.

**Independent Test**: Authenticate as `admin@homenest.vn`, query `GET /api/v1/admin/orders` with status/search filters, transition an order through `PROCESSING` → `SHIPPED` → `DELIVERED` (verifying `paymentStatus` becomes `PAID`), and verify `ROLE_USER` receives `403 Forbidden`.

### Implementation for User Story 3

- [X] T016 [US3] Add admin search/filter paginated query `searchOrders(OrderStatus status, String search, Pageable pageable)` in `backend/src/main/java/com/homenest/order/OrderRepository.java`
- [X] T017 [US3] Implement `getAllOrdersForAdmin(OrderStatus status, String search, int page, int size)` and `updateOrderStatusByAdmin(String orderNumber, UpdateOrderStatusRequest request)` in `backend/src/main/java/com/homenest/order/OrderServiceImpl.java`
- [X] T018 [US3] Create `AdminOrderController` (`GET /api/v1/admin/orders`, `PATCH /api/v1/admin/orders/{orderNumber}/status`) in `backend/src/main/java/com/homenest/order/AdminOrderController.java`
- [X] T019 [P] [US3] Add integration tests for admin order listing/filtering, valid state machine transitions (`CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`), admin cancellation from `PROCESSING`, invalid transition rejection, and `ROLE_USER` `403` access denial in `backend/src/test/java/com/homenest/order/OrderControllerTest.java`

**Checkpoint**: All backend user stories (US1, US2, US3) complete and verified by integration tests

---

## Phase 6: Frontend Integration & UI for US1, US2, US3

**Purpose**: Connect React frontend to the new Order Lifecycle APIs for Customers, Guests, and Administrators

- [X] T020 [P] [US1] Update TypeScript interfaces (`OrderResponse`, `CancelOrderRequest`, `UpdateOrderStatusRequest`) in `frontend/src/types/index.ts` and `frontend/src/shared/types/index.ts`
- [X] T021 [US1] Add `getMyOrders`, `cancelOrder`, `getAdminOrders`, and `updateOrderStatusAdmin` API client functions in `frontend/src/services/orderApi.ts` and `frontend/src/features/orders/orderApi.ts`
- [X] T022 [US3] Add `isAdminOrdersOpen` / `setIsAdminOrdersOpen` state to `frontend/src/context/UIContext.tsx`, `frontend/src/shared/ui/UIContext.tsx`, and `frontend/src/context/ShopContext.tsx`
- [X] T023 [US1] Enhance `OrderLookupModal` (`frontend/src/components/OrderLookupModal.tsx` and `frontend/src/features/orders/OrderLookupModal.tsx`) with "Đơn hàng của tôi" tab for logged-in users, visual progress stepper, and interactive "Hủy đơn hàng" dialog with reason & guest phone confirmation
- [X] T024 [US3] Create `AdminOrderModal` in `frontend/src/components/AdminOrderModal.tsx` and `frontend/src/features/orders/AdminOrderModal.tsx` for `ROLE_ADMIN` to filter, search, advance order statuses, and cancel orders
- [X] T025 [US3] Update `Navbar` (`frontend/src/components/Navbar.tsx` and `frontend/src/shared/ui/Navbar.tsx`), `AuthModal` (`frontend/src/components/AuthModal.tsx` and `frontend/src/features/auth/AuthModal.tsx`), and `IndexPage` (`frontend/src/pages/index.tsx`) to expose "Đơn hàng của tôi", "Quản lý đơn hàng (Admin)", and quick-fill Demo Admin login

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end verification, documentation, and knowledge graph update

- [X] T026 [P] Update `README.md` with Admin demo credentials (`admin@homenest.vn` / `Admin@123`) and new Order Lifecycle API documentation
- [X] T027 Execute full backend test suite (`.\mvnw.cmd clean test`), frontend lint & build (`npm run lint && npm run build`), and update knowledge graph (`graphify update .`)

---

## Dependencies & Execution Order

1. **Phase 1 (Setup)** → **Phase 2 (Foundational)**: Blocks all user stories.
2. **Phase 3 (US1 - Visibility & Ownership)** → **Phase 4 (US2 - Cancellation & Restock)** → **Phase 5 (US3 - Admin Lifecycle)**: Sequential backend domain increments.
3. **Phase 6 (Frontend Integration)**: Consumes US1, US2, US3 backend endpoints.
4. **Phase 7 (Polish & Verification)**: Final test gate and knowledge graph sync.
