package com.homenest.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homenest.dto.PageResponse;
import com.homenest.dto.ProductResponseDTO;
import com.homenest.entity.Product;
import com.homenest.entity.ProductFeature;
import com.homenest.entity.ProductGallery;
import com.homenest.exception.ResourceNotFoundException;
import com.homenest.repository.ProductRepository;
import com.homenest.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    public ProductServiceImpl(ProductRepository productRepository, ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public PageResponse<ProductResponseDTO> getProducts(String category, String search, int page, int size, String sort) {
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();

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
        return productRepository.findByBadgeType("bestseller")
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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

