-- V1__init_schema.sql
-- Schema initialization for HomeNest categories and products

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    category_slug VARCHAR(50) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price BIGINT NOT NULL,
    original_price BIGINT NOT NULL,
    discount_percent INT NOT NULL DEFAULT 0,
    rating NUMERIC(3, 1) NOT NULL DEFAULT 5.0,
    reviews_count INT NOT NULL DEFAULT 0,
    badge VARCHAR(100),
    badge_type VARCHAR(50),
    image VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    specs_json TEXT,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_slug) REFERENCES categories(slug) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_features (
    id BIGSERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    feature_text VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_features_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_gallery (
    id BIGSERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_gallery_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_products_category ON products(category_slug);
CREATE INDEX idx_products_badge ON products(badge_type);
CREATE INDEX idx_features_product ON product_features(product_id);
CREATE INDEX idx_gallery_product ON product_gallery(product_id);

