# Phase 1 Data Model: Product Management & Product Detail Page

**Feature**: `002-product-management` | **Date**: 2026-11-06

## 1. Database Schema Evolution (`V7__phase6_product_management_and_inventory_audit.sql`)

### 1.1. Table: `products` (Modified)

| Column | Type | Nullable | Default | Constraints / Notes |
|--------|------|----------|---------|---------------------|
| `id` | `VARCHAR(50)` | `NOT NULL` | - | Primary Key (e.g. `prod-1`, `prod-11` or slug-based ID) |
| `category_slug` | `VARCHAR(50)` | `NOT NULL` | - | FK to `categories(slug) ON DELETE CASCADE` (existing) |
| `category_name` | `VARCHAR(255)` | `NOT NULL` | - | Denormalized category display name (existing) |
| `name` | `VARCHAR(255)` | `NOT NULL` | - | Product display name (existing) |
| `price` | `BIGINT` | `NOT NULL` | - | Selling price in VND (`> 0`) (existing) |
| `original_price` | `BIGINT` | `NOT NULL` | - | Original list price in VND (`>= price`) (existing) |
| `discount_percent` | `INT` | `NOT NULL` | `0` | Auto-calculated: `round((original_price - price) * 100.0 / original_price)` (existing) |
| `rating` | `NUMERIC(3, 1)` | `NOT NULL` | `5.0` | Average rating `0.0`–`5.0` (existing) |
| `reviews_count` | `INT` | `NOT NULL` | `0` | Review count `>= 0` (existing) |
| `badge` | `VARCHAR(100)` | `NULL` | `NULL` | Optional badge label, e.g. `"Bán chạy"`, `"Mới ra mắt"` (existing) |
| `badge_type` | `VARCHAR(50)` | `NULL` | `NULL` | Optional badge style: `bestseller`, `sale`, `featured`, `new` (existing) |
| `image` | `VARCHAR(500)` | `NOT NULL` | - | Primary product image URL (existing) |
| `description` | `TEXT` | `NOT NULL` | - | Detailed product description (existing) |
| `specs_json` | `TEXT` | `NULL` | `NULL` | JSON object mapping specification name to value (existing) |
| `in_stock` | `BOOLEAN` | `NOT NULL` | `TRUE` | Derived from `stock_quantity > 0` (existing) |
| `stock_quantity` | `INT` | `NOT NULL` | `50` | Physical available units (`>= 0`) (existing) |
| `is_active` | `BOOLEAN` | `NOT NULL` | `TRUE` | **NEW**: Commercial visibility (`TRUE` = active on storefront, `FALSE` = hidden/discontinued) |
| `created_at` | `TIMESTAMP` | `NULL` | `CURRENT_TIMESTAMP` | Creation timestamp (existing) |
| `updated_at` | `TIMESTAMP` | `NULL` | `CURRENT_TIMESTAMP` | Last update timestamp (existing) |

### 1.2. Table: `inventory_adjustments` (New)

| Column | Type | Nullable | Default | Constraints / Notes |
|--------|------|----------|---------|---------------------|
| `id` | `BIGSERIAL` | `NOT NULL` | auto | Primary Key |
| `product_id` | `VARCHAR(50)` | `NOT NULL` | - | FK to `products(id) ON DELETE CASCADE` |
| `previous_quantity` | `INT` | `NOT NULL` | - | Stock quantity before adjustment (`>= 0`) |
| `quantity_change` | `INT` | `NOT NULL` | - | Signed delta (`!= 0`, e.g. `+20` or `-5`) |
| `new_quantity` | `INT` | `NOT NULL` | - | Stock quantity after adjustment (`previous_quantity + quantity_change >= 0`) |
| `reason` | `VARCHAR(500)` | `NOT NULL` | - | Mandatory business reason for the stock adjustment |
| `adjusted_by` | `VARCHAR(150)` | `NOT NULL` | - | Email of the administrator who performed the adjustment |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` | Timestamp of adjustment |

**New Indexes**:
- `idx_products_is_active ON products(is_active)`
- `idx_inventory_adjustments_product_id ON inventory_adjustments(product_id)`
- `idx_inventory_adjustments_created_at ON inventory_adjustments(created_at DESC)`

---

## 2. Availability & Visibility State Rules

| `isActive` | `stockQuantity` | `inStock` | Storefront List (`GET /products`) | Detail Page (`/products/:id`) | Add to Cart / Checkout | Order Cancel Restock Behavior |
|------------|-----------------|-----------|-----------------------------------|-------------------------------|------------------------|-------------------------------|
| `true` | `> 0` | `true` | Visible | `"Còn hàng (X sản phẩm)"`, Buy Enabled | Allowed (up to `stockQuantity`) | `stockQuantity += qty`, `inStock = true`, `isActive` stays `true` |
| `true` | `0` | `false` | Visible (marked out of stock) | `"Tạm hết hàng"`, Buy Disabled | Rejected (`400 Bad Request`) | `stockQuantity += qty`, `inStock = true`, `isActive` stays `true` |
| `false` | `>= 0` | `stockQuantity > 0` | **Hidden** (Visible only in Admin) | `"Sản phẩm đã ngừng kinh doanh"`, Buy Disabled | Rejected (`400 Bad Request`) | `stockQuantity += qty`, `inStock = (restored > 0)`, **`isActive` stays `false`** |

---

## 3. DTO Specifications

### 3.1. `CreateProductRequest` (`POST /api/v1/admin/products`)
- `id` (`String`, optional, max 50 chars): Optional custom ID; if blank, auto-generated as `prod-<timestamp/sequence>`.
- `name` (`String`, required, `@NotBlank`, max 255 chars): Product name.
- `categorySlug` (`String`, required, `@NotBlank`, max 50 chars): Must match an existing `Category.slug`.
- `price` (`Long`, required, `@NotNull`, `@Min(1)`): Selling price in VND.
- `originalPrice` (`Long`, required, `@NotNull`, `@Min(1)`): Must satisfy `originalPrice >= price`.
- `badge` (`String`, optional, max 100 chars): Display badge text.
- `badgeType` (`String`, optional, max 50 chars): One of `bestseller`, `sale`, `featured`, `new`, or null/empty.
- `image` (`String`, required, `@NotBlank`, max 500 chars): Primary image URL.
- `gallery` (`List<String>`, optional): Ordered list of image URLs (each max 500 chars). Defaults to `[image]` if empty.
- `description` (`String`, required, `@NotBlank`): Detailed description.
- `features` (`List<String>`, optional): Ordered list of key feature strings (each max 500 chars).
- `specs` (`Map<String, String>`, optional): Key-value technical specifications map.
- `initialStockQuantity` (`Integer`, optional, `@Min(0)`, default `0`): Initial stock count. If `> 0`, creates an initial `InventoryAdjustment` record (`reason = "Khởi tạo tồn kho ban đầu"`).
- `isActive` (`Boolean`, optional, default `true`): Initial visibility state.

### 3.2. `UpdateProductRequest` (`PUT /api/v1/admin/products/{id}`)
- `name` (`String`, required, `@NotBlank`, max 255 chars)
- `categorySlug` (`String`, required, `@NotBlank`, max 50 chars)
- `price` (`Long`, required, `@NotNull`, `@Min(1)`)
- `originalPrice` (`Long`, required, `@NotNull`, `@Min(1)`): Must satisfy `originalPrice >= price`.
- `badge` (`String`, optional, max 100 chars)
- `badgeType` (`String`, optional, max 50 chars)
- `image` (`String`, required, `@NotBlank`, max 500 chars)
- `gallery` (`List<String>`, optional)
- `description` (`String`, required, `@NotBlank`)
- `features` (`List<String>`, optional)
- `specs` (`Map<String, String>`, optional)
- `isActive` (`Boolean`, optional): Updates visibility if provided.
*(Note: `stockQuantity` is intentionally excluded from `UpdateProductRequest`; all post-creation stock changes must use `AdjustStockRequest`.)*

### 3.3. `UpdateProductVisibilityRequest` (`PATCH /api/v1/admin/products/{id}/visibility`)
- `isActive` (`Boolean`, required, `@NotNull`): `true` to list for sale, `false` to hide/discontinue.

### 3.4. `AdjustStockRequest` (`POST /api/v1/admin/products/{id}/stock-adjustments`)
- `quantityChange` (`Integer`, required, `@NotNull`): Signed integer delta (`!= 0`). Resulting `previousQuantity + quantityChange` must be `>= 0`.
- `reason` (`String`, required, `@NotBlank`, max 500 chars): Mandatory business explanation for the stock adjustment.

### 3.5. `InventoryAdjustmentResponseDTO`
- `id` (`Long`)
- `productId` (`String`)
- `productName` (`String`)
- `previousQuantity` (`Integer`)
- `quantityChange` (`Integer`)
- `newQuantity` (`Integer`)
- `reason` (`String`)
- `adjustedBy` (`String`)
- `createdAt` (`LocalDateTime`)

### 3.6. `CreateCategoryRequest` (`POST /api/v1/admin/categories`)
- `slug` (`String`, required, `@NotBlank`, max 50 chars, lowercase alphanumeric + hyphens): Unique category slug.
- `name` (`String`, required, `@NotBlank`, max 255 chars): Display name.
- `description` (`String`, optional): Category description.
- `image` (`String`, required, `@NotBlank`, max 500 chars): Category thumbnail URL.

### 3.7. `ProductResponseDTO` (Extended)
Adds the following fields to existing `ProductResponseDTO`:
- `isActive` (`Boolean`, non-null, default `true`)
- `createdAt` (`LocalDateTime`, nullable)
- `updatedAt` (`LocalDateTime`, nullable)

