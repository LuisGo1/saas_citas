import { requireAdmin } from "@/lib/admin-middleware";
import { createClient } from "@/utils/supabase/server";
import { AdminEditUserForm } from "@/components/admin/AdminEditUserForm";
import { notFound } from "next/navigation";

export default async function UserDetailsPage({
    params,
}: {
    params: Promise<{
        userId: string;
    }>;
}) {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    await requireAdmin();
    const supabase = await createClient();

    const { data: userProfile, error } = await supabase
        .from("user_profiles")
        .select(`*`)
        .eq("id", userId)
        .single();

    if (error || !userProfile) {
        console.error("Error fetching user profile details:", error);
        notFound();
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Detalles y Edición de Usuario</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona los detalles del usuario, su rol y estado de actividad.
                </p>
            </div>

            <AdminEditUserForm userProfile={userProfile} />
        </div>
    );
}