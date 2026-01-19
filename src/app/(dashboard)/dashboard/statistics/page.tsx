
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { BarChart, TrendingUp, Calendar, DollarSign } from "lucide-react";

export default async function StatisticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!business) return redirect("/onboarding");

    return (
        <div className="p-8 relative z-10">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-white">Estadísticas</h1>
                <p className="text-slate-400">Rendimiento de tu negocio.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: "Citas Totales", value: "0", icon: Calendar, color: "text-blue-400" },
                    { label: "Ingresos Totales", value: "$0.00", icon: DollarSign, color: "text-green-400" },
                    { label: "Crecimiento", value: "0%", icon: TrendingUp, color: "text-purple-400" },
                    { label: "Eficiencia", value: "0%", icon: BarChart, color: "text-pink-400" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className={`p-3 rounded-lg bg-opacity-20 mb-4 inline-block ${stat.color} bg-current`}>
                            <stat.icon size={24} />
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-500">
                Gráficos de rendimiento reservados para futuras actualizaciones.
            </div>
        </div>
    );
}
