# Phase 1 API Contracts: Product Management & Product Detail Page

**Feature**: `002-product-management` | **Base URL**: `/api/v1`

All responses use the standard `ApiResponse<T>` envelope:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "timestamp": "2026-11-06T15:40:00"
}
```

---

## 1. Public Storefront Catalog Endpoints (`/api/v1/products`, `/api/v1/categories`)

### 1.1. List Active Products (Public)
- **Endpoint**: `GET /api/v1/products`
- **Auth**: Public (`permitAll`)
- **Query Params**:
  - `category` (optional, `String`, default `"all"`): Category slug filter.
  - `search` (optional, `String`, default `""`): Case-insensitive keyword match on `name`, `categoryName`, or `description`.
  - `page` (optional, `int`, default `0`)
  - `size` (optional, `int`, default `12`)
  - `sort` (optional, `String`, default `"id"`): `id`, `price_asc`, `price_desc`, `rating`.
- **Behavior**: Filters strictly by `isActive = true`.
- **Response** (`200 OK`): `ApiResponse<PageResponse<ProductResponseDTO>>`.

### 1.2. Get Product Detail by ID (Public Shareable URL Support)
- **Endpoint**: `GET /api/v1/products/{id}`
- **Auth**: Public (`permitAll`)
- **Behavior**: Returns full product details for both `isActive = true` and `isActive = false` products so bookmarked/shared URLs (`/products/:id`) can render product information alongside an explicit `"Sản phẩm đã ngừng kinh doanh"` status when `isActive == false`.
- **Response** (`200 OK`): `ApiResponse<ProductResponseDTO>` (includes `isActive`, `inStock`, `stockQuantity`, `gallery`, `features`, `specs`).
- **Error Responses**:
  - `404 Not Found`: Product ID does not exist.

### 1.3. List Active Bestsellers (Public)
- **Endpoint**: `GET /api/v1/products/bestsellers`
- **Auth**: Public (`permitAll`)
- **Behavior**: Returns products where `badgeType = 'bestseller'` AND `isActive = true`.
- **Response** (`200 OK`): `ApiResponse<List<ProductResponseDTO>>`.

---

## 2. Administrator Catalog & Inventory Endpoints (`/api/v1/admin/products`, `/api/v1/admin/categories`)

> **Security**: All `/api/v1/admin/**` endpoints require a valid JWT with `ROLE_ADMIN` authority (`SecurityConfig`). Unauthenticated requests return `401`/`403`; authenticated `ROLE_USER` requests return `403 Forbidden`.

### 2.1. List All Products for Admin (Including Hidden/Discontinued)
- **Endpoint**: `GET /api/v1/admin/products`
- **Auth**: Required (`ROLE_ADMIN`)
- **Query Params**:
  - `category` (optional, `String`): Category slug (`all` or omitted for all categories).
  - `search` (optional, `String`): Keyword search across `id`, `name`, `categoryName`, `description`.
  - `isActive` (optional, `Boolean`): Filter by commercial visibility (`true` = active, `false` = hidden/discontinued).
  - `inStock` (optional, `Boolean`): Filter by stock status (`true` = in stock, `false` = out of stock).
  - `page` (optional, `int`, default `0`)
  - `size` (optional, `int`, default `20`)
- **Response** (`200 OK`): `ApiResponse<PageResponse<ProductResponseDTO>>`.

### 2.2. Create Product (Admin)
- **Endpoint**: `POST /api/v1/admin/products`
- **Auth**: Required (`ROLE_ADMIN`)
- **Request Body** (`CreateProductRequest`):
  ```json
  {
    "name": "Máy rửa bát độc lập HomeNest EcoWash 14 Bộ",
    "categorySlug": "kitchen",
    "price": 7990000,
    "originalPrice": 9990000,
    "badge": "Mới ra mắt",
    "badgeType": "new",
    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Công nghệ rửa nước nóng 75 độ C kết hợp sấy khí tươi Turbo Drying diệt khuẩn 99.99%.",
    "features": [
      "Sức chứa 14 bộ bát đĩa châu Âu (3 giàn rửa)",
      "Tiết kiệm nước chỉ 9.5L mỗi chu trình rửa"
    ],
    "specs": {
      "Dung tích": "14 bộ",
      "Công suất": "1850W",
      "Độ ồn": "44 dB",
      "Bảo hành": "36 tháng"
    },
    "initialStockQuantity": 25,
    "isActive": true
  }
  ```
- **Response** (`201 Created`): `ApiResponse<ProductResponseDTO>` (with auto-calculated `discountPercent = 20`, `inStock = true`, `stockQuantity = 25`, and initial `InventoryAdjustment` logged).
- **Error Responses**:
  - `400 Bad Request`: Validation error (`price <= 0`, `originalPrice < price`, blank required fields, or duplicate ID).
  - `404 Not Found`: `categorySlug` does not exist.

### 2.3. Update Product Details (Admin)
- **Endpoint**: `PUT /api/v1/admin/products/{id}`
- **Auth**: Required (`ROLE_ADMIN`)
- **Request Body** (`UpdateProductRequest`): Same metadata/pricing/image/features/specs fields as creation (excludes `stockQuantity`).
- **Response** (`200 OK`): `ApiResponse<ProductResponseDTO>`.
- **Error Responses**:
  - `400 Bad Request`: Invalid pricing (`originalPrice < price` or `price <= 0`) or blank required fields.
  - `404 Not Found`: Product ID or `categorySlug` not found.

### 2.4. Toggle Product Visibility / Discontinue (Admin)
- **Endpoint**: `PATCH /api/v1/admin/products/{id}/visibility`
- **Auth**: Required (`ROLE_ADMIN`)
- **Request Body** (`UpdateProductVisibilityRequest`):
  ```json
  {
    "isActive": false
  }
  ```
- **Response** (`200 OK`): `ApiResponse<ProductResponseDTO>`.

### 2.5. Adjust Product Stock with Mandatory Reason (Admin)
- **Endpoint**: `POST /api/v1/admin/products/{id}/stock-adjustments`
- **Auth**: Required (`ROLE_ADMIN`)
- **Request Body** (`AdjustStockRequest`):
  ```json
  {
    "quantityChange": 15,
    "reason": "Nhập bổ sung lô hàng tháng 11 từ nhà phân phối"
  }
  ```
- **Behavior**: Locks product row (`PESSIMISTIC_WRITE`), verifies `quantityChange != 0` and `stockQuantity + quantityChange >= 0`, updates `stockQuantity` and `inStock`, and records `InventoryAdjustment` with authenticated admin email.
- **Response** (`200 OK`): `ApiResponse<InventoryAdjustmentResponseDTO>`.
- **Error Responses**:
  - `400 Bad Request`: `reason` is blank, `quantityChange == 0`, or resulting `newQuantity < 0`.
  - `404 Not Found`: Product ID not found.

### 2.6. Get Product Stock Adjustment History (Admin)
- **Endpoint**: `GET /api/v1/admin/products/{id}/stock-adjustments`
- **Auth**: Required (`ROLE_ADMIN`)
- **Response** (`200 OK`): `ApiResponse<List<InventoryAdjustmentResponseDTO>>` ordered by `createdAt DESC`.

### 2.7. Create Category (Admin)
- **Endpoint**: `POST /api/v1/admin/categories`
- **Auth**: Required (`ROLE_ADMIN`)
- **Request Body** (`CreateCategoryRequest`):
  ```json
  {
    "slug": "bathroom",
    "name": "Thiết bị phòng tắm",
    "description": "Bồn cầu thông minh, máy nước nóng bơm nhiệt, vòi sen nhiệt độ",
    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
  }
  ```
- **Response** (`201 Created`): `ApiResponse<CategoryResponseDTO>`.
- **Error Responses**:
  - `400 Bad Request`: Duplicate `slug` or missing required fields.

---

## 3. Cart & Order Coordination Rules

- **`POST /api/v1/cart/items` & `PUT /api/v1/cart/items/{productId}`**: Rejects adding/updating a product if `Boolean.FALSE.equals(product.getIsActive())` with `400 Bad Request` (`"Sản phẩm '...' hiện đã ngừng kinh doanh."`).
- **`POST /api/v1/orders`**: Acquires `PESSIMISTIC_WRITE` lock on each ordered `Product`; if `Boolean.FALSE.equals(product.getIsActive())`, rejects checkout with `400 Bad Request` (`"Sản phẩm '...' hiện đã ngừng kinh doanh."`).
- **`POST /api/v1/orders/{orderNumber}/cancel`**: Restores `stockQuantity` and updates `inStock = (restoredStock > 0)` under `PESSIMISTIC_WRITE` lock while preserving `product.isActive` unchanged.

