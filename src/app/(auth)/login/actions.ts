
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
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

    return redirect("/dashboard");
}

export async function signup(formData: FormData) {
    const origin = (await headers()).get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return redirect(`/register?error=${encodeURIComponent(error.message)}`);
    }

    return redirect("/register?success=¡Cuenta creada! Revisa tu email para confirmar y poder entrar.");
}
