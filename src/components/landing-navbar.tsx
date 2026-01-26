"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { logout } from "@/app/actions";

interface LandingNavbarProps {
    user?: any;
}

export function LandingNavbar({ user }: LandingNavbarProps) {
    const navLinks = [
        { href: "/login", label: "Login", variant: "text" },
        { href: "/register", label: "Empezar Gratis", variant: "button" },
    ];

    return (
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                CitasApp
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
                {!user ? (
                    <>
                        <Link href="/login" className="text-slate-300 hover:text-white font-medium transition">
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold hover:bg-slate-200 transition shadow-lg shadow-white/10"
                        >
                            Empezar Gratis
                        </Link>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <form action={logout}>
                            <button type="submit" className="text-slate-400 hover:text-white font-medium transition text-sm">
                                Cerrar Sesión
                            </button>
                        </form>
                        <Link
                            href="/dashboard"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition shadow-lg shadow-purple-500/20"
                        >
                            Ir al Dashboard
                        </Link>
                    </div>
                )}
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="text-white p-2 hover:bg-white/5 rounded-lg transition">
                            <Menu className="w-8 h-8" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-slate-950 border-l border-white/10 text-white w-[300px]">
                        <VisuallyHidden.Root>
                            <SheetTitle>Menú</SheetTitle>
                        </VisuallyHidden.Root>
                        <div className="flex flex-col space-y-6 mt-12">
                            {!user ? (
                                <>
                                    <Link href="/login" className="text-2xl font-bold text-slate-300 hover:text-white transition">
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-white text-slate-950 px-5 py-4 rounded-2xl font-black text-center hover:bg-slate-100 transition shadow-xl"
                                    >
                                        Empezar Gratis
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-4 rounded-2xl font-black text-center hover:opacity-90 transition shadow-xl shadow-purple-500/20"
                                    >
                                        Ir al Dashboard
                                    </Link>
                                    <form action={logout}>
                                        <button type="submit" className="w-full text-slate-400 hover:text-white font-bold text-lg transition">
                                            Cerrar Sesión
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}
