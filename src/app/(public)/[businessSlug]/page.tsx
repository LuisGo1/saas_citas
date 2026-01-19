
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
    const params = await props.params;
    const { businessSlug } = params;

    const supabase = await createClient();

    const { data: business, error } = await supabase
        .from("businesses")
        .select("id, name, whatsapp_number, timezone")
        .eq("slug", businessSlug)
        .single();

    if (error || !business) {
        return notFound();
    }

    const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", business.id)
        .eq("active", true)
        .order("price", { ascending: true });

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicHeader businessName={business.name} businessSlug={businessSlug} />

            {/* Hero Section */}
            <section className="relative w-full pt-20 pb-32 px-4 overflow-hidden">
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
                                className="group glass-card p-1 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/10 active:scale-[0.98]"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="bg-card rounded-[1.9rem] p-8 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{service.name}</h3>
                                            <span className="text-3xl font-black text-primary">${service.price}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm bg-muted px-3 py-1 rounded-full">
                                                <Clock className="w-4 h-4" />
                                                {service.duration_minutes} min
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between">
                                        <span className="text-sm font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-primary">
                                            Reservar Ahora <ArrowRight className="w-4 h-4" />
                                        </span>
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <ArrowRight className="w-6 h-6" />
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
