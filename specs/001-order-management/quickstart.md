# Quickstart & Validation Guide: Order Lifecycle Management

**Feature**: `001-order-management`

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
Expected outcome: All integration tests (existing 38 tests + new order lifecycle, cancellation, inventory restock, and admin authorization tests) pass with 0 failures.

### Frontend Lint & Production Build
From the repository root:
```powershell
cd frontend
npm run lint
npm run build
```
Expected outcome: Zero ESLint warnings/errors and clean TypeScript + Vite production bundle build.

## 3. Manual End-to-End Validation Scenarios

### Demo Accounts
- **Customer Account**: `demo@homenest.vn` / `Password@123` (`ROLE_USER`)
- **Admin Account**: `admin@homenest.vn` / `Admin@123` (`ROLE_ADMIN`)

### Scenario A: Customer Order Linking & Self-Service Cancellation
1. Log in as `demo@homenest.vn` (`Password@123`).
2. Add a product to the cart and complete checkout.
3. Open the User menu in the Navbar and click **"Đơn hàng của tôi"** (or open Order Lookup).
4. Verify the newly created order appears automatically under the user's orders in `CONFIRMED` status.
5. Click **"Hủy đơn hàng"**, enter a cancellation reason, and confirm.
6. Verify the order status changes to **"Đã hủy"** (`CANCELLED`), displays the cancellation reason, and the product's stock count is restored.

### Scenario B: Admin Order Lifecycle Fulfillment
1. Log in as `admin@homenest.vn` (`Admin@123`).
2. Open the User menu in the Navbar and click **"Quản lý đơn hàng (Admin)"**.
3. Filter orders by status or search by order number/phone.
4. Advance a `CONFIRMED` order to `PROCESSING` ("Đang đóng gói"), then `SHIPPED` ("Đang giao hàng"), and finally `DELIVERED` ("Đã giao hàng").
5. Verify that once `DELIVERED`, the payment status updates to `PAID` and no further status changes or cancellations are allowed.

