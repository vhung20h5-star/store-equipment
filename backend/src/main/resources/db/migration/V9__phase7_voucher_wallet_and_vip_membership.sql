-- V9__phase7_voucher_wallet_and_vip_membership.sql
-- Phase 7: Client Voucher Wallet, Special Event Campaigns (10/10, 11/11, Holidays, Daily), and VIP Membership (Monthly / Yearly)

-- 1. Extend promotions table for event campaigns, limited quantities, and VIP exclusivity
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(50) NOT NULL DEFAULT 'FLASH_SALE';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS event_tag VARCHAR(100) DEFAULT 'Flash Sale';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS min_order_amount BIGINT NOT NULL DEFAULT 0;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS total_quantity INT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS claimed_quantity INT NOT NULL DEFAULT 0;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS used_quantity INT NOT NULL DEFAULT 0;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS vip_only BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS requires_claim BOOLEAN NOT NULL DEFAULT TRUE;

-- Keep legacy HOMENEST30 flash sale public (no pre-claim required) for backward compatibility
UPDATE promotions
SET campaign_type = 'FLASH_SALE',
    event_tag = 'Flash Sale Mở Màn',
    min_order_amount = 0,
    total_quantity = 500,
    claimed_quantity = 128,
    vip_only = FALSE,
    requires_claim = FALSE
WHERE id = 'promo-flash-sale';

-- 2. Create user_vouchers table (Client Voucher Wallet)
CREATE TABLE IF NOT EXISTS user_vouchers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    promotion_id VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    claimed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    order_number VARCHAR(50),
    CONSTRAINT fk_user_vouchers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_vouchers_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_voucher_claim UNIQUE (user_id, promotion_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vouchers_user_id ON user_vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_promotion_id ON user_vouchers(promotion_id);

-- 3. Extend users table with VIP Membership status
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_tier VARCHAR(30) NOT NULL DEFAULT 'NONE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMP;

-- 4. Create vip_subscriptions table for VIP purchase history
CREATE TABLE IF NOT EXISTS vip_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_type VARCHAR(30) NOT NULL,
    price_paid BIGINT NOT NULL,
    discount_percent INT NOT NULL,
    max_discount_per_order BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'QR_INSTANT',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vip_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_user_id ON vip_subscriptions(user_id);

-- 5. Extend orders table for stacked VIP + Voucher discounts
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_discount_amount BIGINT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vip_discount_amount BIGINT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vip_tier_applied VARCHAR(30);

-- 6. Seed Special Event Vouchers (10/10, 11/11, 12/12), Holiday Vouchers, Daily Vouchers, and VIP-Only Vouchers
INSERT INTO promotions (
    id, code, title, description, discount_percent, max_discount_amount,
    start_time, end_time, featured_product_id, is_active,
    campaign_type, event_tag, min_order_amount, total_quantity, claimed_quantity, used_quantity, vip_only, requires_claim
) VALUES
(
    'promo-double-1111',
    'MEGA1111',
    'Siêu Sale 11/11 – Giảm Sâu 40%',
    'Voucher đặc biệt đợt 11/11 giảm tới 40% (tối đa 1.200.000đ) cho đơn từ 2.000.000đ. Số lượng phát hành cực kỳ giới hạn!',
    40,
    1200000,
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    NULL,
    TRUE,
    'DOUBLE_DAY',
    '11/11 Siêu Sale Ngày Đôi',
    2000000,
    50,
    42,
    18,
    FALSE,
    TRUE
),
(
    'promo-double-1010',
    'SALE1010',
    'Đại Tiệc 10/10 – Giảm Sốc 35%',
    'Săn mã ngày đôi 10/10 giảm ngay 35% (tối đa 900.000đ) cho đơn hàng thiết bị gia dụng từ 1.500.000đ.',
    35,
    900000,
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    NULL,
    TRUE,
    'DOUBLE_DAY',
    '10/10 Đại Tiệc Ngày Đôi',
    1500000,
    60,
    52,
    24,
    FALSE,
    TRUE
),
(
    'promo-double-1212',
    'SALE1212',
    'Lễ Hội 12/12 – Ưu Đãi Đỉnh Điểm 45%',
    'Siêu voucher ngày đôi 12/12 giảm tới 45% (tối đa 1.500.000đ) cho đơn hàng từ 3.000.000đ. Chỉ 30 suất duy nhất!',
    45,
    1500000,
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    NULL,
    TRUE,
    'DOUBLE_DAY',
    '12/12 Sale Cuối Năm',
    3000000,
    30,
    26,
    12,
    FALSE,
    TRUE
),
(
    'promo-holiday-tet',
    'LEHOI35',
    'Mừng Đại Lễ & Tết – Giảm 35%',
    'Ưu đãi dịp Lễ lớn tân trang tổ ấm: Giảm 35% (tối đa 1.000.000đ) cho đơn từ 2.000.000đ.',
    35,
    1000000,
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    NULL,
    TRUE,
    'HOLIDAY',
    'Đặc Biệt Ngày Lễ',
    2000000,
    80,
    68,
    30,
    FALSE,
    TRUE
),
(
    'promo-holiday-25',
    'NGAYLE25',
    'Tuần Lễ Vàng Ngày Lễ – Giảm 25%',
    'Tri ân khách hàng dịp lễ: Giảm 25% (tối đa 600.000đ) cho mọi đơn hàng từ 1.000.000đ.',
    25,
    600000,
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    NULL,
    TRUE,
    'HOLIDAY',
    'Đặc Biệt Ngày Lễ',
    1000000,
    100,
    74,
    40,
    FALSE,
    TRUE
),
(
    'promo-daily-10',
    'DAILY10',
    'Ưu Đãi Ngày Thường – Giảm 10%',
    'Mã giảm giá hàng ngày dành cho mọi khách hàng: Giảm 10% (tối đa 150.000đ) cho đơn từ 500.000đ.',
    10,
    150000,
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    NULL,
    TRUE,
    'DAILY',
    'Ưu Đãi Hàng Ngày',
    500000,
    500,
    145,
    80,
    FALSE,
    TRUE
),
(
    'promo-daily-12',
    'DAILY12',
    'Tiện Nghi Mỗi Ngày – Giảm 12%',
    'Voucher mua sắm ngày thường tiết kiệm 12% (tối đa 250.000đ) cho đơn từ 1.200.000đ.',
    12,
    250000,
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    NULL,
    TRUE,
    'DAILY',
    'Ưu Đãi Hàng Ngày',
    1200000,
    300,
    92,
    45,
    FALSE,
    TRUE
),
(
    'promo-daily-welcome',
    'HOMENEST8',
    'Voucher Thường Nhật – Giảm 8% Mọi Đơn',
    'Áp dụng cho mọi đơn hàng không giới hạn giá trị tối thiểu, giảm 8% tối đa 100.000đ.',
    8,
    100000,
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    NULL,
    TRUE,
    'DAILY',
    'Ưu Đãi Hàng Ngày',
    0,
    1000,
    210,
    110,
    FALSE,
    TRUE
),
(
    'promo-vip-25',
    'VIPCLUB25',
    'Đặc Quyền Hội Viên VIP – Giảm 25%',
    'Voucher độc quyền dành riêng cho Hội viên VIP Tháng & VIP Năm: Giảm 25% (tối đa 800.000đ) cho đơn từ 1.000.000đ, cộng dồn thêm ưu đãi % hạng thẻ VIP!',
    25,
    800000,
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    NULL,
    TRUE,
    'VIP_ONLY',
    'Đặc Quyền Hội Viên VIP',
    1000000,
    200,
    35,
    15,
    TRUE,
    TRUE
),
(
    'promo-vip-35',
    'VIPDIAMOND35',
    'Siêu Đặc Quyền VIP – Giảm 35%',
    'Mã giảm giá sâu dành riêng cho thành viên VIP HomeNest: Giảm 35% (tối đa 1.500.000đ) cho đơn từ 2.500.000đ.',
    35,
    1500000,
    '2026-01-01 00:00:00',
    '2027-12-31 23:59:59',
    NULL,
    TRUE,
    'VIP_ONLY',
    'Đặc Quyền Hội Viên VIP',
    2500000,
    100,
    28,
    10,
    TRUE,
    TRUE
);

