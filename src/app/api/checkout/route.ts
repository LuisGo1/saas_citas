import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS } from "@/lib/plans";

export async function POST(req: Request) {
    try {
        const { planId } = await req.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const origin = req.headers.get("origin");

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
        if (!details) {
            return new NextResponse("Invalid Plan", { status: 400 });
        }

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
            customer_email: user.email,
            metadata: {
                userId: user.id,
                planId: planId,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
