-- Run in Supabase SQL Editor if customers already exist without avatar_url
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
