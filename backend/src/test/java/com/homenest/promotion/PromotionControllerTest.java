package com.homenest.promotion;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
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
}

