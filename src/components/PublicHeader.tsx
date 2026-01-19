"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Clock, Calendar } from "lucide-react";

interface PublicHeaderProps {
    businessName: string;
    businessSlug: string;
}

export function PublicHeader({ businessName, businessSlug }: PublicHeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link
                    href={`/${businessSlug}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
                        {businessName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden sm:block">{businessName}</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        href={`/${businessSlug}/book`}
                        className="hidden xs:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Calendar className="w-4 h-4" />
                        Reservar
                    </Link>
                    <div className="h-4 w-px bg-border/60 mx-1 hidden xs:block" />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
