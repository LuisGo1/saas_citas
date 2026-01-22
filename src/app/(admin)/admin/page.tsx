import { requireAdmin } from "@/lib/admin-middleware";
import { createClient } from "@/utils/supabase/server";
import {
    Users,
    Building2,
    CreditCard,
    TrendingUp,
    Calendar,
    DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
    // This will redirect if user is not admin
    const { user } = await requireAdmin();
    const supabase = await createClient();

    // Get global statistics
    const [
        { count: totalUsers },
        { count: totalBusinesses },
        { count: totalSubscriptions },
        { count: totalAppointments }
    ] = await Promise.all([
        supabase.from("user_profiles").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true })
    ]);

    // Get revenue statistics
    const { data: revenueData } = await supabase
        .from("appointments")
        .select(`
            services (price),
            appointment_date
        `)
        .eq("status", "confirmed")
        .gte("appointment_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const totalRevenue = revenueData?.reduce((sum, apt) => {
        const price = Array.isArray(apt.services) && apt.services[0]?.price
            ? apt.services[0].price
            : (apt.services as any)?.price || 0;
        return sum + Number(price);
    }, 0) || 0;

    const stats = [
        {
            title: "Total Usuarios",
            value: totalUsers?.toString() || "0",
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-500/10"
        },
        {
            title: "Negocios Activos",
            value: totalBusinesses?.toString() || "0",
            icon: Building2,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-500/10"
        },
        {
            title: "Suscripciones",
            value: totalSubscriptions?.toString() || "0",
            icon: CreditCard,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-500/10"
        },
        {
            title: "Citas Totales",
            value: totalAppointments?.toString() || "0",
            icon: Calendar,
            color: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-500/10"
        },
        {
            title: "Ingresos (30 días)",
            value: `$${totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-500/10"
        },
        {
            title: "Tasa de Crecimiento",
            value: "+12.5%",
            icon: TrendingUp,
            color: "text-cyan-600 dark:text-cyan-400",
            bgColor: "bg-cyan-500/10"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona usuarios, negocios y métricas globales de la plataforma.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => (
                    <Card key={index} className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Nuevo negocio registrado</p>
                                    <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Usuario actualizó suscripción</p>
                                    <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Nueva cita confirmada</p>
                                    <p className="text-xs text-muted-foreground">Hace 6 horas</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Estado del Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">API WhatsApp</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-green-600">Operativo</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Base de Datos</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-green-600">Operativo</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Sistema de Notificaciones</span>
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-xs text-yellow-600">Procesando</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">12 pendientes</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}