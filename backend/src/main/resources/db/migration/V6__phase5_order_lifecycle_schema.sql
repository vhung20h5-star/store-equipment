-- V6__phase5_order_lifecycle_schema.sql
-- Schema evolution for Order Lifecycle Management, User Link, and Cancellation Audit

ALTER TABLE orders ADD COLUMN user_id BIGINT;
ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN cancelled_by VARCHAR(50);
ALTER TABLE orders ADD COLUMN cancel_reason VARCHAR(500);

ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);

