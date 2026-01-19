
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Users, Phone, MessageSquare, History, User, Search, Filter, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ClientsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!business) return redirect("/onboarding");

    // Fetch unique clients from appointments
    const { data: clients } = await supabase
        .from("appointments")
        .select("client_name, client_phone, created_at")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

    // Deduplicate by phone
    const uniqueClients = clients ? Array.from(new Map(clients.map(c => [c.client_phone, c])).values()) : [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic">Tu Red de Clientes</h1>
                    <p className="text-muted-foreground font-medium mt-1">Gestiona y contacta a las personas que han confiado en tu negocio.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            placeholder="Buscar cliente..."
                            className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        />
                    </div>
                    <button className="p-3 bg-muted border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </header>

            <div className="glass-card rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border/20">
                            <tr>
                                <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">Cliente</th>
                                <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">Contacto</th>
                                <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">Última Actividad</th>
                                <th className="px-10 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground text-right italic">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {uniqueClients.length > 0 ? (
                                uniqueClients.map((client, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-all group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xl shadow-inner border border-indigo-500/20 group-hover:scale-110 transition-transform italic">
                                                    {client.client_name.substring(0, 1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg text-foreground leading-tight">{client.client_name}</p>
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-80 italic">Cliente VIP</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-muted text-muted-foreground border border-border/40">
                                                    <Phone size={14} />
                                                </div>
                                                <span className="font-bold text-base tracking-tighter text-muted-foreground group-hover:text-foreground transition-colors">{client.client_phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <History size={16} className="text-muted-foreground italic" />
                                                <span className="text-sm font-medium text-muted-foreground uppercase">{new Date(client.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <a
                                                    href={`https://wa.me/${client.client_phone.replace(/\+/g, '')}`}
                                                    target="_blank"
                                                    className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                                                    title="Contactar WhatsApp"
                                                >
                                                    <MessageSquare size={20} />
                                                </a>
                                                <button className="p-3 bg-muted text-muted-foreground rounded-2xl border border-border/40 hover:bg-background hover:text-foreground transition-all">
                                                    <History size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-10 py-32 text-center">
                                        <div className="max-w-xs mx-auto space-y-4 opacity-40">
                                            <User size={64} className="mx-auto text-muted-foreground mb-6" />
                                            <p className="font-black italic text-xl uppercase tracking-widest text-muted-foreground">Base de Datos Desierta</p>
                                            <p className="text-sm font-medium text-muted-foreground">Tus clientes aparecerán aquí automáticamente cuando realicen su primera reserva.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
