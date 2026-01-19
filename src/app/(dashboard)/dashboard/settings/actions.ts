
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBusiness(formData: FormData) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const whatsapp = formData.get("whatsapp") as string;

    const supabase = await createClient();
    const { error } = await supabase
        .from("businesses")
        .update({
            name,
            slug,
            whatsapp_number: whatsapp,
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
}
