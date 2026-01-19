
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard-sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: business } = await supabase
        .from("businesses")
        .select("id, name, slug")
        .eq("owner_id", user.id)
        .single();

    if (!business) {
        return redirect("/onboarding");
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar business={business} />
            <MobileNav business={business} />
            <main className="flex-1 overflow-y-auto relative scroll-smooth">
                {/* Global dashboard background element */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
                <div className="container mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
