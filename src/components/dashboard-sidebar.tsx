"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, BarChart, Settings, Plus, LayoutDashboard, Sparkles, LogOut, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { logout } from "@/app/actions";

interface SidebarProps {
    business: {
        name: string;
        slug: string;
    };
}

export function Sidebar({ business }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", label: "Vista General", icon: LayoutDashboard },
        { href: "/dashboard/calendar", label: "Calendario", icon: Calendar },
        { href: "/dashboard/services", label: "Servicios", icon: Plus },
        { href: "/dashboard/staff", label: "Equipo", icon: Briefcase },
        { href: "/dashboard/clients", label: "Clientes", icon: Users },
        { href: "/dashboard/statistics", label: "Estadísticas", icon: BarChart },
        { href: "/dashboard/settings", label: "Configuración", icon: Settings },
    ];

    return (
        <aside className="w-72 glass border-r border-border/40 p-6 flex flex-col hidden md:flex h-screen sticky top-0 z-50">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tighter">CitasApp</span>
            </div>

            <nav className="flex-1 space-y-1.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold group",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 mt-6 border-t border-border/40 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <ThemeToggle />
                    <form action={logout}>
                        <button type="submit" className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Cerrar Sesión">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border/40">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0 border border-primary/20">
                        {business.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate font-bold text-sm">{business.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground uppercase tracking-widest font-black">{business.slug}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
