"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Check, X, Trash2, Loader2, User, ArrowRight } from "lucide-react";
import { updateAppointmentStatus, updateAppointment } from "@/app/actions";
import { cn } from "@/lib/utils";

interface Staff {
    id: string;
    name: string;
}

interface AppointmentRowActionsProps {
    appointmentId: string;
    currentStatus: string;
    staff: Staff[];
    currentStaffId?: string;
}

export default function AppointmentRowActions({ appointmentId, currentStatus, staff = [], currentStaffId }: AppointmentRowActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isReassigning, setIsReassigning] = useState(false);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsReassigning(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAction = async (newStatus: string) => {
        setLoading(true);
        try {
            await updateAppointmentStatus(appointmentId, newStatus);
            setIsOpen(false);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar el estado");
        } finally {
            setLoading(false);
        }
    };

    const handleReassign = async (staffId: string) => {
        setLoading(true);
        try {
            await updateAppointment(appointmentId, { staff_id: staffId });
            setIsOpen(false);
            setIsReassigning(false);
        } catch (error) {
            console.error("Error updating staff:", error);
            alert("Error al reasignar especialista");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <MoreVertical size={20} />}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1">
                        {currentStatus !== 'confirmed' && (
                            <button
                                onClick={() => handleAction('confirmed')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Check size={16} className="text-emerald-500" />
                                Confirmar
                            </button>
                        )}

                        {currentStatus !== 'cancelled' && (
                            <button
                                onClick={() => handleAction('cancelled')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <X size={16} className="text-red-500" />
                                Cancelar
                            </button>
                        )}

                        <button
                            onClick={(e) => { e.stopPropagation(); setIsReassigning(!isReassigning); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors justify-between group"
                        >
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-blue-400" />
                                Reasignar
                            </div>
                            <ArrowRight size={14} className={cn("text-slate-500 transition-transform", isReassigning && "rotate-90")} />
                        </button>

                        <div className="h-px bg-slate-800 my-1"></div>

                        <button
                            onClick={() => alert("Funcionalidad de detalles pendiente")}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Ver Detalles
                        </button>
                    </div>

                    {/* Reassign Submenu logic (Simplified: Show list if reassigning) */}
                    {isReassigning && (
                        <div className="border-t border-slate-800 bg-slate-950 p-1 animate-in slide-in-from-left-5">
                            <div className="px-2 py-1 text-xs font-bold text-slate-500 uppercase tracking-widest">Reasignar a:</div>
                            {staff.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleReassign(s.id)}
                                    disabled={s.id === currentStaffId}
                                    className={cn(
                                        "w-full text-left px-4 py-2 text-sm rounded-lg flex items-center justify-between transition-colors",
                                        s.id === currentStaffId ? "opacity-50 cursor-not-allowed text-slate-500" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    {s.name}
                                    {s.id === currentStaffId && <Check size={12} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
