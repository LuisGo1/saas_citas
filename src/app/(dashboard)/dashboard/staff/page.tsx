import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { StaffList } from "@/components/dashboard/StaffList";

export default async function StaffPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!business) return redirect("/onboarding");

    const { data: staff } = await supabase
        .from("staff")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

    // Fetch subscription info to check limits
    const { getUserSubscriptionInfo } = await import("@/lib/subscription-helpers");
    const subscriptionInfo = await getUserSubscriptionInfo(user.id, business.id);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <StaffList
                staff={staff || []}
                canAddStaff={subscriptionInfo.canAddStaff}
                maxStaff={subscriptionInfo.currentPlan === 'basic' ? 3 : -1} // -1 for unlimited
            />
        </div>
    );
}
