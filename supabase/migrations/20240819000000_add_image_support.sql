-- Migration: Add image support for services and staff
-- This enables visual trust elements in the booking flow

ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add logo support to business profile (future use)
-- ALTER TABLE business ADD COLUMN IF NOT EXISTS logo_url TEXT;
