import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Plus, ExternalLink, Settings } from "lucide-react";

export default async function BusinessesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: businesses } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

    const { getUserSubscriptionInfo } = await import("@/lib/subscription-helpers");
    const subscriptionInfo = await getUserSubscriptionInfo(user.id);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic">Mis Negocios</h1>
                    <p className="text-muted-foreground font-medium mt-1">Gestiona tus sucursales y puntos de venta.</p>
                </div>

                {subscriptionInfo.canAddBusiness ? (
                    <Link
                        href="/dashboard/businesses/new"
                        className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        <span>Nueva Sucursal</span>
                    </Link>
                ) : (
                    <div className="flex flex-col items-end">
                        <Link
                            href="/dashboard/plans"
                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Plus size={20} className="opacity-50" />
                            <span>Límite Alcanzado ({subscriptionInfo.numBusinesses})</span>
                        </Link>
                        <p className="text-xs text-muted-foreground font-bold mt-2 group-hover:text-primary transition-colors">
                            <Link href="/dashboard/plans" className="hover:underline">Actualiza a Premium &rarr;</Link>
                        </p>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses && businesses.map((business) => (
                    <div key={business.id} className="glass-card p-8 rounded-[2rem] relative group border border-border/50 hover:border-primary/30 transition-colors flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                                    <Briefcase size={28} />
                                </div>
                                <Link
                                    href={`/dashboard/settings`} // In MVP settings handles "current" business context found by ID. Future: /dashboard/settings/[id]
                                    className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    <Settings size={20} />
                                </Link>
                            </div>

                            <h3 className="text-2xl font-black tracking-tight mb-2">{business.name}</h3>
                            <p className="text-sm font-bold text-muted-foreground bg-muted/50 inline-block px-3 py-1 rounded-lg border border-border/50">
                                /{business.slug}
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/40 flex gap-3">
                            <a
                                href={`/${business.slug}`}
                                target="_blank"
                                className="flex-1 py-3 bg-muted text-muted-foreground font-bold rounded-xl hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <ExternalLink size={16} /> Ver Sitio
                            </a>
                            {/* Future: "Manage" button that switches active business context */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
