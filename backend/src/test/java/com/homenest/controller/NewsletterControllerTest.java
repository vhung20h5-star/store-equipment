package com.homenest.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NewsletterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("POST /api/v1/newsletter/subscribe - new email subscription")
    void testSubscribe_NewEmail() throws Exception {
        String payload = """
                {
                    "email": "customer123@example.com"
                }
                """;

        mockMvc.perform(post("/api/v1/newsletter/subscribe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("customer123@example.com")))
                .andExpect(jsonPath("$.data.voucherCode", is("HOMENEST10")))
                .andExpect(jsonPath("$.data.alreadySubscribed", is(false)));
    }

    @Test
    @DisplayName("POST /api/v1/newsletter/subscribe - existing email should inform already subscribed")
    void testSubscribe_ExistingEmail() throws Exception {
        String payload = """
                {
                    "email": "duplicate@example.com"
                }
                """;

        // First subscription
        mockMvc.perform(post("/api/v1/newsletter/subscribe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        // Duplicate subscription
        mockMvc.perform(post("/api/v1/newsletter/subscribe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.alreadySubscribed", is(true)))
                .andExpect(jsonPath("$.data.voucherCode", is("HOMENEST10")));
    }

    @Test
    @DisplayName("POST /api/v1/newsletter/subscribe - invalid email format")
    void testSubscribe_InvalidEmail() throws Exception {
        String payload = """
                {
                    "email": "not-a-valid-email"
                }
                """;

        mockMvc.perform(post("/api/v1/newsletter/subscribe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }
}

