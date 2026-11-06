# Implementation Plan: Order Lifecycle Management

**Branch**: `feat/order-management` | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-order-management/spec.md`

## Summary

Implement end-to-end Order Lifecycle Management for HomeNest (`CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` and `CANCELLED`). Key capabilities include linking orders to authenticated user accounts (`user_id`), providing a personal "My Orders" view for logged-in customers, enabling self-service order cancellation in `CONFIRMED` status (with phone verification for guests and ownership checks for customers), providing an administrative order management dashboard (`ROLE_ADMIN`) for filtering and advancing order statuses, and executing atomic, idempotent inventory restocking (`PESSIMISTIC_WRITE`) whenever an order is cancelled.

## Technical Context

**Language/Version**: Java 21+ (Backend), TypeScript 5.x / React 19 (Frontend)

**Primary Dependencies**: Spring Boot 3.4.3 (Spring Web, Spring Data JPA, Spring Security, Flyway, Bean Validation), React 19, Vite 8, HeroUI v3, Tailwind CSS v4, Lucide React

**Storage**: PostgreSQL 16 (dev/prod), H2 in-memory database (automated integration tests), managed via Flyway (`V6__phase5_order_lifecycle_schema.sql`)

**Testing**: JUnit 5, Spring Boot Test, MockMvc (`./mvnw clean test`), TypeScript compiler & ESLint (`npm run lint && npm run build`)

**Target Platform**: Web application (Monorepo: `/backend` REST API + `/frontend` SPA)

**Project Type**: Full-stack web application (Monorepo)

**Performance Goals**: Pessimistic lock duration minimal (single transaction per order mutation); UI modal transitions instantaneous (<200ms)

**Constraints**: Strict state machine enforcement; zero double-restock under concurrent cancellation; backward-compatible guest checkout and order lookup

**Scale/Scope**: 1 new Flyway migration (`V6`), 1 new Admin controller + DTOs + service methods in `/backend`, enhanced Order Lookup / My Orders / Admin Order Management modal views in `/frontend`, 12+ new integration tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Monorepo & Domain-Driven Modularity**: PASS — Backend changes stay cleanly inside `com.homenest.order`, `com.homenest.auth`, `com.homenest.security`, and `com.homenest.exception`. Frontend changes follow existing `features/orders` and `components` modular structure.
- **II. Role-Based Access Control & Data Ownership**: PASS — `/api/v1/admin/orders/**` is restricted to `ROLE_ADMIN` in `SecurityConfig`; `/api/v1/orders/my-orders` requires authentication; guest cancellation verifies `customerPhone`; customer cancellation verifies `userId` ownership.
- **III. State Machine & Inventory Integrity**: PASS — State transitions are validated deterministically in `OrderServiceImpl`, and cancellation restocks products under `@Transactional` using `ProductRepository.findByIdWithLock`.
- **IV. Automated Integration Testing**: PASS — Comprehensive `MockMvc` integration tests cover all user stories, edge cases, state transitions, permission boundaries, and stock restoration.
- **V. Backward Compatibility & Schema Evolution**: PASS — `V6__phase5_order_lifecycle_schema.sql` adds nullable columns without breaking `V1`–`V5` or existing guest order creation/lookup payloads.

## Project Structure

### Documentation (this feature)

```text
specs/001-order-management/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── order-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/homenest/
│   ├── auth/
│   │   └── AuthServiceImpl.java               # Seed demo admin account (admin@homenest.vn)
│   ├── exception/
│   │   ├── AccessDeniedException.java         # 403 Forbidden domain exception
│   │   └── GlobalExceptionHandler.java        # Map AccessDeniedException -> 403
│   ├── order/
│   │   ├── AdminOrderController.java          # GET /api/v1/admin/orders, PATCH status
│   │   ├── CancelOrderRequest.java            # DTO for order cancellation
│   │   ├── Order.java                         # Add userId, cancelledAt, cancelledBy, cancelReason
│   │   ├── OrderController.java               # Pass auth context, GET /my-orders, POST /{orderNumber}/cancel
│   │   ├── OrderRepository.java               # Queries for user orders, admin search/filter, pessimistic lock
│   │   ├── OrderResponseDTO.java              # Include lifecycle & cancellation fields
│   │   ├── OrderService.java                  # Lifecycle methods
│   │   ├── OrderServiceImpl.java              # State machine, ownership checks, atomic restock
│   │   └── UpdateOrderStatusRequest.java      # DTO for admin status transitions
│   └── security/
│       └── SecurityConfig.java                # Protect /api/v1/admin/** and /api/v1/orders/my-orders
├── src/main/resources/db/migration/
│   └── V6__phase5_order_lifecycle_schema.sql  # Add user_id and cancellation audit columns
└── src/test/java/com/homenest/order/
    └── OrderControllerTest.java               # Integration tests for US1, US2, US3

frontend/
└── src/
    ├── types/index.ts & shared/types/index.ts # Add lifecycle types & request/response interfaces
    ├── services/orderApi.ts & features/orders/orderApi.ts # API client methods for my-orders, cancel, admin
    ├── context/UIContext.tsx & shared/ui/UIContext.tsx # Modal state for Admin Orders view
    ├── context/ShopContext.tsx                # Expose Admin Orders modal state
    ├── components/
    │   ├── AuthModal.tsx                      # Quick-fill button for Demo Admin account
    │   ├── Navbar.tsx                         # Links for "Đơn hàng của tôi" and "Quản lý đơn hàng (Admin)"
    │   ├── OrderLookupModal.tsx               # Tab for "Đơn hàng của tôi", Cancel Order dialog & status timeline
    │   └── AdminOrderModal.tsx                # Admin order management dashboard modal
    └── pages/index.tsx                        # Mount AdminOrderModal
```

**Structure Decision**: Retain the existing Web Application Monorepo layout (`backend/` and `frontend/`), keeping both `frontend/src/components` (active runtime imports) and `frontend/src/features` / `frontend/src/shared` synchronized.

## Complexity Tracking

No Constitution violations. All design choices use existing patterns and dependencies.
