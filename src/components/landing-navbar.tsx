"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function LandingNavbar() {
    const navLinks = [
        { href: "/login", label: "Login", variant: "text" },
        { href: "/login", label: "Empezar Gratis", variant: "button" },
    ];

    return (
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                CitasApp
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
                <Link href="/login" className="text-slate-300 hover:text-white transition">
                    Login
                </Link>
                <Link
                    href="/login"
                    className="bg-white text-slate-900 px-5 py-2 rounded-full font-bold hover:bg-slate-200 transition"
                >
                    Empezar Gratis
                </Link>
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="text-white p-2">
                            <Menu className="w-8 h-8" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-slate-900 border-l border-white/10 text-white w-[300px]">
                        <VisuallyHidden.Root>
                            <SheetTitle>Menú</SheetTitle>
                        </VisuallyHidden.Root>
                        <div className="flex flex-col space-y-6 mt-10">
                            <Link href="/login" className="text-xl font-medium text-slate-300 hover:text-white transition">
                                Login
                            </Link>
                            <Link
                                href="/login"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-full font-bold text-center hover:opacity-90 transition"
                            >
                                Empezar Gratis
                            </Link>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}
