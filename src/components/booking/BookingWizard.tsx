
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Calendar, Clock, User, Check, ChevronRight, ChevronLeft, Phone } from "lucide-react";

// Types
type Service = {
    id: string;
    name: string;
    duration_minutes: number;
    price: number;
};

type Business = {
    id: string;
    name: string;
    timezone: string;
};

interface BookingWizardProps {
    business: Business;
    services: Service[];
    initialServiceId?: string;
}

export default function BookingWizard({ business, services, initialServiceId }: BookingWizardProps) {
    const [step, setStep] = useState(1);
    const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(initialServiceId);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    // Derived state
    const selectedService = services.find(s => s.id === selectedServiceId);

    const supabase = createClient();

    // Handlers
    const handleServiceSelect = (id: string) => {
        setSelectedServiceId(id);
        setStep(2);
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        // TODO: Fetch available slots for this date
    };

    const handleSubmit = async () => {
        if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) return;

        setLoading(true);

        try {
            const { error } = await supabase.from('appointments').insert({
                business_id: business.id,
                service_id: selectedService.id,
                client_name: clientName,
                client_phone: clientPhone,
                appointment_date: selectedDate,
                appointment_time: selectedTime,
                status: 'pending'
            });

            if (error) throw error;

            // Send WhatsApp confirmation
            // Basic phone formatting - ensure it starts with + and country code
            // As per user context, defaulting to +503 (El Salvador) if not provided
            let formattedPhone = clientPhone.trim().replace(/\D/g, ''); // Remove all non-digits

            if (formattedPhone.length === 8) {
                formattedPhone = `+503${formattedPhone}`;
            } else if (formattedPhone.startsWith('503') && formattedPhone.length === 11) {
                formattedPhone = `+${formattedPhone}`;
            } else if (!formattedPhone.startsWith('+')) {
                formattedPhone = `+${formattedPhone}`;
            }

            console.log("Attempting to send WhatsApp to:", formattedPhone);

            try {
                const { data: invokeData, error: invokeError } = await supabase.functions.invoke('send-whatsapp', {
                    body: {
                        phone: formattedPhone,
                        templateName: 'hello_world',
                        languageCode: 'en_US',
                        components: []
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

            setConfirmed(true);
        } catch (err: any) {
            console.error("Booking error:", err);
            const detail = err.context?.error || err.message || "Error desconocido";
            alert("Error al crear la cita: " + detail);
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
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">

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
                                        <div>
                                            <span className="font-bold text-lg text-white block">{s.name}</span>
                                            <span className={`text-sm ${selectedServiceId === s.id ? 'text-blue-100' : 'text-slate-400'}`}>{s.duration_minutes} minutos</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`font-bold text-xl ${selectedServiceId === s.id ? 'text-white' : 'text-blue-400'}`}>${s.price}</span>
                                            <ChevronRight className={`${selectedServiceId === s.id ? 'text-white' : 'text-slate-600 group-hover:text-white'}`} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-6">Fecha y Hora</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Selecciona Fecha</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none" // appearance-none needed for some browsers to style calendar icon usually
                                    onChange={(e) => handleDateSelect(e.target.value)}
                                    value={selectedDate}
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>

                            {selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Horarios Disponibles</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`py-3 px-2 rounded-lg text-sm font-medium transition-all
                                            ${selectedTime === time
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between pt-8 border-t border-slate-800 mt-4">
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white flex items-center gap-1 px-4 py-2">
                                <ChevronLeft size={16} /> Atrás
                            </button>
                            <button
                                disabled={!selectedDate || !selectedTime}
                                onClick={() => setStep(3)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-6">Tus Datos</h2>

                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Nombre completo"
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 text-slate-500" size={20} />
                                <input
                                    type="tel"
                                    value={clientPhone}
                                    onChange={e => setClientPhone(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Teléfono (WhatsApp)"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mt-6">
                            <h3 className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-4">Resumen de Cita</h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white">{selectedService?.name}</span>
                                <span className="text-blue-400 font-bold">${selectedService?.price}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Calendar size={14} /> {selectedDate}
                                <span className="mx-2">•</span>
                                <Clock size={14} /> {selectedTime}
                            </div>
                        </div>

                        <div className="flex justify-between pt-8">
                            <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white flex items-center gap-1 px-4 py-2">
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
