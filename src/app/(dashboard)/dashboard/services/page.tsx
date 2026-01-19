
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createService, deleteService } from "./actions";
import { Plus, Trash2, Clock, DollarSign, Briefcase, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ServicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!business) return redirect("/onboarding");

    const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black tracking-tight">Servicios</h1>
                <p className="text-muted-foreground font-medium mt-1">Define y gestiona el catálogo de servicios que ofreces.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Formulario */}
                <div className="lg:col-span-4 h-fit sticky top-24">
                    <div className="glass-card rounded-[2.5rem] overflow-hidden border-primary/20 bg-primary/[0.02]">
                        <div className="px-8 py-6 border-b border-primary/10 bg-primary/5 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                <Plus size={20} />
                            </div>
                            <h2 className="font-black text-xl tracking-tight italic text-primary">Nuevo Servicio</h2>
                        </div>

                        <form action={async (formData: FormData) => {
                            "use server";
                            await createService(formData);
                        }} className="p-8 space-y-6">
                            <input type="hidden" name="businessId" value={business.id} />

                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">Nombre</label>
                                <input
                                    name="name"
                                    required
                                    className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                    placeholder="Ej: Corte de Cabello Elite"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">Precio ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full bg-background/50 border border-border rounded-2xl pl-10 pr-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                                            placeholder="15.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">Minutos</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            name="duration"
                                            type="number"
                                            required
                                            className="w-full bg-background/50 border border-border rounded-2xl pl-10 pr-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                                            placeholder="30"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] mt-4">
                                Crear Servicio
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lista */}
                <div className="lg:col-span-8 space-y-4">
                    {services && services.length > 0 ? (
                        services.map((s) => (
                            <div key={s.id} className="glass-card p-6 rounded-[2rem] flex justify-between items-center group hover:border-primary/40 hover:bg-muted/30 transition-all duration-300">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-muted border border-border/40 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                                        <Zap size={28} className="fill-primary/10" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-foreground tracking-tight italic">{s.name}</h3>
                                        <div className="flex gap-6 mt-2">
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10 text-xs font-black">
                                                <Clock size={14} />
                                                {s.duration_minutes} MINUTOS
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 text-xs font-black">
                                                <DollarSign size={14} />
                                                ${parseFloat(s.price.toString()).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <form action={async (formData: FormData) => {
                                        "use server";
                                        const id = formData.get("id") as string;
                                        await deleteService(id);
                                    }}>
                                        <input type="hidden" name="id" value={s.id} />
                                        <button type="submit" className="p-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all active:scale-90">
                                            <Trash2 size={22} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass border-dashed border-2 p-20 rounded-[3rem] text-center space-y-4">
                            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                                <Briefcase size={40} />
                            </div>
                            <h3 className="text-xl font-black text-muted-foreground">No hay servicios</h3>
                            <p className="text-muted-foreground/60 max-w-xs mx-auto font-medium">Comienza por agregar tu primer servicio en el panel de la izquierda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
