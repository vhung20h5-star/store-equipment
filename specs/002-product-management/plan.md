# Implementation Plan: Product Management & Product Detail Page

**Branch**: `feat/product-management` (`002-product-management`) | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-product-management/spec.md`

## Summary

Deliver end-to-end **Product Catalog Management for Administrators** and a **Dedicated Shareable Product Detail Page (`/products/:id`) for Customers**. Key capabilities include:
1. Separating commercial visibility (`is_active`) from physical stock availability (`in_stock`) via Flyway migration `V7__phase6_product_management_and_inventory_audit.sql`.
2. Introducing an immutable `inventory_adjustments` audit table and concurrency-safe (`PESSIMISTIC_WRITE`) stock adjustment endpoints requiring a mandatory business reason.
3. Providing `ROLE_ADMIN` REST endpoints (`/api/v1/admin/products/**`, `/api/v1/admin/categories/**`) and an `AdminProductModal` UI for creating/editing products (pricing with auto-calculated discount percent, URL images with live preview, features, key-value technical specifications), creating categories, toggling product visibility, and auditing stock adjustments.
4. Providing a dedicated `/products/:id` route (`ProductDetailPage`) with full gallery switching, stock/discontinued status badges, quantity selection, add-to-cart, link sharing, and related products.
5. Coordinating discontinued/hidden products across public listings, shopping carts, order creation, historical order snapshots, and order cancellation restock flows.

## Technical Context

**Language/Version**: Java 21+ (Backend), TypeScript 5.x / React 19 (Frontend)

**Primary Dependencies**: Spring Boot 3.4.3 (Spring Web, Spring Data JPA, Spring Security, Flyway, Bean Validation, Jackson), React 19, Vite 8, React Router v6, HeroUI v3, Tailwind CSS v4, Lucide React

**Storage**: PostgreSQL 16 (dev/prod), H2 in-memory database (automated integration tests), managed via Flyway (`V7__phase6_product_management_and_inventory_audit.sql`)

**Testing**: JUnit 5, Spring Boot Test, MockMvc (`./mvnw clean test`), TypeScript compiler & ESLint (`npm run lint && npm run build`)

**Target Platform**: Web application (Monorepo: `/backend` REST API + `/frontend` SPA)

**Project Type**: Full-stack web application (Monorepo)

**Performance Goals**: Pessimistic lock held only for single-row stock mutation transaction; `/products/:id` route and Admin modal interactions <200ms

**Constraints**: Strict RBAC enforcement (`ROLE_ADMIN` on `/api/v1/admin/**`); zero lost updates under concurrent order checkout/cancellation/stock adjustment; append-only Flyway migration `V7`; historical `order_items` snapshots untouched by catalog edits; no external cloud file storage or multi-SKU variant tables in v1

**Scale/Scope**: 1 new Flyway migration (`V7`), 1 new JPA entity (`InventoryAdjustment`) + repository, 1 new Admin controller (`AdminProductController`) + request/response DTOs, enhanced `ProductServiceImpl` / `CategoryServiceImpl` / `CartServiceImpl` / `OrderServiceImpl`, 1 new route & page (`ProductDetailPage.tsx` at `/products/:id`), 1 new Admin management modal (`AdminProductModal.tsx`), and 15+ new backend integration tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Monorepo & Domain-Driven Modularity**: PASS — Backend additions stay cleanly within `com.homenest.catalog`, `com.homenest.cart`, `com.homenest.order`, and `com.homenest.security`. Frontend additions follow the existing dual-synced structure (`frontend/src/pages`, `frontend/src/components`, `frontend/src/services` alongside `frontend/src/features` and `frontend/src/shared`).
- **II. Role-Based Access Control & Data Ownership**: PASS — All `/api/v1/admin/products/**` and `/api/v1/admin/categories/**` endpoints are protected by `SecurityConfig` (`.requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")`) and verified by integration tests for both `401` (unauthenticated) and `403` (`ROLE_USER`).
- **III. State Machine & Inventory Integrity**: PASS — Manual stock adjustments (`adjustStock`) acquire the exact same `PESSIMISTIC_WRITE` lock (`ProductRepository.findByIdWithLock`) used by `OrderServiceImpl.createOrder` and `OrderServiceImpl.cancelOrder`. Order cancellation restores physical `stockQuantity` and updates `inStock` while preserving `isActive` so discontinued items are never accidentally re-opened.
- **IV. Automated Integration Testing**: PASS — Comprehensive `@SpringBootTest` + `MockMvc` integration tests in `ProductControllerTest`, `CartControllerTest`, and `OrderControllerTest` will cover all admin CRUD, stock adjustment audit logs, RBAC boundaries, and discontinued product edge cases; frontend passes `npm run lint && npm run build`.
- **V. Backward Compatibility & Schema Evolution**: PASS — `V7__phase6_product_management_and_inventory_audit.sql` is strictly additive (`ALTER TABLE products ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE` and `CREATE TABLE inventory_adjustments`), preserving all `V1`–`V6` migrations and `ApiResponse<T>` contracts.

## Project Structure

### Documentation (this feature)

```text
specs/002-product-management/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── catalog-api.md
├── checklists/
│   ├── requirements.md  # Spec quality checklist (/speckit-specify)
│   └── catalog-review.md # Domain requirements checklist (/speckit-checklist)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/homenest/
│   ├── catalog/
│   │   ├── AdminProductController.java            # NEW: /api/v1/admin/products & /api/v1/admin/categories endpoints
│   │   ├── AdjustStockRequest.java                # NEW: DTO for reason-audited stock adjustment
│   │   ├── Category.java                          # Existing Category entity
│   │   ├── CategoryRepository.java                # Update countProductsGroupedBySlug to count only isActive=true
│   │   ├── CategoryService.java                   # Add createCategory for Admin
│   │   ├── CategoryServiceImpl.java               # Filter active product count & implement createCategory
│   │   ├── CreateCategoryRequest.java             # NEW: DTO for admin category creation
│   │   ├── CreateProductRequest.java              # NEW: DTO for admin product creation
│   │   ├── InventoryAdjustment.java               # NEW: JPA entity for stock adjustment audit log
│   │   ├── InventoryAdjustmentRepository.java     # NEW: Repository for product stock adjustment history
│   │   ├── InventoryAdjustmentResponseDTO.java    # NEW: Response DTO for stock adjustment audit log
│   │   ├── Product.java                           # Add isActive field (default true)
│   │   ├── ProductController.java                 # Existing public product endpoints
│   │   ├── ProductRepository.java                 # Add active-filtered queries for public bestsellers/category
│   │   ├── ProductResponseDTO.java                # Add isActive, createdAt, updatedAt
│   │   ├── ProductService.java                    # Add admin CRUD, visibility toggle, and stock adjustment methods
│   │   ├── ProductServiceImpl.java                # Filter public queries by isActive=true; implement admin methods
│   │   ├── UpdateProductRequest.java              # NEW: DTO for admin product metadata/price/image/specs update
│   │   └── UpdateProductVisibilityRequest.java    # NEW: DTO for toggling isActive
│   ├── cart/
│   │   └── CartServiceImpl.java                   # Block adding/updating discontinued (isActive=false) products; skip in syncCart
│   └── order/
│       └── OrderServiceImpl.java                  # Block checkout if product.isActive=false; preserve isActive on cancel restock
├── src/main/resources/db/migration/
│   └── V7__phase6_product_management_and_inventory_audit.sql # Add products.is_active & inventory_adjustments table
└── src/test/java/com/homenest/
    ├── catalog/
    │   └── ProductControllerTest.java             # Add Admin CRUD, RBAC, visibility, and stock adjustment integration tests
    ├── cart/
    │   └── CartControllerTest.java                # Add discontinued product cart guard tests
    └── order/
        └── OrderControllerTest.java               # Add discontinued product checkout guard & cancel restock tests

frontend/
└── src/
    ├── App.tsx & app/App.tsx                      # Add route /products/:id -> ProductDetailPage
    ├── pages/
    │   ├── index.tsx                              # Mount AdminProductModal
    │   └── product-detail.tsx                     # NEW: Dedicated Product Detail Page (/products/:id)
    ├── types/index.ts & shared/types/index.ts     # Update Product/Category types & add Admin Product/Stock DTO interfaces
    ├── services/
    │   ├── api.ts                                 # Re-export new admin catalog API functions
    │   └── catalogApi.ts & features/catalog/catalogApi.ts # Add admin product/category/stock API client functions
    ├── context/
    │   ├── UIContext.tsx & shared/ui/UIContext.tsx # Add isAdminProductsOpen / setIsAdminProductsOpen state
    │   └── ShopContext.tsx                        # Expose isAdminProductsOpen / setIsAdminProductsOpen
    └── components/
        ├── AdminProductModal.tsx                  # NEW: Admin Product, Category & Inventory Management modal
        ├── Navbar.tsx & shared/ui/Navbar.tsx      # Add "Quản trị sản phẩm" link for ROLE_ADMIN & support cross-page navigation
        ├── ProductCard.tsx & features/catalog/ProductCard.tsx # Link product title/image to /products/:id while keeping Quick View button
        ├── QuickViewModal.tsx & features/catalog/QuickViewModal.tsx # Add "Xem trang chi tiết" link & respect isActive/inStock
        └── CartDrawer.tsx & features/cart/CartDrawer.tsx # Warn & block checkout when cart contains discontinued/out-of-stock items
```

**Structure Decision**: Retain the existing Web Application Monorepo layout (`backend/` and `frontend/`), keeping both `frontend/src/components` / `frontend/src/services` (active runtime imports) and `frontend/src/features` / `frontend/src/shared` synchronized.

## Complexity Tracking

No Constitution violations. All design choices reuse existing Spring Boot JPA, Flyway, Spring Security, and React + HeroUI patterns.
