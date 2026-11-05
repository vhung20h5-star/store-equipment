package com.homenest.cart;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private String userToken;

    @BeforeEach
    void setUp() throws Exception {
        String loginPayload = """
                {
                    "email": "demo@homenest.vn",
                    "password": "Password@123"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn();

        userToken = JsonPath.read(result.getResponse().getContentAsString(), "$.data.token");
    }

    @Test
    @DisplayName("Cart Flow: Add item -> Update qty -> Sync -> Clear with Bearer token")
    void testCartOperations() throws Exception {
        // 1. Add item prod-1
        String addPayload = """
                {
                    "productId": "prod-1",
                    "quantity": 2
                }
                """;

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items", not(empty())))
                .andExpect(jsonPath("$.data.totalItems", greaterThanOrEqualTo(2)));

        // 2. Get Cart
        mockMvc.perform(get("/api/v1/cart")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items", not(empty())));

        // 3. Update quantity
        String updatePayload = """
                {
                    "quantity": 5
                }
                """;
        mockMvc.perform(put("/api/v1/cart/items/prod-1")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 4. Sync guest items
        String syncPayload = """
                {
                    "items": [
                        {
                            "productId": "prod-2",
                            "quantity": 1
                        }
                    ]
                }
                """;
        mockMvc.perform(post("/api/v1/cart/sync")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(syncPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items", hasSize(greaterThanOrEqualTo(2))));

        // 5. Clear cart
        mockMvc.perform(delete("/api/v1/cart")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalItems", is(0)));
    }

    @Test
    @DisplayName("GET /api/v1/cart - without token should return 401 or 403")
    void testGetCart_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/v1/cart/items/{productId} - should remove specific item from cart")
    void testRemoveItemFromCart() throws Exception {
        String addPayload = """
                {
                    "productId": "prod-1",
                    "quantity": 1
                }
                """;
        mockMvc.perform(post("/api/v1/cart/items")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addPayload))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/cart/items/prod-1")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("POST /api/v1/cart/sync - merging items adds quantities for existing products")
    void testSyncCart_MergeQuantities() throws Exception {
        // Clear cart first to have a clean slate
        mockMvc.perform(delete("/api/v1/cart")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());

        // Add prod-1 with quantity 2
        String addPayload = """
                {
                    "productId": "prod-1",
                    "quantity": 2
                }
                """;
        mockMvc.perform(post("/api/v1/cart/items")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addPayload))
                .andExpect(status().isOk());

        // Sync guest cart that also has prod-1 with quantity 3
        String syncPayload = """
                {
                    "items": [
                        {
                            "productId": "prod-1",
                            "quantity": 3
                        }
                    ]
                }
                """;
        mockMvc.perform(post("/api/v1/cart/sync")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(syncPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items[0].quantity", is(5)));
    }

    @Test
    @DisplayName("PUT /api/v1/cart/items/{productId} - update quantity to 0 removes item")
    void testUpdateCartItem_ZeroQuantityRemovesItem() throws Exception {
        String addPayload = """
                {
                    "productId": "prod-1",
                    "quantity": 2
                }
                """;
        mockMvc.perform(post("/api/v1/cart/items")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addPayload))
                .andExpect(status().isOk());

        String updatePayload = """
                {
                    "quantity": 0
                }
                """;
        mockMvc.perform(put("/api/v1/cart/items/prod-1")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}

