-- ============================================
-- Migration: Virtual Phone Numbers Pool
-- Description: Table for managing virtual SMS numbers
-- ============================================

-- Create virtual_phone_numbers table
CREATE TABLE IF NOT EXISTS public.virtual_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Phone number details
  phone_number TEXT NOT NULL UNIQUE,
  country_code TEXT NOT NULL DEFAULT 'BG',
  sms_inbox_url TEXT NOT NULL,

  -- Provider information
  provider TEXT DEFAULT 'receive-sms-online',
  provider_phone_id TEXT,

  -- Status management
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN (
    'available',      -- Ready to be used
    'in_use',         -- Currently assigned to an owner
    'cooldown',       -- Recently used, waiting before reuse
    'disabled',       -- Temporarily disabled
    'retired'         -- Permanently removed from pool
  )),

  -- Assignment tracking
  assigned_to_owner_id UUID REFERENCES public.verified_owners(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  total_uses INTEGER DEFAULT 0,
  successful_verifications INTEGER DEFAULT 0,
  failed_verifications INTEGER DEFAULT 0,

  -- Cooldown settings (time before number can be reused)
  cooldown_hours INTEGER DEFAULT 24,
  cooldown_until TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Notes
  notes TEXT
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_virtual_phones_status
ON public.virtual_phone_numbers (status);

CREATE INDEX IF NOT EXISTS idx_virtual_phones_country
ON public.virtual_phone_numbers (country_code);

CREATE INDEX IF NOT EXISTS idx_virtual_phones_available
ON public.virtual_phone_numbers (status, country_code, last_used_at)
WHERE status = 'available';

CREATE INDEX IF NOT EXISTS idx_virtual_phones_assigned
ON public.virtual_phone_numbers (assigned_to_owner_id)
WHERE assigned_to_owner_id IS NOT NULL;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION set_virtual_phones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_virtual_phones_updated_at ON public.virtual_phone_numbers;
CREATE TRIGGER trg_virtual_phones_updated_at
  BEFORE UPDATE ON public.virtual_phone_numbers
  FOR EACH ROW EXECUTE FUNCTION set_virtual_phones_updated_at();

-- Function to release phone number after use (with cooldown)
CREATE OR REPLACE FUNCTION release_phone_number(phone_id UUID)
RETURNS void AS $$
DECLARE
  cooldown_hrs INTEGER;
BEGIN
  SELECT cooldown_hours INTO cooldown_hrs
  FROM public.virtual_phone_numbers
  WHERE id = phone_id;

  UPDATE public.virtual_phone_numbers
  SET
    status = 'cooldown',
    assigned_to_owner_id = NULL,
    assigned_at = NULL,
    cooldown_until = NOW() + (cooldown_hrs || ' hours')::INTERVAL,
    total_uses = total_uses + 1
  WHERE id = phone_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and release phones from cooldown
CREATE OR REPLACE FUNCTION release_phones_from_cooldown()
RETURNS void AS $$
BEGIN
  UPDATE public.virtual_phone_numbers
  SET
    status = 'available',
    cooldown_until = NULL
  WHERE status = 'cooldown'
    AND cooldown_until <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Sample data for Bulgarian numbers (uncomment to seed)
/*
INSERT INTO public.virtual_phone_numbers (phone_number, country_code, sms_inbox_url, provider)
VALUES
  ('+359888000001', 'BG', 'https://receive-sms-online.info/359888000001', 'receive-sms-online'),
  ('+359888000002', 'BG', 'https://receive-sms-online.info/359888000002', 'receive-sms-online'),
  ('+359888000003', 'BG', 'https://receive-sms-online.info/359888000003', 'receive-sms-online')
ON CONFLICT (phone_number) DO NOTHING;
*/

-- RLS Policies
ALTER TABLE public.virtual_phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on virtual_phone_numbers"
  ON public.virtual_phone_numbers FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.virtual_phone_numbers IS 'Pool of virtual phone numbers for SMS verification';
COMMENT ON COLUMN public.virtual_phone_numbers.sms_inbox_url IS 'URL to check SMS inbox via Airtop browser automation';
COMMENT ON COLUMN public.virtual_phone_numbers.cooldown_hours IS 'Hours to wait before reusing this number';
