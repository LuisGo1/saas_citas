
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar/CalendarView";

export default async function CalendarPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Fetch user's business
    const { data: business } = await supabase
        .from("businesses")
        .select("id, slug")
        .eq("owner_id", user.id)
        .single();

    if (!business) {
        return redirect("/onboarding");
    }

    // Fetch all appointments for the business
    const { data: appointments } = await supabase
        .from("appointments")
        .select(`
            id, 
            client_name, 
            client_phone, 
            appointment_date, 
            appointment_time, 
            status,
            services (name, price)
        `)
        .eq("business_id", business.id)
        .order("appointment_date", { ascending: true });

    // Transform appointments to match the expected structure if necessary
    const formattedAppointments = (appointments || []).map((apt: any) => ({
        ...apt,
        services: Array.isArray(apt.services) ? apt.services[0] : apt.services
    }));

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black tracking-tight">Calendario</h1>
                <p className="text-muted-foreground font-medium mt-1">Visualiza y gestiona el horario y las reservas de tu negocio.</p>
            </header>

            <div className="glass-card rounded-[2.5rem] overflow-hidden p-2">
                <CalendarView appointments={formattedAppointments} />
            </div>
        </div>
    );
}
