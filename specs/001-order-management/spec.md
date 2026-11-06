# Feature Specification: Order Lifecycle Management

**Feature Branch**: `feat/order-management`

**Created**: 2026-11-06

**Status**: Approved

**Input**: User description: "Phân tích tính năng quản lý vòng đời đơn hàng cho HomeNest dựa trên code hiện có. Làm rõ vai trò khách hàng/admin, quyền xem đơn, các trạng thái, điều kiện hủy và hoàn kho. Chốt phạm vi phiên bản đầu và tiêu chí nghiệm thu trước khi triển khai."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer & Guest Order Visibility & Ownership (Priority: P1)

Customers who place orders while signed in need their orders automatically linked to their account so they can view their complete personal order history at any time without manually entering order numbers or phone numbers. Meanwhile, guests who check out without an account must still be able to place orders and securely look up their order details using their order number and phone number.

**Why this priority**: Linking orders to user accounts and enforcing strict ownership access rules is the foundation for all subsequent customer self-service actions (tracking, history, and cancellation).

**Independent Test**: Can be fully tested by placing an order while logged in, viewing the personal order history list, verifying another logged-in user cannot see that order, and verifying a guest can still place and look up an order.

**Acceptance Scenarios**:

1. **Given** a logged-in customer places a new order, **When** the order is confirmed, **Then** the order is automatically associated with that customer's account and appears in their personal "My Orders" list ordered from newest to oldest.
2. **Given** a guest user places a new order without logging in, **When** the order is confirmed, **Then** the order is saved without an account link and can be looked up by order number or customer phone number.
3. **Given** Customer A and Customer B both have accounts, **When** Customer A views their "My Orders" list, **Then** Customer A sees only orders linked to Customer A's account and never sees Customer B's orders.

---

### User Story 2 - Self-Service Order Cancellation & Inventory Restock (Priority: P1)

Customers and guests need the ability to cancel an order they recently placed if they change their mind or entered wrong details, provided the warehouse has not started packing the order (`CONFIRMED` state). When an order is cancelled, the system must immediately return the reserved product quantities back to available stock and record the cancellation reason and actor.

**Why this priority**: Self-service cancellation with accurate inventory restoration prevents lost sales from locked stock and reduces manual customer support workload.

**Independent Test**: Can be tested by placing an order for a product with limited stock (including reducing stock to 0), cancelling the order while in `CONFIRMED` status, and verifying the order transitions to `CANCELLED`, product stock quantity is restored, `inStock` becomes true again, and duplicate cancellation attempts are rejected.

**Acceptance Scenarios**:

1. **Given** a logged-in customer owns an order in `CONFIRMED` status, **When** the customer submits a cancellation request with a reason, **Then** the order status changes to `CANCELLED`, cancellation metadata (timestamp, actor, reason) is recorded, and all ordered item quantities are added back to product stock.
2. **Given** a guest has an order in `CONFIRMED` status, **When** the guest submits a cancellation request providing the matching phone number and a reason, **Then** the order is cancelled and product inventory is restored.
3. **Given** a guest submits a cancellation request with a phone number that does not match the order's customer phone, **When** the request is processed, **Then** the system rejects the cancellation with an access denied / validation error and leaves the order unchanged.
4. **Given** an order has already progressed to `PROCESSING`, `SHIPPED`, or `DELIVERED`, **When** a customer or guest attempts to cancel the order, **Then** the system rejects the request with a clear message instructing them to contact support.
5. **Given** an order is already in `CANCELLED` status, **When** a repeat or concurrent cancellation request is submitted, **Then** the system rejects the duplicate request and guarantees product stock is only restored once (idempotency).

---

### User Story 3 - Administrator Order Lifecycle & Fulfillment Management (Priority: P2)

Store administrators (`ROLE_ADMIN`) need a centralized view to inspect all customer orders across the store, filter orders by status or search by order number/phone, advance orders through the fulfillment lifecycle (`CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`), and cancel orders in `CONFIRMED` or `PROCESSING` status when operational issues arise.

**Why this priority**: Without administrative fulfillment controls, orders remain stuck in `CONFIRMED` status forever and cannot complete their business lifecycle.

**Independent Test**: Can be tested by logging in as an administrator, filtering the order list, advancing an order step-by-step from `CONFIRMED` to `DELIVERED` (verifying payment status updates to `PAID`), and cancelling a `PROCESSING` order (verifying stock restoration).

**Acceptance Scenarios**:

1. **Given** an authenticated administrator views the order management panel, **When** they filter by status or search by keyword (order number, customer name, or phone), **Then** the system returns the matching paginated orders across all customers and guests.
2. **Given** an order in `CONFIRMED` status, **When** the administrator advances the status to `PROCESSING`, then `SHIPPED`, and finally `DELIVERED`, **Then** each valid transition succeeds and transitioning a `COD` order to `DELIVERED` automatically marks its payment status as `PAID`.
3. **Given** an order in `CONFIRMED` or `PROCESSING` status, **When** the administrator cancels the order with a reason, **Then** the order transitions to `CANCELLED`, product stock is restored, and if payment status was `PAID`, payment status transitions to `REFUNDED`.
4. **Given** an order in `SHIPPED`, `DELIVERED`, or `CANCELLED` status, **When** the administrator attempts an invalid transition (such as cancelling a `SHIPPED` or `DELIVERED` order, or moving backwards from `SHIPPED` to `CONFIRMED`), **Then** the system rejects the transition with a clear business rule error.
5. **Given** a regular customer (`ROLE_USER`) or unauthenticated visitor attempts to access administrative order endpoints, **When** the request is sent, **Then** the system denies access (`401 Unauthorized` or `403 Forbidden`).

---

### Edge Cases

- **Out-of-stock recovery on cancellation**: When an order purchases the last remaining unit of a product (`stockQuantity` drops from `1` to `0` and `inStock` becomes `false`), cancelling that order MUST increase `stockQuantity` back to `1` and flip `inStock` back to `true` so the product can be purchased again.
- **Concurrent cancellation requests**: If two requests attempt to cancel the same order simultaneously, row-level locking and status validation MUST ensure only one request succeeds and inventory is incremented exactly once.
- **Invalid state jumps**: Attempting to skip or reverse states (e.g., `DELIVERED` → `PROCESSING` or `CANCELLED` → `CONFIRMED`) MUST be rejected.
- **Guest order ownership verification on cancel**: A guest who only knows an `orderNumber` (e.g., guessed or seen on a screen) cannot cancel the order unless they also supply the matching `customerPhone` (unless the user is authenticated as the linked order owner or an administrator).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST associate newly created orders with the authenticated user's account (`userId`) when the order is placed by a signed-in user, while continuing to allow unauthenticated guest orders (`userId = null`).
- **FR-002**: Authenticated users MUST be able to view a list of their own orders sorted by creation time descending, including full item breakdown, status, payment status, and cancellation details if applicable.
- **FR-003**: Administrators (`ROLE_ADMIN`) MUST be able to view all orders in the system with support for status filtering, keyword search (by order number, customer phone, or customer name), and pagination.
- **FR-004**: System MUST enforce a strict order state machine with five states: `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.
- **FR-005**: System MUST only permit the following forward state transitions by administrators:
  - `CONFIRMED` → `PROCESSING` or `CANCELLED`
  - `PROCESSING` → `SHIPPED` or `CANCELLED`
  - `SHIPPED` → `DELIVERED`
  - `DELIVERED` and `CANCELLED` are terminal states with no outbound transitions permitted.
- **FR-006**: Customers (authenticated order owners) and Guests (verified by matching `customerPhone`) MUST be allowed to cancel an order ONLY when the order is in `CONFIRMED` status.
- **FR-007**: Every order cancellation (by customer, guest, or administrator) MUST require a non-empty cancellation reason and record `cancelledAt`, `cancelledBy` (`CUSTOMER`, `GUEST`, or `ADMIN`), and `cancelReason`.
- **FR-008**: Whenever an order transitions to `CANCELLED`, the system MUST atomically restore the `stockQuantity` for every product item in the order and set `inStock = true` whenever the restored `stockQuantity > 0`.
- **FR-009**: When an order transitions to `DELIVERED`, the system MUST automatically set `paymentStatus` to `PAID`. When an order with `paymentStatus = PAID` transitions to `CANCELLED`, the system MUST automatically set `paymentStatus` to `REFUNDED`.
- **FR-010**: System MUST prevent unauthorized users from viewing another user's account order list, cancelling another user's order, or invoking administrative order management actions.
- **FR-011**: System MUST provide a default demo administrator account (`admin@homenest.vn`) alongside the existing demo customer account (`demo@homenest.vn`) so administrative order lifecycle workflows can be tested and demonstrated out-of-the-box.

### Key Entities

- **Order**: Represents a customer purchase transaction. Key lifecycle attributes include `orderNumber`, optional `userId` (owner link), customer contact & shipping fields, `orderStatus` (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), `paymentMethod`, `paymentStatus` (`PENDING`, `PAID`, `REFUNDED`), monetary totals, timestamps (`createdAt`, `updatedAt`, `cancelledAt`), and cancellation audit fields (`cancelledBy`, `cancelReason`).
- **OrderItem**: Represents a line item snapshot within an Order (`productId`, `productName`, `productImage`, `price`, `quantity`, `totalPrice`) used both for display and for exact quantity restoration during order cancellation.
- **Product**: Represents a catalog item with `stockQuantity` and `inStock` availability flag that are decremented on order creation and incremented on order cancellation.
- **User**: Represents a registered actor with `role` (`ROLE_USER` for customers, `ROLE_ADMIN` for store administrators).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of orders placed by signed-in users appear immediately in their personal "My Orders" view without requiring manual order code entry.
- **SC-002**: 100% of valid order cancellations restore exact product inventory counts within the same transaction, with zero instances of double-restocking under repeated or concurrent cancellation requests.
- **SC-003**: 100% of invalid state transitions (such as cancelling a `SHIPPED` or `DELIVERED` order, or mutating a terminal order) are blocked with clear Vietnamese error messages.
- **SC-004**: Customers can view their order history or cancel a `CONFIRMED` order in under 30 seconds directly from the user menu or order lookup modal.
- **SC-005**: Administrators can filter orders and update order lifecycle status in under 15 seconds from the admin order management interface.

## Assumptions

- First-version (v1) scope focuses on the core internal order lifecycle (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`). Post-delivery returns/exchanges (`RETURNED`) and third-party courier webhook integrations (GHN/GHTK) are out of scope for v1.
- Payment status transitions (`PENDING` → `PAID` on delivery, `PAID` → `REFUNDED` on cancellation) are tracked within the order record; automated bank gateway refund payouts are handled offline by accounting in v1.
- Existing orders created before v1 migration will have `user_id = NULL` and remain accessible via the Order Lookup feature (`orderNumber` / `customerPhone`) and the Admin dashboard.

