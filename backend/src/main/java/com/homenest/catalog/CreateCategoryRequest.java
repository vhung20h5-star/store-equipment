package com.homenest.catalog;

import jakarta.validation.constraints.NotBlank;

public class CreateCategoryRequest {

    private String id;

    @NotBlank(message = "Slug danh mục không được để trống")
    private String slug;

    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private String description;

    @NotBlank(message = "Ảnh danh mục không được để trống")
    private String image;

    public CreateCategoryRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}

