-- Run this if schema.sql was already applied earlier.
-- SQL Editor → New query → Run without RLS

ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS auth_events (
  id BIGSERIAL PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'login')),
  method TEXT NOT NULL CHECK (method IN ('email', 'google')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_events_created ON auth_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_events_customer ON auth_events(customer_id);

ALTER TABLE auth_events DISABLE ROW LEVEL SECURITY;
