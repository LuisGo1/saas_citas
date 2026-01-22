"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Building2,
    CreditCard,
    BarChart3,
    Settings,
    Shield,
    LogOut,
    Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Citas", href: "/admin/appointments", icon: Calendar },
    { name: "Usuarios", href: "/admin/users", icon: Users },
    { name: "Negocios", href: "/admin/businesses", icon: Building2 },
    { name: "Suscripciones", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Configuración", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card px-6 pb-4 border-r border-border">
                <div className="flex h-16 shrink-0 items-center">
                    <Shield className="h-8 w-8 text-primary" />
                    <span className="ml-2 text-xl font-bold text-foreground">
                        Admin Panel
                    </span>
                </div>
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors",
                                                    isActive
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                                )}
                                            >
                                                <item.icon
                                                    className="h-6 w-6 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                        <li className="mt-auto">
                            <button
                                onClick={handleSignOut}
                                className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                                Cerrar Sesión
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}