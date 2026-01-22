import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PLAN_LIMITS, SUBSCRIPTION_PLANS } from "@/lib/plans";
import { CheckCircle, XCircle } from "lucide-react";

export default async function SelectPlanPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if user already has an active subscription for any of their businesses
    const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id);

    if (businesses && businesses.length > 0) {
        const businessIds = businesses.map(b => b.id);
        const { data: subscriptions } = await supabase
            .from("subscriptions")
            .select("status")
            .in("business_id", businessIds)
            .eq("status", "active");

        if (subscriptions && subscriptions.length > 0) {
            // User already has an active subscription, redirect to dashboard
            redirect("/dashboard");
        }
    }


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
                "Notificaciones de WhatsApp básicas",
                "Estadísticas básicas",
            ],
            cta: "Elegir Plan Básico",
        },
        {
            id: SUBSCRIPTION_PLANS.PREMIUM,
            name: "Plan Premium",
            price: "$30/mes",
            description: "Para negocios que buscan expandirse y maximizar su potencial.",
            features: [
                `Hasta ${PLAN_LIMITS.premium.max_businesses} negocios`,
                "Especialistas ilimitados",
                "Citas ilimitadas",
                "Sitio público personalizable avanzado",
                "Notificaciones de WhatsApp automáticas",
                "Estadísticas avanzadas",
                "Soporte prioritario",
            ],
            cta: "Elegir Plan Premium",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white p-4">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold mb-4">Elige tu Plan</h1>
                <p className="text-xl text-indigo-200">Comienza a gestionar tus citas con el plan perfecto para ti.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                        <div>
                            <h2 className="text-3xl font-bold mb-4 text-white">{plan.name}</h2>
                            <p className="text-5xl font-extrabold text-blue-300 mb-6">{plan.price}</p>
                            <p className="text-indigo-200 mb-8">{plan.description}</p>
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center text-lg">
                                        <CheckCircle className="w-6 h-6 text-green-400 mr-3 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            // onClick={() => handleSelectPlan(plan.id)} // Lógica para Stripe Checkout
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl text-xl transition-all transform hover:scale-[1.02] shadow-lg"
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>

            <Link href="/dashboard" className="mt-10 text-indigo-200 hover:underline text-lg">
                Ya tengo un plan activo, ir al Dashboard
            </Link>
        </div>
    );
}
