"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createStaff(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autorizado" };
    }

    // Get business
    const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!business) {
        return { error: "Negocio no encontrado" };
    }

    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const avatar_url = formData.get("avatar_url") as string;

    const { error } = await supabase.from("staff").insert({
        business_id: business.id,
        name,
        role,
        avatar_url: avatar_url || null,
        is_active: true
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/staff");
    return { success: true };
}

export async function updateStaff(id: string, data: { name?: string; role?: string; avatar_url?: string }) {
    const supabase = await createClient();
    const { error } = await supabase.from("staff").update(data).eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/staff");
    return { success: true };
}

export async function deleteStaff(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("staff").delete().eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/staff");
    return { success: true };
}

export async function toggleStaffStatus(id: string, isActive: boolean) {
    const supabase = await createClient();
    const { error } = await supabase.from("staff").update({ is_active: isActive }).eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/staff");
    return { success: true };
}
