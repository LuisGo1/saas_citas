
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Phone, ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";

interface Props {
    params: Promise<{
        businessSlug: string;
    }>
}

export default async function BusinessBookingPage(props: Props) {
    const supabase = await createClient();
    const businessSlug = (await props.params).businessSlug;

    const { data: business, error } = await supabase
        .from("businesses")
        .select("id, name, whatsapp_number, timezone, owner_id")
        .eq("slug", businessSlug)
        .single();

    if (error || !business) {
        return notFound();
    }

    // Check for other branches (businesses with same owner)
    const { data: branches } = await supabase
        .from("businesses")
        .select("name, slug")
        .eq("owner_id", business.owner_id);

    const hasMultipleBranches = branches && branches.length > 1;

    // Fetch services for the current business
    const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", business.id)
        .order("name", { ascending: true });

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicHeader businessName={business.name} businessSlug={businessSlug} />

            {/* Branch Selector Banner */}
            {hasMultipleBranches && (
                <div className="bg-primary/5 border-b border-primary/10">
                    <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Esta empresa tiene múltiples sedes. Estás viendo: <strong>{business.name}</strong></span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {branches.filter(b => b.slug !== businessSlug).map(branch => (
                                <Link
                                    key={branch.slug}
                                    href={`/${branch.slug}`}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-background border border-border/50 hover:border-primary hover:text-primary transition-all shadow-sm"
                                >
                                    Ir a {branch.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative w-full pt-12 pb-32 px-4 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/40 rounded-full blur-[120px] animate-blob" />
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Zap className="w-3 h-3" />
                        RESERVAS INSTANTÁNEAS
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {business.name}
                    </h1>

                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Experimenta el mejor servicio con una reserva rápida y sencilla. Elige tu tratamiento preferido a continuación.
                    </p>

                    <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            Seguro y Verificado
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-400" />
                            Calidad Premium
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <main className="max-w-5xl w-full mx-auto px-4 -mt-16 relative z-20 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services && services.length > 0 ? (
                        services.map((service, idx) => (
                            <Link
                                key={service.id}
                                href={`/${businessSlug}/book?serviceId=${service.id}`}
                                className="group glass-card overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 active:scale-[0.98] border border-border/50"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex flex-col h-full">
                                    {/* Service Image/Header */}
                                    <div className="relative h-64 overflow-hidden bg-muted">
                                        {service.image_url ? (
                                            <img
                                                src={service.image_url}
                                                alt={service.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-primary/20">
                                                <Zap size={80} className="fill-primary/5" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 px-4 py-2 rounded-2xl bg-background/90 backdrop-blur-md border border-border/50 shadow-xl">
                                            <span className="text-2xl font-black text-primary">${service.price}</span>
                                        </div>
                                    </div>

                                    {/* Service Info */}
                                    <div className="p-8 flex-1 flex flex-col justify-between bg-card">
                                        <div>
                                            <h3 className="text-3xl font-black mb-3 group-hover:text-primary transition-colors tracking-tight italic">
                                                {service.name}
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <span className="inline-flex items-center gap-2 text-muted-foreground font-bold text-sm bg-muted/50 px-4 py-2 rounded-xl border border-border/50">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    {service.duration_minutes} MINUTOS
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between">
                                            <span className="text-sm font-black tracking-widest uppercase flex items-center gap-2 text-primary">
                                                RESERVAR AHORA <ArrowRight className="w-4 h-4" />
                                            </span>
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-lg shadow-primary/10">
                                                <ArrowRight className="w-7 h-7" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-32 glass-card rounded-3xl border-dashed">
                            <p className="text-muted-foreground text-xl">No hay servicios disponibles en este momento.</p>
                        </div>
                    )}
                </div>
            </main>

            <footer className="mt-auto py-12 border-t border-border/40 bg-muted/50">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-muted-foreground text-sm font-medium">
                        &copy; 2024 {business.name}. Impulsado por <span className="text-foreground font-bold italic tracking-tighter uppercase">Antigravity Appointments</span>
                    </p>
                    <div className="flex items-center gap-6 text-muted-foreground">
                        {business.whatsapp_number && (
                            <a href={`https://wa.me/${business.whatsapp_number}`} className="hover:text-primary transition-colors flex items-center gap-2">
                                <Phone className="w-4 h-4" /> Contacto
                            </a>
                        )}
                        <span className="flex items-center gap-2 italic">
                            <Clock className="w-4 h-4" /> TZ: {business.timezone}
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
