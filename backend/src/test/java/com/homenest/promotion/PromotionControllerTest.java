package com.homenest.promotion;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PromotionControllerTest {

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
    @DisplayName("GET /api/v1/promotions/flash-sale - should return active flash sale with featured product")
    void testGetActiveFlashSale() throws Exception {
        mockMvc.perform(get("/api/v1/promotions/flash-sale")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.code", is("HOMENEST30")))
                .andExpect(jsonPath("$.data.discountPercent", is(30)))
                .andExpect(jsonPath("$.data.endTime", notNullValue()))
                .andExpect(jsonPath("$.data.featuredProduct.id", is("prod-1")));
    }

    @Test
    @DisplayName("POST /api/v1/promotions/validate - valid voucher code")
    void testValidatePromotion_Valid() throws Exception {
        String payload = """
                {
                    "code": "HOMENEST30"
                }
                """;

        mockMvc.perform(post("/api/v1/promotions/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.valid", is(true)))
                .andExpect(jsonPath("$.data.discountPercent", is(30)));
    }

    @Test
    @DisplayName("POST /api/v1/promotions/validate - invalid voucher code")
    void testValidatePromotion_Invalid() throws Exception {
        String payload = """
                {
                    "code": "EXPIRED_OR_NON_EXISTENT"
                }
                """;

        mockMvc.perform(post("/api/v1/promotions/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.valid", is(false)));
    }

    @Test
    @DisplayName("GET /api/v1/promotions/vouchers - should list special Double Day, Holiday, Daily, and VIP vouchers")
    void testListPublicVouchersByCampaign() throws Exception {
        mockMvc.perform(get("/api/v1/promotions/vouchers")
                        .param("campaignType", "DOUBLE_DAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[*].code", hasItems("MEGA1111", "SALE1010", "SALE1212")));

        mockMvc.perform(get("/api/v1/promotions/vouchers")
                        .param("campaignType", "DAILY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].code", hasItems("DAILY10", "DAILY12")));
    }

    @Test
    @DisplayName("Voucher Wallet & VIP Lifecycle: claim limited voucher, subscribe VIP, stack VIP + Voucher discount on order, and restore voucher on cancel")
    void testVoucherClaimVipSubscriptionStackingAndRefundOnCancel() throws Exception {
        // Register a dedicated customer for isolated testing
        String regPayload = """
                {
                    "fullName": "Khách Săn Sale VIP",
                    "email": "vip_hunter@homenest.vn",
                    "password": "Password@123",
                    "phone": "0911223344",
                    "address": "88 Nguyễn Huệ, Quận 1, TP.HCM"
                }
                """;

        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(regPayload))
                .andExpect(status().isCreated())
                .andReturn();

        String token = JsonPath.read(regRes.getResponse().getContentAsString(), "$.data.token");

        // 1. Non-VIP user cannot claim VIP-only voucher
        mockMvc.perform(post("/api/v1/promotions/vouchers/VIPCLUB25/claim")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Hội viên VIP")));

        // 2. User claims limited Double Day 11/11 voucher (MEGA1111) -> deducts remaining quantity immediately
        mockMvc.perform(post("/api/v1/promotions/vouchers/MEGA1111/claim")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.code", is("MEGA1111")))
                .andExpect(jsonPath("$.data.claimed", is(true)))
                .andExpect(jsonPath("$.data.userVoucherStatus", is("AVAILABLE")));

        // Duplicate claim by the same user must be rejected
        mockMvc.perform(post("/api/v1/promotions/vouchers/MEGA1111/claim")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("đã lưu mã voucher")));

        // 3. Subscribe to VIP YEARLY plan -> activates 8% direct discount & automatically gifts VIP vouchers
        mockMvc.perform(post("/api/v1/promotions/vip/subscribe")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "planType": "YEARLY",
                                    "paymentMethod": "QR_INSTANT"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.active", is(true)))
                .andExpect(jsonPath("$.data.tier", is("VIP_YEARLY")))
                .andExpect(jsonPath("$.data.directDiscountPercent", is(8)));

        // Verify my-vouchers now contains MEGA1111 as well as gifted VIPCLUB25 and VIPDIAMOND35
        mockMvc.perform(get("/api/v1/promotions/my-vouchers")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].code", hasItems("MEGA1111", "VIPCLUB25", "VIPDIAMOND35")));

        // 4. Create an order using claimed MEGA1111 voucher -> stacks MEGA1111 (40% capped at 1,200,000) + VIP_YEARLY (8% on remaining)
        String orderPayload = """
                {
                    "customerName": "Khách Săn Sale VIP",
                    "customerPhone": "0911223344",
                    "shippingAddress": "88 Nguyễn Huệ, Quận 1, TP.HCM",
                    "paymentMethod": "COD",
                    "couponCode": "MEGA1111",
                    "items": [
                        {
                            "productId": "prod-2",
                            "quantity": 1
                        }
                    ]
                }
                """;

        MvcResult orderRes = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.couponCode", is("MEGA1111")))
                .andExpect(jsonPath("$.data.voucherDiscountAmount", greaterThan(0)))
                .andExpect(jsonPath("$.data.vipDiscountAmount", greaterThan(0)))
                .andExpect(jsonPath("$.data.vipTierApplied", is("VIP_YEARLY")))
                .andReturn();

        String orderNumber = JsonPath.read(orderRes.getResponse().getContentAsString(), "$.data.orderNumber");

        // Verify MEGA1111 cannot be used a second time while order is active
        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("đã sử dụng")));

        // 5. Cancel the order -> MEGA1111 is automatically restored to AVAILABLE in user's wallet!
        mockMvc.perform(post("/api/v1/orders/" + orderNumber + "/cancel")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "reason": "Đổi địa chỉ nhận hàng, đặt lại đơn mới"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderStatus", is("CANCELLED")));

        // Validate MEGA1111 is valid/AVAILABLE again for this user
        mockMvc.perform(post("/api/v1/promotions/validate")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "code": "MEGA1111",
                                    "orderSubtotal": 5000000
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid", is(true)));
    }

    @Test
    @DisplayName("Admin Promotion Management: create custom event voucher and trigger event preset")
    void testAdminCreateAndTriggerEventPreset() throws Exception {
        String adminToken = loginAndGetToken("admin@homenest.vn", "Admin@123");

        mockMvc.perform(post("/api/v1/admin/promotions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "code": "BLACKFRIDAY50",
                                    "title": "Siêu Bão Black Friday – Giảm 50%",
                                    "description": "Săn deal Black Friday giảm 50% tối đa 2.000.000đ",
                                    "discountPercent": 50,
                                    "maxDiscountAmount": 2000000,
                                    "minOrderAmount": 3500000,
                                    "campaignType": "HOLIDAY",
                                    "eventTag": "Black Friday",
                                    "totalQuantity": 20,
                                    "vipOnly": false
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code", is("BLACKFRIDAY50")))
                .andExpect(jsonPath("$.data.remainingQuantity", is(20)));

        mockMvc.perform(post("/api/v1/admin/promotions/trigger-event")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "eventPreset": "DOUBLE_1010"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
