
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const duration = parseInt(formData.get("duration") as string);
    const businessId = formData.get("businessId") as string;

    const supabase = await createClient();
    const { error } = await supabase.from("services").insert({
        business_id: businessId,
        name,
        price,
        duration_minutes: duration,
        active: true
    });

    if (error) {
        console.error(error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/services");
    return { success: true };
}

export async function deleteService(serviceId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("services").delete().eq("id", serviceId);

    if (error) return { error: error.message };
    revalidatePath("/dashboard/services");
    return { success: true };
}
