package com.homenest.controller;

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
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("POST /api/v1/auth/register - should register user successfully")
    void testRegister_Success() throws Exception {
        String uniqueEmail = "user_" + System.currentTimeMillis() + "@example.com";
        String payload = String.format("""
                {
                    "fullName": "Lê Minh Quân",
                    "email": "%s",
                    "password": "Password@123",
                    "phone": "0934567890",
                    "address": "TP Đà Nẵng"
                }
                """, uniqueEmail);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is(uniqueEmail)))
                .andExpect(jsonPath("$.data.user.fullName", is("Lê Minh Quân")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - duplicate email should return 400")
    void testRegister_DuplicateEmail() throws Exception {
        String payload = """
                {
                    "fullName": "Demo User",
                    "email": "demo@homenest.vn",
                    "password": "Password@123"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("đã được sử dụng")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - valid credentials should return token")
    void testLogin_Success() throws Exception {
        String payload = """
                {
                    "email": "demo@homenest.vn",
                    "password": "Password@123"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("demo@homenest.vn")))
                .andReturn();

        String token = JsonPath.read(result.getResponse().getContentAsString(), "$.data.token");

        // Verify GET /api/v1/auth/me with Bearer token
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("demo@homenest.vn")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - wrong password should return 400")
    void testLogin_WrongPassword() throws Exception {
        String payload = """
                {
                    "email": "demo@homenest.vn",
                    "password": "WrongPassword!999"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("không chính xác")));
    }
}

