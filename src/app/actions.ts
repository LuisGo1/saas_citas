"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/login");
}

export async function updateAppointmentStatus(id: string, status: string) {
    const supabase = await createClient();
    await supabase.from("appointments").update({ status }).eq("id", id);
    return { success: true };
}

export async function updateAppointment(id: string, data: { appointment_date: string; appointment_time: string }) {
    const supabase = await createClient();
    const { error } = await supabase.from("appointments").update(data).eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    return { success: true };
}
