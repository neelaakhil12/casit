-- SUPABASE DATABASE SCHEMA FOR CASIT STORE
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Products Table with Per-Size Price Matrix Support
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  base_price NUMERIC DEFAULT 299,
  frame_price NUMERIC DEFAULT 400,
  poster_frame_price NUMERIC,
  a3_extra_price NUMERIC DEFAULT 150,
  split_extra_price NUMERIC DEFAULT 450,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  description TEXT,
  available_formats TEXT[] DEFAULT ARRAY['poster', 'frame', 'both'],
  size_prices JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Admin Users Table for Dynamic Password Verification & Reset
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Admin Credentials into Supabase DB
INSERT INTO public.admin_users (email, password)
VALUES ('casithelpline@gmail.com', 'admin123')
ON CONFLICT (email) DO NOTHING;

-- 4. Add Section Checkboxes columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;
