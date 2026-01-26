import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createBusiness } from "@/app/(auth)/onboarding/actions"; // We can likely reuse this logic OR verify if it needs adaptation

export default async function NewBusinessPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { getUserSubscriptionInfo } = await import("@/lib/subscription-helpers");
    const subscriptionInfo = await getUserSubscriptionInfo(user.id);

    if (!subscriptionInfo.canAddBusiness) {
        redirect("/dashboard/plans");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black tracking-tight">Nueva Sucursal</h1>
                <p className="text-muted-foreground font-medium mt-1">Expande tu negocio creando una nueva sede.</p>
            </header>

            <div className="glass-card p-8 rounded-[2.5rem]">
                <form action={createBusiness} className="space-y-6">
                    <div>
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre del Negocio</label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="Ej: Barbería Don Pepe - Centro"
                            className="w-full mt-2 px-5 py-4 rounded-xl border border-border bg-muted/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition font-medium"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">URL Personalizada (Slug)</label>
                        <div className="flex mt-2">
                            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-border bg-muted text-muted-foreground font-bold text-sm">
                                citas.app/
                            </span>
                            <input
                                name="slug"
                                type="text"
                                required
                                placeholder="barberia-pepe-centro"
                                className="flex-1 px-5 py-4 rounded-r-xl border border-border bg-muted/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition font-medium"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground font-bold mt-2 ml-1">Este será el link único para esta sucursal.</p>
                    </div>

                    <div>
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Teléfono WhatsApp</label>
                        <input
                            name="phone"
                            type="tel"
                            placeholder="Ej: 50370000000"
                            className="w-full mt-2 px-5 py-4 rounded-xl border border-border bg-muted/50 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition font-medium"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Crear Sucursal
                    </button>

                    <p className="text-center text-xs text-muted-foreground">
                        Al crear esta sucursal, aceptas nuestros términos y condiciones.
                    </p>
                </form>
            </div>
        </div>
    );
}
