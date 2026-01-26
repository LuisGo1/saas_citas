-- Add whatsapp_settings column to businesses table to store API credentials
-- This is used for the Basic plan where users provide their own WhatsApp API keys

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS whatsapp_settings JSONB DEFAULT NULL;

-- Comment on column
COMMENT ON COLUMN public.businesses.whatsapp_settings IS 'Stores custom WhatsApp API credentials: { accessToken, phoneNumberId, businessId }';
