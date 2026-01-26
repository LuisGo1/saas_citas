
import { createBusiness } from "./actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Enforce Plan Selection
    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

    if (!subscription) {
        redirect("/select-plan");
    }

    const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id);

    if (businesses && businesses.length > 0) {
        // User already has a business, redirect to dashboard
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                <h1 className="text-3xl font-bold mb-2 text-slate-800 text-center">Bienvenido</h1>
                <p className="text-slate-500 text-center mb-4">Configura tu negocio para empezar</p>

                {searchParams.error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-lg text-center font-medium">
                        {searchParams.error}
                    </div>
                )}

                <form action={createBusiness} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Negocio</label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="Ej: Barbería Don Pepe"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">URL Personalizada (Slug)</label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                                citas.com/
                            </span>
                            <input
                                name="slug"
                                type="text"
                                required
                                placeholder="barberia-pepe"
                                className="flex-1 px-4 py-2 rounded-r-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Este será el link que compartirás con tus clientes.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono WhatsApp</label>
                        <input
                            name="phone"
                            type="tel"
                            placeholder="Ej: 50370000000"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        Crear Negocio
                    </button>
                </form>
            </div>
        </div>
    );
}
