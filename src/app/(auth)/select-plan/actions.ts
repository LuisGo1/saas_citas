"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SUBSCRIPTION_PLANS } from "@/lib/plans";

export async function selectPlan(planId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    if (planId !== SUBSCRIPTION_PLANS.BASIC && planId !== SUBSCRIPTION_PLANS.PREMIUM) {
        return { error: "Plan inválido" };
    }

    // Creating Stripe Checkout Session directly in the action
    const { stripe } = await import("@/lib/stripe");
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const origin = headersList.get("origin");

    // Simple pricing mapping
    const PLAN_DETAILS: any = {
        [SUBSCRIPTION_PLANS.BASIC]: {
            name: "Plan Básico",
            amount: 1000, // $10.00
        },
        [SUBSCRIPTION_PLANS.PREMIUM]: {
            name: "Plan Premium",
            amount: 3000, // $30.00
        }
    };

    const details = PLAN_DETAILS[planId];

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: details.name,
                            description: `Suscripción mensual al ${details.name}`,
                        },
                        unit_amount: details.amount,
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/select-plan`,
            customer_email: user.email || undefined,
            metadata: {
                userId: user.id,
                planId: planId,
            },
        });

        if (session.url) {
            redirect(session.url);
        }
    } catch (e: any) {
        console.error("Stripe Error:", e);
        return { error: "Error al iniciar el proceso de pago." };
    }
}
