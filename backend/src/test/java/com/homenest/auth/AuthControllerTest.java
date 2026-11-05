package com.homenest.auth;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

    @Test
    @DisplayName("PUT /api/v1/auth/profile - update user profile with Bearer token")
    void testUpdateProfile_Success() throws Exception {
        String loginPayload = """
                {
                    "email": "demo@homenest.vn",
                    "password": "Password@123"
                }
                """;

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn();

        String token = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.data.token");

        String updatePayload = """
                {
                    "fullName": "Demo User Updated",
                    "phone": "0987654321",
                    "address": "Số 456 Đường Nguyễn Trãi, Hà Nội"
                }
                """;

        mockMvc.perform(put("/api/v1/auth/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.fullName", is("Demo User Updated")))
                .andExpect(jsonPath("$.data.phone", is("0987654321")))
                .andExpect(jsonPath("$.data.address", is("Số 456 Đường Nguyễn Trãi, Hà Nội")));
    }

    @Test
    @DisplayName("PUT /api/v1/auth/profile - without token should return 401 or 403")
    void testUpdateProfile_Unauthenticated() throws Exception {
        String updatePayload = """
                {
                    "fullName": "Unauthenticated Update"
                }
                """;

        mockMvc.perform(put("/api/v1/auth/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - nonexistent email should return 400")
    void testLogin_UserNotFound() throws Exception {
        String payload = """
                {
                    "email": "nonexistent_user_999@homenest.vn",
                    "password": "Password@123"
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

