
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBusiness(formData: FormData) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const whatsapp = formData.get("whatsapp") as string;

    const supabase = await createClient();
    const whatsapp_settings_json = formData.get("whatsapp_settings") as string;
    let whatsapp_settings: any = null;

    if (whatsapp_settings_json) {
        try {
            whatsapp_settings = JSON.parse(whatsapp_settings_json);
        } catch (e) {
            console.error("Invalid JSON for whatsapp_settings", e);
        }
    } else {
        // Look for individual fields
        const accessToken = formData.get("whatsapp_accessToken") as string;
        const phoneNumberId = formData.get("whatsapp_phoneNumberId") as string;
        const templateName = formData.get("whatsapp_templateName") as string;

        if (accessToken || phoneNumberId || templateName) {
            whatsapp_settings = {};
            if (accessToken) whatsapp_settings.accessToken = accessToken;
            if (phoneNumberId) whatsapp_settings.phoneNumberId = phoneNumberId;
            if (templateName) whatsapp_settings.templateName = templateName;
        }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (whatsapp) updateData.whatsapp_number = whatsapp;
    if (whatsapp_settings) updateData.whatsapp_settings = whatsapp_settings;

    if (Object.keys(updateData).length === 0) {
        return { success: true };
    }

    const { error } = await supabase
        .from("businesses")
        .update(updateData)
        .eq("id", id);

    if (error) {
        console.error(error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
}
