
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateBusiness } from "./actions";
import { Settings, Save, Globe, MessageSquare, Briefcase, Clock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AvailabilityManager from "@/components/settings/AvailabilityManager";
import DebugPanel from "@/components/settings/DebugPanel";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single();

    if (!business) return redirect("/onboarding");

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black tracking-tight">Configuración</h1>
                <p className="text-muted-foreground font-medium mt-1">Gestiona los detalles y la identidad de tu negocio.</p>
            </header>

            <div className="max-w-3xl glass-card rounded-[2.5rem] overflow-hidden">
                <div className="px-8 py-6 border-b border-border/40 bg-muted/30 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Settings size={20} />
                    </div>
                    <h2 className="font-black text-xl tracking-tight italic">Perfil del Negocio</h2>
                </div>

                <form action={async (formData: FormData) => {
                    "use server";
                    await updateBusiness(formData);
                }} className="p-8 space-y-8">
                    <input type="hidden" name="id" value={business.id} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> Nombre del Negocio
                            </label>
                            <input
                                name="name"
                                defaultValue={business.name}
                                required
                                className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                placeholder="Tu negocio increíble"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> WhatsApp
                            </label>
                            <input
                                name="whatsapp"
                                defaultValue={business.whatsapp_number}
                                placeholder="Ej: +50370000000"
                                className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                            />
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight italic px-1">Se usará para confirmaciones automáticas.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Enlace Público (Slug)
                        </label>
                        <div className="flex items-center group">
                            <div className="h-14 px-5 flex items-center bg-muted border border-r-0 border-border rounded-l-2xl text-muted-foreground font-bold text-sm">
                                citas.app/
                            </div>
                            <input
                                name="slug"
                                defaultValue={business.slug}
                                required
                                className="flex-1 h-14 bg-muted/50 border border-border rounded-r-2xl px-5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                                placeholder="nombre-de-tu-negocio"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Esta es la URL que compartirás con tus clientes para que reserven.</p>
                    </div>

                    <div className="pt-8 border-t border-border/40">
                        <button type="submit" className="flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
                            <Save size={20} />
                            Guardar Todos los Cambios
                        </button>
                    </div>
                </form>
            </div>

            {/* Availability Settings */}
            <div className="max-w-4xl glass-card rounded-[2.5rem] overflow-hidden">
                <div className="px-8 py-6 border-b border-border/40 bg-muted/30 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Clock size={20} />
                    </div>
                    <h2 className="font-black text-xl tracking-tight italic">Horarios de Atención</h2>
                </div>
                <div className="p-8">
                    <AvailabilityManager businessId={business.id} />
                </div>
            </div>

            <div className="max-w-3xl glass shadow-none border-dashed border-2 border-border p-8 rounded-[2.5rem] flex items-center gap-6 opacity-60">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                    <Globe className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Personalización Visual</h3>
                    <p className="text-sm text-muted-foreground">Próximamente: Cambia colores, logotipos y fuentes de tu sitio público directamente desde aquí.</p>
                </div>
            </div>

            {/* Debug Panel - Only in development */}
            {process.env.NODE_ENV === 'development' && (
                <DebugPanel />
            )}
        </div>
    );
}
