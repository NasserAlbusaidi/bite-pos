-- ========================================
-- BITE POS - Fix RLS Policies for User Profile
-- Run this in Supabase SQL Editor to fix the "Could not find your restaurant" issue
-- ========================================

-- Drop the problematic policy that has a circular reference
DROP POLICY IF EXISTS "Users can view profiles in their restaurant" ON user_profile;

-- Create a direct policy that allows users to view THEIR OWN profile first
CREATE POLICY "Users can view their own profile"
    ON user_profile FOR SELECT
    USING (auth_user_id = auth.uid());

-- Create a policy that allows users to view OTHER profiles in their restaurant
-- (This is needed so owners can see staff in their restaurant)
CREATE POLICY "Users can view profiles in their restaurant"
    ON user_profile FOR SELECT
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM user_profile 
            WHERE auth_user_id = auth.uid()
        )
    );
