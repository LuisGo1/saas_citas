import { requireAdmin } from "@/lib/admin-middleware";
import { createClient } from "@/utils/supabase/server";
import { AdminBusinessTable } from "@/components/admin/AdminBusinessTable";

export default async function AdminBusinessesPage() {
    // This will redirect if user is not admin
    await requireAdmin();
    const supabase = await createClient();

    // Get all businesses with owner info and subscription details
    const { data: businessesData, error: businessesError } = await supabase
        .from("businesses")
        .select(`*
        `)
        .order("created_at", { ascending: false });

    if (businessesError) {
        console.error("Error fetching businesses:", businessesError);
        return {
            props: { businesses: [] },
        };
    }

    const businessIds = businessesData?.map(business => business.id) || [];
    const ownerIds = businessesData?.map(business => business.owner_id) || [];

    const [
        { data: userProfilesData, error: userProfilesError },
        { data: subscriptionsData, error: subscriptionsError },
        { data: appointmentsData, error: appointmentsError }
    ] = await Promise.all([
        supabase.from("user_profiles").select(`full_name, email, id`).in("id", ownerIds),
        supabase.from("subscriptions").select(`plan, status, valid_until, business_id`).in("business_id", businessIds),
        supabase.from("appointments").select(`id, status, business_id`).in("business_id", businessIds)
    ]);

    if (userProfilesError) console.error("Error fetching user profiles for businesses:", userProfilesError);
    if (subscriptionsError) console.error("Error fetching subscriptions for businesses:", subscriptionsError);
    if (appointmentsError) console.error("Error fetching appointments for businesses:", appointmentsError);

    const userProfilesById = userProfilesData?.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
    }, {} as Record<string, typeof userProfilesData[0]>) || {};

    const subscriptionsByBusiness = subscriptionsData?.reduce((acc, sub) => {
        if (!acc[sub.business_id]) {
            acc[sub.business_id] = [];
        }
        acc[sub.business_id].push(sub);
        return acc;
    }, {} as Record<string, typeof subscriptionsData>) || {};

    const appointmentsByBusiness = appointmentsData?.reduce((acc, apt) => {
        if (!acc[apt.business_id]) {
            acc[apt.business_id] = [];
        }
        acc[apt.business_id].push(apt);
        return acc;
    }, {} as Record<string, typeof appointmentsData>) || {};

    const businesses = businessesData?.map(business => ({
        ...business,
        user_profiles: userProfilesById[business.owner_id] || null,
        subscriptions: subscriptionsByBusiness[business.id] || [],
        appointments: appointmentsByBusiness[business.id] || []
    })) || [];

    console.log("Admin Businesses fetched:", businesses?.length, businesses);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Negocios</h1>
                <p className="text-muted-foreground mt-2">
                    Supervisa todos los negocios registrados en la plataforma.
                </p>
            </div>

            <AdminBusinessTable businesses={businesses || []} />
        </div>
    );
}