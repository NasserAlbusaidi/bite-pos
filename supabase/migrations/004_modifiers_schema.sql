-- ========================================
-- BITE POS - Modifiers Schema
-- Version: 004
-- Adds support for product modifiers (add-ons, variations)
-- ========================================

-- ========================================
-- NEW TABLES
-- ========================================

-- Modifier Groups (e.g., "Size", "Pizza Toppings", "Sugar Level")
CREATE TABLE modifier_group (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    min_selection INT DEFAULT 0,       -- 0 = optional, 1+ = required
    max_selection INT DEFAULT 1,       -- 1 = single choice, NULL = unlimited
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modifiers (e.g., "Small", "Large", "Extra Cheese")
CREATE TABLE modifier (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES modifier_group(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,  -- Can be 0 or positive
    sort_order INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: Links Products (menu_item) to Modifier Groups
-- A Burger might have "Toppings" and "Size", but a Coke only has "Size"
CREATE TABLE product_modifier_group (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_item(id) ON DELETE CASCADE,
    modifier_group_id UUID NOT NULL REFERENCES modifier_group(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(menu_item_id, modifier_group_id)
);

-- ========================================
-- ORDER ITEMS UPDATE: Store selected modifiers
-- ========================================

-- Add a JSONB column to order_item to store selected modifiers snapshot
ALTER TABLE order_item 
ADD COLUMN selected_modifiers JSONB DEFAULT '[]'::jsonb;

-- The JSONB structure will be:
-- [
--   { "modifier_id": "uuid", "name": "Extra Cheese", "price_adjustment": 1.50 },
--   { "modifier_id": "uuid", "name": "Large", "price_adjustment": 2.00 }
-- ]

-- Add a column for the total modifier price adjustment (denormalized for fast queries)
ALTER TABLE order_item 
ADD COLUMN modifier_total DECIMAL(10, 2) DEFAULT 0;

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX idx_modifier_group_restaurant ON modifier_group(restaurant_id);
CREATE INDEX idx_modifier_group_id ON modifier(group_id);
CREATE INDEX idx_product_modifier_group_item ON product_modifier_group(menu_item_id);
CREATE INDEX idx_product_modifier_group_group ON product_modifier_group(modifier_group_id);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

ALTER TABLE modifier_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_modifier_group ENABLE ROW LEVEL SECURITY;

-- Modifier Group policies
CREATE POLICY "Anyone can view active modifier groups"
    ON modifier_group FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Owners can manage modifier groups"
    ON modifier_group FOR ALL
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM user_profile 
            WHERE auth_user_id = auth.uid() AND role = 'OWNER'
        )
    );

-- Modifier policies
CREATE POLICY "Anyone can view available modifiers"
    ON modifier FOR SELECT
    USING (is_available = TRUE);

CREATE POLICY "Owners can manage modifiers"
    ON modifier FOR ALL
    USING (
        group_id IN (
            SELECT mg.id FROM modifier_group mg
            JOIN user_profile up ON up.restaurant_id = mg.restaurant_id
            WHERE up.auth_user_id = auth.uid() AND up.role = 'OWNER'
        )
    );

-- Product-Modifier Group junction policies
CREATE POLICY "Anyone can view product modifier links"
    ON product_modifier_group FOR SELECT
    USING (TRUE);

CREATE POLICY "Owners can manage product modifier links"
    ON product_modifier_group FOR ALL
    USING (
        menu_item_id IN (
            SELECT mi.id FROM menu_item mi
            JOIN menu_category mc ON mi.category_id = mc.id
            JOIN user_profile up ON up.restaurant_id = mc.restaurant_id
            WHERE up.auth_user_id = auth.uid() AND up.role = 'OWNER'
        )
    );
