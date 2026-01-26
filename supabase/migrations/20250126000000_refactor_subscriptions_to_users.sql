-- Refactor subscriptions to be User-centric and align with 'basic'/'premium' plans

-- First, drop the old table and its dependents (if any)
-- We use CASCADE to remove the old RLS policies and functions depending on it
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Create the new subscriptions table linked to auth.users
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'premium')),
    status TEXT NOT NULL DEFAULT 'active',
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Cache limits in the subscription for easy access / grandfathering
    max_businesses INTEGER DEFAULT 1,
    max_staff_per_business INTEGER DEFAULT 3,
    whatsapp_provider TEXT DEFAULT 'own_api' CHECK (whatsapp_provider IN ('own_api', 'platform_api')),
    
    -- Constraints
    UNIQUE (user_id) -- One active subscription per user
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role or internal logic should insert/update subscriptions usually, 
-- but for the 'Select Plan' page, we might allow the user to INSERT their initial plan 
-- if they don't have one.
CREATE POLICY "Users can create own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle plan updates and limit setting
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- Set limits based on the plan
    IF NEW.plan = 'basic' THEN
        NEW.max_businesses := 1;
        NEW.max_staff_per_business := 3;
        NEW.whatsapp_provider := 'own_api';
    ELSIF NEW.plan = 'premium' THEN
        NEW.max_businesses := 10; -- or unlimited/high number
        NEW.max_staff_per_business := 100; -- High limit
        NEW.whatsapp_provider := 'platform_api';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set limits on insert/update of plan
CREATE TRIGGER set_subscription_limits
    BEFORE INSERT OR UPDATE OF plan ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_subscription();

-- Helper function to check if user can create business
CREATE OR REPLACE FUNCTION public.can_create_business(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_max_businesses INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Get max businesses from subscription
    SELECT max_businesses INTO v_max_businesses
    FROM public.subscriptions
    WHERE user_id = p_user_id AND status = 'active';

    -- Create default subscription if none (fallback to Basic logic if we want, or fail)
    -- For now, if no subscription, deny (enforcing selection)
    IF v_max_businesses IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Count existing businesses
    SELECT COUNT(*) INTO v_current_count
    FROM public.businesses
    WHERE owner_id = p_user_id;

    RETURN v_current_count < v_max_businesses;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
