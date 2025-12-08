-- ========================================
-- BITE POS - Clean Database Reset
-- Version: 1.1 (with RLS fixes and image support)
-- 
-- ⚠️  WARNING: This will DELETE all existing data!
-- Run this in your Supabase SQL Editor
-- ========================================

-- ========================================
-- STEP 1: DROP EXISTING TABLES
-- ========================================
DROP TABLE IF EXISTS order_item CASCADE;
DROP TABLE IF EXISTS "order" CASCADE;
DROP TABLE IF EXISTS menu_item CASCADE;
DROP TABLE IF EXISTS menu_category CASCADE;
DROP TABLE IF EXISTS user_profile CASCADE;
DROP TABLE IF EXISTS restaurant CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- STEP 2: CREATE TABLES
-- ========================================

-- Restaurant (Core Tenant Table)
CREATE TABLE restaurant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    currency_symbol VARCHAR(10) DEFAULT '$',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (Owners & Staff)
CREATE TABLE user_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    auth_user_id UUID UNIQUE, -- Links to Supabase auth.users (only for owners)
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    pin_code VARCHAR(4), -- 4-digit PIN for staff
    role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'STAFF')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Categories
CREATE TABLE menu_category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items (with image support)
CREATE TABLE menu_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES menu_category(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    description TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE "order" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES user_profile(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'COMPLETED', 'VOID')),
    total_amount DECIMAL(10, 2) DEFAULT 0,
    daily_order_number INT NOT NULL
);

-- Order Items
CREATE TABLE order_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
    item_id UUID REFERENCES menu_item(id),
    item_name_snapshot VARCHAR(255) NOT NULL,
    price_snapshot DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    notes TEXT
);

-- ========================================
-- STEP 3: INDEXES
-- ========================================
CREATE INDEX idx_user_profile_restaurant ON user_profile(restaurant_id);
CREATE INDEX idx_user_profile_auth_user ON user_profile(auth_user_id);
CREATE INDEX idx_user_profile_pin ON user_profile(restaurant_id, pin_code);
CREATE INDEX idx_menu_category_restaurant ON menu_category(restaurant_id);
CREATE INDEX idx_menu_item_category ON menu_item(category_id);
CREATE INDEX idx_order_restaurant ON "order"(restaurant_id);
CREATE INDEX idx_order_created ON "order"(created_at);
CREATE INDEX idx_order_daily ON "order"(restaurant_id, daily_order_number);
CREATE INDEX idx_order_item_order ON order_item(order_id);

-- ========================================
-- STEP 4: ROW LEVEL SECURITY (Fixed)
-- ========================================

ALTER TABLE restaurant ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item ENABLE ROW LEVEL SECURITY;

-- Restaurant policies
CREATE POLICY "Users can view their restaurant"
    ON restaurant FOR SELECT
    USING (
        id IN (
            SELECT restaurant_id FROM user_profile 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update their restaurant"
    ON restaurant FOR UPDATE
    USING (
        id IN (
            SELECT restaurant_id FROM user_profile 
            WHERE auth_user_id = auth.uid() AND role = 'OWNER'
        )
    );

-- User profile policies (FIXED - direct access to own profile first)
CREATE POLICY "Users can view their own profile"
    ON user_profile FOR SELECT
    USING (auth_user_id = auth.uid());

CREATE POLICY "Users can view profiles in their restaurant"
    ON user_profile FOR SELECT
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM user_profile 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can manage staff"
    ON user_profile FOR ALL
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM user_profile 
            WHERE auth_user_id = auth.uid() AND role = 'OWNER'
        )
    );

-- Menu category policies
CREATE POLICY "Anyone can view active menu categories"
    ON menu_category FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Owners can manage categories"
    ON menu_category FOR ALL
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM user_profile 
            WHERE auth_user_id = auth.uid() AND role = 'OWNER'
        )
    );

-- Menu item policies
CREATE POLICY "Anyone can view available menu items"
    ON menu_item FOR SELECT
    USING (is_available = TRUE);

CREATE POLICY "Owners can manage items"
    ON menu_item FOR ALL
    USING (
        category_id IN (
            SELECT mc.id FROM menu_category mc
            JOIN user_profile up ON up.restaurant_id = mc.restaurant_id
            WHERE up.auth_user_id = auth.uid() AND up.role = 'OWNER'
        )
    );

-- Order policies
CREATE POLICY "Staff can view orders in their restaurant"
    ON "order" FOR SELECT
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM user_profile 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can create orders"
    ON "order" FOR INSERT
    WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM user_profile 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can manage orders"
    ON "order" FOR ALL
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM user_profile 
            WHERE auth_user_id = auth.uid() AND role = 'OWNER'
        )
    );

-- Order item policies
CREATE POLICY "Staff can view order items"
    ON order_item FOR SELECT
    USING (
        order_id IN (
            SELECT o.id FROM "order" o
            JOIN user_profile up ON up.restaurant_id = o.restaurant_id
            WHERE up.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can create order items"
    ON order_item FOR INSERT
    WITH CHECK (
        order_id IN (
            SELECT o.id FROM "order" o
            JOIN user_profile up ON up.restaurant_id = o.restaurant_id
            WHERE up.auth_user_id = auth.uid()
        )
    );

-- ========================================
-- STEP 5: FUNCTIONS
-- ========================================

-- Function to get the next daily order number
CREATE OR REPLACE FUNCTION get_next_daily_order_number(p_restaurant_id UUID)
RETURNS INT AS $$
DECLARE
    next_number INT;
BEGIN
    SELECT COALESCE(MAX(daily_order_number), 0) + 1 INTO next_number
    FROM "order"
    WHERE restaurant_id = p_restaurant_id
    AND DATE(created_at) = CURRENT_DATE;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to validate PIN and return user
CREATE OR REPLACE FUNCTION validate_pin(p_restaurant_id UUID, p_pin VARCHAR(4))
RETURNS TABLE(
    id UUID,
    full_name VARCHAR(255),
    role VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT up.id, up.full_name, up.role
    FROM user_profile up
    WHERE up.restaurant_id = p_restaurant_id
    AND up.pin_code = p_pin
    AND up.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 6: SEED DATA
-- ========================================
-- ⚠️ REPLACE 'YOUR_AUTH_USER_ID_HERE' with your actual Supabase auth user ID
-- Get it from: Supabase Dashboard → Authentication → Users → Copy the ID

-- Create the restaurant
INSERT INTO restaurant (id, name, address, currency_symbol)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'My Restaurant',
    'Muscat, Oman',
    'ر.ع'
);

-- Create the owner (REPLACE THE AUTH_USER_ID!)
INSERT INTO user_profile (restaurant_id, auth_user_id, full_name, email, role)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'YOUR_AUTH_USER_ID_HERE',  -- ← REPLACE THIS with your actual auth user ID!
    'Owner',
    'owner@example.com',
    'OWNER'
);

-- Create a demo staff member
INSERT INTO user_profile (restaurant_id, full_name, pin_code, role)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Demo Staff',
    '1234',
    'STAFF'
);

-- Create sample categories
INSERT INTO menu_category (restaurant_id, name, sort_order) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Drinks', 1),
    ('11111111-1111-1111-1111-111111111111', 'Appetizers', 2),
    ('11111111-1111-1111-1111-111111111111', 'Mains', 3),
    ('11111111-1111-1111-1111-111111111111', 'Desserts', 4);

-- ========================================
-- DONE! Refresh the app and login.
-- ========================================
