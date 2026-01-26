
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getUserSubscriptionInfo } from "@/lib/subscription-helpers";

export async function createBusiness(formData: FormData) {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const phone = formData.get("phone") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Check subscription limits before creating a business
    const subscriptionInfo = await getUserSubscriptionInfo(user.id);
    if (!subscriptionInfo.canAddBusiness) {
        return redirect("/onboarding?error=Has alcanzado el límite de negocios para tu plan actual. Actualiza a Premium para añadir más.");
    }

    const { error } = await supabase.from("businesses").insert({
        owner_id: user.id,
        name,
        slug,
        whatsapp_number: phone,
        timezone: "America/El_Salvador" // Default for MVP
    });

    if (error) {
        console.error(error);
        return redirect("/onboarding?error=Could not create business. Slug might be taken.");
    }

    return redirect("/dashboard");
}
