import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// We use the service role key for webhook updates to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        if (!session?.metadata?.userId) {
            return new NextResponse("User id is required", { status: 400 });
        }

        // Update or Insert subscription in Supabase
        const { error } = await supabaseAdmin
            .from("subscriptions")
            .upsert({
                user_id: session.metadata.userId,
                plan: session.metadata.planId,
                status: "active",
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer as string,
                // Optional: whatsapp_provider: session.metadata.planId === 'premium' ? 'platform_api' : 'own_api'
            }, { onConflict: 'user_id' });

        if (error) {
            console.error("Error updating subscription via webhook:", error);
            return new NextResponse("Database Error", { status: 500 });
        }
    }

    if (event.type === "customer.subscription.deleted") {
        const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", session.id);

        if (error) console.error("Error canceling subscription:", error);
    }

    return new NextResponse(null, { status: 200 });
}
