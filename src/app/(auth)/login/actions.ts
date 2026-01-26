
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        // Si el error es específico de credenciales, avisamos
        if (error.status === 400) {
            return redirect("/login?error=Credenciales inválidas o usuario no existe");
        }
        return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    // Verificar el rol del usuario para redirigir apropiadamente
    if (authData.user) {
        console.log("User authenticated:", authData.user.id, authData.user.email);
        const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single();

        if (profileError) {
            console.error("Error fetching user profile:", profileError);
        }

        console.log("User profile:", profile);
        console.log("User role:", profile?.role);

        // Si es admin o superadmin, redirigir al panel de admin
        if (profile && ["admin", "superadmin"].includes(profile.role)) {
            return redirect("/admin");
        }
    }

    // Para usuarios normales, redirigir al dashboard
    return redirect("/dashboard");
}

export async function signup(formData: FormData) {
    const origin = (await headers()).get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const plan = formData.get("plan") as string; // Capture plan intention

    const supabase = await createClient();

    const nextUrl = new URL("/select-plan", origin || undefined);
    if (plan) {
        nextUrl.searchParams.set("preselected", plan);
    }

    // Construct the callback URL
    // We want: /auth/callback?next=/select-plan%3Fpreselected%3Dbasic
    const callbackUrl = new URL("/auth/callback", origin || undefined);
    callbackUrl.searchParams.set("next", nextUrl.pathname + nextUrl.search);

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: callbackUrl.toString(),
        },
    });

    if (error) {
        return redirect(`/register?error=${encodeURIComponent(error.message)}`);
    }

    return redirect(`/register?success=¡Cuenta creada! Revisa tu email para confirmar y poder entrar.`);
}
