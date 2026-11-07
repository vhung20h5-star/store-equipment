-- V10__phase8_bank_cards_and_mandatory_vip_payment.sql
-- Phase 8: User Bank Cards (Balance, CVV Verification, Top-up, Transactions), Mandatory Card Payment for VIP Membership, and Bank Card Order Checkout & Refund

-- 1. Create bank_cards table
CREATE TABLE IF NOT EXISTS bank_cards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    card_brand VARCHAR(30) NOT NULL DEFAULT 'VISA',
    card_number_masked VARCHAR(30) NOT NULL,
    card_last4 VARCHAR(4) NOT NULL,
    card_holder_name VARCHAR(150) NOT NULL,
    expiry_date VARCHAR(10) NOT NULL,
    cvv_code VARCHAR(20) NOT NULL,
    balance BIGINT NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bank_cards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bank_cards_user_id ON bank_cards(user_id);

-- 2. Create card_transactions table
CREATE TABLE IF NOT EXISTS card_transactions (
    id BIGSERIAL PRIMARY KEY,
    card_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    description VARCHAR(500) NOT NULL,
    reference_code VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_card_tx_card FOREIGN KEY (card_id) REFERENCES bank_cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_card_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_card_tx_user_id ON card_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_tx_card_id ON card_transactions(card_id);

-- 3. Extend vip_subscriptions with bank card payment info (snapshot, no FK so history survives card deletion)
ALTER TABLE vip_subscriptions ADD COLUMN IF NOT EXISTS bank_card_id BIGINT;
ALTER TABLE vip_subscriptions ADD COLUMN IF NOT EXISTS card_masked VARCHAR(100);

-- 4. Extend orders with bank card payment info (snapshot, no FK so order history survives card deletion)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bank_card_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_masked VARCHAR(100);

