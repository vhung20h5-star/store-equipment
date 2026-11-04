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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/products - should return paginated products list")
    void testGetProducts_All() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", not(empty())))
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(10)))
                .andExpect(jsonPath("$.data.content[0].name", notNullValue()))
                .andExpect(jsonPath("$.data.content[0].specs", notNullValue()))
                .andExpect(jsonPath("$.data.content[0].features", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/products - filter by category")
    void testGetProducts_FilterCategory() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .param("category", "kitchen")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", everyItem(hasEntry("category", "kitchen"))));
    }

    @Test
    @DisplayName("GET /api/v1/products - search keyword")
    void testGetProducts_Search() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .param("search", "nồi chiên")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", not(empty())))
                .andExpect(jsonPath("$.data.content[0].name", containsStringIgnoringCase("nồi chiên")));
    }

    @Test
    @DisplayName("GET /api/v1/products/{id} - get product detail by ID")
    void testGetProductById_Success() throws Exception {
        mockMvc.perform(get("/api/v1/products/prod-1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is("prod-1")))
                .andExpect(jsonPath("$.data.name", containsString("DualZone")))
                .andExpect(jsonPath("$.data.specs['Công suất']", is("1800W")))
                .andExpect(jsonPath("$.data.features", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("GET /api/v1/products/{id} - 404 for non-existent product")
    void testGetProductById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/products/prod-non-existent-999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("GET /api/v1/products/bestsellers - should return list of bestsellers")
    void testGetBestsellers() throws Exception {
        mockMvc.perform(get("/api/v1/products/bestsellers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", not(empty())))
                .andExpect(jsonPath("$.data[0].badgeType", is("bestseller")));
    }
}

