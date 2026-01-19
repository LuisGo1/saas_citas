-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Create 'businesses' table
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    whatsapp_number TEXT,
    timezone TEXT DEFAULT 'America/El_Salvador',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create 'services' table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create 'availability' table
CREATE TABLE public.availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, day_of_week, start_time, end_time)
);

-- Create 'appointments' table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'no-show', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create 'notifications_log' table
CREATE TABLE public.notifications_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
    channel TEXT NOT NULL DEFAULT 'whatsapp',
    type TEXT NOT NULL CHECK (type IN ('confirmation', 'reminder_24h', 'reminder_2h')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMPTZ
);

-- Create 'subscriptions' table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    status TEXT NOT NULL DEFAULT 'active',
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Businesses
-- Public read access for slug (needed for booking page)
CREATE POLICY "Public read access for businesses by slug" ON public.businesses
    FOR SELECT USING (true); -- Ideally restrict columns in API, but RLS on rows is 'true' to find by slug.

-- Owner can do everything
CREATE POLICY "Owners can view own business" ON public.businesses
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create business" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Services
-- Public read access if finding by business_id (for booking page)
CREATE POLICY "Public read access for services" ON public.services
    FOR SELECT USING (true);

-- Owners can manage their services
CREATE POLICY "Owners can manage services" ON public.services
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.businesses WHERE id = services.business_id AND owner_id = auth.uid())
    );

-- Availability
-- Public read access
CREATE POLICY "Public read access for availability" ON public.availability
    FOR SELECT USING (true);

-- Owners can manage availability
CREATE POLICY "Owners can manage availability" ON public.availability
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.businesses WHERE id = availability.business_id AND owner_id = auth.uid())
    );

-- Appointments
-- Owners can view/manage their appointments
CREATE POLICY "Owners can view and manage appointments" ON public.appointments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.businesses WHERE id = appointments.business_id AND owner_id = auth.uid())
    );

-- Public can INSERT appointments (Booking flow)
-- We allow anonymous inserts, but they can't see them afterwards unless we return it immediately in the same session (not handled by RLS easily).
-- Standard allow insert for anon.
CREATE POLICY "Public can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (true);

-- Notifications Log
CREATE POLICY "Owners can view notification logs" ON public.notifications_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments a
            JOIN public.businesses b ON a.business_id = b.id
            WHERE a.id = notifications_log.appointment_id AND b.owner_id = auth.uid()
        )
    );

-- Subscriptions
CREATE POLICY "Owners can view subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.businesses WHERE id = subscriptions.business_id AND owner_id = auth.uid())
    );

-- Indexes for performance
CREATE INDEX idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX idx_businesses_slug ON public.businesses(slug);
CREATE INDEX idx_services_business_id ON public.services(business_id);
CREATE INDEX idx_availability_business_id ON public.availability(business_id);
CREATE INDEX idx_appointments_business_id ON public.appointments(business_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);
