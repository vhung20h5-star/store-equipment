-- Phase 6: Product Management & Inventory Adjustment Audit Log

-- 1. Add visibility column to products (default true so all existing products remain active)
ALTER TABLE products
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- 2. Create inventory_adjustments audit table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id BIGSERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    previous_quantity INT NOT NULL,
    quantity_change INT NOT NULL,
    new_quantity INT NOT NULL,
    reason VARCHAR(500) NOT NULL,
    adjusted_by VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_adjustments_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON inventory_adjustments(created_at DESC);

