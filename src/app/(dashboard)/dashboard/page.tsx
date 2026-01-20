
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, BarChart, Clock, ExternalLink, TrendingUp, Calendar as CalendarIcon, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatToAmPm } from "@/lib/time";
import AppointmentRowActions from "@/components/dashboard/AppointmentRowActions";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Fetch user's business
    const { data: business } = await supabase
        .from("businesses")
        .select("id, name, slug")
        .eq("owner_id", user.id)
        .single();

    if (!business) {
        return redirect("/onboarding");
    }

    // Fetch active staff
    const { data: staff } = await supabase
        .from("staff")
        .select("id, name")
        .eq("business_id", business.id)
        .eq("is_active", true);

    // Fetch appointments
    const { data: appointments } = await supabase
        .from("appointments")
        .select(`
            id,
            client_name,
            client_phone,
            appointment_date,
            appointment_time,
            status,
            staff_id,
            services (name, price, duration_minutes),
            staff (name)
        `)
        .eq("business_id", business.id)
        .order("appointment_date", { ascending: true })
        .limit(10);

    // Calculate income from confirmed appointments
    const confirmedAppointments = appointments?.filter(apt => apt.status === 'confirmed') || [];
    const totalIncome = confirmedAppointments.reduce((sum, apt) => {
        const servicePrice = Array.isArray(apt.services) && apt.services[0]?.price
            ? apt.services[0].price
            : (apt.services as any)?.price || 0;
        return sum + Number(servicePrice);
    }, 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Hola, {user.email?.split('@')[0] || 'Dueño'}</h1>
                    <p className="text-muted-foreground font-medium mt-1">Aquí tienes un resumen de tu negocio <span className="text-foreground font-bold italic">"{business.name}"</span>.</p>
                </div>
                <Link
                    href={`/${business.slug}`}
                    target="_blank"
                    className="group px-6 py-3 glass border border-border/40 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-muted transition-all active:scale-95 shadow-lg shadow-black/5"
                >
                    <span>Ver Sitio Público</span>
                    <ExternalLink className="w-4 h-4 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Card 1 */}
                <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 p-6 opacity-[0.05] group-hover:scale-110 transition-transform rotate-12">
                        <Clock size={100} className="text-primary" />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Clock size={28} />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-black z-10 glass">
                            <TrendingUp size={12} />
                            +12%
                        </div>
                    </div>
                    <h3 className="text-muted-foreground text-sm font-black uppercase tracking-widest relative z-10">Citas Hoy</h3>
                    <p className="text-5xl font-black mt-2 tracking-tighter relative z-10">{appointments?.length || 0}</p>
                </div>

                {/* Stats Card 2 */}
                <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 p-6 opacity-[0.05] group-hover:scale-110 transition-transform rotate-12">
                        <BarChart size={100} className="text-indigo-500" />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            <BarChart size={28} />
                        </div>
                    </div>
                    <h3 className="text-muted-foreground text-sm font-black uppercase tracking-widest relative z-10">Ingresos (Est.)</h3>
                    <p className="text-5xl font-black mt-2 tracking-tighter relative z-10">${totalIncome.toFixed(2)}</p>
                </div>

                {/* Stats Card 3 */}
                <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 p-6 opacity-[0.05] group-hover:scale-110 transition-transform rotate-12">
                        <Users size={100} className="text-emerald-500" />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Users size={28} />
                        </div>
                    </div>
                    <h3 className="text-muted-foreground text-sm font-black uppercase tracking-widest relative z-10">Clientes Nuevos</h3>
                    <p className="text-5xl font-black mt-2 tracking-tighter relative z-10">0</p>
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] overflow-hidden">
                <div className="px-8 py-6 border-b border-border/40 flex justify-between items-center bg-muted/30">
                    <h2 className="font-black text-xl tracking-tight">Últimas Citas</h2>
                    <Link href="/dashboard/calendar" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                        Ver todas <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border/20">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Cliente</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Servicio</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Especialista</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Fecha / Hora</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {appointments && appointments.length > 0 ? (
                                appointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-8 py-5 text-foreground">
                                            <p className="font-bold text-base">{apt.client_name}</p>
                                            <p className="text-xs text-muted-foreground font-medium">{apt.client_phone}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            {/* Accessing the first service since it's a 1:1 relation in this context */}
                                            {Array.isArray(apt.services) ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold border border-border/40">
                                                    {apt.services[0]?.name}
                                                </span>
                                            ) : apt.services ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold border border-border/40">
                                                    {(apt.services as any).name}
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {(apt.staff as any)?.name || "Sin asignar"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-muted border border-border/40 group-hover:bg-background transition-colors">
                                                    <CalendarIcon size={14} className="text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{apt.appointment_date}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black">{formatToAmPm(apt.appointment_time)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight italic",
                                                apt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    apt.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        'bg-muted text-muted-foreground border border-border/40'
                                            )}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-medium">
                                            <AppointmentRowActions
                                                appointmentId={apt.id}
                                                currentStatus={apt.status}
                                                staff={staff || []}
                                                currentStaffId={apt.staff_id}
                                                appointmentDetails={{
                                                    client_name: apt.client_name,
                                                    client_phone: apt.client_phone,
                                                    appointment_date: apt.appointment_date,
                                                    appointment_time: apt.appointment_time,
                                                    service_name: Array.isArray(apt.services) ? apt.services[0]?.name : (apt.services as any)?.name,
                                                    service_price: Array.isArray(apt.services) ? apt.services[0]?.price : (apt.services as any)?.price,
                                                    service_duration: Array.isArray(apt.services) ? apt.services[0]?.duration_minutes : (apt.services as any)?.duration_minutes,
                                                    staff_name: (apt.staff as any)?.name
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <p className="text-muted-foreground font-bold italic text-lg opacity-50">No hay citas registradas aún.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
