import { requireAdmin } from "@/lib/admin-middleware";
import { createClient } from "@/utils/supabase/server";
import { AdminUserTable } from "@/components/admin/AdminUserTable";

export default async function AdminUsersPage() {
    // This will redirect if user is not admin
    await requireAdmin();
    const supabase = await createClient();

    // Get all users with their profiles and business info
    const { data: userProfiles, error: userProfilesError } = await supabase
        .from("user_profiles")
        .select(`*
        `)
        .order("created_at", { ascending: false });

    if (userProfilesError) {
        console.error("Error fetching user profiles:", userProfilesError);
        return {
            props: { users: [] },
        };
    }

    const userIds = userProfiles?.map(profile => profile.id) || [];

    const { data: businessesData, error: businessesError } = await supabase
        .from("businesses")
        .select(`
            id,
            name,
            slug,
            created_at,
            owner_id
        `)
        .in("owner_id", userIds);

    if (businessesError) {
        console.error("Error fetching businesses for users:", businessesError);
        return {
            props: { users: [] },
        };
    }

    const businessesByUser = businessesData?.reduce((acc, business) => {
        if (!acc[business.owner_id]) {
            acc[business.owner_id] = [];
        }
        acc[business.owner_id].push(business);
        return acc;
    }, {} as Record<string, typeof businessesData>) || {};

    const users = userProfiles?.map(profile => ({
        ...profile,
        businesses: businessesByUser[profile.id] || []
    })) || [];

    console.log("Admin Users fetched:", users?.length, users);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                <p className="text-muted-foreground mt-2">
                    Administra todos los usuarios de la plataforma, sus roles y permisos.
                </p>
            </div>

            <AdminUserTable users={users || []} />
        </div>
    );
}