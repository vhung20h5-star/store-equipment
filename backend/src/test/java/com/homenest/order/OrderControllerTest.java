package com.homenest.order;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.jayway.jsonpath.JsonPath;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private String loginAndGetToken(String email, String password) throws Exception {
        String loginPayload = """
                {
                    "email": "%s",
                    "password": "%s"
                }
                """.formatted(email, password);

        MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn();

        return JsonPath.read(res.getResponse().getContentAsString(), "$.data.token");
    }

    @Test
    @DisplayName("POST /api/v1/orders - should successfully create an order and deduct stock")
    void testCreateOrder_Success() throws Exception {
        String payload = """
                {
                    "customerName": "Nguyễn Văn A",
                    "customerPhone": "0987654321",
                    "customerEmail": "nguyenvana@example.com",
                    "shippingAddress": "Số 123 Đường Cầu Giấy, Hà Nội",
                    "notes": "Giao giờ hành chính",
                    "paymentMethod": "COD",
                    "items": [
                        {
                            "productId": "prod-1",
                            "quantity": 1
                        }
                    ]
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderNumber", startsWith("HN-")))
                .andExpect(jsonPath("$.data.customerName", is("Nguyễn Văn A")))
                .andExpect(jsonPath("$.data.customerPhone", is("0987654321")))
                .andExpect(jsonPath("$.data.totalAmount", greaterThan(0)))
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.items[0].productId", is("prod-1")))
                .andReturn();

        String orderNumber = JsonPath.read(result.getResponse().getContentAsString(), "$.data.orderNumber");

        // Verify retrieval by order number
        mockMvc.perform(get("/api/v1/orders/" + orderNumber)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderNumber", is(orderNumber)))
                .andExpect(jsonPath("$.data.customerName", is("Nguyễn Văn A")));
    }

    @Test
    @DisplayName("POST /api/v1/orders - should apply valid coupon discount")
    void testCreateOrder_WithCoupon_Success() throws Exception {
        String payload = """
                {
                    "customerName": "Trần Thị B",
                    "customerPhone": "0912345678",
                    "customerEmail": "tranthib@example.com",
                    "shippingAddress": "Quận 1, TP Hồ Chí Minh",
                    "couponCode": "HOMENEST30",
                    "items": [
                        {
                            "productId": "prod-2",
                            "quantity": 1
                        }
                    ]
                }
                """;

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.couponCode", is("HOMENEST30")))
                .andExpect(jsonPath("$.data.discountAmount", greaterThan(0)));
    }

    @Test
    @DisplayName("POST /api/v1/orders - should fail with 400 when stock is insufficient")
    void testCreateOrder_InsufficientStock() throws Exception {
        String payload = """
                {
                    "customerName": "Lê Văn C",
                    "customerPhone": "0909090909",
                    "shippingAddress": "Hải Phòng",
                    "items": [
                        {
                            "productId": "prod-1",
                            "quantity": 99999
                        }
                    ]
                }
                """;

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("không đủ số lượng trong kho")));
    }

    @Test
    @DisplayName("POST /api/v1/orders - should return 400 for invalid request body")
    void testCreateOrder_ValidationFailure() throws Exception {
        String invalidPayload = """
                {
                    "customerName": "",
                    "customerPhone": "invalid-phone",
                    "shippingAddress": "",
                    "items": []
                }
                """;

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("GET /api/v1/orders/lookup - should return orders by phone")
    void testLookupOrdersByPhone() throws Exception {
        mockMvc.perform(get("/api/v1/orders/lookup?phone=0987654321")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("GET /api/v1/orders/{orderNumber} - should return 404 for nonexistent order")
    void testGetOrderByNumber_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/orders/HN-NONEXISTENT")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("POST /api/v1/orders - create order with BANK_TRANSFER payment method")
    void testCreateOrder_BankTransfer_Success() throws Exception {
        String payload = """
                {
                    "customerName": "Hoàng Văn E",
                    "customerPhone": "0977889900",
                    "shippingAddress": "Đà Nẵng",
                    "paymentMethod": "BANK_TRANSFER",
                    "items": [
                        {
                            "productId": "prod-3",
                            "quantity": 1
                        }
                    ]
                }
                """;

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.paymentMethod", is("BANK_TRANSFER")))
                .andExpect(jsonPath("$.data.paymentStatus", is("PENDING")))
                .andExpect(jsonPath("$.data.orderStatus", is("CONFIRMED")));
    }

    @Test
    @DisplayName("POST /api/v1/orders - nonexistent coupon results in 0 discount")
    void testCreateOrder_InvalidCoupon_ZeroDiscount() throws Exception {
        String payload = """
                {
                    "customerName": "Đặng Thị F",
                    "customerPhone": "0966554433",
                    "shippingAddress": "Cần Thơ",
                    "couponCode": "NON_EXISTENT_COUPON",
                    "items": [
                        {
                            "productId": "prod-3",
                            "quantity": 1
                        }
                    ]
                }
                """;

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.discountAmount", is(0)));
    }

    @Test
    @DisplayName("GET /api/v1/orders/lookup - phone with no orders returns empty list")
    void testLookupOrdersByPhone_EmptyResult() throws Exception {
        mockMvc.perform(get("/api/v1/orders/lookup?phone=0000000000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("US1: Authenticated user creates order linked to userId and retrieves /my-orders")
    void testAuthenticatedUserOrderAndMyOrders() throws Exception {
        String userToken = loginAndGetToken("demo@homenest.vn", "Password@123");

        String payload = """
                {
                    "customerName": "Nguyễn Văn An",
                    "customerPhone": "0912345678",
                    "customerEmail": "demo@homenest.vn",
                    "shippingAddress": "123 Đường Cầu Giấy, Hà Nội",
                    "paymentMethod": "COD",
                    "items": [
                        {
                            "productId": "prod-2",
                            "quantity": 1
                        }
                    ]
                }
                """;

        MvcResult createRes = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.userId", notNullValue()))
                .andReturn();

        String createdOrderNumber = JsonPath.read(createRes.getResponse().getContentAsString(), "$.data.orderNumber");

        // Fetch /api/v1/orders/my-orders
        mockMvc.perform(get("/api/v1/orders/my-orders")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[*].orderNumber", hasItem(createdOrderNumber)));

        // Unauthenticated call to /my-orders should be rejected
        mockMvc.perform(get("/api/v1/orders/my-orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("US2: Customer cancels CONFIRMED order, restores stock & inStock flag, and blocks duplicate cancel")
    void testCustomerCancelOrder_RestoresStockAndIsIdempotent() throws Exception {
        String userToken = loginAndGetToken("demo@homenest.vn", "Password@123");

        // Check initial stock of prod-4
        MvcResult prodBefore = mockMvc.perform(get("/api/v1/products/prod-4"))
                .andExpect(status().isOk())
                .andReturn();
        int initialStock = JsonPath.read(prodBefore.getResponse().getContentAsString(), "$.data.stockQuantity");

        // Order ALL remaining stock of prod-4 so stock drops to 0 and inStock becomes false
        String orderPayload = """
                {
                    "customerName": "Nguyễn Văn An",
                    "customerPhone": "0912345678",
                    "shippingAddress": "123 Đường Cầu Giấy, Hà Nội",
                    "paymentMethod": "COD",
                    "items": [
                        {
                            "productId": "prod-4",
                            "quantity": %d
                        }
                    ]
                }
                """.formatted(initialStock);

        MvcResult orderRes = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderPayload))
                .andExpect(status().isCreated())
                .andReturn();
        String orderNumber = JsonPath.read(orderRes.getResponse().getContentAsString(), "$.data.orderNumber");

        // Verify prod-4 is now out of stock (0, inStock = false)
        mockMvc.perform(get("/api/v1/products/prod-4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stockQuantity", is(0)))
                .andExpect(jsonPath("$.data.inStock", is(false)));

        // Cancel order as owner
        String cancelPayload = """
                {
                    "reason": "Đặt nhầm số lượng, muốn đặt lại"
                }
                """;

        mockMvc.perform(post("/api/v1/orders/" + orderNumber + "/cancel")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cancelPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderStatus", is("CANCELLED")))
                .andExpect(jsonPath("$.data.cancelledBy", is("CUSTOMER")))
                .andExpect(jsonPath("$.data.cancelReason", is("Đặt nhầm số lượng, muốn đặt lại")))
                .andExpect(jsonPath("$.data.cancelledAt", notNullValue()));

        // Verify prod-4 stock is restored to initialStock and inStock is true again
        mockMvc.perform(get("/api/v1/products/prod-4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stockQuantity", is(initialStock)))
                .andExpect(jsonPath("$.data.inStock", is(true)));

        // Duplicate cancellation must fail with 400 and NOT double-restock
        mockMvc.perform(post("/api/v1/orders/" + orderNumber + "/cancel")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cancelPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("đã được hủy trước đó")));

        mockMvc.perform(get("/api/v1/products/prod-4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stockQuantity", is(initialStock)));
    }

    @Test
    @DisplayName("US2: Guest cancel order requires matching phone number")
    void testGuestCancelOrder_PhoneVerification() throws Exception {
        String orderPayload = """
                {
                    "customerName": "Khách Vãng Lai",
                    "customerPhone": "0933445566",
                    "shippingAddress": "Quận 3, TP.HCM",
                    "items": [
                        {
                            "productId": "prod-2",
                            "quantity": 1
                        }
                    ]
                }
                """;

        MvcResult orderRes = mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderPayload))
                .andExpect(status().isCreated())
                .andReturn();
        String orderNumber = JsonPath.read(orderRes.getResponse().getContentAsString(), "$.data.orderNumber");

        // Attempt cancel with wrong phone -> 403 Forbidden
        mockMvc.perform(post("/api/v1/orders/" + orderNumber + "/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "reason": "Muốn hủy",
                                    "phone": "0999999999"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)));

        // Cancel with matching phone -> 200 OK
        mockMvc.perform(post("/api/v1/orders/" + orderNumber + "/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "reason": "Đổi ý không mua nữa",
                                    "phone": "0933445566"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderStatus", is("CANCELLED")))
                .andExpect(jsonPath("$.data.cancelledBy", is("GUEST")));
    }

    @Test
    @DisplayName("US3: Admin order listing, state machine transitions (CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED), and access control")
    void testAdminOrderLifecycleAndPermissions() throws Exception {
        String userToken = loginAndGetToken("demo@homenest.vn", "Password@123");
        String adminToken = loginAndGetToken("admin@homenest.vn", "Admin@123");

        // Regular user cannot access admin order list -> 403 Forbidden
        mockMvc.perform(get("/api/v1/admin/orders")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Create a new order
        MvcResult orderRes = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "customerName": "Nguyễn Văn An",
                                    "customerPhone": "0912345678",
                                    "shippingAddress": "Hà Nội",
                                    "paymentMethod": "COD",
                                    "items": [
                                        {
                                            "productId": "prod-1",
                                            "quantity": 1
                                        }
                                    ]
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String orderNumber = JsonPath.read(orderRes.getResponse().getContentAsString(), "$.data.orderNumber");

        // Admin lists orders with search filter
        mockMvc.perform(get("/api/v1/admin/orders")
                        .param("search", orderNumber)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].orderNumber", is(orderNumber)));

        // Invalid skip transition: CONFIRMED -> DELIVERED must fail with 400
        mockMvc.perform(patch("/api/v1/admin/orders/" + orderNumber + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "status": "DELIVERED"
                                }
                                """))
                .andExpect(status().isBadRequest());

        // Valid transition 1: CONFIRMED -> PROCESSING
        mockMvc.perform(patch("/api/v1/admin/orders/" + orderNumber + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "status": "PROCESSING"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderStatus", is("PROCESSING")));

        // Customer cannot cancel once order is in PROCESSING -> 400 Bad Request
        mockMvc.perform(post("/api/v1/orders/" + orderNumber + "/cancel")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "reason": "Khách muốn hủy khi đang đóng gói"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("CONFIRMED")));

        // Valid transition 2: PROCESSING -> SHIPPED
        mockMvc.perform(patch("/api/v1/admin/orders/" + orderNumber + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "status": "SHIPPED"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderStatus", is("SHIPPED")));

        // Admin cannot cancel once order is SHIPPED -> 400 Bad Request
        mockMvc.perform(patch("/api/v1/admin/orders/" + orderNumber + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "status": "CANCELLED",
                                    "reason": "Hủy khi đang giao"
                                }
                                """))
                .andExpect(status().isBadRequest());

        // Valid transition 3: SHIPPED -> DELIVERED (COD paymentStatus becomes PAID)
        mockMvc.perform(patch("/api/v1/admin/orders/" + orderNumber + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "status": "DELIVERED"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderStatus", is("DELIVERED")))
                .andExpect(jsonPath("$.data.paymentStatus", is("PAID")));
    }

    @Test
    @DisplayName("US3: Admin can cancel an order in PROCESSING status and restore stock")
    void testAdminCanCancelProcessingOrder() throws Exception {
        String adminToken = loginAndGetToken("admin@homenest.vn", "Admin@123");

        MvcResult prodBefore = mockMvc.perform(get("/api/v1/products/prod-3"))
                .andExpect(status().isOk())
                .andReturn();
        int stockBefore = JsonPath.read(prodBefore.getResponse().getContentAsString(), "$.data.stockQuantity");

        MvcResult orderRes = mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "customerName": "Phạm Văn G",
                                    "customerPhone": "0944556677",
                                    "shippingAddress": "Huế",
                                    "items": [
                                        {
                                            "productId": "prod-3",
                                            "quantity": 2
                                        }
                                    ]
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String orderNumber = JsonPath.read(orderRes.getResponse().getContentAsString(), "$.data.orderNumber");

        // Move to PROCESSING
        mockMvc.perform(patch("/api/v1/admin/orders/" + orderNumber + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "status": "PROCESSING"
                                }
                                """))
                .andExpect(status().isOk());

        // Admin cancels from PROCESSING
        mockMvc.perform(patch("/api/v1/admin/orders/" + orderNumber + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "status": "CANCELLED",
                                    "reason": "Khách gọi hotline báo hủy đơn"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderStatus", is("CANCELLED")))
                .andExpect(jsonPath("$.data.cancelledBy", is("ADMIN")))
                .andExpect(jsonPath("$.data.cancelReason", is("Khách gọi hotline báo hủy đơn")));

        // Verify stock is restored back to stockBefore
        mockMvc.perform(get("/api/v1/products/prod-3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stockQuantity", is(stockBefore)));
    }

    @Test
    @DisplayName("US4: Order snapshot immutability after product edit/hide, checkout rejection when hidden, and restock on cancel while keeping isActive=false")
    void testOrderSnapshotImmutabilityAndDiscontinuedProductLifecycle() throws Exception {
        String adminToken = loginAndGetToken("admin@homenest.vn", "Admin@123");
        String userToken = loginAndGetToken("demo@homenest.vn", "Password@123");

        // 1. Admin creates a dedicated product for order lifecycle testing
        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "id": "prod-order-lifecycle",
                                    "name": "Máy Lọc Nước RO HomeNest G1",
                                    "categorySlug": "kitchen",
                                    "price": 4500000,
                                    "originalPrice": 5500000,
                                    "image": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
                                    "description": "Máy lọc nước RO 10 lõi.",
                                    "initialStockQuantity": 2,
                                    "isActive": true
                                }
                                """))
                .andExpect(status().isCreated());

        // 2. Customer orders all 2 units at price 4,500,000 -> stock drops to 0 (inStock = false)
        MvcResult orderRes = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "customerName": "Nguyễn Văn An",
                                    "customerPhone": "0912345678",
                                    "shippingAddress": "Hà Nội",
                                    "paymentMethod": "COD",
                                    "items": [
                                        {
                                            "productId": "prod-order-lifecycle",
                                            "quantity": 2
                                        }
                                    ]
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.totalAmount", is(9000000)))
                .andReturn();
        String orderNumber = JsonPath.read(orderRes.getResponse().getContentAsString(), "$.data.orderNumber");

        // 3. Admin updates product name & price (to 6,000,000) and hides it (isActive = false)
        mockMvc.perform(put("/api/v1/admin/products/prod-order-lifecycle")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Máy Lọc Nước RO HomeNest G2 Đổi Tên",
                                    "categorySlug": "kitchen",
                                    "price": 6000000,
                                    "originalPrice": 7000000,
                                    "image": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
                                    "description": "Đã nâng giá",
                                    "isActive": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive", is(false)))
                .andExpect(jsonPath("$.data.stockQuantity", is(0)))
                .andExpect(jsonPath("$.data.inStock", is(false)));

        // 4. Verify historical order snapshot still preserves original name ("Máy Lọc Nước RO HomeNest G1") and price (4,500,000)
        mockMvc.perform(get("/api/v1/orders/" + orderNumber))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].productName", is("Máy Lọc Nước RO HomeNest G1")))
                .andExpect(jsonPath("$.data.items[0].price", is(4500000)))
                .andExpect(jsonPath("$.data.items[0].totalPrice", is(9000000)));

        // 5. Verify cancelling the order restores stockQuantity to 2 and inStock to true, while keeping isActive = false
        mockMvc.perform(post("/api/v1/orders/" + orderNumber + "/cancel")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "reason": "Đổi sang dòng sản phẩm khác"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderStatus", is("CANCELLED")));

        mockMvc.perform(get("/api/v1/products/prod-order-lifecycle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stockQuantity", is(2)))
                .andExpect(jsonPath("$.data.inStock", is(true)))
                .andExpect(jsonPath("$.data.isActive", is(false)));

        // 6. Attempting to place a new order for the discontinued product (even though stockQuantity = 2) fails with 400
        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "customerName": "Nguyễn Văn An",
                                    "customerPhone": "0912345678",
                                    "shippingAddress": "Hà Nội",
                                    "items": [
                                        {
                                            "productId": "prod-order-lifecycle",
                                            "quantity": 1
                                        }
                                    ]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("ngừng kinh doanh")));
    }
}
