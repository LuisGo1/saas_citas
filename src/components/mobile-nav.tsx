"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, LayoutDashboard, Calendar, Plus, Users, BarChart, Settings, LogOut, Sparkles, Briefcase } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { logout } from "@/app/actions";
import { useState } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface MobileNavProps {
    business: {
        name: string;
        slug: string;
    };
}

export function MobileNav({ business }: MobileNavProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

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
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="md:hidden p-4 text-foreground">
                    <Menu className="w-8 h-8" />
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r border-border/40">
                {/* Accessibility: Title for Screen Readers */}
                <VisuallyHidden.Root>
                    <SheetTitle>Menú de Navegación</SheetTitle>
                </VisuallyHidden.Root>

                <div className="flex flex-col h-full bg-background/95 backdrop-blur-xl">
                    <div className="flex items-center gap-3 p-6 pb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">CitasApp</span>
                    </div>

                    <div className="px-6 py-4">
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

                    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
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

                    <div className="p-6 border-t border-border/40 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Tema</span>
                            <ThemeToggle />
                        </div>
                        <form action={logout}>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive font-bold hover:bg-destructive/20 transition-all">
                                <LogOut className="w-5 h-5" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </form>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
