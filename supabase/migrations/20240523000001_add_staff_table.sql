-- Create 'staff' table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add 'staff_id' to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;

-- Enable RLS on staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Staff

-- Public read access (for booking page)
CREATE POLICY "Public read access for staff" ON public.staff
    FOR SELECT USING (true);

-- Owners can manage their staff
CREATE POLICY "Owners can manage staff" ON public.staff
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.businesses WHERE id = staff.business_id AND owner_id = auth.uid())
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_staff_business_id ON public.staff(business_id);
