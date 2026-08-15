-- ═══════════════════════════════════════════════════════════════
-- CASIT STORE — COMPLETE SUPABASE SQL MIGRATION
-- Run this in Supabase SQL Editor → https://supabase.com/dashboard
-- Safe to run multiple times (uses IF NOT EXISTS & ON CONFLICT)
-- ═══════════════════════════════════════════════════════════════


-- ──────────────────────────────────────────────────────────────
-- TABLE 1: CATEGORIES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  image_url  TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default categories (safe upsert)
INSERT INTO public.categories (id, name, image_url) VALUES
  ('anime',              'Anime',                '/anime/anime-poster-12.png'),
  ('movies-series',      'Movies & Series',      '/categories/movies-series.png'),
  ('motivational',       'Motivational Quotes',  '/categories/motivational.png'),
  ('cars-bikes',         'Cars & Bikes',          '/categories/cars-bikes.png'),
  ('marvel-dc',          'Marvel & DC',           '/categories/marvel-dc.png'),
  ('spiritual',          'Spiritual',             '/categories/spiritual.png'),
  ('sports',             'Sports',                '/categories/sports.png'),
  ('split-posters',      'Split Posters',         '/categories/split-posters.png'),
  ('wall-setups',        'Wall Setup Packs',      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop'),
  ('polaroids',          'Polaroids',             '/categories/polaroids.png'),
  ('framed',             'Framed Posters',        '/categories/framed.png'),
  ('customized-posters', 'Customized Posters',   'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET
  name      = EXCLUDED.name,
  image_url = COALESCE(EXCLUDED.image_url, public.categories.image_url);


-- ──────────────────────────────────────────────────────────────
-- TABLE 2: PRODUCTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                  SERIAL PRIMARY KEY,
  title               TEXT NOT NULL,
  base_price          NUMERIC DEFAULT 299,
  frame_price         NUMERIC DEFAULT 400,
  poster_frame_price  NUMERIC,
  a3_extra_price      NUMERIC DEFAULT 150,
  split_extra_price   NUMERIC DEFAULT 450,
  category_id         TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url           TEXT,
  description         TEXT,
  available_formats   TEXT[] DEFAULT ARRAY['poster', 'frame', 'both'],
  size_prices         JSONB,
  is_trending         BOOLEAN DEFAULT true,
  is_best_seller      BOOLEAN DEFAULT false,
  is_new_arrival      BOOLEAN DEFAULT false,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add homepage section columns if products table already exists
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_trending    BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;


-- ──────────────────────────────────────────────────────────────
-- TABLE 3: ADMIN USERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin credentials (skips if already exists)
INSERT INTO public.admin_users (email, password)
VALUES ('casithelpline@gmail.com', 'admin123')
ON CONFLICT (email) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- TABLE 4: ORDERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id             SERIAL PRIMARY KEY,
  customer_name  TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  address        TEXT,
  items          JSONB,
  total_amount   NUMERIC DEFAULT 0,
  status         TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'cod',
  notes          TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if orders table already exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes          TEXT;


-- ──────────────────────────────────────────────────────────────
-- TABLE 5: VERIFIED REVIEWS + CUSTOMER VIDEO REELS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.verified_reviews (
  id             SERIAL PRIMARY KEY,
  image_url      TEXT,
  thumbnail      TEXT,
  video_url      TEXT,
  customer_name  TEXT    DEFAULT 'Verified Buyer',
  handle         TEXT,                                  -- social handle (for video reels)
  location       TEXT,                                  -- city (for photo reviews)
  caption        TEXT,
  rating         NUMERIC DEFAULT 5,
  views          TEXT    DEFAULT '45.2K',               -- display view count
  likes          TEXT    DEFAULT '3.8K',                -- display like count
  tagged_product TEXT,                                  -- linked product name
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if verified_reviews table already exists (safe migration)
ALTER TABLE public.verified_reviews ADD COLUMN IF NOT EXISTS thumbnail      TEXT;
ALTER TABLE public.verified_reviews ADD COLUMN IF NOT EXISTS video_url      TEXT;
ALTER TABLE public.verified_reviews ADD COLUMN IF NOT EXISTS handle         TEXT;
ALTER TABLE public.verified_reviews ADD COLUMN IF NOT EXISTS location       TEXT;
ALTER TABLE public.verified_reviews ADD COLUMN IF NOT EXISTS views          TEXT DEFAULT '45.2K';
ALTER TABLE public.verified_reviews ADD COLUMN IF NOT EXISTS likes          TEXT DEFAULT '3.8K';
ALTER TABLE public.verified_reviews ADD COLUMN IF NOT EXISTS tagged_product TEXT;


-- ──────────────────────────────────────────────────────────────
-- TABLE 6: CUSTOM PRINT TYPES (Custom Wall Art Studio Presets)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.custom_print_types (
  id               TEXT PRIMARY KEY,
  title_script     TEXT,
  title_main       TEXT NOT NULL,
  subtitle         TEXT,
  button_text      TEXT,
  image            TEXT,
  badge            TEXT,
  type_label       TEXT,
  extra_tag        TEXT,
  image_count      INTEGER DEFAULT 1,
  allow_framing    BOOLEAN DEFAULT true,
  allow_frame_only BOOLEAN DEFAULT true,
  frame_price      NUMERIC DEFAULT 250,
  frame_badge      TEXT DEFAULT 'Acrylic Shield',
  frame_styles     JSONB,
  default_sizes    JSONB,
  sort_order       INTEGER DEFAULT 0,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allows public read, authenticated (anon key) write for all tables
-- ──────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_print_types ENABLE ROW LEVEL SECURITY;

-- ── categories ──
DROP POLICY IF EXISTS "Public read categories"  ON public.categories;
DROP POLICY IF EXISTS "Anon write categories"   ON public.categories;
CREATE POLICY "Public read categories"  ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anon write categories"   ON public.categories FOR ALL    USING (true) WITH CHECK (true);

-- ── products ──
DROP POLICY IF EXISTS "Public read products"  ON public.products;
DROP POLICY IF EXISTS "Anon write products"   ON public.products;
CREATE POLICY "Public read products"  ON public.products FOR SELECT USING (true);
CREATE POLICY "Anon write products"   ON public.products FOR ALL    USING (true) WITH CHECK (true);

-- ── admin_users ──
DROP POLICY IF EXISTS "Anon read admin_users"  ON public.admin_users;
DROP POLICY IF EXISTS "Anon write admin_users" ON public.admin_users;
CREATE POLICY "Anon read admin_users"  ON public.admin_users FOR SELECT USING (true);
CREATE POLICY "Anon write admin_users" ON public.admin_users FOR ALL    USING (true) WITH CHECK (true);

-- ── orders ──
DROP POLICY IF EXISTS "Public insert orders"  ON public.orders;
DROP POLICY IF EXISTS "Anon read orders"      ON public.orders;
DROP POLICY IF EXISTS "Anon write orders"     ON public.orders;
CREATE POLICY "Public insert orders"  ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon read orders"      ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anon write orders"     ON public.orders FOR ALL    USING (true) WITH CHECK (true);

-- ── verified_reviews ──
DROP POLICY IF EXISTS "Public read verified_reviews"  ON public.verified_reviews;
DROP POLICY IF EXISTS "Anon write verified_reviews"   ON public.verified_reviews;
CREATE POLICY "Public read verified_reviews"  ON public.verified_reviews FOR SELECT USING (true);
CREATE POLICY "Anon write verified_reviews"   ON public.verified_reviews FOR ALL    USING (true) WITH CHECK (true);

-- ── custom_print_types ──
DROP POLICY IF EXISTS "Public read custom_print_types"  ON public.custom_print_types;
DROP POLICY IF EXISTS "Anon write custom_print_types"   ON public.custom_print_types;
CREATE POLICY "Public read custom_print_types"  ON public.custom_print_types FOR SELECT USING (true);
CREATE POLICY "Anon write custom_print_types"   ON public.custom_print_types FOR ALL    USING (true) WITH CHECK (true);


-- ──────────────────────────────────────────────────────────────
-- VERIFICATION — Check all tables exist
-- ──────────────────────────────────────────────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('categories', 'products', 'admin_users', 'orders', 'verified_reviews', 'custom_print_types')
ORDER BY table_name;
