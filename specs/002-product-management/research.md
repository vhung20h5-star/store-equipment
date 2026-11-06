# Phase 0 Research: Product Management & Product Detail Page

**Feature**: `002-product-management` | **Date**: 2026-11-06

## 1. Separating Commercial Visibility (`isActive`) from Physical Stock (`inStock`)

- **Decision**: Add `is_active BOOLEAN NOT NULL DEFAULT TRUE` to the `products` table via Flyway migration `V7__phase6_product_management_and_inventory_audit.sql` and `private Boolean isActive = true;` on the `Product` JPA entity.
- **Rationale**:
  - Currently, `Product.inStock` represents whether `stockQuantity > 0` and is automatically toggled to `false` when an order depletes the last item (`OrderServiceImpl.createOrder`) and automatically restored to `true` when a cancelled order restocks the item (`OrderServiceImpl.restockOrderItems`).
  - If `inStock` were overloaded to represent "Admin hid/discontinued this product", cancelling an old order would inadvertently set `inStock = true` and re-list a discontinued product for sale.
  - Separating `isActive` (commercial visibility controlled exclusively by `ROLE_ADMIN`) from `inStock` (physical inventory availability derived from `stockQuantity > 0`) guarantees that order cancellation restocks physical units while keeping discontinued products hidden (`isActive = false`).
- **Alternatives considered**:
  - Hard deleting products (`DELETE FROM products`): Rejected because `cart_items` has `ON DELETE CASCADE` and historical `order_items` or bookmarked `/products/:id` URLs would lose product context or return 404 without explaining that the item was discontinued.
  - Reusing `inStock` for discontinued state: Rejected due to conflict with automatic restock recovery in `OrderServiceImpl`.

## 2. Concurrency-Safe, Reason-Audited Inventory Adjustments

- **Decision**:
  - Create table `inventory_adjustments` in `V7__phase6_product_management_and_inventory_audit.sql` storing `id`, `product_id`, `previous_quantity`, `quantity_change`, `new_quantity`, `reason`, `adjusted_by`, and `created_at`.
  - Expose `POST /api/v1/admin/products/{id}/stock-adjustments` (`AdminProductController`). Inside `@Transactional`, acquire the existing pessimistic write lock via `ProductRepository.findByIdWithLock(id)` (`@Lock(LockModeType.PESSIMISTIC_WRITE)`), validate `quantityChange != 0` and `previousQuantity + quantityChange >= 0`, update `product.stockQuantity = newQuantity` and `product.inStock = (newQuantity > 0)`, and persist an `InventoryAdjustment` entity.
  - Exclude `stockQuantity` from `PUT /api/v1/admin/products/{id}` (general metadata/price/image update) so every inventory change after initial product creation is guaranteed to go through the reason-audited adjustment endpoint. (Initial stock on `POST /api/v1/admin/products` > 0 also records an initial `InventoryAdjustment` entry with reason `"Khởi tạo tồn kho ban đầu"`.)
- **Rationale**: Complies strictly with Constitution Principle III (State Machine & Inventory Integrity), serializing admin stock edits against concurrent customer `createOrder` and `cancelOrder` transactions on the exact same database row lock.
- **Alternatives considered**:
  - Allowing direct `stockQuantity` overwrite in `PUT /api/v1/admin/products/{id}` without a reason: Rejected because it bypasses the mandatory audit trail requirement (`FR-009`, `SC-002`).

## 3. Image Management & Product Specifications Architecture

- **Decision**:
  - **Images**: Retain URL-based storage (`products.image` `VARCHAR(500)` for the primary image and `product_gallery.image_url` `VARCHAR(500)` ordered by `display_order` for gallery images), enhanced with instant live image preview and broken-URL fallback handling in the Admin Product Modal UI.
  - **Variants / Specifications**: Keep the 1-product-per-item model without sub-SKU variant tables. Store technical specifications as a `Map<String, String>` serialized to `products.specs_json` via Jackson `ObjectMapper` (existing pattern in `ProductServiceImpl`), and provide a dynamic key-value row editor in the Admin UI.
- **Rationale**: Confirmed by user during brainstorming. Fits 100% of existing database tables (`products`, `product_gallery`, `product_features`, `cart_items`, `order_items`) and avoids external cloud storage dependencies (S3/Cloudinary) in v1.
- **Alternatives considered**:
  - Multipart local file upload: Rejected because local container filesystems are ephemeral and break across deployments.
  - Multi-SKU `product_variants` table: Rejected for v1 as it requires redesigning `cart_items` (`uq_cart_product`) and checkout payloads.

## 4. Discontinued Product Behavior Across Public URLs, Cart, and Orders

- **Decision**:
  - **Public Catalog (`GET /api/v1/products`, `GET /api/v1/products/bestsellers`)**: Filter by `isActive = true`.
  - **Public Direct URL (`GET /api/v1/products/{id}` & `/products/:id`)**: Return the product DTO including `isActive`. When `isActive == false`, `/products/:id` renders the product information with a prominent `"Sản phẩm đã ngừng kinh doanh"` badge and disables the quantity selector and `"Thêm vào giỏ hàng"` button.
  - **Cart & Checkout (`CartServiceImpl`, `OrderServiceImpl`, `CartDrawer.tsx`)**:
    - `CartServiceImpl.addToCart` and `updateCartItem` reject products with `isActive == false` (or `inStock == false`) with `IllegalArgumentException` (`400 Bad Request`).
    - `CartServiceImpl.syncCart` skips guest items whose product is missing or has `isActive == false`.
    - `OrderServiceImpl.createOrder` checks `Boolean.FALSE.equals(product.getIsActive())` under `findByIdWithLock` and throws `IllegalArgumentException` (`"Sản phẩm '...' hiện đã ngừng kinh doanh."`, `400 Bad Request`).
    - `CartDrawer.tsx` visually flags any cart item where `product.isActive === false` or `!product.inStock` and blocks proceeding to checkout until removed.
- **Rationale**: Prevents broken bookmarks while strictly enforcing that discontinued items cannot be newly added or checked out, and preserves `order_items` snapshots for historical orders.

