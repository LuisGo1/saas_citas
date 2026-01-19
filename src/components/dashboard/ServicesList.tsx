"use client";

import { useState } from "react";
import { Plus, Trash2, Clock, DollarSign, Briefcase, Zap, Pencil } from "lucide-react";
import { createService, deleteService, updateService } from "@/app/(dashboard)/dashboard/services/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface Service {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
    image_url?: string;
}

interface ServicesListProps {
    services: Service[];
    businessId: string;
}

export function ServicesList({ services, businessId }: ServicesListProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [editImageUrl, setEditImageUrl] = useState<string>("");

    const handleCreate = async (formData: FormData) => {
        setIsLoading(true);
        await createService(formData);
        setIsLoading(false);
        setImageUrl("");
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setEditImageUrl(service.image_url || "");
        setIsEditOpen(true);
    };

    const handleUpdate = async (formData: FormData) => {
        if (!editingService) return;
        setIsLoading(true);

        const name = formData.get("name") as string;
        const price = parseFloat(formData.get("price") as string);
        const duration = parseInt(formData.get("duration") as string);

        await updateService(editingService.id, {
            name,
            price,
            duration_minutes: duration,
            image_url: editImageUrl || undefined
        });

        setIsLoading(false);
        setIsEditOpen(false);
        setEditingService(null);
        setEditImageUrl("");
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este servicio?")) {
            await deleteService(id);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Formulario */}
            <div className="lg:col-span-4 h-fit sticky top-24">
                <div className="glass-card rounded-[2.5rem] overflow-hidden border-primary/20 bg-primary/[0.02]">
                    <div className="px-8 py-6 border-b border-primary/10 bg-primary/5 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                            <Plus size={20} />
                        </div>
                        <h2 className="font-black text-xl tracking-tight italic text-primary">Nuevo Servicio</h2>
                    </div>

                    <form action={handleCreate} className="p-8 space-y-6">
                        <input type="hidden" name="businessId" value={businessId} />
                        <input type="hidden" name="image_url" value={imageUrl} />

                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">Imagen (Opcional)</label>
                            <div className="flex items-center gap-4">
                                <ImageUpload
                                    currentImageUrl={null}
                                    onImageUploaded={(url) => setImageUrl(url)}
                                    folder="services"
                                    size="lg"
                                />
                                <span className="text-sm text-muted-foreground">Sube una imagen</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">Nombre</label>
                            <input
                                name="name"
                                required
                                className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                                placeholder="Ej: Corte de Cabello Elite"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">Precio ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full bg-background/50 border border-border rounded-2xl pl-10 pr-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                                        placeholder="15.00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">Minutos</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        name="duration"
                                        type="number"
                                        required
                                        className="w-full bg-background/50 border border-border rounded-2xl pl-10 pr-5 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                                        placeholder="30"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-50">
                            {isLoading ? "Creando..." : "Crear Servicio"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Lista */}
            <div className="lg:col-span-8 space-y-4">
                {services && services.length > 0 ? (
                    services.map((s) => (
                        <div key={s.id} className="glass-card p-6 rounded-[2rem] flex justify-between items-center group hover:border-primary/40 hover:bg-muted/30 transition-all duration-300">
                            <div className="flex items-center gap-6">
                                {s.image_url ? (
                                    <img
                                        src={s.image_url}
                                        alt={s.name}
                                        className="w-16 h-16 rounded-2xl object-cover border border-border/40"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-muted border border-border/40 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                                        <Zap size={28} className="fill-primary/10" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-black text-xl text-foreground tracking-tight italic">{s.name}</h3>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10 text-xs font-black">
                                            <Clock size={14} />
                                            {s.duration_minutes} MIN
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 text-xs font-black">
                                            <DollarSign size={14} />
                                            ${parseFloat(s.price.toString()).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(s)}
                                    className="p-4 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-90"
                                    title="Editar"
                                >
                                    <Pencil size={22} />
                                </button>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    className="p-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all active:scale-90"
                                >
                                    <Trash2 size={22} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass border-dashed border-2 p-20 rounded-[3rem] text-center space-y-4">
                        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                            <Briefcase size={40} />
                        </div>
                        <h3 className="text-xl font-black text-muted-foreground">No hay servicios</h3>
                        <p className="text-muted-foreground/60 max-w-xs mx-auto font-medium">Comienza por agregar tu primer servicio en el panel de la izquierda.</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditOpen && editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card p-8 rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h2 className="text-2xl font-black mb-6">Editar Servicio</h2>
                        <form action={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Imagen</label>
                                <div className="flex items-center gap-4">
                                    <ImageUpload
                                        currentImageUrl={editingService.image_url || null}
                                        onImageUploaded={(url) => setEditImageUrl(url)}
                                        folder="services"
                                        size="lg"
                                    />
                                    <span className="text-sm text-muted-foreground">Cambiar imagen</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre</label>
                                <input name="name" required defaultValue={editingService.name} className="w-full p-4 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Precio ($)</label>
                                    <input name="price" type="number" step="0.01" required defaultValue={editingService.price} className="w-full p-4 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Minutos</label>
                                    <input name="duration" type="number" required defaultValue={editingService.duration_minutes} className="w-full p-4 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { setIsEditOpen(false); setEditingService(null); }} className="flex-1 py-4 font-bold rounded-xl text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
                                <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
                                    {isLoading ? "Guardando..." : "Actualizar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
