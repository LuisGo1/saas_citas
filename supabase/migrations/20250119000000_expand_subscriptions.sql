-- Expand subscriptions table with detailed plan limits and features

-- Add new columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS max_services INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS max_staff INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_appointments_per_month INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS whatsapp_notifications BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_branding BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS analytics BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority_support BOOLEAN DEFAULT FALSE;

-- Update existing subscriptions with plan-specific limits
UPDATE public.subscriptions
SET
  max_services = CASE
    WHEN plan = 'free' THEN 3
    WHEN plan = 'pro' THEN 50
    ELSE 3
  END,
  max_staff = CASE
    WHEN plan = 'free' THEN 1
    WHEN plan = 'pro' THEN 10
    ELSE 1
  END,
  max_appointments_per_month = CASE
    WHEN plan = 'free' THEN 50
    WHEN plan = 'pro' THEN 1000
    ELSE 50
  END,
  whatsapp_notifications = CASE
    WHEN plan = 'free' THEN FALSE
    WHEN plan = 'pro' THEN TRUE
    ELSE FALSE
  END,
  custom_branding = CASE
    WHEN plan = 'free' THEN FALSE
    WHEN plan = 'pro' THEN TRUE
    ELSE FALSE
  END,
  analytics = CASE
    WHEN plan = 'free' THEN FALSE
    WHEN plan = 'pro' THEN TRUE
    ELSE FALSE
  END,
  priority_support = CASE
    WHEN plan = 'free' THEN FALSE
    WHEN plan = 'pro' THEN TRUE
    ELSE FALSE
  END;

-- Set default values for new subscriptions
ALTER TABLE public.subscriptions
ALTER COLUMN max_services SET DEFAULT 3,
ALTER COLUMN max_staff SET DEFAULT 1,
ALTER COLUMN max_appointments_per_month SET DEFAULT 50,
ALTER COLUMN whatsapp_notifications SET DEFAULT FALSE,
ALTER COLUMN custom_branding SET DEFAULT FALSE,
ALTER COLUMN analytics SET DEFAULT FALSE,
ALTER COLUMN priority_support SET DEFAULT FALSE;

-- Create a function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limits(
  p_business_id UUID,
  p_resource_type TEXT,
  p_current_count INTEGER DEFAULT 0
) RETURNS BOOLEAN AS $$
DECLARE
  subscription_record RECORD;
  limit_value INTEGER;
BEGIN
  -- Get subscription for business
  SELECT * INTO subscription_record
  FROM public.subscriptions
  WHERE business_id = p_business_id
  AND status = 'active'
  AND (valid_until IS NULL OR valid_until > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no active subscription, use free limits
  IF subscription_record IS NULL THEN
    CASE p_resource_type
      WHEN 'services' THEN RETURN p_current_count < 3;
      WHEN 'staff' THEN RETURN p_current_count < 1;
      WHEN 'appointments_month' THEN RETURN p_current_count < 50;
      ELSE RETURN TRUE;
    END CASE;
  END IF;

  -- Check specific limits
  CASE p_resource_type
    WHEN 'services' THEN RETURN p_current_count < subscription_record.max_services;
    WHEN 'staff' THEN RETURN p_current_count < subscription_record.max_staff;
    WHEN 'appointments_month' THEN RETURN p_current_count < subscription_record.max_appointments_per_month;
    ELSE RETURN TRUE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get subscription details
CREATE OR REPLACE FUNCTION get_subscription_details(p_business_id UUID)
RETURNS TABLE (
  plan TEXT,
  status TEXT,
  max_services INTEGER,
  max_staff INTEGER,
  max_appointments_per_month INTEGER,
  whatsapp_notifications BOOLEAN,
  custom_branding BOOLEAN,
  analytics BOOLEAN,
  priority_support BOOLEAN,
  valid_until TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(s.plan, 'free'::TEXT) as plan,
    COALESCE(s.status, 'active'::TEXT) as status,
    COALESCE(s.max_services, 3) as max_services,
    COALESCE(s.max_staff, 1) as max_staff,
    COALESCE(s.max_appointments_per_month, 50) as max_appointments_per_month,
    COALESCE(s.whatsapp_notifications, FALSE) as whatsapp_notifications,
    COALESCE(s.custom_branding, FALSE) as custom_branding,
    COALESCE(s.analytics, FALSE) as analytics,
    COALESCE(s.priority_support, FALSE) as priority_support,
    s.valid_until
  FROM public.subscriptions s
  WHERE s.business_id = p_business_id
  AND s.status = 'active'
  AND (s.valid_until IS NULL OR s.valid_until > NOW())
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- If no subscription found, return free plan defaults
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      'free'::TEXT,
      'active'::TEXT,
      3,
      1,
      50,
      FALSE,
      FALSE,
      FALSE,
      FALSE,
      NULL::TIMESTAMPTZ;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;