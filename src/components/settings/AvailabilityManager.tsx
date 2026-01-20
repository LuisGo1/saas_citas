"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Clock, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface AvailabilityManagerProps {
  businessId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function AvailabilityManager({ businessId }: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchAvailability();
  }, [businessId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('business_id', businessId)
        .order('day_of_week, start_time');

      if (error) throw error;

      setAvailability(data || []);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      setError('Error al cargar horarios de atención');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '17:00',
    };

    setAvailability(prev => [...prev, newSlot]);
  };

  const updateTimeSlot = (index: number, field: keyof AvailabilitySlot, value: string | number) => {
    setAvailability(prev =>
      prev.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const removeTimeSlot = (index: number) => {
    setAvailability(prev => prev.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Delete existing availability
      await supabase
        .from('availability')
        .delete()
        .eq('business_id', businessId);

      // Insert new availability
      if (availability.length > 0) {
        const { error } = await supabase
          .from('availability')
          .insert(
            availability.map(slot => ({
              business_id: businessId,
              day_of_week: slot.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
            }))
          );

        if (error) throw error;
      }

      setSuccess('Horarios guardados exitosamente');
    } catch (err: any) {
      console.error('Error saving availability:', err);
      setError('Error al guardar los horarios');
    } finally {
      setSaving(false);
    }
  };

  const getSlotsForDay = (dayOfWeek: number) => {
    return availability.filter(slot => slot.day_of_week === dayOfWeek);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Configura los horarios en que tu negocio está disponible para citas.
        Los clientes solo podrán reservar en estos horarios.
      </p>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => {
          const daySlots = getSlotsForDay(day.value);

          return (
            <div key={day.value} className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {day.label}
                </h3>
                <button
                  onClick={() => addTimeSlot(day.value)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Horario
                </button>
              </div>

              <div className="space-y-3">
                {daySlots.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">
                    No hay horarios configurados para este día
                  </p>
                ) : (
                  daySlots.map((slot, index) => {
                    const globalIndex = availability.findIndex(s => s === slot);
                    return (
                      <div key={globalIndex} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-muted-foreground">Desde:</label>
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => updateTimeSlot(globalIndex, 'start_time', e.target.value)}
                            className="px-3 py-1 bg-background border border-border rounded-lg text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-muted-foreground">Hasta:</label>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => updateTimeSlot(globalIndex, 'end_time', e.target.value)}
                            className="px-3 py-1 bg-background border border-border rounded-lg text-sm"
                          />
                        </div>

                        <button
                          onClick={() => removeTimeSlot(globalIndex)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors ml-auto"
                          title="Eliminar horario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-border/40">
        <button
          onClick={saveAvailability}
          disabled={saving}
          className="flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Guardando...' : 'Guardar Horarios'}
        </button>
      </div>
    </div>
  );
}