import { createClient } from "@/utils/supabase/server";
import { PLAN_LIMITS, SUBSCRIPTION_PLANS } from "./plans";

interface UserSubscriptionInfo {
    currentPlan: string;
    numBusinesses: number;
    numStaffInCurrentBusiness: number;
    canAddBusiness: boolean;
    canAddStaff: boolean;
    isPremium: boolean;
}

export async function getUserSubscriptionInfo(userId: string, businessId?: string): Promise<UserSubscriptionInfo> {
    const supabase = await createClient();

    // Get all businesses for the user
    const { data: businesses, error: businessesError } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", userId);

    if (businessesError) {
        console.error("Error fetching user businesses for subscription info:", businessesError);
        // Default to free if there's an error
        return {
            currentPlan: SUBSCRIPTION_PLANS.BASIC, // Assuming basic is the default paid plan
            numBusinesses: 0,
            numStaffInCurrentBusiness: 0,
            canAddBusiness: PLAN_LIMITS.basic.max_businesses > 0,
            canAddStaff: PLAN_LIMITS.basic.max_staff > 0,
            isPremium: false,
        };
    }

    const numBusinesses = businesses?.length || 0;

    let currentPlan = SUBSCRIPTION_PLANS.BASIC;
    let isPremium = false;

    // In the new schema, subscriptions are per user (owner), not per business.
    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

    if (subscription) {
        currentPlan = subscription.plan;
        isPremium = (currentPlan === SUBSCRIPTION_PLANS.PREMIUM);
    }

    const maxBusinesses = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS]?.max_businesses || PLAN_LIMITS.basic.max_businesses;
    const maxStaff = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS]?.max_staff || PLAN_LIMITS.basic.max_staff;

    let numStaffInCurrentBusiness = 0;
    if (businessId) {
        const { count: staffCount, error: staffError } = await supabase
            .from("staff")
            .select("id", { count: "exact", head: true })
            .eq("business_id", businessId);

        if (staffError) {
            console.error("Error fetching staff count for subscription info:", staffError);
        }
        numStaffInCurrentBusiness = staffCount || 0;
    }

    return {
        currentPlan,
        numBusinesses,
        numStaffInCurrentBusiness,
        canAddBusiness: numBusinesses < maxBusinesses,
        canAddStaff: numStaffInCurrentBusiness < maxStaff,
        isPremium: isPremium,
    };
}