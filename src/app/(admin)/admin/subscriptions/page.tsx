import { requireAdmin } from "@/lib/admin-middleware";
import { createClient } from "@/utils/supabase/server";
import { AdminSubscriptionTable } from "@/components/admin/AdminSubscriptionTable";

export default async function AdminSubscriptionsPage() {
    // This will redirect if user is not admin
    await requireAdmin();
    const supabase = await createClient();

    // Get all subscriptions with business and user info
    const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select(`
            *,
            businesses (
                id,
                name,
                slug,
                user_profiles!businesses_owner_id_fkey (
                    full_name,
                    email
                )
            )
        `)
        .order("created_at", { ascending: false });

    // Get subscription statistics
    const { data: stats } = await supabase
        .from("subscriptions")
        .select("plan, status");

    const planStats = stats?.reduce((acc, sub) => {
        const key = `${sub.plan}_${sub.status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Suscripciones</h1>
                <p className="text-muted-foreground mt-2">
                    Administra las suscripciones y planes de todos los negocios.
                </p>
            </div>

            {/* Subscription Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Planes Free</p>
                            <p className="text-2xl font-bold">{planStats.free_active || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/10">
                            <span className="text-2xl">🆓</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Planes Pro</p>
                            <p className="text-2xl font-bold">{planStats.pro_active || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-500/10">
                            <span className="text-2xl">⭐</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Suscripciones Activas</p>
                            <p className="text-2xl font-bold">
                                {(planStats.free_active || 0) + (planStats.pro_active || 0)}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-500/10">
                            <span className="text-2xl">✅</span>
                        </div>
                    </div>
                </div>
            </div>

            <AdminSubscriptionTable subscriptions={subscriptions || []} />
        </div>
    );
}