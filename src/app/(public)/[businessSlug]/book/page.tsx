
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import { PublicHeader } from "@/components/PublicHeader";

interface Props {
    params: Promise<{
        businessSlug: string;
    }>;
    searchParams: Promise<{
        serviceId?: string;
    }>;
}

export default async function BookingPage(props: Props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const { businessSlug } = params;
    const { serviceId } = searchParams;

    const supabase = await createClient();

    const { data: business } = await supabase
        .from("businesses")
        .select("id, name, whatsapp_number, timezone")
        .eq("slug", businessSlug)
        .single();

    if (!business) {
        return notFound();
    }

    // Fetch Services for the wizard selector
    const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", business.id)
        .eq("active", true);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicHeader businessName={business.name} businessSlug={businessSlug} />

            <main className="flex-1 py-12 px-4 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />

                <div className="max-w-4xl mx-auto">
                    <BookingWizard
                        business={business}
                        services={services || []}
                        initialServiceId={serviceId}
                    />
                </div>
            </main>
        </div>
    );
}
