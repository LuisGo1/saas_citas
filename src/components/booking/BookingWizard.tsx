"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Calendar, Clock, User, Check, ChevronRight, ChevronLeft, Phone, Briefcase } from "lucide-react";
import { formatToAmPm } from "@/lib/time";
import { getAvailableTimeSlots } from "@/lib/availability";
import { validateClientName, validatePhoneNumber, validateAppointmentDate, validateAppointmentTime, formatPhoneNumber } from "@/lib/validations";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { cn } from "@/lib/utils";
import { logUserAction, logApiCall, logError } from "@/lib/logger";

// Types
type Service = {
    id: string;
    name: string;
    duration_minutes: number;
    price: number;
    image_url?: string;
};

type Staff = {
    id: string;
    name: string;
    role: string | null;
    avatar_url?: string;
};

type Business = {
    id: string;
    name: string;
    timezone: string;
};

interface BookingWizardProps {
    business: Business;
    services: Service[];
    staff: Staff[];
    initialServiceId?: string;
}

export default function BookingWizard({ business, services, staff, initialServiceId }: BookingWizardProps) {
    const [step, setStep] = useState(initialServiceId ? 2 : 1);
    const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(initialServiceId);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [conflictError, setConflictError] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});
    const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});

    const { error, errorType, setError, clearError, handleAsyncError } = useErrorHandler();

    // Derived state
    const selectedService = services.find(s => s.id === selectedServiceId);
    const selectedStaff = staff.find(s => s.id === selectedStaffId);

    const supabase = createClient();

    // Validation helpers
    const validateField = (field: string, value: string) => {
        let result = { isValid: true, errors: [] as string[] };

        switch (field) {
            case 'clientName':
                result = validateClientName(value);
                break;
            case 'clientPhone':
                result = validatePhoneNumber(value);
                break;
            case 'date':
                result = validateAppointmentDate(value);
                break;
            case 'time':
                result = validateAppointmentTime(value);
                break;
        }

        setValidationErrors(prev => ({
            ...prev,
            [field]: result.errors
        }));

        return result.isValid;
    };

    const handleFieldBlur = (field: string, value: string) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
        validateField(field, value);
    };

    // Handlers
    const handleServiceSelect = (id: string) => {
        const service = services.find(s => s.id === id);
        logUserAction('service_selected', {
            serviceId: id,
            serviceName: service?.name,
            step: 1
        });
        setSelectedServiceId(id);
        setStep(2);
    };

    const handleStaffSelect = (id: string | null) => {
        const staffMember = id ? staff.find(s => s.id === id) : null;
        logUserAction('staff_selected', {
            staffId: id,
            staffName: staffMember?.name || 'Sin preferencia',
            step: 2
        });
        setSelectedStaffId(id);
        setStep(3);
    };

    const handleDateSelect = async (date: string) => {
        setSelectedDate(date);
        setSelectedTime("");
        setLoadingSlots(true);

        const result = await handleAsyncError(async () => {
            const serviceDuration = selectedService?.duration_minutes || 60;
            const slots = await getAvailableTimeSlots(
                business.id,
                date,
                selectedStaffId || undefined,
                serviceDuration
            );
            setAvailableSlots(slots);
            return slots;
        }, 'network');

        if (!result) {
            setAvailableSlots([]);
        }

        setLoadingSlots(false);
    };

    const handleSubmit = async () => {
        logUserAction('booking_submit_attempted', {
            serviceId: selectedServiceId,
            staffId: selectedStaffId,
            date: selectedDate,
            time: selectedTime,
            clientName,
            step: 4
        });

        // Mark all fields as touched for validation display
        setTouchedFields({
            clientName: true,
            clientPhone: true,
            date: true,
            time: true
        });

        // Validate all fields
        const nameValid = validateField('clientName', clientName);
        const phoneValid = validateField('clientPhone', clientPhone);
        const dateValid = validateField('date', selectedDate);
        const timeValid = validateField('time', selectedTime);

        if (!nameValid || !phoneValid || !dateValid || !timeValid || !selectedService || !selectedDate || !selectedTime) {
            logUserAction('booking_validation_failed', {
                errors: validationErrors
            });
            return;
        }

        setLoading(true);
        setConflictError(null);

        const startTime = Date.now();

        try {
            // 1. Conflict Detection: Check is staff is busy
            if (selectedStaffId) {
                const { data: conflicts } = await supabase
                    .from('appointments')
                    .select('id')
                    .eq('business_id', business.id)
                    .eq('staff_id', selectedStaffId)
                    .eq('appointment_date', selectedDate)
                    .eq('appointment_time', selectedTime)
                    .neq('status', 'cancelled'); // Ignore cancelled appointments

                if (conflicts && conflicts.length > 0) {
                    setConflictError(`El especialista ${selectedStaff?.name} ya tiene una cita agendada a las ${selectedTime}.`);
                    setLoading(false);
                    return;
                }
            }

            // 2. Create Appointment
            const { error } = await supabase.from('appointments').insert({
                business_id: business.id,
                service_id: selectedService.id,
                staff_id: selectedStaffId, // Can be null
                client_name: clientName,
                client_phone: clientPhone,
                appointment_date: selectedDate,
                appointment_time: selectedTime,
                status: 'pending'
            });

            if (error) throw error;

            // Format phone number for WhatsApp
            const formattedPhone = formatPhoneNumber(clientPhone);

            console.log("Attempting to send WhatsApp to:", formattedPhone);

            try {
                const { data: invokeData, error: invokeError } = await supabase.functions.invoke('send-whatsapp', {
                    body: {
                        phone: formattedPhone,
                        businessId: business.id,
                        clientName: clientName,
                        businessName: business.name,
                        date: selectedDate,
                        time: selectedTime,
                    }
                });

                if (invokeError) {
                    console.error("Supabase function invocation error:", invokeError);
                    throw invokeError;
                }

                console.log("WhatsApp notification response:", invokeData);
            } catch (notifyError: any) {
                console.error("Failed to send WhatsApp notification:", notifyError);
                // If it's a specific function error, we might want to know
                const errorMessage = notifyError.context?.error || notifyError.message || "Unknown error";
                console.error("WhatsApp error details:", errorMessage);
            }

            const duration = Date.now() - startTime;
            logApiCall('/appointments', 'INSERT', true, duration, null);
            logUserAction('booking_success', {
                duration,
                appointmentData: {
                    businessId: business.id,
                    serviceId: selectedServiceId,
                    staffId: selectedStaffId,
                    date: selectedDate,
                    time: selectedTime,
                    clientName,
                    clientPhone: formattedPhone
                }
            });
            setConfirmed(true);
        } catch (err: any) {
            const duration = Date.now() - startTime;
            console.error("Booking error:", err);
            const detail = err.context?.error || err.message || "Error desconocido";
            logApiCall('/appointments', 'INSERT', false, duration, err);
            logError("Booking submission failed", {
                error: detail,
                appointmentData: {
                    businessId: business.id,
                    serviceId: selectedServiceId,
                    staffId: selectedStaffId,
                    date: selectedDate,
                    time: selectedTime
                }
            });
            setError("Error al crear la cita: " + detail, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (confirmed) {
        return (
            <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center text-white mt-10">
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-2">¡Cita Confirmada!</h2>
                <p className="text-slate-400 mb-8">Hemos enviado los detalles a tu WhatsApp.</p>
                <button onClick={() => window.location.reload()} className="text-blue-400 hover:text-blue-300 underline font-medium">Volver al inicio</button>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 relative">

            {/* Conflict Alert Modal */}
            {conflictError && (
                <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl max-w-md text-center shadow-2xl shadow-red-900/20">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Horario No Disponible</h3>
                        <p className="text-slate-300 mb-6">{conflictError}</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setConflictError(null);
                                    setStep(3); // Go back to Date/Time selection
                                    setSelectedTime(""); // Reset time
                                }}
                                className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                Elegir otro horario
                            </button>
                            <button
                                onClick={() => {
                                    setConflictError(null);
                                    setStep(2); // Go back to Staff selection
                                    setSelectedStaffId(null);
                                }}
                                className="w-full py-3 px-4 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                Cambiar de especialista
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Error Display */}
            {error && (
                <div className="bg-slate-950 px-6 py-4 border-b border-slate-800">
                    <ErrorDisplay
                        error={error}
                        type={errorType}
                        onDismiss={clearError}
                        onRetry={errorType === 'network' ? () => handleSubmit() : undefined}
                    />
                </div>
            )}

            {/* Progress Header */}
            <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-white">{business.name}</h1>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Reserva en línea</p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>1</div>
                    <div className={`w-8 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>2</div>
                    <div className={`w-8 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>3</div>
                    <div className={`w-8 h-1 ${step >= 4 ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>4</div>
                </div>
            </div>

            <div className="p-8 min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-6">Elige un servicio</h2>
                        <div className="grid gap-4">
                            {services.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => handleServiceSelect(s.id)}
                                    className={`p-5 rounded-xl cursor-pointer transition-all border group
                                ${selectedServiceId === s.id
                                            ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/50'
                                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-6">
                                            {s.image_url && (
                                                <img
                                                    src={s.image_url}
                                                    alt={s.name}
                                                    className="w-24 h-24 rounded-2xl object-cover border border-slate-600 shadow-xl"
                                                />
                                            )}
                                            <div>
                                                <span className="font-black text-2xl text-white block italic tracking-tight">{s.name}</span>
                                                <span className={`text-sm font-bold mt-1 inline-block px-3 py-1 rounded-lg ${selectedServiceId === s.id ? 'bg-white/20 text-white' : 'bg-slate-700/50 text-slate-400'}`}>
                                                    {s.duration_minutes} MINUTOS
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className={`font-black text-3xl ${selectedServiceId === s.id ? 'text-white' : 'text-blue-400'}`}>${s.price}</span>
                                            <ChevronRight className={`${selectedServiceId === s.id ? 'text-white' : 'text-slate-600 group-hover:text-white'} w-8 h-8`} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Staff */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-6 italic tracking-tight">¿Quién te atenderá?</h2>
                        <div className="grid gap-4">
                            <div
                                onClick={() => handleStaffSelect(null)}
                                className={`p-6 rounded-[2rem] cursor-pointer transition-all border group
                            ${selectedStaffId === null
                                        ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/50'
                                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center shadow-inner">
                                            <Briefcase size={28} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <span className="font-black text-xl text-white block italic">Sin preferencia</span>
                                            <span className="text-sm font-medium text-slate-400">Cualquier especialista disponible</span>
                                        </div>
                                    </div>
                                    <ChevronRight className={`${selectedStaffId === null ? 'text-white' : 'text-slate-600 group-hover:text-white'}`} />
                                </div>
                            </div>

                            {staff.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => handleStaffSelect(s.id)}
                                    className={`p-6 rounded-[2rem] cursor-pointer transition-all border group
                                ${selectedStaffId === s.id
                                            ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/50'
                                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-6">
                                            {s.avatar_url ? (
                                                <img
                                                    src={s.avatar_url}
                                                    alt={s.name}
                                                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-600 shadow-xl"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-2xl bg-slate-700 flex items-center justify-center text-white text-3xl font-black shadow-inner">
                                                    {s.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-black text-xl text-white block italic">{s.name}</span>
                                                <span className={`text-sm font-bold mt-1 inline-block px-3 py-1 rounded-lg ${selectedStaffId === s.id ? 'bg-white/20 text-white' : 'bg-slate-700/50 text-slate-400'}`}>
                                                    {s.role || "ESPECIALISTA"}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className={`${selectedStaffId === s.id ? 'text-white' : 'text-slate-600 group-hover:text-white'} w-8 h-8`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-start pt-8 border-t border-slate-800 mt-4">
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white flex items-center gap-1 px-4 py-2">
                                <ChevronLeft size={16} /> Atrás
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-6">Fecha y Hora</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Selecciona Fecha</label>
                                <input
                                    type="date"
                                    className={cn(
                                        "w-full p-4 bg-slate-800 border rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                                        touchedFields.date && validationErrors.date?.length > 0
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-slate-700"
                                    )}
                                    onChange={(e) => handleDateSelect(e.target.value)}
                                    onBlur={(e) => handleFieldBlur('date', e.target.value)}
                                    value={selectedDate}
                                    style={{ colorScheme: 'dark' }}
                                />
                                {touchedFields.date && validationErrors.date?.length > 0 && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.date[0]}</p>
                                )}
                            </div>

                            {selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Horarios Disponibles</label>
                                    {loadingSlots ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableSlots.map(slot => (
                                                <button
                                                    key={slot.time}
                                                    onClick={() => slot.available && setSelectedTime(slot.time)}
                                                    disabled={!slot.available}
                                                    className={`py-3 px-2 rounded-lg text-sm font-medium transition-all
                                                ${selectedTime === slot.time
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                                            : slot.available
                                                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                                : 'bg-slate-900 text-slate-600 cursor-not-allowed opacity-50'}`}
                                                    title={!slot.available ? 'Horario no disponible' : undefined}
                                                >
                                                    {formatToAmPm(slot.time)}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">
                                            No hay horarios disponibles para esta fecha
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between pt-8 border-t border-slate-800 mt-4">
                            <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white flex items-center gap-1 px-4 py-2">
                                <ChevronLeft size={16} /> Atrás
                            </button>
                            <button
                                disabled={!selectedDate || !selectedTime}
                                onClick={() => setStep(4)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-6">Tus Datos</h2>

                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    onBlur={e => handleFieldBlur('clientName', e.target.value)}
                                    className={cn(
                                        "w-full pl-12 pr-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition",
                                        touchedFields.clientName && validationErrors.clientName?.length > 0
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-slate-700"
                                    )}
                                    placeholder="Nombre completo"
                                />
                                {touchedFields.clientName && validationErrors.clientName?.length > 0 && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.clientName[0]}</p>
                                )}
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 text-slate-500" size={20} />
                                <input
                                    type="tel"
                                    value={clientPhone}
                                    onChange={e => setClientPhone(e.target.value)}
                                    onBlur={e => handleFieldBlur('clientPhone', e.target.value)}
                                    className={cn(
                                        "w-full pl-12 pr-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition",
                                        touchedFields.clientPhone && validationErrors.clientPhone?.length > 0
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-slate-700"
                                    )}
                                    placeholder="Teléfono (WhatsApp)"
                                />
                                {touchedFields.clientPhone && validationErrors.clientPhone?.length > 0 && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.clientPhone[0]}</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mt-6">
                            <h3 className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-4">Resumen de Cita</h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white">{selectedService?.name}</span>
                                <span className="text-blue-400 font-bold">${selectedService?.price}</span>
                            </div>
                            {selectedStaff && (
                                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                                    <Briefcase size={14} /> Especialista: <span className="text-white font-medium">{selectedStaff.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Calendar size={14} /> {selectedDate}
                                <span className="mx-2">•</span>
                                <Clock size={14} /> {selectedTime}
                            </div>
                        </div>

                        <div className="flex justify-between pt-8">
                            <button onClick={() => setStep(3)} className="text-slate-400 hover:text-white flex items-center gap-1 px-4 py-2">
                                <ChevronLeft size={16} /> Atrás
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !clientName || !clientPhone}
                                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 disabled:opacity-50 transition transform hover:scale-105 flex items-center gap-2"
                            >
                                {loading ? 'Confirmando...' : <>Confirmar Cita <Check size={18} /></>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
