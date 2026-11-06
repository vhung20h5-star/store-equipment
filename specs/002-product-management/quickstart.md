# Quickstart & Validation Guide: Product Management & Product Detail Page

**Feature**: `002-product-management`

## 1. Prerequisites

- Java 21+ and Maven Wrapper (`./mvnw` or `.\mvnw.cmd`)
- Node.js 20+ and `npm`

## 2. Running Automated Verification

### Backend Integration Tests (H2 In-Memory)
From the repository root:
```powershell
cd backend
.\mvnw.cmd clean test
```
Expected outcome: All integration tests (existing 50+ tests + new Admin Product CRUD, visibility toggling, reason-audited stock adjustment, RBAC 403 checks, cart/order discontinued-product protection, and cancellation restock coordination tests) pass with 0 failures.

### Frontend Lint & Production Build
From the repository root:
```powershell
cd frontend
npm run lint
npm run build
```
Expected outcome: Zero ESLint errors and clean TypeScript + Vite production bundle build.

## 3. Manual End-to-End Validation Scenarios

### Demo Accounts
- **Customer Account**: `demo@homenest.vn` / `Password@123` (`ROLE_USER`)
- **Admin Account**: `admin@homenest.vn` / `Admin@123` (`ROLE_ADMIN`)

### Scenario A: Customer Product Detail Page & Shareable URL (`/products/:id`)
1. Open `http://localhost:5173` and click on a product name or image (e.g., `"Nồi chiên không dầu HomeNest DualZone 6.5L"`), or navigate directly to `http://localhost:5173/products/prod-1`.
2. Verify the dedicated Product Detail Page loads with:
   - Breadcrumb navigation (`Trang chủ > Thiết bị nhà bếp > ...`),
   - Main image and interactive thumbnail gallery,
   - Selling price, original price, discount percentage badge, and stock badge (`"Còn hàng (45 sản phẩm)"`),
   - Detailed description, highlighted features list, and 2-column technical specifications table (`specs`),
   - Related products in the same category.
3. Click **"Chia sẻ"** and verify the URL `http://localhost:5173/products/prod-1` is copied to the clipboard with a toast notification.
4. Select quantity `2` and click **"Thêm vào giỏ hàng"**, verifying the cart drawer updates accurately.

### Scenario B: Admin Product Creation, Editing & Reason-Audited Stock Adjustment
1. Log in as `admin@homenest.vn` (`Admin@123`).
2. Open the User menu in the Navbar and click **"Quản trị sản phẩm (Admin)"**.
3. Click **"Thêm sản phẩm mới"**, fill in the product name, category, selling price (`7,990,000`), original price (`9,990,000`), primary image URL, gallery URLs (verify live image previews appear), features, and technical specifications (`Dung tích: 14 bộ`, `Công suất: 1850W`), and save.
4. Verify `discountPercent` (`20%`) is calculated automatically and the new product is immediately accessible on the storefront and at `/products/<new-id>`.
5. On an existing product, click **"Chỉnh kho"**, enter `+15` with reason `"Nhập bổ sung lô hàng tháng 11"`, and submit.
6. Verify the stock count increases by `15` and the new adjustment entry appears in the **"Lịch sử điều chỉnh kho"** list with before/after quantities, reason, and admin email.

### Scenario C: Hiding/Discontinuing a Product & Coordinating with Cart, Old URLs, and Historical Orders
1. Place an order for `prod-1` as `demo@homenest.vn`.
2. As `admin@homenest.vn`, edit `prod-1`'s price and click **"Ngừng bán"** (`isActive = false`).
3. Verify `prod-1` disappears from the public homepage catalog and search results.
4. Visit `http://localhost:5173/products/prod-1` directly: verify the page still loads product details, shows a prominent **"Sản phẩm đã ngừng kinh doanh"** badge, and disables the **"Thêm vào giỏ hàng"** button.
5. Check the previously placed order in **"Đơn hàng của tôi"**: verify the historical order still displays the original price and product snapshot from the time of purchase.
6. Cancel that `CONFIRMED` order: verify `prod-1`'s `stockQuantity` increases in the Admin Product panel, while its visibility remains **"Ngừng kinh doanh"** (`isActive = false`).

