package com.homenest.dto;

public class CategoryResponseDTO {

    private String id;
    private String slug;
    private String name;
    private String description;
    private String image;
    private long itemCount;

    public CategoryResponseDTO() {}

    public CategoryResponseDTO(String id, String slug, String name, String description, String image, long itemCount) {
        this.id = id;
        this.slug = slug;
        this.name = name;
        this.description = description;
        this.image = image;
        this.itemCount = itemCount;
    }

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

    public long getItemCount() { return itemCount; }
    public void setItemCount(long itemCount) { this.itemCount = itemCount; }
}

