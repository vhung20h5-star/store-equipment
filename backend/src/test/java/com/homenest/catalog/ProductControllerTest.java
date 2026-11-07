package com.homenest.catalog;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTest {

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
    @DisplayName("GET /api/v1/products - should return paginated products list")
    void testGetProducts_All() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", not(empty())))
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(30)))
                .andExpect(jsonPath("$.data.content[0].name", notNullValue()))
                .andExpect(jsonPath("$.data.content[0].specs", notNullValue()))
                .andExpect(jsonPath("$.data.content[0].features", notNullValue()))
                .andExpect(jsonPath("$.data.content[0].isActive", is(true)));
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
                .andExpect(jsonPath("$.data.features", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.isActive", is(true)));
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

    @Test
    @DisplayName("US2: Admin RBAC - unauthenticated and ROLE_USER are rejected on /api/v1/admin/products")
    void testAdminProductEndpoints_AccessControl() throws Exception {
        String userToken = loginAndGetToken("demo@homenest.vn", "Password@123");

        // Unauthenticated
        mockMvc.perform(get("/api/v1/admin/products"))
                .andExpect(status().isForbidden());

        // ROLE_USER
        mockMvc.perform(get("/api/v1/admin/products")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("US2: Admin creates category, creates product, edits product, toggles visibility, and validates inputs")
    void testAdminCreateUpdateAndHideProductLifecycle() throws Exception {
        String adminToken = loginAndGetToken("admin@homenest.vn", "Admin@123");

        // 1. Create a new category
        String createCatPayload = """
                {
                    "slug": "bathroom",
                    "name": "Thiết bị phòng tắm",
                    "description": "Thiết bị phòng tắm thông minh cao cấp",
                    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800"
                }
                """;
        mockMvc.perform(post("/api/v1/admin/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createCatPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.slug", is("bathroom")))
                .andExpect(jsonPath("$.data.itemCount", is(0)));

        // Duplicate category slug should fail with 400
        mockMvc.perform(post("/api/v1/admin/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createCatPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // 2. Create a new product in the new category
        String createProductPayload = """
                {
                    "id": "prod-test-heater",
                    "name": "Máy Nước Nóng Hồng Ngoại HomeNest X1",
                    "categorySlug": "bathroom",
                    "price": 3200000,
                    "originalPrice": 4000000,
                    "badge": "Mới ra mắt",
                    "badgeType": "new",
                    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
                    "gallery": [
                        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
                        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800"
                    ],
                    "description": "Máy nước nóng công nghệ hồng ngoại an toàn tuyệt đối.",
                    "features": [
                        "Chống giật ELCB kép",
                        "Màn hình cảm ứng LED hiển thị nhiệt độ"
                    ],
                    "specs": {
                        "Công suất": "4500W",
                        "Chống nước": "IP25"
                    },
                    "initialStockQuantity": 15,
                    "isActive": true
                }
                """;

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createProductPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is("prod-test-heater")))
                .andExpect(jsonPath("$.data.discountPercent", is(20)))
                .andExpect(jsonPath("$.data.inStock", is(true)))
                .andExpect(jsonPath("$.data.stockQuantity", is(15)))
                .andExpect(jsonPath("$.data.isActive", is(true)))
                .andExpect(jsonPath("$.data.gallery", hasSize(2)))
                .andExpect(jsonPath("$.data.features", hasSize(2)))
                .andExpect(jsonPath("$.data.specs['Công suất']", is("4500W")));

        // Verify category count is now 1 for active product
        mockMvc.perform(get("/api/v1/categories/bathroom"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.itemCount", is(1)));

        // 3. Invalid pricing (originalPrice < price) should fail with 400
        String invalidPricingPayload = """
                {
                    "name": "Sản phẩm lỗi giá",
                    "categorySlug": "bathroom",
                    "price": 5000000,
                    "originalPrice": 3000000,
                    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
                    "description": "Mô tả"
                }
                """;
        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPricingPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // 4. Update the product
        String updateProductPayload = """
                {
                    "name": "Máy Nước Nóng Hồng Ngoại HomeNest X1 Pro",
                    "categorySlug": "bathroom",
                    "price": 3000000,
                    "originalPrice": 4000000,
                    "badge": "Bán chạy",
                    "badgeType": "bestseller",
                    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
                    "gallery": [
                        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800"
                    ],
                    "description": "Phiên bản nâng cấp Pro.",
                    "features": [
                        "Chống giật ELCB kép",
                        "Tự ngắt khi quá nhiệt",
                        "Vỏ chống cháy ABS"
                    ],
                    "specs": {
                        "Công suất": "5000W",
                        "Bảo hành": "24 tháng"
                    },
                    "isActive": true
                }
                """;

        mockMvc.perform(put("/api/v1/admin/products/prod-test-heater")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateProductPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("Máy Nước Nóng Hồng Ngoại HomeNest X1 Pro")))
                .andExpect(jsonPath("$.data.price", is(3000000)))
                .andExpect(jsonPath("$.data.discountPercent", is(25)))
                .andExpect(jsonPath("$.data.features", hasSize(3)))
                .andExpect(jsonPath("$.data.specs['Công suất']", is("5000W")))
                .andExpect(jsonPath("$.data.stockQuantity", is(15)));

        // 5. Hide product (isActive = false)
        mockMvc.perform(patch("/api/v1/admin/products/prod-test-heater/visibility")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "isActive": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive", is(false)));

        // Verify hidden product is excluded from public catalog listing & bestsellers & category count
        mockMvc.perform(get("/api/v1/products")
                        .param("category", "bathroom"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", empty()));

        mockMvc.perform(get("/api/v1/products/bestsellers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", not(hasItem("prod-test-heater"))));

        mockMvc.perform(get("/api/v1/categories/bathroom"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.itemCount", is(0)));

        // Direct URL /api/v1/products/{id} still resolves with isActive = false
        mockMvc.perform(get("/api/v1/products/prod-test-heater"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is("prod-test-heater")))
                .andExpect(jsonPath("$.data.isActive", is(false)));

        // Admin product listing with isActive=false includes it
        mockMvc.perform(get("/api/v1/admin/products")
                        .param("isActive", "false")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[*].id", hasItem("prod-test-heater")));
    }

    @Test
    @DisplayName("US3: Admin stock adjustment with reason, audit log, and negative stock prevention")
    void testAdminStockAdjustmentsAndAuditHistory() throws Exception {
        String adminToken = loginAndGetToken("admin@homenest.vn", "Admin@123");

        // Get current stock of prod-5
        MvcResult beforeRes = mockMvc.perform(get("/api/v1/products/prod-5"))
                .andExpect(status().isOk())
                .andReturn();
        int initialStock = JsonPath.read(beforeRes.getResponse().getContentAsString(), "$.data.stockQuantity");

        // 1. Restock +10 with reason
        mockMvc.perform(post("/api/v1/admin/products/prod-5/stock-adjustments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "quantityChange": 10,
                                    "reason": "Nhập thêm lô hàng mới tháng 11"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.previousQuantity", is(initialStock)))
                .andExpect(jsonPath("$.data.quantityChange", is(10)))
                .andExpect(jsonPath("$.data.newQuantity", is(initialStock + 10)))
                .andExpect(jsonPath("$.data.reason", is("Nhập thêm lô hàng mới tháng 11")))
                .andExpect(jsonPath("$.data.adjustedBy", is("admin@homenest.vn")));

        // 2. Deduct all stock to 0 -> inStock becomes false
        int currentStock = initialStock + 10;
        mockMvc.perform(post("/api/v1/admin/products/prod-5/stock-adjustments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "quantityChange": %d,
                                    "reason": "Xuất kho kiểm định định kỳ"
                                }
                                """.formatted(-currentStock)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.newQuantity", is(0)));

        mockMvc.perform(get("/api/v1/products/prod-5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stockQuantity", is(0)))
                .andExpect(jsonPath("$.data.inStock", is(false)));

        // 3. Reject adjustment resulting in negative stock (< 0)
        mockMvc.perform(post("/api/v1/admin/products/prod-5/stock-adjustments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "quantityChange": -5,
                                    "reason": "Trừ quá số lượng"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // 4. Reject adjustment without reason or with quantityChange = 0
        mockMvc.perform(post("/api/v1/admin/products/prod-5/stock-adjustments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "quantityChange": 5,
                                    "reason": "   "
                                }
                                """))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/admin/products/prod-5/stock-adjustments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "quantityChange": 0,
                                    "reason": "Không thay đổi"
                                }
                                """))
                .andExpect(status().isBadRequest());

        // 5. Restore stock back to initialStock -> inStock becomes true again
        mockMvc.perform(post("/api/v1/admin/products/prod-5/stock-adjustments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "quantityChange": %d,
                                    "reason": "Hoàn kho sau kiểm định"
                                }
                                """.formatted(initialStock)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.newQuantity", is(initialStock)));

        mockMvc.perform(get("/api/v1/products/prod-5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stockQuantity", is(initialStock)))
                .andExpect(jsonPath("$.data.inStock", is(true)));

        // 6. Verify audit log history order (newest first)
        mockMvc.perform(get("/api/v1/admin/products/prod-5/stock-adjustments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$.data[0].reason", is("Hoàn kho sau kiểm định")));
    }
}
