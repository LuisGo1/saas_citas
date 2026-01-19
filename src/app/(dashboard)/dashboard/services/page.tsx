
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ServicesList } from "@/components/dashboard/ServicesList";

export default async function ServicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!business) return redirect("/onboarding");

    const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black tracking-tight">Servicios</h1>
                <p className="text-muted-foreground font-medium mt-1">Define y gestiona el catálogo de servicios que ofreces.</p>
            </header>

            <ServicesList services={services || []} businessId={business.id} />
        </div>
    );
}
