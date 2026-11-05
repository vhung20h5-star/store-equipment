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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
}

