package com.homenest.dto;

public class TestimonialResponseDTO {

    private String id;
    private String name;
    private String location;
    private String avatar;
    private Integer rating;
    private String comment;
    private String purchasedProduct;

    public TestimonialResponseDTO() {}

    public TestimonialResponseDTO(String id, String name, String location, String avatar, Integer rating, String comment, String purchasedProduct) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.avatar = avatar;
        this.rating = rating;
        this.comment = comment;
        this.purchasedProduct = purchasedProduct;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getPurchasedProduct() { return purchasedProduct; }
    public void setPurchasedProduct(String purchasedProduct) { this.purchasedProduct = purchasedProduct; }
}

