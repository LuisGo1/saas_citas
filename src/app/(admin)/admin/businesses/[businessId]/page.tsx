import { requireAdmin } from "@/lib/admin-middleware";
import { createClient } from "@/utils/supabase/server";
import { AdminEditBusinessForm } from "@/components/admin/AdminEditBusinessForm";
import { notFound } from "next/navigation";

export default async function BusinessDetailsPage({
    params,
}: {
    params: Promise<{
        businessId: string;
    }>;
}) {
    const resolvedParams = await params;
    const businessId = resolvedParams.businessId;

    await requireAdmin();
    const supabase = await createClient();

    console.log("DEBUG: BusinessDetailsPage - businessId from params:", businessId); // Log the ID

    const { data: business, error } = await supabase
        .from("businesses")
        .select(`*`)
        .eq("id", businessId)
        .single();

    if (error) {
        console.error("DEBUG: Supabase error object:", error); // Log the full error object
    }
    if (!business) {
        console.error("DEBUG: Business not found for ID:", params.businessId); // Log if business is null
    }

    if (error || !business) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Detalles y Edición de Negocio</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona los detalles del negocio y su estado.
                </p>
            </div>

            <AdminEditBusinessForm business={business} />
        </div>
    );
}