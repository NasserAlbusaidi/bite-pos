-- ========================================
-- BITE POS - Add Image Support for Menu Items
-- Run this in Supabase SQL Editor
-- ========================================

-- Add image_url column to menu_item table
ALTER TABLE menu_item
ADD COLUMN image_url TEXT;

-- Create a storage bucket for menu images (run this separately if needed)
-- Note: You may need to create the bucket manually in Supabase Dashboard > Storage
-- Bucket name: menu-images
-- Public bucket: Yes (for easy access)
