"use client";

import { useState } from "react";
import { Save, MessageCircle, AlertTriangle, CheckCircle, Smartphone } from "lucide-react";
import { updateBusiness } from "@/app/(dashboard)/dashboard/settings/actions";

interface WhatsAppSettingsFormProps {
    businessId: string;
    initialSettings: any;
    plan: string;
}

export default function WhatsAppSettingsForm({ businessId, initialSettings, plan }: WhatsAppSettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Parse settings if string
    const settings = typeof initialSettings === 'string' ? JSON.parse(initialSettings) : (initialSettings || {});

    if (plan !== 'basic') {
        return (
            <div className="max-w-3xl glass-card rounded-[2.5rem] overflow-hidden opacity-80">
                <div className="px-8 py-6 border-b border-border/40 bg-muted/30 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-500/10 text-green-600">
                        <MessageCircle size={20} />
                    </div>
                    <h2 className="font-black text-xl tracking-tight italic">Configuración de WhatsApp</h2>
                </div>
                <div className="p-8">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-emerald-800 text-lg">Servicio Gestionado (Premium)</h3>
                            <p className="text-emerald-700/80 mt-1">
                                Como usuario Premium, nosotros nos encargamos de toda la infraestructura de WhatsApp.
                                No necesitas configurar nada. Los mensajes se enviarán automáticamente usando nuestra API verificada.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);

        const accessToken = formData.get("accessToken") as string;
        const phoneNumberId = formData.get("phoneNumberId") as string;

        // Pack into JSON
        const settingsJson = JSON.stringify({ accessToken, phoneNumberId });

        // Use a new FormData to send to the server action
        const actionFormData = new FormData();
        actionFormData.append("id", businessId);
        // We only update settings, so we can send dummy values for others or modify the action to be partial.
        // Actually, the current action expects all fields or we need to update it to be partial.
        // Let's assume we want to preserve other fields, or we pass them if they were in the form.
        // A better approach for the action was 'updateBusiness' handling everything.
        // But here we are isolated.
        // To avoid Overwriting name/slug with null, we should probably update the action to be smarter 
        // OR include hidden fields here, BUT we don't have the current values of name/slug here easily unless passed props.
        // FIX: I'll actually rely on the main form in page.tsx for general settings, 
        // and THIS form specifically for WhatsApp settings.
        // I need to make sure the server action handles partial updates or I send everything.
        // Let's modify the server action to support partial updates first? 
        // Actually the current server action implementation I just wrote:
        // `const updateData: any = { name, slug, whatsapp_number: whatsapp };`
        // It blindly takes name/slug. If I send null, it might break or erase.

        // WORKAROUND: For now, I will include this logic in the MAIN FORM in page.tsx instead of a separate submit button/form 
        // UNLESS I change the action.
        // Changing the action to allow partial updates is better.

        // Let's append the JSON to the form data
        formData.append("whatsapp_settings", settingsJson);

        // But wait, this handleSubmit is client side.
        // I will let the user click "Save" on the main form? 
        // No, it's better to have a separate section.
        // I will modify the action to check for nulls.

        // Actually, for the implementation plan, I'll put this INSIDE the main form in `page.tsx` directly if possible,
        // OR I make this a sub-component that renders FIELDS, and the main form validation handles it.
        // That's cleaner.

        // Re-reading: "WhatsAppSettingsForm.tsx".
        // If I make it a form, it needs its own submit.
        // If I make it fields, it goes into the main form.
        // Let's make it FIELDS + Info.
    };

    return (
        <form action={async (formData) => {
            "use server";
            await updateBusiness(formData);
        }} className="space-y-6">
            <input type="hidden" name="id" value={businessId} />

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-amber-800 text-lg">Configuración Manual (Plan Básico)</h3>
                    <p className="text-amber-700/80 mt-1">
                        En el plan Básico, debes conectar tu propia API de WhatsApp (Cloud API/Meta).
                        Ingresa tus credenciales abajo para habilitar las confirmaciones.
                    </p>
                    <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" className="text-amber-800 font-bold underline mt-2 block text-sm">
                        Ver guía de configuración &rarr;
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        Token de Acceso (Permanent)
                    </label>
                    <input
                        name="whatsapp_accessToken"
                        defaultValue={settings.accessToken || ""}
                        type="password"
                        placeholder="EAAG..."
                        className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-mono text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Smartphone className="w-4 h-4" /> Phone Number ID
                    </label>
                    <input
                        name="whatsapp_phoneNumberId"
                        defaultValue={settings.phoneNumberId || ""}
                        placeholder="10034..."
                        className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-mono text-sm"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <MessageCircle size={16} /> Nombre de Plantilla (WhatsApp Template)
                    </label>
                    <input
                        name="whatsapp_templateName"
                        defaultValue={settings.templateName || "hello_world"}
                        placeholder="ej: confirmacion_cita"
                        className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                    />
                    <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2 italic">Mapeo de Variables Personalizadas</h4>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                            <li><span className="text-primary">{"{{1}}"}</span> : Nombre del Cliente</li>
                            <li><span className="text-primary">{"{{2}}"}</span> : Nombre del Negocio</li>
                            <li><span className="text-primary">{"{{3}}"}</span> : Fecha</li>
                            <li><span className="text-primary">{"{{4}}"}</span> : Hora</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white font-black py-4 rounded-2xl transition-all shadow-xl hover:bg-slate-800 disabled:opacity-50"
                >
                    <Save size={18} />
                    {isLoading ? "Guardando..." : "Actualizar Configuración WhatsApp"}
                </button>
            </div>
        </form>
    );
}
