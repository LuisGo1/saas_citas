
"use client";

import { useState, useRef, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    Phone,
    Calendar as CalendarIcon,
    X,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Save,
    Edit as EditIcon,
    Briefcase,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatToAmPm } from "@/lib/time";
import { updateAppointmentStatus, updateAppointment } from "@/app/actions";

interface Appointment {
    id: string;
    client_name: string;
    client_phone: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    services?: {
        name: string;
        price: number;
    };
    staff?: {
        name: string;
    };
    staff_id?: string;
}

interface Staff {
    id: string;
    name: string;
}

interface CalendarViewProps {
    appointments: Appointment[];
    staff: Staff[];
}

export function CalendarView({ appointments, staff }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
    const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close filter on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDateSelect = (dateStr: string) => {
        setSelectedDate(dateStr);
        // Desplazamiento suave hacia la barra lateral en móvil después de un breve retraso para permitir render
        setTimeout(() => {
            sidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // New state for editing
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ date: "", time: "", staff_id: "" });

    // Cuando se selecciona una cita, inicializar el form
    const handleSelectApt = (apt: Appointment) => {
        setSelectedApt(apt);
        setEditForm({ date: apt.appointment_date, time: apt.appointment_time, staff_id: apt.staff_id || "" });
        setIsEditing(false);
        // Centrar la vista en el móvil al abrir el detalle
        setTimeout(() => {
            sidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleSaveEdit = async () => {
        if (!selectedApt) return;

        try {
            await updateAppointment(selectedApt.id, {
                appointment_date: editForm.date,
                appointment_time: editForm.time,
                staff_id: editForm.staff_id || null
            });

            // Optimistic update (or reload logic could go here)
            window.location.reload();
        } catch (error) {
            console.error("Error updating appointment:", error);
            alert("Error al actualizar la cita");
        }
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);

    // Month names in Spanish
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Filter appointments
    const filteredAppointments = appointments.filter(apt => {
        if (selectedStaffId === 'all') return true;
        if (selectedStaffId === 'unassigned') return !apt.staff_id;
        return apt.staff_id === selectedStaffId;
    });

    const getFilterLabel = () => {
        if (selectedStaffId === 'all') return 'Todo el Equipo';
        if (selectedStaffId === 'unassigned') return 'Sin preferencia';
        return staff.find(s => s.id === selectedStaffId)?.name || 'Seleccionar';
    };

    const days = [];
    // Pad with previous month's days
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        days.push(<div key={`pad-${i}`} className="h-24 md:h-32 bg-muted/20 border border-border/10" />);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAppointments = filteredAppointments.filter(a => a.appointment_date === dateStr);
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        days.push(
            <div
                key={day}
                onClick={() => handleDateSelect(dateStr)}
                className={cn(
                    "h-24 md:h-32 p-3 bg-card/10 border border-border/10 hover:bg-primary/[0.03] transition-all cursor-pointer relative group overflow-hidden",
                    selectedDate === dateStr && "ring-4 ring-primary/20 z-10 bg-primary/5",
                    isToday && "bg-primary/[0.08]"
                )}
            >
                <div className="flex justify-between items-start">
                    <span className={cn(
                        "text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all",
                        isToday ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted"
                    )}>
                        {day}
                    </span>
                    {dayAppointments.length > 0 && (
                        <div className="flex -space-x-1.5 overflow-hidden">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-black border border-primary/20 uppercase tracking-tighter">
                                {dayAppointments.length}
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-3 space-y-1 overflow-hidden hidden md:block">
                    {dayAppointments.slice(0, 2).map(apt => (
                        <div
                            key={apt.id}
                            className="text-[10px] truncate bg-muted/60 p-1.5 rounded-lg border border-border/40 text-foreground font-bold italic"
                        >
                            {apt.appointment_time} - {apt.client_name}
                        </div>
                    ))}
                    {dayAppointments.length > 2 && (
                        <div className="text-[9px] text-muted-foreground font-black px-1 uppercase tracking-widest opacity-60">
                            + {dayAppointments.length - 2} más
                        </div>
                    )}
                </div>
                {isToday && <div className="absolute bottom-0 right-0 p-1 opacity-20"><Sparkles size={24} className="text-primary" /></div>}
            </div>
        );
    }

    const selectedDayAppointments = filteredAppointments
        .filter(a => a.appointment_date === selectedDate)
        .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

    return (
        <div className="flex flex-col xl:flex-row gap-10 h-max items-start">
            {/* Calendar Main Grid */}
            <div className="flex-1 w-full glass shadow-none border border-border/40 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-border/40 flex justify-between items-center bg-muted/30">
                    <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3 italic">
                        <div className="p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                            <CalendarIcon size={24} />
                        </div>
                        {monthNames[month]} {year}
                    </h2>

                    <div className="flex items-center gap-4">
                        {/* Staff Filter Custom Dropdown */}
                        <div className="relative hidden md:block" ref={filterRef}>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 bg-muted/50 hover:bg-muted border border-border/40 hover:border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground transition-all min-w-[180px] justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <Filter size={14} className="text-muted-foreground" />
                                    <span>{getFilterLabel()}</span>
                                </div>
                                <ChevronRight size={14} className={cn("text-muted-foreground transition-transform rotate-90", isFilterOpen && "-rotate-90")} />
                            </button>

                            {isFilterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-1.5 space-y-0.5">
                                        <button
                                            onClick={() => { setSelectedStaffId('all'); setIsFilterOpen(false); }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors",
                                                selectedStaffId === 'all' ? "bg-primary/20 text-primary font-bold" : "text-slate-300 hover:bg-white/5"
                                            )}
                                        >
                                            Todo el Equipo
                                            {selectedStaffId === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                        </button>

                                        <button
                                            onClick={() => { setSelectedStaffId('unassigned'); setIsFilterOpen(false); }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors",
                                                selectedStaffId === 'unassigned' ? "bg-primary/20 text-primary font-bold" : "text-slate-300 hover:bg-white/5"
                                            )}
                                        >
                                            Sin preferencia
                                            {selectedStaffId === 'unassigned' && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                        </button>

                                        <div className="h-px bg-white/10 my-1 mx-2" />

                                        {staff.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => { setSelectedStaffId(s.id); setIsFilterOpen(false); }}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors",
                                                    selectedStaffId === s.id ? "bg-primary/20 text-primary font-bold" : "text-slate-300 hover:bg-white/5"
                                                )}
                                            >
                                                {s.name}
                                                {selectedStaffId === s.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={prevMonth}
                                className="p-3 rounded-2xl bg-muted border border-border/40 hover:bg-background hover:scale-110 transition-all text-foreground active:scale-95"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-3 rounded-2xl bg-muted border border-border/40 hover:bg-background hover:scale-110 transition-all text-foreground active:scale-95"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-7 text-center border-b border-border/20 bg-muted/10">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                        <div key={d} className="py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-fr bg-background/20">
                    {days}
                </div>
            </div>

            {/* Sidebar Details */}
            <div ref={sidebarRef} className="w-full xl:w-[400px] flex flex-col gap-8 shrink-0">
                <div className="glass shadow-none border border-primary/20 bg-primary/[0.01] rounded-[2.5rem] p-10 min-h-[500px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] -z-10 bg-primary rounded-bl-full w-40 h-40" />

                    <h3 className="text-xl font-black tracking-tight mb-8 flex items-center justify-between italic">
                        {selectedDate ? `Citas: ${selectedDate.split('-').reverse().join('/')}` : 'Detalles del día'}
                        {selectedDate && (
                            <button onClick={() => setSelectedDate(null)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground transition-all">
                                <X size={20} />
                            </button>
                        )}
                    </h3>

                    <div className="space-y-5">
                        {selectedDate ? (
                            selectedDayAppointments.length > 0 ? (
                                selectedDayAppointments.map(apt => (
                                    <div
                                        key={apt.id}
                                        onClick={() => handleSelectApt(apt)}
                                        className="p-6 rounded-[2rem] bg-background/50 border border-border hover:border-primary/40 hover:bg-card transition-all cursor-pointer group shadow-lg shadow-black/[0.02]"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-primary font-black flex items-center gap-2 text-sm uppercase tracking-widest italic">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                {formatToAmPm(apt.appointment_time)}
                                            </span>
                                            <span className={cn(
                                                "text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border italic",
                                                apt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    apt.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-muted text-muted-foreground border-border/40'
                                            )}>
                                                {apt.status}
                                            </span>
                                        </div>
                                        <p className="font-black text-xl leading-none group-hover:text-primary transition-colors italic">{apt.client_name}</p>
                                        <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">
                                            {apt.services?.name || 'Servicio General'}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                                            <Briefcase size={10} />
                                            {(apt.staff as any)?.name || "Sin preferencia"}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-24 px-6 border border-dashed border-border rounded-[2.5rem] opacity-50">
                                    <AlertCircle className="mx-auto mb-6 text-muted-foreground" size={56} />
                                    <p className="font-black italic text-lg uppercase tracking-widest">Sin programaciones</p>
                                    <p className="text-sm mt-2 text-muted-foreground font-medium">No hay citas para esta fecha.</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-24 px-6 border border-dashed border-border rounded-[2.5rem] opacity-50">
                                <CalendarIcon className="mx-auto mb-6 text-muted-foreground" size={56} />
                                <p className="font-black italic text-lg uppercase tracking-widest">Calendario Vacío</p>
                                <p className="text-sm mt-2 text-muted-foreground font-medium">Selecciona un día para ver su agenda detalle.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Detalle */}
            {selectedApt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="glass-card border-primary/20 rounded-[3rem] p-10 max-w-xl w-full shadow-[0_0_100px_rgba(var(--primary),0.1)] relative overflow-hidden group animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
                        <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary/5 rounded-full blur-3xl transition-all group-hover:bg-primary/10" />

                        <button
                            onClick={() => setSelectedApt(null)}
                            className="absolute top-8 right-8 p-3 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-24 h-24 rounded-[2rem] bg-primary text-primary-foreground flex items-center justify-center font-black text-4xl shadow-2xl shadow-primary/30 italic">
                                {selectedApt.client_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="text-4xl font-black text-foreground tracking-tight italic">{selectedApt.client_name}</h4>
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic border mt-3",
                                    selectedApt.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                )}>
                                    {selectedApt.status === 'confirmed' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                    {selectedApt.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4 p-5 rounded-3xl bg-muted/30 border border-border/40">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary"><CalendarIcon size={20} /></div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 italic">Fecha y Hora</p>
                                    {isEditing ? (
                                        <div className="flex gap-2 mt-1">
                                            <input
                                                type="date"
                                                value={editForm.date}
                                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                className="bg-background border border-border rounded-lg px-2 py-1 text-sm font-bold w-32"
                                            />
                                            <input
                                                type="time"
                                                value={editForm.time}
                                                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                                className="bg-background border border-border rounded-lg px-2 py-1 text-sm font-bold w-24"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-xl font-bold">{selectedApt.appointment_date} <span className="text-primary tracking-widest">#{selectedApt.appointment_time}</span></p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-3xl bg-muted/30 border border-border/40">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><Clock size={20} /></div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 italic">Servicio</p>
                                    <p className="text-xl font-bold">{selectedApt.services?.name} <span className="text-emerald-500 opacity-60 italic text-sm ml-2">${selectedApt.services?.price}</span></p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-3xl bg-muted/30 border border-border/40">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500"><Phone size={20} /></div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 italic">Contacto Profesional</p>
                                    <p className="text-xl font-bold tracking-tighter">{selectedApt.client_phone}</p>
                                    <a
                                        href={`https://wa.me/${selectedApt.client_phone.replace(/\+/g, '')}`}
                                        target="_blank"
                                        className="mt-3 inline-flex items-center gap-2 text-primary font-black text-sm hover:underline italic group/wa transition-all"
                                    >
                                        Contactar vía WhatsApp
                                        <ChevronRight size={16} className="group-hover/wa:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-3xl bg-muted/30 border border-border/40">
                                <div className="p-3 rounded-2xl bg-slate-500/10 text-slate-500"><Briefcase size={20} /></div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 italic">Especialista</p>
                                    {isEditing ? (
                                        <select
                                            value={editForm.staff_id}
                                            onChange={(e) => setEditForm({ ...editForm, staff_id: e.target.value })}
                                            className="w-full bg-background border border-border rounded-lg p-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="">Sin preferencia</option>
                                            {staff.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-xl font-bold">{(selectedApt.staff as any)?.name || "Sin preferencia"}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-4">
                            {!isEditing && (
                                <button
                                    onClick={async () => {
                                        if (!selectedApt) return;
                                        await updateAppointmentStatus(selectedApt.id, "confirmed");
                                        setSelectedApt({ ...selectedApt, status: "confirmed" });
                                        window.location.reload();
                                    }}
                                    className="flex-1 py-5 bg-primary text-primary-foreground font-black rounded-2xl transition-all shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-95 text-lg italic"
                                >
                                    Confirmar Reserva
                                </button>
                            )}

                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="flex-1 py-5 bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 text-lg italic flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} />
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-5 bg-muted text-foreground font-black rounded-2xl transition-all hover:bg-muted/80 active:scale-95 text-lg italic border border-border"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-8 py-5 bg-muted text-foreground font-black rounded-2xl transition-all hover:bg-muted/80 active:scale-95 text-lg italic border border-border flex items-center gap-2"
                                >
                                    <EditIcon size={20} />
                                    Editar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
