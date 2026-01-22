import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || !["admin", "superadmin"].includes(profile.role)) {
        redirect("/dashboard");
    }

    return { user, profile };
}

export async function requireSuperAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "superadmin") {
        redirect("/admin");
    }

    return { user, profile };
}

export async function isAdmin(userId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .single();

    return profile ? ["admin", "superadmin"].includes(profile.role) : false;
}