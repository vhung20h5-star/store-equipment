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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/categories - should return all 4 categories seeded by Flyway")
    void testGetAllCategories() throws Exception {
        mockMvc.perform(get("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(4)))
                .andExpect(jsonPath("$.data[0].slug", notNullValue()))
                .andExpect(jsonPath("$.data[0].itemCount", greaterThanOrEqualTo(0)));
    }

    @Test
    @DisplayName("GET /api/v1/categories/{slug} - should return category detail when slug exists")
    void testGetCategoryBySlug_Success() throws Exception {
        mockMvc.perform(get("/api/v1/categories/kitchen")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.slug", is("kitchen")))
                .andExpect(jsonPath("$.data.name", is("Thiết bị nhà bếp")));
    }

    @Test
    @DisplayName("GET /api/v1/categories/{slug} - should return 404 when slug does not exist")
    void testGetCategoryBySlug_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/categories/non-existing-slug")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }
}
