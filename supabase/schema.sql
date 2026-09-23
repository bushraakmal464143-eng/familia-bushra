-- Run in Supabase SQL Editor: https://supabase.com/dashboard → SQL → New query

DO $$ BEGIN
  CREATE TYPE camping_status AS ENUM ('pending', 'active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE offer_status AS ENUM ('pending', 'active', 'draft', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE offer_setting AS ENUM ('mountain', 'beach');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'paid', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  reset_token_hash TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS campings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT,
  location TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  photos TEXT[] NOT NULL DEFAULT '{}',
  profile_complete BOOLEAN NOT NULL DEFAULT false,
  status camping_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  camping_id TEXT NOT NULL REFERENCES campings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  meal_plan TEXT,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  travel_dates TEXT NOT NULL DEFAULT '',
  price_from NUMERIC(10,2) NOT NULL DEFAULT 0,
  image TEXT NOT NULL,
  gallery TEXT[],
  badge TEXT,
  countdown TEXT,
  countdown_progress SMALLINT,
  nights_options INTEGER[],
  cta_text TEXT,
  accommodation_name TEXT,
  accommodation_link_text TEXT,
  accommodations JSONB,
  map_label TEXT,
  map_lat DOUBLE PRECISION,
  map_lng DOUBLE PRECISION,
  category TEXT NOT NULL DEFAULT 'new',
  display_pages TEXT[],
  setting offer_setting,
  pet_friendly BOOLEAN,
  is_glamping BOOLEAN,
  is_hotel BOOLEAN,
  status offer_status NOT NULL DEFAULT 'active',
  featured BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  offer_id TEXT NOT NULL REFERENCES offers(id),
  camping_id TEXT NOT NULL REFERENCES campings(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  nights INTEGER NOT NULL,
  price_per_night NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  accommodation_id TEXT,
  accommodation_name TEXT,
  traveler_details JSONB,
  status booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT NOT NULL,
  site_tagline TEXT NOT NULL,
  logo_part1 TEXT NOT NULL,
  logo_accent TEXT NOT NULL,
  logo_part2 TEXT NOT NULL,
  logo_suffix TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  offers_heading TEXT NOT NULL,
  trust_point TEXT NOT NULL,
  footer_text TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campsite_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  comments TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  camping_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_events (
  id BIGSERIAL PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'login')),
  method TEXT NOT NULL CHECK (method IN ('email', 'google')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offers_camping ON offers(camping_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_camping ON bookings(camping_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_created ON auth_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_events_customer ON auth_events(customer_id);

-- Disable RLS for server-side access via service role key (app handles auth in cookies).
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE campings DISABLE ROW LEVEL SECURITY;
ALTER TABLE offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE partner_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events DISABLE ROW LEVEL SECURITY;
