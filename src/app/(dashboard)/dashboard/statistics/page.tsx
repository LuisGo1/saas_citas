
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { BarChart, TrendingUp, Calendar, DollarSign, Users, Clock, Star } from "lucide-react";
import AdvancedStatistics from "@/components/statistics/AdvancedStatistics";

export default async function StatisticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: business } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("owner_id", user.id)
        .single();

    if (!business) return redirect("/onboarding");

    // Get basic statistics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get appointments this month
    const { data: appointmentsThisMonth, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
            id,
            status,
            appointment_date,
            client_phone,
            services (price)
        `)
        .eq('business_id', business.id)
        .gte('appointment_date', startOfMonth.toISOString().split('T')[0]);

    if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
    }

    // Get appointments last month for comparison
    const { data: appointmentsLastMonth, error: lastMonthError } = await supabase
        .from('appointments')
        .select('id')
        .eq('business_id', business.id)
        .gte('appointment_date', startOfLastMonth.toISOString().split('T')[0])
        .lte('appointment_date', endOfLastMonth.toISOString().split('T')[0]);

    if (lastMonthError) {
        console.error('Error fetching last month appointments:', lastMonthError);
    }

    // Calculate statistics
    const totalAppointments = appointmentsThisMonth?.length || 0;
    const confirmedAppointments = appointmentsThisMonth?.filter(apt => apt.status === 'confirmed') || [];
    const totalRevenue = confirmedAppointments.reduce((sum, apt) => {
        const price = Array.isArray(apt.services) && apt.services[0]?.price
            ? apt.services[0].price
            : (apt.services as any)?.price || 0;
        return sum + Number(price);
    }, 0);

    const lastMonthAppointments = appointmentsLastMonth?.length || 0;
    const growth = lastMonthAppointments > 0
        ? ((totalAppointments - lastMonthAppointments) / lastMonthAppointments * 100)
        : (totalAppointments > 0 ? 100 : 0); // 100% growth if went from 0 to some

    // Get unique clients this month
    const uniqueClients = new Set(
        appointmentsThisMonth?.map(apt => apt.client_phone) || []
    ).size;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black tracking-tight">Estadísticas Avanzadas</h1>
                <p className="text-muted-foreground font-medium mt-1">
                    Métricas detalladas del rendimiento de <span className="text-foreground font-bold italic">"{business.name}"</span>.
                </p>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: "Citas este mes",
                        value: totalAppointments.toString(),
                        icon: Calendar,
                        color: "text-blue-600 dark:text-blue-400",
                        change: growth,
                        changeLabel: "vs mes anterior"
                    },
                    {
                        label: "Ingresos este mes",
                        value: `$${totalRevenue.toFixed(2)}`,
                        icon: DollarSign,
                        color: "text-emerald-600 dark:text-emerald-400",
                        change: null,
                        changeLabel: ""
                    },
                    {
                        label: "Clientes únicos",
                        value: uniqueClients.toString(),
                        icon: Users,
                        color: "text-purple-600 dark:text-purple-400",
                        change: null,
                        changeLabel: ""
                    },
                    {
                        label: "Tasa de confirmación",
                        value: totalAppointments > 0
                            ? `${((confirmedAppointments.length / totalAppointments) * 100).toFixed(1)}%`
                            : "0%",
                        icon: Star,
                        color: "text-amber-600 dark:text-amber-400",
                        change: null,
                        changeLabel: ""
                    },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
                        <div className="absolute -bottom-6 -right-6 p-6 opacity-[0.05] group-hover:scale-110 transition-transform rotate-12">
                            <stat.icon size={100} className={stat.color.replace('text-', '')} />
                        </div>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-gradient-to-br from-current/15 to-current/5 border border-current/20 backdrop-blur-sm`}>
                                <stat.icon size={28} className={stat.color} />
                            </div>
                            {stat.change !== null && (
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                                    stat.change >= 0
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                    <TrendingUp size={12} className={stat.change >= 0 ? '' : 'rotate-180'} />
                                    {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(1)}%
                                </div>
                            )}
                        </div>
                        <h3 className="text-muted-foreground text-sm font-black uppercase tracking-widest relative z-10">{stat.label}</h3>
                        <p className="text-5xl font-black mt-2 tracking-tighter relative z-10">{stat.value}</p>
                        {stat.changeLabel && (
                            <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.changeLabel}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Advanced Statistics Component */}
            <AdvancedStatistics businessId={business.id} />
        </div>
    );
}
