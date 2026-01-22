import { requireAdmin } from "@/lib/admin-middleware";
import { createClient } from "@/utils/supabase/server";
import { AdminAnalyticsClientWrapper } from "@/components/admin/AdminAnalyticsClientWrapper";

export default async function AdminAnalyticsPage() {
    // This will redirect if user is not admin
    await requireAdmin();
    const supabase = await createClient();

    // Get global analytics data
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // User registration trends
    const { data: userTrends } = await supabase
        .from("user_profiles")
        .select("created_at")
        .gte("created_at", lastMonth.toISOString())
        .order("created_at");

    // Business registration trends
    const { data: businessTrends } = await supabase
        .from("businesses")
        .select("created_at")
        .gte("created_at", lastMonth.toISOString())
        .order("created_at");

    // Appointment trends
    const { data: appointmentTrends } = await supabase
        .from("appointments")
        .select("created_at, status")
        .gte("created_at", lastMonth.toISOString())
        .order("created_at");

    // Revenue trends
    const { data: revenueTrends } = await supabase
        .from("appointments")
        .select(`
            created_at,
            services (price)
        `)
        .eq("status", "confirmed")
        .gte("created_at", lastMonth.toISOString())
        .order("created_at");

    // Subscription metrics
    const { data: subscriptionStats } = await supabase
        .from("subscriptions")
        .select("plan, status, created_at");

    // WhatsApp notifications stats
    const { data: notificationStats } = await supabase
        .from("notifications_log")
        .select("type, status, created_at")
        .gte("created_at", lastMonth.toISOString());

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Globales</h1>
                <p className="text-muted-foreground mt-2">
                    Métricas y estadísticas completas del SaaS.
                </p>
            </div>

            <AdminAnalyticsClientWrapper
                userTrends={userTrends || []}
                businessTrends={businessTrends || []}
                appointmentTrends={appointmentTrends || []}
                revenueTrends={revenueTrends || []}
                subscriptionStats={subscriptionStats || []}
                notificationStats={notificationStats || []}
            />
        </div>
    );
}