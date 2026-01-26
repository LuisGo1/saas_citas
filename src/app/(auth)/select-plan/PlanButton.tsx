"use client";

import { useTransition } from "react";
import { selectPlan } from "./actions";
import { Loader2 } from "lucide-react";

interface PlanButtonProps {
    planId: string;
    cta: string;
    variant: "basic" | "premium";
}

export function PlanButton({ planId, cta, variant }: PlanButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            const result = await selectPlan(planId);
            if (result && result.error) {
                alert(result.error); // Basic error handling for now
            }
        });
    };

    const baseClasses = "w-full font-bold py-4 rounded-xl text-xl transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center";
    const variantClasses = variant === 'premium'
        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white'
        : 'bg-blue-500 hover:bg-blue-600 text-white';

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`${baseClasses} ${variantClasses} ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Procesando...
                </>
            ) : (
                cta
            )}
        </button>
    );
}
