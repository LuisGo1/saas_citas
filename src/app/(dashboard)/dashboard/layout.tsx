
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard-sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Check subscription
    const { getUserSubscriptionInfo } = await import("@/lib/subscription-helpers");
    const subscriptionInfo = await getUserSubscriptionInfo(user.id);
    // Note: subscription-helpers might default to basic/false if error, so we should check if they actually have a subscription record if we want STRICT enforcement.
    // However, the helper returns default "Basic" values if it fails or finds nothing? 
    // Let's check the helper implementation again. 
    // It defaults to BASIC. This is problematic if we want to FORCE selection.
    // I should probably do a raw DB check here for STRICT enforcement, or update the helper to return "none".

    // Raw check for strict enforcement
    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

    if (!subscription) {
        return redirect("/select-plan");
    }

    const { data: businesses, error: businessesError } = await supabase
        .from("businesses")
        .select("id, name, slug")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

    if (businessesError) {
        console.error("Layout business fetch error:", businessesError);
    }

    const business = businesses && businesses.length > 0 ? businesses[0] : null;

    if (!business) {
        return redirect("/onboarding");
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar business={business} />
            <MobileNav business={business} />
            <main className="flex-1 overflow-y-auto relative scroll-smooth">
                {/* Global dashboard background element */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
                <div className="container mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
