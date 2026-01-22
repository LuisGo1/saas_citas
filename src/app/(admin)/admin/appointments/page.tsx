import { requireAdmin } from "@/lib/admin-middleware";
import { createClient } from "@/utils/supabase/server";
import { AdminAppointmentTable } from "@/components/admin/AdminAppointmentTable";

export default async function AdminAppointmentsPage() {
    await requireAdmin();
    const supabase = await createClient();

    const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
            *,
            services (name, price),
            businesses (name, slug, owner_id)
        `)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false });

    if (appointmentsError) {
        console.error("Error fetching admin appointments:", appointmentsError);
    }

    // Fetch user profiles for business owners
    const ownerIds = Array.from(new Set(appointmentsData?.map(apt => apt.businesses?.owner_id).filter(Boolean))) as string[];
    const { data: ownersData, error: ownersError } = await supabase
        .from("user_profiles")
        .select(`id, full_name, email`)
        .in("id", ownerIds);

    if (ownersError) {
        console.error("Error fetching owners for appointments:", ownersError);
    }

    const ownersById = ownersData?.reduce((acc, owner) => {
        acc[owner.id] = owner;
        return acc;
    }, {} as Record<string, typeof ownersData[0]>) || {};

    const appointments = appointmentsData?.map(apt => ({
        ...apt,
        businesses: apt.businesses ? {
            ...apt.businesses,
            owner_profile: ownersById[apt.businesses.owner_id || ""],
        } : apt.businesses,
    })) || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión Global de Citas</h1>
                <p className="text-muted-foreground mt-2">
                    Visualiza y administra todas las citas de la plataforma.
                </p>
            </div>

            <AdminAppointmentTable appointments={appointments} />
        </div>
    );
}