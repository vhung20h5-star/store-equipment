package com.homenest.catalog;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.homenest.common.PageResponse;
import com.homenest.exception.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryAdjustmentRepository inventoryAdjustmentRepository;
    private final ObjectMapper objectMapper;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            InventoryAdjustmentRepository inventoryAdjustmentRepository,
            ObjectMapper objectMapper
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryAdjustmentRepository = inventoryAdjustmentRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public PageResponse<ProductResponseDTO> getProducts(String category, String search, int page, int size, String sort) {
        Specification<Product> spec = (root, query, cb) -> cb.isTrue(root.get("isActive"));

        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("category").get("slug"), category.trim().toLowerCase())
            );
        }

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("categoryName")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            ));
        }

        Sort sortObj = resolveSort(sort);
        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? Math.min(size, 100) : 12;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sortObj);

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductResponseDTO> dtos = productPage.getContent()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                dtos,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isLast()
        );
    }

    @Override
    public ProductResponseDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDTO(product);
    }

    @Override
    public List<ProductResponseDTO> getBestsellers() {
        return productRepository.findByBadgeTypeAndIsActiveTrue("bestseller")
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<ProductResponseDTO> getAdminProducts(
            String category,
            String search,
            Boolean isActive,
            Boolean inStock,
            int page,
            int size
    ) {
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();

        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("category").get("slug"), category.trim().toLowerCase())
            );
        }

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("id")), pattern),
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("categoryName")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            ));
        }

        if (isActive != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("isActive"), isActive));
        }

        if (inStock != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("inStock"), inStock));
        }

        int pageNumber = Math.max(0, page);
        int pageSize = size > 0 ? Math.min(size, 100) : 20;
        Pageable pageable = PageRequest.of(
                pageNumber,
                pageSize,
                Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.asc("id"))
        );

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        List<ProductResponseDTO> dtos = productPage.getContent()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                dtos,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isLast()
        );
    }

    @Override
    @Transactional
    public ProductResponseDTO createProduct(CreateProductRequest request, String adminEmail) {
        validatePricing(request.getPrice(), request.getOriginalPrice());

        int initialStock = request.getInitialStockQuantity() != null ? request.getInitialStockQuantity() : 0;
        if (initialStock < 0) {
            throw new IllegalArgumentException("Tồn kho khởi tạo không được âm.");
        }

        Category category = resolveCategory(request.getCategorySlug());
        String productId = resolveNewProductId(request.getId(), request.getName());

        Product product = new Product();
        product.setId(productId);
        product.setName(request.getName().trim());
        product.setCategory(category);
        product.setCategoryName(category.getName());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setDiscountPercent(calculateDiscountPercent(request.getPrice(), request.getOriginalPrice()));
        product.setRating(BigDecimal.valueOf(5.0));
        product.setReviewsCount(0);
        product.setBadge(trimOrNull(request.getBadge()));
        product.setBadgeType(trimOrNull(request.getBadgeType()));
        product.setImage(request.getImage().trim());
        product.setDescription(request.getDescription().trim());
        product.setSpecsJson(serializeSpecs(request.getSpecs()));
        product.setStockQuantity(initialStock);
        product.setInStock(initialStock > 0);
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        LocalDateTime now = LocalDateTime.now();
        product.setCreatedAt(now);
        product.setUpdatedAt(now);

        applyFeatures(product, request.getFeatures());
        applyGallery(product, request.getImage(), request.getGallery());

        Product saved = productRepository.save(product);

        if (initialStock > 0) {
            InventoryAdjustment initAdjustment = new InventoryAdjustment(
                    saved.getId(),
                    0,
                    initialStock,
                    initialStock,
                    "Khởi tạo tồn kho ban đầu",
                    adminEmail != null && !adminEmail.isBlank() ? adminEmail : "admin"
            );
            inventoryAdjustmentRepository.save(initAdjustment);
        }

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public ProductResponseDTO updateProduct(String id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        validatePricing(request.getPrice(), request.getOriginalPrice());
        Category category = resolveCategory(request.getCategorySlug());

        product.setName(request.getName().trim());
        product.setCategory(category);
        product.setCategoryName(category.getName());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setDiscountPercent(calculateDiscountPercent(request.getPrice(), request.getOriginalPrice()));
        product.setBadge(trimOrNull(request.getBadge()));
        product.setBadgeType(trimOrNull(request.getBadgeType()));
        product.setImage(request.getImage().trim());
        product.setDescription(request.getDescription().trim());
        product.setSpecsJson(serializeSpecs(request.getSpecs()));
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }
        product.setUpdatedAt(LocalDateTime.now());

        applyFeatures(product, request.getFeatures());
        applyGallery(product, request.getImage(), request.getGallery());

        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public ProductResponseDTO updateProductVisibility(String id, boolean isActive) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setIsActive(isActive);
        product.setUpdatedAt(LocalDateTime.now());
        Product saved = productRepository.save(product);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public InventoryAdjustmentResponseDTO adjustStock(String id, AdjustStockRequest request, String adminEmail) {
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Lý do điều chỉnh kho không được để trống.");
        }
        if (request.getQuantityChange() == null || request.getQuantityChange() == 0) {
            throw new IllegalArgumentException("Số lượng điều chỉnh kho phải khác 0.");
        }

        Product product = productRepository.findByIdWithLock(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        int previousQuantity = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int newQuantity = previousQuantity + request.getQuantityChange();
        if (newQuantity < 0) {
            throw new IllegalArgumentException(
                    "Tồn kho sau điều chỉnh không được âm (Tồn hiện tại: " + previousQuantity + ")."
            );
        }

        product.setStockQuantity(newQuantity);
        product.setInStock(newQuantity > 0);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        InventoryAdjustment adjustment = new InventoryAdjustment(
                product.getId(),
                previousQuantity,
                request.getQuantityChange(),
                newQuantity,
                request.getReason().trim(),
                adminEmail != null && !adminEmail.isBlank() ? adminEmail : "admin"
        );
        InventoryAdjustment savedAdjustment = inventoryAdjustmentRepository.save(adjustment);
        return mapAdjustmentToDTO(savedAdjustment);
    }

    @Override
    public List<InventoryAdjustmentResponseDTO> getStockAdjustments(String id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        return inventoryAdjustmentRepository.findByProductIdOrderByCreatedAtDesc(id)
                .stream()
                .map(this::mapAdjustmentToDTO)
                .collect(Collectors.toList());
    }

    private void validatePricing(Long price, Long originalPrice) {
        if (price == null || price <= 0) {
            throw new IllegalArgumentException("Giá bán phải lớn hơn 0.");
        }
        if (originalPrice == null || originalPrice < price) {
            throw new IllegalArgumentException("Giá gốc phải lớn hơn hoặc bằng giá bán.");
        }
    }

    private Category resolveCategory(String categorySlug) {
        if (categorySlug == null || categorySlug.isBlank()) {
            throw new IllegalArgumentException("Danh mục sản phẩm không được để trống.");
        }
        String normalizedSlug = categorySlug.trim().toLowerCase();
        return categoryRepository.findBySlug(normalizedSlug)
                .orElseThrow(() -> new IllegalArgumentException("Danh mục không tồn tại: " + normalizedSlug));
    }

    private String resolveNewProductId(String requestedId, String productName) {
        if (requestedId != null && !requestedId.isBlank()) {
            String cleanId = slugify(requestedId.trim());
            if (cleanId.isEmpty()) {
                throw new IllegalArgumentException("Mã sản phẩm không hợp lệ.");
            }
            if (productRepository.existsById(cleanId)) {
                throw new IllegalArgumentException("Mã sản phẩm đã tồn tại: " + cleanId);
            }
            return cleanId;
        }
        String baseSlug = slugify(productName);
        if (baseSlug.isEmpty()) {
            baseSlug = "prod";
        }
        if (baseSlug.length() > 36) {
            baseSlug = baseSlug.substring(0, 36).replaceAll("-+$", "");
        }
        String candidate = baseSlug;
        int suffix = 1;
        while (productRepository.existsById(candidate)) {
            candidate = baseSlug + "-" + suffix++;
        }
        return candidate;
    }

    private String slugify(String input) {
        if (input == null) {
            return "";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'd')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return normalized;
    }

    private int calculateDiscountPercent(Long price, Long originalPrice) {
        if (originalPrice == null || price == null || originalPrice <= price || originalPrice <= 0) {
            return 0;
        }
        return (int) Math.round(((originalPrice - price) * 100.0) / originalPrice);
    }

    private String trimOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String serializeSpecs(Map<String, String> specs) {
        Map<String, String> cleanSpecs = new LinkedHashMap<>();
        if (specs != null) {
            for (Map.Entry<String, String> entry : specs.entrySet()) {
                if (entry.getKey() != null && !entry.getKey().isBlank()
                        && entry.getValue() != null && !entry.getValue().isBlank()) {
                    cleanSpecs.put(entry.getKey().trim(), entry.getValue().trim());
                }
            }
        }
        try {
            return objectMapper.writeValueAsString(cleanSpecs);
        } catch (Exception e) {
            return "{}";
        }
    }

    private void applyFeatures(Product product, List<String> features) {
        product.getFeatures().clear();
        if (features == null) {
            return;
        }
        int order = 0;
        for (String feature : features) {
            if (feature != null && !feature.isBlank()) {
                product.getFeatures().add(new ProductFeature(product, feature.trim(), order++));
            }
        }
    }

    private void applyGallery(Product product, String primaryImage, List<String> galleryUrls) {
        product.getGallery().clear();
        List<String> urls = new ArrayList<>();
        if (galleryUrls != null) {
            for (String url : galleryUrls) {
                if (url != null && !url.isBlank()) {
                    String trimmed = url.trim();
                    if (!urls.contains(trimmed)) {
                        urls.add(trimmed);
                    }
                }
            }
        }
        if (primaryImage != null && !primaryImage.isBlank()) {
            String trimmedPrimary = primaryImage.trim();
            if (urls.isEmpty()) {
                urls.add(trimmedPrimary);
            } else if (!urls.contains(trimmedPrimary)) {
                urls.add(0, trimmedPrimary);
            }
        }
        int order = 0;
        for (String url : urls) {
            product.getGallery().add(new ProductGallery(product, url, order++));
        }
    }

    private InventoryAdjustmentResponseDTO mapAdjustmentToDTO(InventoryAdjustment entity) {
        return new InventoryAdjustmentResponseDTO(
                entity.getId(),
                entity.getProductId(),
                entity.getPreviousQuantity(),
                entity.getQuantityChange(),
                entity.getNewQuantity(),
                entity.getReason(),
                entity.getAdjustedBy(),
                entity.getCreatedAt()
        );
    }

    private Sort resolveSort(String sort) {
        if ("price_asc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "price");
        } else if ("rating".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "rating");
        }
        return Sort.by(Sort.Direction.ASC, "id");
    }

    private ProductResponseDTO mapToDTO(Product entity) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCategory(entity.getCategory() != null ? entity.getCategory().getSlug() : entity.getCategoryName());
        dto.setCategoryName(entity.getCategoryName());
        dto.setPrice(entity.getPrice());
        dto.setOriginalPrice(entity.getOriginalPrice());
        dto.setDiscountPercent(entity.getDiscountPercent());
        dto.setRating(entity.getRating() != null ? entity.getRating().doubleValue() : 5.0);
        dto.setReviewsCount(entity.getReviewsCount());
        dto.setBadge(entity.getBadge());
        dto.setBadgeType(entity.getBadgeType());
        dto.setImage(entity.getImage());
        dto.setDescription(entity.getDescription());
        dto.setInStock(entity.getInStock());
        dto.setStockQuantity(entity.getStockQuantity());
        dto.setIsActive(entity.getIsActive() != null ? entity.getIsActive() : true);
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getFeatures() != null && !entity.getFeatures().isEmpty()) {
            dto.setFeatures(entity.getFeatures().stream()
                    .map(ProductFeature::getFeatureText)
                    .collect(Collectors.toList()));
        } else {
            dto.setFeatures(new ArrayList<>());
        }

        if (entity.getGallery() != null && !entity.getGallery().isEmpty()) {
            dto.setGallery(entity.getGallery().stream()
                    .map(ProductGallery::getImageUrl)
                    .collect(Collectors.toList()));
        } else {
            dto.setGallery(List.of(entity.getImage()));
        }

        if (entity.getSpecsJson() != null && !entity.getSpecsJson().isBlank()) {
            try {
                Map<String, String> specs = objectMapper.readValue(
                        entity.getSpecsJson(),
                        new TypeReference<Map<String, String>>() {}
                );
                dto.setSpecs(specs);
            } catch (Exception e) {
                dto.setSpecs(new HashMap<>());
            }
        } else {
            dto.setSpecs(new HashMap<>());
        }

        return dto;
    }
}
