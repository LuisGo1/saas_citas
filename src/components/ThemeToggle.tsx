"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
        );
    }

    const toggleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5 overflow-hidden">
                <div
                    className={cn(
                        "absolute inset-0 transition-transform duration-500",
                        theme === "light" ? "translate-y-0" : "translate-y-full"
                    )}
                >
                    <Sun className="w-5 h-5 text-amber-500" />
                </div>
                <div
                    className={cn(
                        "absolute inset-0 transition-transform duration-500",
                        theme === "dark" ? "translate-y-0" : "-translate-y-full"
                    )}
                >
                    <Moon className="w-5 h-5 text-indigo-400" />
                </div>
                <div
                    className={cn(
                        "absolute inset-0 transition-transform duration-500",
                        theme === "system" ? "translate-y-0" : "-translate-y-full"
                    )}
                >
                    <Monitor className="w-5 h-5 text-slate-500" />
                </div>
            </div>
        </button>
    );
}

// Helper function in case lib/utils is not available or doesn't have cn
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
