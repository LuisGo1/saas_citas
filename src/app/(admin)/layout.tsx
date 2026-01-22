import { requireAdmin } from "@/lib/admin-middleware";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This will redirect if user is not admin
    await requireAdmin();

    return (
        <div className="min-h-screen bg-background">
            <AdminSidebar />
            <div className="lg:pl-72">
                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}