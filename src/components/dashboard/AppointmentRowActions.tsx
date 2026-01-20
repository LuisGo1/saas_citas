"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Check, X, Trash2, Loader2, User, ArrowRight, Eye, Calendar, Phone, Clock, DollarSign } from "lucide-react";
import { updateAppointmentStatus, updateAppointment } from "@/app/actions";
import { cn } from "@/lib/utils";
import { formatToAmPm } from "@/lib/time";

interface Staff {
    id: string;
    name: string;
}

interface AppointmentRowActionsProps {
    appointmentId: string;
    currentStatus: string;
    staff: Staff[];
    currentStaffId?: string;
    appointmentDetails?: {
        client_name: string;
        client_phone: string;
        appointment_date: string;
        appointment_time: string;
        service_name: string;
        service_price: number;
        service_duration: number;
        staff_name?: string;
    };
}

export default function AppointmentRowActions({ appointmentId, currentStatus, staff = [], currentStaffId, appointmentDetails }: AppointmentRowActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isReassigning, setIsReassigning] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
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
                            onClick={() => {
                                setShowDetails(true);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Eye size={16} className="text-blue-400" />
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

            {/* Details Modal */}
            {showDetails && appointmentDetails && (
                <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Detalles de Cita</h3>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Client Info */}
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-blue-400 mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">{appointmentDetails.client_name}</p>
                                    <p className="text-slate-400 text-sm flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {appointmentDetails.client_phone}
                                    </p>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-green-400 mt-0.5" />
                                <div>
                                    <p className="text-white font-medium">{appointmentDetails.appointment_date}</p>
                                    <p className="text-slate-400 text-sm flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {formatToAmPm(appointmentDetails.appointment_time)}
                                    </p>
                                </div>
                            </div>

                            {/* Service Info */}
                            {appointmentDetails.service_name && (
                                <div className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-purple-400 mt-0.5" />
                                    <div>
                                        <p className="text-white font-medium">{appointmentDetails.service_name}</p>
                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            {appointmentDetails.service_duration && (
                                                <span>{appointmentDetails.service_duration} min</span>
                                            )}
                                            {appointmentDetails.service_price && (
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    {appointmentDetails.service_price}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Staff Info */}
                            {appointmentDetails.staff_name && (
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-orange-400 mt-0.5" />
                                    <div>
                                        <p className="text-white font-medium">{appointmentDetails.staff_name}</p>
                                        <p className="text-slate-400 text-sm">Especialista asignado</p>
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="pt-4 border-t border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Estado:</span>
                                    <span className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight italic",
                                        currentStatus === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            currentStatus === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                'bg-muted text-muted-foreground border border-border/40'
                                    )}>
                                        {currentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50">
                            <button
                                onClick={() => setShowDetails(false)}
                                className="w-full py-2 px-4 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
