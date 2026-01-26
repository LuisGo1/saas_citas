import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PLAN_LIMITS, SUBSCRIPTION_PLANS } from "@/lib/plans";
import { CheckCircle, Zap } from "lucide-react";
import { upgradePlan } from "./actions";

export default async function PlansPage(props: { searchParams: Promise<{ preselected?: string }> }) {
    const searchParams = await props.searchParams;
    const preselected = searchParams.preselected;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { getUserSubscriptionInfo } = await import("@/lib/subscription-helpers");
    const subscriptionInfo = await getUserSubscriptionInfo(user.id);
    const currentPlan = subscriptionInfo.currentPlan;

    const plans = [
        {
            id: SUBSCRIPTION_PLANS.BASIC,
            name: "Plan Básico",
            price: "$10/mes",
            description: "Ideal para pequeños negocios que están empezando.",
            features: [
                `Hasta ${PLAN_LIMITS.basic.max_businesses} negocio`,
                `Hasta ${PLAN_LIMITS.basic.max_staff} especialistas`,
                "Citas ilimitadas",
                "Sitio público personalizable",
                "Notificaciones de WhatsApp básicas (Tu API)",
                "Estadísticas básicas",
            ],
            cta: "Tu Plan Actual",
            variant: "basic"
        },
        {
            id: SUBSCRIPTION_PLANS.PREMIUM,
            name: "Plan Premium",
            price: "$30/mes",
            description: "Para negocios que buscan expandirse y maximizar su potencial.",
            features: [
                `Hasta ${PLAN_LIMITS.premium.max_businesses} negocios`,
                "Especialistas ilimitados",
                "Citas ilimitados",
                "Sitio público personalizable avanzado",
                "Notificaciones de WhatsApp automáticas (Nuestra API)",
                "Estadísticas avanzadas",
                "Soporte prioritario",
            ],
            cta: "Actualizar a Premium",
            variant: "premium"
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-black tracking-tight">Planes y Facturación</h1>
                <p className="text-muted-foreground font-medium mt-1">Elige el plan que mejor se adapte a las necesidades de tu negocio.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {plans.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    const isDowngrade = currentPlan === 'premium' && plan.id === 'basic';

                    return (
                        <div
                            key={plan.id}
                            className={`
                                relative p-8 rounded-[2.5rem] flex flex-col justify-between transition-all duration-300
                                ${plan.variant === 'premium' ? 'glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5' : 'glass border-border/50'}
                                ${isCurrent ? 'ring-4 ring-primary/20 border-primary' : ''}
                                ${preselected === plan.id && !isCurrent ? 'ring-4 ring-yellow-400/50 border-yellow-400 animate-pulse-subtle' : ''}
                            `}
                        >
                            {plan.variant === 'premium' && (
                                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg transform rotate-6 flex items-center gap-1">
                                    <Zap size={12} fill="currentColor" /> Recomendado
                                </div>
                            )}

                            <div>
                                <h2 className="text-3xl font-black mb-2">{plan.name}</h2>
                                <p className="text-4xl font-black text-primary mb-6 tracking-tight">{plan.price}</p>
                                <p className="text-muted-foreground mb-8 font-medium">{plan.description}</p>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm font-medium">
                                            <CheckCircle className={`w-5 h-5 mr-3 shrink-0 ${plan.variant === 'premium' ? 'text-green-500' : 'text-muted-foreground'}`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {isCurrent ? (
                                <button
                                    disabled
                                    className="w-full font-black py-4 rounded-2xl text-lg bg-muted text-muted-foreground cursor-default flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={20} /> Plan Actual
                                </button>
                            ) : (
                                <form action={async () => {
                                    "use server";
                                    await upgradePlan(plan.id);
                                }}>
                                    <button
                                        type="submit"
                                        disabled={isDowngrade} // Prevent downgrade in MVP if complex
                                        className={`w-full font-black py-4 rounded-2xl text-lg transition-all transform hover:scale-[1.02] shadow-xl ${plan.variant === 'premium'
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25'
                                            : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200'
                                            } ${isDowngrade ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isDowngrade ? "Contactar Soporte para Bajar" : plan.cta}
                                    </button>
                                </form>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
