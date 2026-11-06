---

description: "Actionable, dependency-ordered task list for Product Management & Product Detail Page"
---

# Tasks: Product Management & Product Detail Page

**Input**: Design documents from `/specs/002-product-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/catalog-api.md

**Tests**: Automated integration tests (`ProductControllerTest.java`, `CartControllerTest.java`, `OrderControllerTest.java`) and frontend lint/build checks (`npm run lint && npm run build`) are included per project Constitution Principle IV.

**Organization**: Tasks are grouped by user story (`US1`, `US2`, `US3`, `US4`) to enable independent implementation and verification of each increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`, `US4`)
- Includes exact file paths and data model constraints in descriptions

---

## Phase 1: Setup (Database Schema & Migration Foundation)

**Purpose**: Append-only Flyway schema evolution for product visibility (`is_active`) and inventory adjustment audit trail (`inventory_adjustments`)

- [X] T001 Create Flyway migration `V7__phase6_product_management_and_inventory_audit.sql` in `backend/src/main/resources/db/migration/V7__phase6_product_management_and_inventory_audit.sql` adding `is_active BOOLEAN NOT NULL DEFAULT TRUE` to `products`, creating table `inventory_adjustments` (`id BIGSERIAL PRIMARY KEY`, `product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE`, `previous_quantity INT NOT NULL`, `quantity_change INT NOT NULL`, `new_quantity INT NOT NULL`, `reason VARCHAR(500) NOT NULL`, `adjusted_by VARCHAR(150) NOT NULL`, `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`), and creating indexes `idx_products_is_active`, `idx_inventory_adjustments_product_id`, and `idx_inventory_adjustments_created_at` (FR-001, FR-010)

---

## Phase 2: Foundational (Core Entities, Repositories & Shared DTOs)

**Purpose**: Core JPA entities, repositories, and DTOs that block all user stories (`US1`–`US4`)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Update `Product` entity in `backend/src/main/java/com/homenest/catalog/Product.java` to add `isActive` (`@Column(name = "is_active", nullable = false) private Boolean isActive = true;`) with getter and setter (FR-001)
- [X] T003 [P] Update `ProductResponseDTO` in `backend/src/main/java/com/homenest/catalog/ProductResponseDTO.java` to expose `isActive` (`Boolean`, non-null), `createdAt` (`LocalDateTime`), and `updatedAt` (`LocalDateTime`) (FR-001, FR-003)
- [X] T004 [P] Create `InventoryAdjustment` JPA entity in `backend/src/main/java/com/homenest/catalog/InventoryAdjustment.java` mapped to `inventory_adjustments` (`id`, `productId` `VARCHAR(50) NOT NULL`, `previousQuantity` `INT NOT NULL`, `quantityChange` `INT NOT NULL`, `newQuantity` `INT NOT NULL`, `reason` `VARCHAR(500) NOT NULL`, `adjustedBy` `VARCHAR(150) NOT NULL`, `createdAt` `TIMESTAMP NOT NULL`) and `InventoryAdjustmentRepository` (`findByProductIdOrderByCreatedAtDesc(String productId)`) in `backend/src/main/java/com/homenest/catalog/InventoryAdjustmentRepository.java` (FR-010, FR-011)
- [X] T005 [P] Update `ProductRepository` in `backend/src/main/java/com/homenest/catalog/ProductRepository.java` to add `findByBadgeTypeAndIsActiveTrue(String badgeType)` and `findByCategorySlugAndIsActiveTrue(String categorySlug)`, and update `CategoryRepository.countProductsGroupedBySlug()` in `backend/src/main/java/com/homenest/catalog/CategoryRepository.java` to count only active products (`LEFT JOIN c.products p ON p.isActive = true`) (FR-002)
- [X] T006 [P] Create request/response DTOs in `backend/src/main/java/com/homenest/catalog/`: `CreateProductRequest.java` (`name` `@NotBlank` max 255, `categorySlug` `@NotBlank` max 50, `price` `@NotNull @Min(1)`, `originalPrice` `@NotNull @Min(1)`, optional `id` max 50, `badge` max 100, `badgeType` max 50, `image` `@NotBlank` max 500, `gallery` `List<String>`, `description` `@NotBlank`, `features` `List<String>`, `specs` `Map<String, String>`, `initialStockQuantity` `@Min(0)`, `isActive` `Boolean`), `UpdateProductRequest.java` (same metadata/price/image/features/specs fields, excluding `stockQuantity`), `UpdateProductVisibilityRequest.java` (`isActive` `@NotNull`), `AdjustStockRequest.java` (`quantityChange` `@NotNull`, `reason` `@NotBlank` max 500), `InventoryAdjustmentResponseDTO.java`, and `CreateCategoryRequest.java` (`slug` `@NotBlank` max 50, `name` `@NotBlank` max 255, `description`, `image` `@NotBlank` max 500) (FR-006, FR-008, FR-009, FR-012)
- [X] T007 [P] Update TypeScript interfaces (`Product` with `isActive?: boolean`, `createdAt?: string`, `updatedAt?: string`, `ProductCategory = string`, `CreateProductRequest`, `UpdateProductRequest`, `AdjustStockRequest`, `InventoryAdjustment`, `CreateCategoryRequest`) in `frontend/src/types/index.ts` and `frontend/src/shared/types/index.ts` (FR-003, FR-006, FR-009, FR-012)

**Checkpoint**: Foundation ready - user story implementation can now proceed

---

## Phase 3: User Story 1 - Customer Dedicated Product Detail Page & Shareable URL (Priority: P1) 🎯 MVP

**Goal**: Filter public catalog listings to active products (`isActive = true`), return full product status (`isActive`, `inStock`, `stockQuantity`, `gallery`, `features`, `specs`) on `GET /api/v1/products/{id}`, and provide a shareable `/products/:id` route (`ProductDetailPage`) with gallery switching, stock/discontinued badges, quantity selector, add-to-cart, link sharing, and related products.

**Independent Test**: Navigate directly to `/products/prod-1` (and refresh), verify gallery images, specs table, stock badge, share link copy, and add-to-cart; verify visiting `/products/:id` of an out-of-stock or discontinued (`isActive = false`) product displays the appropriate badge and disables purchasing.

### Implementation for User Story 1

- [X] T008 [US1] Update `ProductServiceImpl.getProducts` and `getBestsellers` in `backend/src/main/java/com/homenest/catalog/ProductServiceImpl.java` to filter by `isActive = true`, update `mapToDTO` to populate `isActive`, `createdAt`, and `updatedAt`, and update `CategoryServiceImpl.getCategoryBySlug` in `backend/src/main/java/com/homenest/catalog/CategoryServiceImpl.java` to count only `isActive = true` products (FR-001, FR-002, FR-003)
- [X] T009 [US1] Create `ProductDetailPage` component in `frontend/src/pages/product-detail.tsx` featuring breadcrumb navigation, interactive main + thumbnail image gallery, pricing & discount display, dynamic availability badge (`"Còn hàng (còn X sản phẩm)"`, `"Tạm hết hàng"`, or `"Sản phẩm đã ngừng kinh doanh"`), quantity selector (bounded by `stockQuantity`), `"Thêm vào giỏ hàng"` button (disabled when `!product.isActive || !product.inStock || product.stockQuantity === 0`), `"Chia sẻ"` copy-URL button with toast feedback, features list, 2-column `specs` table, and 4 related products in the same category (FR-003, FR-004)
- [X] T010 [P] [US1] Register route `<Route path="/products/:id" element={<ProductDetailPage />} />` in `frontend/src/App.tsx` and `frontend/src/app/App.tsx` (FR-004)
- [X] T011 [P] [US1] Update `ProductCard` (`frontend/src/components/ProductCard.tsx` and `frontend/src/features/catalog/ProductCard.tsx`) and `QuickViewModal` (`frontend/src/components/QuickViewModal.tsx` and `frontend/src/features/catalog/QuickViewModal.tsx`) so clicking a product title/image or `"Xem chi tiết"` navigates to `/products/${product.id}`, while preserving the `"Xem nhanh"` overlay button and disabling add-to-cart when `!product.inStock || product.isActive === false` (FR-004)
- [X] T012 [P] [US1] Update `Navbar` (`frontend/src/components/Navbar.tsx` and `frontend/src/shared/ui/Navbar.tsx`) so clicking anchor links (`#hero`, `#categories`, `#products`, `#promotions`, `#about`) from `/products/:id` navigates back to `/#section` smoothly (FR-004)

**Checkpoint**: User Story 1 is functional and independently testable

---

## Phase 4: User Story 2 - Administrator Product & Category Catalog Management (Priority: P1)

**Goal**: Provide `ROLE_ADMIN` backend endpoints and frontend management UI to list all products (including hidden items), create/edit products (pricing with auto-calculated discount percent, image URLs with live preview, features, `specs` key-value pairs), toggle product visibility (`isActive`), and create categories.

**Independent Test**: Authenticate as `admin@homenest.vn`, create a new category and a new product via `/api/v1/admin/products`, verify auto-calculated `discountPercent`, edit product price/images/specs, toggle `isActive` to `false` (verifying it disappears from `GET /api/v1/products` while remaining in `GET /api/v1/admin/products`), and verify `ROLE_USER` / unauthenticated callers receive `403` / `401`.

### Implementation for User Story 2

- [X] T013 [US2] Implement admin catalog methods in `ProductService` (`backend/src/main/java/com/homenest/catalog/ProductService.java`) and `ProductServiceImpl` (`backend/src/main/java/com/homenest/catalog/ProductServiceImpl.java`): `getAdminProducts(String category, String search, Boolean isActive, Boolean inStock, int page, int size)`, `createProduct(CreateProductRequest request, String adminEmail)`, `updateProduct(String id, UpdateProductRequest request)`, and `updateProductVisibility(String id, boolean isActive)` with price validation (`price > 0`, `originalPrice >= price`) and automatic `discountPercent` computation (FR-005, FR-006, FR-007, FR-008)
- [X] T014 [P] [US2] Implement `createCategory(CreateCategoryRequest request)` in `CategoryService` (`backend/src/main/java/com/homenest/catalog/CategoryService.java`) and `CategoryServiceImpl` (`backend/src/main/java/com/homenest/catalog/CategoryServiceImpl.java`) validating unique `slug` (FR-012)
- [X] T015 [US2] Create `AdminProductController` in `backend/src/main/java/com/homenest/catalog/AdminProductController.java` exposing `GET /api/v1/admin/products`, `POST /api/v1/admin/products`, `PUT /api/v1/admin/products/{id}`, `PATCH /api/v1/admin/products/{id}/visibility`, and `POST /api/v1/admin/categories` under `/api/v1/admin/**` (`ROLE_ADMIN` guarded by `SecurityConfig`) (FR-005, FR-006, FR-008, FR-012, FR-015)
- [X] T016 [P] [US2] Add integration tests in `backend/src/test/java/com/homenest/catalog/ProductControllerTest.java` covering Admin product creation, discount calculation, product update, visibility toggle (`isActive = false` hidden from public list but visible in admin list and direct `GET /api/v1/products/{id}`), category creation, invalid price rejection (`400`), and `ROLE_USER` / guest access denial (`403` / `401`) (FR-002, FR-003, FR-005–FR-008, FR-012, FR-015)

**Checkpoint**: User Stories 1 and 2 are functional and verified

---

## Phase 5: User Story 3 - Reason-Audited Inventory Adjustment & Concurrency Safety (Priority: P1)

**Goal**: Enable administrators (`ROLE_ADMIN`) to adjust product stock with a mandatory reason under `PESSIMISTIC_WRITE` lock, automatically synchronize `inStock = (newQuantity > 0)`, record an immutable `InventoryAdjustment` audit entry, and inspect the adjustment history per product.

**Independent Test**: Submit `POST /api/v1/admin/products/prod-1/stock-adjustments` with `quantityChange = 15` and reason `"Nhập kho tháng 11"`, verify `stockQuantity` increases by `15`, fetch `GET /api/v1/admin/products/prod-1/stock-adjustments` to verify the audit record, and verify blank reason, zero change, or negative resulting stock returns `400 Bad Request`.

### Implementation for User Story 3

- [X] T017 [US3] Implement `adjustStock(String productId, AdjustStockRequest request, String adminEmail)` (acquiring `ProductRepository.findByIdWithLock`, enforcing `quantityChange != 0`, `newQuantity >= 0`, `reason` non-blank, updating `stockQuantity` and `inStock = (newQuantity > 0)`, saving `InventoryAdjustment`) and `getStockAdjustments(String productId)` in `backend/src/main/java/com/homenest/catalog/ProductService.java` and `backend/src/main/java/com/homenest/catalog/ProductServiceImpl.java` (FR-009, FR-010, FR-011)
- [X] T018 [US3] Expose `POST /api/v1/admin/products/{id}/stock-adjustments` and `GET /api/v1/admin/products/{id}/stock-adjustments` in `backend/src/main/java/com/homenest/catalog/AdminProductController.java` passing the authenticated admin email from `Authentication` (FR-009, FR-010, FR-011, FR-015)
- [X] T019 [P] [US3] Add integration tests in `backend/src/test/java/com/homenest/catalog/ProductControllerTest.java` for positive/negative stock adjustments, `inStock` auto-flip to `false` at `0` and recovery to `true` when `> 0`, audit history retrieval, and `400 Bad Request` rejection on blank reason, zero `quantityChange`, or negative resulting stock (FR-009, FR-010, FR-011, SC-002, SC-003)

**Checkpoint**: User Stories 1, 2, and 3 are functional and verified

---

## Phase 6: User Story 4 - Historical Order Preservation & Cart/Checkout Coordination (Priority: P1)

**Goal**: Prevent discontinued (`isActive = false`) products from being added to carts or checked out in new orders, warn customers in `CartDrawer` when an item in their cart has been discontinued or depleted, preserve historical order item snapshots after product edits, and ensure order cancellation restores physical stock without flipping `isActive` back to `true`.

**Independent Test**: Place an order for a product, then as Admin change its price and set `isActive = false`; verify historical order retains original snapshot price/name, verify adding the discontinued product to cart or placing a new order with it returns `400 Bad Request`, and cancel the historical `CONFIRMED` order to verify `stockQuantity` increases while `isActive` remains `false`.

### Implementation for User Story 4

- [X] T020 [US4] Update `CartServiceImpl` in `backend/src/main/java/com/homenest/cart/CartServiceImpl.java` so `addToCart` and `updateCartItem` reject discontinued products (`Boolean.FALSE.equals(product.getIsActive())`) with `IllegalArgumentException` (`400 Bad Request`), and `syncCart` skips guest items whose product is missing or has `isActive = false` (FR-013)
- [X] T021 [US4] Update `OrderServiceImpl.createOrder` and `OrderServiceImpl.restockOrderItems` in `backend/src/main/java/com/homenest/order/OrderServiceImpl.java` so `createOrder` rejects any product with `Boolean.FALSE.equals(product.getIsActive())` (`"Sản phẩm '...' hiện đã ngừng kinh doanh."`, `400 Bad Request`), and `restockOrderItems` restores `stockQuantity` and `inStock = (restoredStock > 0)` while leaving `product.isActive` unchanged (FR-013, FR-014)
- [X] T022 [P] [US4] Add integration tests in `backend/src/test/java/com/homenest/cart/CartControllerTest.java` and `backend/src/test/java/com/homenest/order/OrderControllerTest.java` verifying cart rejection of discontinued products, checkout rejection of discontinued products, historical order snapshot immutability after admin price/name edit, and order cancellation restocking physical inventory while keeping `isActive = false` (FR-013, FR-014, SC-004, SC-005)

**Checkpoint**: All backend user stories (US1, US2, US3, US4) complete and verified by integration tests

---

## Phase 7: Frontend Admin Catalog & Cart Coordination UI (US2, US3, US4)

**Purpose**: Connect React frontend to Admin Catalog/Inventory APIs and update Cart Drawer availability guards

- [X] T023 [P] [US2] Add admin catalog & inventory API client functions (`getAdminProducts`, `createProductAdmin`, `updateProductAdmin`, `updateProductVisibilityAdmin`, `adjustProductStockAdmin`, `getProductStockAdjustmentsAdmin`, `createCategoryAdmin`) in `frontend/src/services/catalogApi.ts`, `frontend/src/features/catalog/catalogApi.ts`, and re-export in `frontend/src/services/api.ts` (FR-005–FR-012)
- [X] T024 [P] [US2] Add `isAdminProductsOpen` / `setIsAdminProductsOpen` modal state in `frontend/src/context/UIContext.tsx`, `frontend/src/shared/ui/UIContext.tsx`, and `frontend/src/context/ShopContext.tsx` (FR-005)
- [X] T025 [US2] [US3] Create `AdminProductModal` in `frontend/src/components/AdminProductModal.tsx` providing: (1) searchable/filterable product table with status & stock badges, (2) Create/Edit Product form with live primary & gallery URL image previews, dynamic feature list, dynamic `specs` key-value editor, auto-calculated discount preview, and quick Category creation sub-form, (3) one-click visibility toggle (`Đang bán` / `Ngừng bán`), and (4) Stock Adjustment dialog with mandatory reason input and adjustment audit history table (FR-005–FR-012)
- [X] T026 [P] [US4] Update `CartDrawer` in `frontend/src/components/CartDrawer.tsx` and `frontend/src/features/cart/CartDrawer.tsx` to display `"Ngừng kinh doanh"` or `"Hết hàng"` warnings on unavailable cart items and disable proceeding to checkout until unavailable items are removed (FR-013)
- [X] T027 [US2] Mount `AdminProductModal` in `frontend/src/pages/index.tsx` and `frontend/src/pages/product-detail.tsx`, and add `"Quản trị sản phẩm"` menu button for `ROLE_ADMIN` in `frontend/src/components/Navbar.tsx` and `frontend/src/shared/ui/Navbar.tsx` (FR-005, FR-015)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end verification, dynamic category tabs sync, documentation, and knowledge graph update

- [X] T028 [P] Update `ProductsSection` (`frontend/src/components/ProductsSection.tsx`) and `CategoriesSection` (`frontend/src/components/CategoriesSection.tsx`) to dynamically include newly created categories from `fetchCategories()` alongside fallback categories and refresh product list when `AdminProductModal` saves changes
- [X] T029 Execute full backend test suite (`.\mvnw.cmd clean test`), frontend lint & build (`npm run lint && npm run build`), and update knowledge graph (`graphify update .`)

---

## Dependencies & Execution Order

1. **Phase 1 (Setup - `V7` Migration)** → **Phase 2 (Foundational Entities & DTOs)**: Blocks all user stories (`T001`–`T007`).
2. **Phase 3 (US1 - Customer Detail Page & Public Filtering)**: Can proceed immediately after Phase 2 (`T008`–`T012`).
3. **Phase 4 (US2 - Admin Product & Category CRUD)** & **Phase 5 (US3 - Reason-Audited Stock Adjustment)**: Build on Phase 2 (`T013`–`T019`).
4. **Phase 6 (US4 - Order Snapshot & Cart/Checkout Coordination)**: Coordinates catalog `isActive` state with `CartServiceImpl` and `OrderServiceImpl` (`T020`–`T022`).
5. **Phase 7 (Frontend Admin & Cart UI)** → **Phase 8 (Polish & Verification)**: Consumes backend APIs and runs full verification gates (`T023`–`T029`).

## Parallel Opportunities

- In Phase 2, `T003`, `T004`, `T005`, `T006`, and `T007` touch separate DTO/repository/frontend type files and can run in parallel after `T002`.
- Backend phases (`Phase 4`, `Phase 5`, `Phase 6`) and Frontend detail page (`T009`–`T012` in `Phase 3`) can be developed in parallel once `Phase 2` and `T008` complete.
- In Phase 7, `T023`, `T024`, and `T026` can run in parallel prior to wiring `AdminProductModal` (`T025`, `T027`).

## Implementation Strategy

- **MVP Increment 1 (US1)**: Complete Phases 1–3 so customers can browse active products and share `/products/:id` URLs with full gallery, specs, and stock status.
- **Increment 2 (US2 + US3)**: Complete Phases 4, 5, and 7 so administrators can add/edit products, hide products, and perform reason-audited stock adjustments from the UI.
- **Increment 3 (US4 + Polish)**: Complete Phases 6 and 8 to enforce cart/checkout guards on discontinued items and verify end-to-end order restock coordination.

