-- V3__phase2_schema_and_seed.sql
-- Schema and seed data for Promotions, Testimonials, and Newsletter Subscribers

-- 1. Table: promotions
CREATE TABLE IF NOT EXISTS promotions (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percent INT NOT NULL DEFAULT 10,
    max_discount_amount BIGINT,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NOT NULL,
    featured_product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    purchased_product VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    voucher_code VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_testimonials_order ON testimonials(display_order);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- Seed Promotions
INSERT INTO promotions (id, code, title, description, discount_percent, max_discount_amount, start_time, end_time, featured_product_id, is_active)
VALUES (
    'promo-flash-sale',
    'HOMENEST30',
    'Flash Sale Có Hạn – Giảm Đến 30%',
    'Cơ hội sở hữu trọn bộ thiết bị gia dụng nhà bếp, robot lau dọn thông minh và máy lọc không khí cao cấp với mức giá tốt nhất trong tháng.',
    30,
    1000000,
    CURRENT_TIMESTAMP,
    '2026-12-31 23:59:59',
    'prod-1',
    TRUE
);

-- Seed Testimonials
INSERT INTO testimonials (id, name, location, avatar, rating, comment, purchased_product, display_order, is_published)
VALUES
(
    'test-1',
    'Chị Minh Anh',
    'Khu đô thị Vinhomes, Hà Nội',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    5,
    'Nồi chiên dùng cực kỳ thích! Nhà mình có 2 bé nhỏ, từ ngày mua nồi chiên HomeNest các món chiên rán vừa giòn vừa không sợ ngấy mỡ. Thiết kế mặt kính nhìn rất sang trọng trong căn bếp.',
    'Nồi chiên không dầu DualZone 6.5L',
    1,
    TRUE
),
(
    'test-2',
    'Anh Hoàng Long',
    'Quận 7, TP. Hồ Chí Minh',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    5,
    'Robot hút cực sạch và tự giặt sấy giẻ lau thật sự cứu cánh cho dân văn phòng bận rộn như mình. Về đến nhà là sàn bóng loáng sạch sẽ. Giao hàng nhanh và đóng gói rất cẩn thận!',
    'Robot hút bụi lau nhà OmniClean Pro X1',
    2,
    TRUE
),
(
    'test-3',
    'Chị Thu Thảo',
    'Hải Châu, TP. Đà Nẵng',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    5,
    'Máy lọc không khí chạy rất êm, đêm ngủ không nghe thấy tiếng động nào. Nhà mình nuôi mèo mà từ lúc bật máy là không còn mùi hôi hay bay lông tơ nữa. Rất đáng đồng tiền bát gạo!',
    'Máy lọc không khí AirPure Plasma',
    3,
    TRUE
);

