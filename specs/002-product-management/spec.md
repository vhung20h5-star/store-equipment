# Feature Specification: Product Management & Product Detail Page

**Feature Branch**: `feat/product-management` (`002-product-management`)

**Created**: 2026-11-06

**Status**: Approved

**Input**: User description: "Đặc tả đợt 'Quản lý sản phẩm + trang chi tiết' cho HomeNest từ bản thiết kế brainstorming đã duyệt: Admin thêm, sửa, ẩn/ngừng bán sản phẩm; quản lý giá, ảnh URL, danh mục, thông số và điều chỉnh tồn kho có lý do; Khách có trang chi tiết sản phẩm với URL riêng, tình trạng hàng và nút thêm giỏ; Giữ lịch sử sản phẩm trong đơn hàng; phối hợp đúng với đặt/hủy đơn và hoàn kho; Ví ưu đãi để đợt sau."

## Clarifications

### Session 2026-11-06

- Q: Quản lý hình ảnh sản phẩm qua URL hay upload file vật lý trong phiên bản đầu? → A: Dùng URL ảnh (cho cả ảnh đại diện chính và danh sách ảnh phụ gallery) kèm khung xem trước (preview) trực tiếp trên giao diện quản trị; chưa làm upload file vật lý.
- Q: Có tách biến thể sản phẩm (SKU con theo màu sắc/dung tích) trong phiên bản đầu không? → A: Không tách SKU biến thể con; mỗi sản phẩm là một mặt hàng độc lập, các thuộc tính kích thước/dung tích/màu sắc/công suất lưu trong bảng thông số kỹ thuật (`specs`), và Admin có thể chọn danh mục sẵn có hoặc tạo danh mục mới.
- Q: Sản phẩm bị ẩn/ngừng kinh doanh (`isActive = false`) xử lý thế nào với danh sách công khai, URL cũ, giỏ hàng và đơn hàng cũ? → A: Ẩn khỏi danh sách trang chủ/tìm kiếm/bán chạy; khách truy cập URL cũ (`/products/:id`) vẫn xem được thông tin nhưng hiển thị nhãn "Sản phẩm đã ngừng kinh doanh" và khóa nút thêm vào giỏ; chặn đặt hàng nếu sản phẩm ngừng bán còn nằm trong giỏ hàng; đơn hàng lịch sử giữ nguyên snapshot và khi hủy đơn cũ vẫn hoàn trả tồn kho vật lý nhưng giữ nguyên `isActive = false`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer Dedicated Product Detail Page & Shareable URL (Priority: P1)

Customers and visitors browsing HomeNest need a dedicated product detail page with its own unique, shareable URL (`/products/:id`) so they can inspect the full image gallery, pricing and discount percentage, real-time stock status ("Còn hàng", "Tạm hết hàng", or "Ngừng kinh doanh"), detailed description, key features, technical specifications table, related products in the same category, and add a selected quantity to their cart or copy the link to share with family and friends.

**Why this priority**: Providing a shareable URL and comprehensive product details is essential for customer purchasing confidence and direct navigation without relying solely on a homepage quick-view overlay.

**Independent Test**: Can be fully tested by navigating directly to `/products/prod-1` (including browser refresh), switching gallery images, inspecting specifications and stock count, copying the shareable link, and adding a chosen quantity to the cart; as well as visiting the URL of an out-of-stock or discontinued product and verifying purchase actions are disabled with clear status badges.

**Acceptance Scenarios**:

1. **Given** an active, in-stock product (`isActive = true`, `inStock = true`, `stockQuantity > 0`), **When** a visitor navigates to `/products/:id` (from a product card or direct URL), **Then** the page renders the full image gallery, current price, original price, discount percentage, stock badge showing available quantity, features list, technical specifications table, quantity selector (capped at `stockQuantity`), and an enabled "Thêm vào giỏ hàng" button.
2. **Given** a visitor is on `/products/:id`, **When** they click the "Chia sẻ" (Share/Copy Link) button, **Then** the full product URL is copied to the clipboard and a confirmation notification is displayed.
3. **Given** an active product whose stock has reached zero (`isActive = true`, `inStock = false`, `stockQuantity = 0`), **When** a visitor views `/products/:id`, **Then** the page displays a "Tạm hết hàng" badge and disables the quantity selector and "Thêm vào giỏ hàng" button.
4. **Given** a product that has been hidden/discontinued by an administrator (`isActive = false`), **When** a visitor opens its historical URL `/products/:id` directly, **Then** the page still displays the product's historical details with a prominent "Sản phẩm đã ngừng kinh doanh" badge and disables the "Thêm vào giỏ hàng" button.
5. **Given** a visitor navigates to `/products/:id` with a non-existent product ID, **When** the page loads, **Then** the user sees a friendly "Không tìm thấy sản phẩm" state with a button to return to the store catalog.

---

### User Story 2 - Administrator Product & Category Catalog Management (Priority: P1)

Store administrators (`ROLE_ADMIN`) need a dedicated management interface and protected API endpoints to view all products (including hidden/discontinued items), create new products, update existing product details (name, category, selling price, original price, badges, description, primary image URL, gallery image URLs with live preview, highlighted features, and key-value technical specifications), create new categories when needed, and toggle product visibility (`isActive`) between active sale and discontinued—all without modifying source code or database scripts.

**Why this priority**: Empowering administrators to update catalog items, pricing, specifications, and visibility without code deployments is a primary business goal of this release.

**Independent Test**: Can be fully tested by logging in as `admin@homenest.vn`, creating a new product with specifications and image URLs, verifying it appears immediately on the storefront and at `/products/:id`, editing its price and specifications, toggling its visibility to hidden (`isActive = false`), and verifying it disappears from public catalog listings while remaining visible in the Admin catalog table.

**Acceptance Scenarios**:

1. **Given** an authenticated administrator (`ROLE_ADMIN`), **When** they submit the Create Product form with valid name, category, `price > 0`, `originalPrice >= price`, primary image URL, gallery URLs, description, features, and `specs` key-value pairs, **Then** the system automatically calculates `discountPercent`, saves the product as active, and makes it immediately accessible on the storefront and at `/products/:id`.
2. **Given** an existing product, **When** the administrator updates its name, category, pricing, image URLs, features, or technical specifications, **Then** the updated details and recalculated `discountPercent` are persisted and reflected immediately on both the storefront and `/products/:id`.
3. **Given** an active product (`isActive = true`), **When** the administrator toggles its visibility to hidden/discontinued (`isActive = false`), **Then** the product is immediately excluded from public catalog listings (`GET /api/v1/products`), bestseller lists (`GET /api/v1/products/bestsellers`), and public category item counts, while remaining visible in the administrator product list.
4. **Given** a hidden/discontinued product (`isActive = false`), **When** the administrator toggles its visibility back to active (`isActive = true`), **Then** the product reappears in public catalog listings with its current stock status intact.
5. **Given** an administrator needs to classify products under a new product line, **When** they create a new category with name, slug, description, and image URL, **Then** the category is persisted and becomes selectable in the product form and storefront filters.
6. **Given** a regular customer (`ROLE_USER`) or unauthenticated guest attempts to call any `/api/v1/admin/products/**` or `/api/v1/admin/categories/**` endpoint, **When** the request is processed by the backend, **Then** the system rejects the request with `401 Unauthorized` or `403 Forbidden`.

---

### User Story 3 - Reason-Audited Inventory Adjustment & Concurrency Safety (Priority: P1)

Store administrators (`ROLE_ADMIN`) need to adjust product stock quantities (adding new shipment stock, deducting damaged/lost units, or setting an exact physical count) with a mandatory business reason, and view an chronological audit trail of all stock adjustments for each product. Every stock adjustment must be concurrency-safe alongside simultaneous customer order placements and order cancellations.

**Why this priority**: Unaudited stock edits make inventory discrepancies impossible to trace, and uncoordinated stock updates risk race conditions with live customer orders.

**Independent Test**: Can be tested by logging in as an administrator, submitting a stock adjustment (`+20` with reason "Nhập lô hàng mới tháng 11"), verifying `stockQuantity` increases and an audit record is created, attempting an adjustment without a reason or resulting in negative stock (verifying `400 Bad Request` rejection), and verifying `inStock` flips automatically between `false` (`stockQuantity == 0`) and `true` (`stockQuantity > 0`).

**Acceptance Scenarios**:

1. **Given** a product with `stockQuantity = 10`, **When** an administrator submits a stock adjustment of `+15` (or target quantity `25`) with reason "Nhập kho đợt 1", **Then** the product's `stockQuantity` updates to `25`, `inStock` is `true`, and an immutable audit entry recording `previousQuantity = 10`, `quantityChange = +15`, `newQuantity = 25`, `reason`, `adjustedBy`, and `createdAt` is saved.
2. **Given** a product with `stockQuantity = 5`, **When** an administrator submits a stock adjustment of `-5` with reason "Xuất hủy hàng lỗi", **Then** `stockQuantity` becomes `0`, `inStock` automatically updates to `false`, and the audit entry is recorded.
3. **Given** a product with `stockQuantity = 0` and `inStock = false`, **When** an administrator submits a positive stock adjustment (`+10`) with a valid reason, **Then** `stockQuantity` becomes `10` and `inStock` automatically recovers to `true`.
4. **Given** an administrator attempts to adjust stock without providing a reason (blank reason) OR with a negative delta that would make `newQuantity < 0`, **When** the request is submitted, **Then** the backend rejects the request with `400 Bad Request` and leaves `stockQuantity` unchanged.
5. **Given** an administrator inspects a product's inventory history, **When** they open the Stock Adjustment History view, **Then** the system displays all historical adjustments for that product ordered from newest to oldest.

---

### User Story 4 - Historical Order Preservation & Cart/Checkout Coordination (Priority: P1)

When an administrator edits a product's name, price, or images, or hides/discontinues a product, historical orders must preserve the exact product snapshot (name, image, unit price, line total) from the moment the order was placed. Meanwhile, active shopping carts and checkout flows must prevent purchasing discontinued or out-of-stock products, and order cancellations must accurately restore physical stock without accidentally re-activating a discontinued product.

**Why this priority**: Protects financial/accounting accuracy for past orders and prevents customers from checking out with discontinued items or inadvertently re-opening hidden products upon order cancellation.

**Independent Test**: Can be tested by placing an order for Product X, then as Admin changing Product X's price and setting `isActive = false`, verifying the existing order still displays the original price and name, verifying a new order or cart addition for Product X is blocked, and cancelling the existing `CONFIRMED` order to verify `stockQuantity` is incremented while `isActive` remains `false`.

**Acceptance Scenarios**:

1. **Given** a customer placed an order containing Product X at `1,990,000 VND`, **When** an administrator later changes Product X's price to `2,490,000 VND`, changes its name, or sets `isActive = false`, **Then** viewing the historical order (in Customer "My Orders", Guest Lookup, or Admin Orders) still displays the original snapshot name, image, and `1,990,000 VND` price.
2. **Given** a customer has Product X in their cart (guest local cart or authenticated server cart) and an administrator subsequently sets Product X to `isActive = false` (or `stockQuantity = 0`), **When** the customer views their cart or attempts to place an order (`POST /api/v1/orders`), **Then** the cart marks Product X as unavailable ("Ngừng kinh doanh" or "Hết hàng") and checkout is blocked with a clear Vietnamese message until the unavailable item is removed.
3. **Given** a customer or guest attempts to add a discontinued product (`isActive = false`) to the server cart (`POST /api/v1/cart/items`), **When** the request is processed, **Then** the backend rejects the request with `400 Bad Request`.
4. **Given** a `CONFIRMED` or `PROCESSING` order contains 2 units of Product X, and an administrator has since set Product X to `isActive = false` (discontinued), **When** the order is cancelled, **Then** Product X's `stockQuantity` is incremented by 2 and `inStock` reflects `stockQuantity > 0`, **but `isActive` remains `false`** so the discontinued product is not automatically re-listed on the public storefront.

---

### Edge Cases

- **Concurrent Order Checkout / Cancellation and Admin Stock Adjustment**: When a customer places or cancels an order at the exact same moment an administrator adjusts stock for the same product, both operations MUST acquire a database row-level pessimistic write lock (`PESSIMISTIC_WRITE`) on the `Product` record so updates serialize cleanly without lost updates.
- **Zero-Change Stock Adjustment**: Submitting a stock adjustment where `quantityChange == 0` (or `newQuantity == previousQuantity`) MUST be rejected with a `400 Bad Request` validation error to prevent empty noise in the inventory audit log.
- **Price & Discount Boundary Values**: If `originalPrice == price`, `discountPercent` MUST evaluate to `0`. Setting `originalPrice < price` or `price <= 0` MUST be rejected with `400 Bad Request`.
- **Broken or Empty Gallery URLs**: If an administrator provides no secondary gallery URLs, the product's `gallery` defaults to a single-element list containing the primary `image` URL so the detail page gallery never renders empty.
- **Cart Synchronization with Discontinued Items**: When a guest logs in and `POST /api/v1/cart/sync` merges local cart items into the server cart, any item whose product does not exist or has `isActive = false` MUST be safely skipped so cart synchronization never crashes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST distinguish between physical stock availability (`inStock`, derived automatically from `stockQuantity > 0`) and commercial visibility (`isActive`, controlled by administrators to show or hide/discontinue a product).
- **FR-002**: Public product listing (`GET /api/v1/products`) and bestseller listing (`GET /api/v1/products/bestsellers`) MUST return only active products (`isActive = true`). Public category product counts (`GET /api/v1/categories`) MUST count only active products (`isActive = true`).
- **FR-003**: Public product detail lookup (`GET /api/v1/products/{id}`) MUST return the product record (including `isActive`, `inStock`, `stockQuantity`, `gallery`, `features`, and `specs`) for both active and discontinued (`isActive = false`) products so shared/bookmarked URLs continue to resolve with an explicit discontinued status.
- **FR-004**: Frontend application MUST provide a dedicated route `/products/:id` rendering full product details, interactive image gallery, stock availability badge, quantity selector, add-to-cart action, copy-link share button, and related products from the same category.
- **FR-005**: Administrators (`ROLE_ADMIN`) MUST be able to list and filter all products across the store (including `isActive = false` and `inStock = false` items) via `GET /api/v1/admin/products` with support for category filter, visibility (`isActive`) filter, stock status (`inStock`) filter, keyword search, and pagination.
- **FR-006**: Administrators (`ROLE_ADMIN`) MUST be able to create new products (`POST /api/v1/admin/products`) and update existing products (`PUT /api/v1/admin/products/{id}`), managing name, category, selling price (`price > 0`), original price (`originalPrice >= price`), badge/badgeType, description, primary image URL, ordered gallery image URLs, ordered feature bullet points, and key-value technical specifications (`specs`).
- **FR-007**: System MUST automatically compute `discountPercent` on product creation and update as `Math.round((originalPrice - price) * 100.0 / originalPrice)` when `originalPrice > price`, and `0` when `originalPrice == price`.
- **FR-008**: Administrators (`ROLE_ADMIN`) MUST be able to toggle a product's commercial visibility (`isActive`) via `PATCH /api/v1/admin/products/{id}/visibility` without deleting historical product data or breaking existing order item references.
- **FR-009**: Administrators (`ROLE_ADMIN`) MUST be able to adjust a product's stock quantity via `POST /api/v1/admin/products/{id}/stock-adjustments` by supplying a non-zero `quantityChange` (or target quantity) and a mandatory non-blank `reason`. Direct mutation of `stockQuantity` through the general product update endpoint (`PUT /api/v1/admin/products/{id}`) MUST NOT bypass the reason-audited adjustment flow during edits.
- **FR-010**: Every stock adjustment MUST execute inside a database transaction acquiring a `PESSIMISTIC_WRITE` lock on the product, verify that the resulting `stockQuantity >= 0`, automatically synchronize `inStock = (newQuantity > 0)`, and persist an `InventoryAdjustment` audit record (`productId`, `previousQuantity`, `quantityChange`, `newQuantity`, `reason`, `adjustedBy`, `createdAt`).
- **FR-011**: Administrators (`ROLE_ADMIN`) MUST be able to retrieve the chronological stock adjustment audit history for any product via `GET /api/v1/admin/products/{id}/stock-adjustments`.
- **FR-012**: Administrators (`ROLE_ADMIN`) MUST be able to create new product categories (`POST /api/v1/admin/categories`) with unique `slug`, `name`, `description`, and `image` URL.
- **FR-013**: Order creation (`POST /api/v1/orders`) and server cart item addition/update (`POST /api/v1/cart/items`, `PUT /api/v1/cart/items/{productId}`) MUST reject products where `isActive = false` with a clear Vietnamese business error message (`400 Bad Request`).
- **FR-014**: Order cancellation (`OrderServiceImpl.cancelOrder`) MUST restore `stockQuantity` and update `inStock = (restoredStock > 0)` under `PESSIMISTIC_WRITE` lock while preserving the product's existing `isActive` flag unchanged.
- **FR-015**: All `/api/v1/admin/**` endpoints MUST be protected at the backend security layer (`ROLE_ADMIN` authority required), returning `401 Unauthorized` for unauthenticated requests and `403 Forbidden` for authenticated non-admin users (`ROLE_USER`).

### Key Entities

- **Product**: Catalog item identified by `id` (`VARCHAR(50)`), belonging to a `Category` (`category_slug`), with pricing (`price`, `originalPrice`, `discountPercent`), media (`image`, `gallery` list of `ProductGallery`), descriptive content (`description`, `features` list of `ProductFeature`, `specsJson` key-value map), physical inventory state (`stockQuantity`, `inStock`), and commercial visibility state (`isActive`).
- **Category**: Product classification with `id`, unique `slug`, `name`, `description`, `image` URL, and computed active product count (`itemCount`).
- **InventoryAdjustment**: Immutable audit log entry recording a manual stock change by an administrator (`id`, `productId`, `previousQuantity`, `quantityChange`, `newQuantity`, `reason`, `adjustedBy`, `createdAt`).
- **OrderItem**: Historical line-item snapshot within an `Order` (`productId`, `productName`, `productImage`, `price`, `quantity`, `totalPrice`) that remains immutable regardless of subsequent catalog edits or product deactivation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create a new product or update an existing product's price, images, specifications, and visibility from the web UI in under 60 seconds without any code or SQL changes, and changes reflect immediately on public pages.
- **SC-002**: 100% of manual stock changes require a non-empty reason and generate an immutable audit log entry with exact before/after quantities and administrator identity.
- **SC-003**: 100% of concurrent stock mutations (customer order placement, order cancellation restock, and admin stock adjustment) maintain exact inventory consistency with zero negative stock counts or lost updates.
- **SC-004**: 100% of hidden/discontinued products (`isActive = false`) are excluded from public storefront listings and blocked from new cart additions or order checkouts, while 100% of their direct `/products/:id` URLs remain accessible with a clear "Sản phẩm đã ngừng kinh doanh" status.
- **SC-005**: 100% of historical orders retain their exact original product name, image, and unit price after the underlying product is edited or discontinued by an administrator.
- **SC-006**: 100% of unauthorized attempts (` Guest` or `ROLE_USER`) to invoke `/api/v1/admin/products/**` or `/api/v1/admin/categories/**` are blocked by the backend with HTTP `401`/`403`.

## Assumptions

- **Image Hosting**: Product primary and gallery images in v1 are provided as standard `http://` or `https://` URLs with instant image preview in the Admin form. File upload storage (S3/Cloudinary) is deferred to a future iteration.
- **Product Variants**: Each product represents a single purchasable item in v1; attributes like capacity, power, color, and dimensions are modeled in the flexible key-value `specs` map rather than multi-SKU variant trees.
- **Out of Scope**: Customer Voucher Wallet (Ví ưu đãi), customer-submitted product reviews, and bulk CSV import/export are explicitly out of scope for this release.
