"use client";

import { useState } from "react";
import { Plus, Trash2, UserCog, Briefcase, CheckCircle2, XCircle, Pencil } from "lucide-react";
import { createStaff, deleteStaff, toggleStaffStatus, updateStaff } from "@/app/(dashboard)/dashboard/staff/actions";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface Staff {
    id: string;
    name: string;
    role: string | null;
    is_active: boolean;
    avatar_url?: string;
}

interface StaffListProps {
    staff: Staff[];
}

export function StaffList({ staff }: StaffListProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Staff | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [newAvatarUrl, setNewAvatarUrl] = useState<string>("");
    const [editAvatarUrl, setEditAvatarUrl] = useState<string>("");

    const handleCreate = async (formData: FormData) => {
        setIsLoading(true);
        await createStaff(formData);
        setIsLoading(false);
        setIsCreateOpen(false);
        setNewAvatarUrl("");
    };

    const handleEdit = (member: Staff) => {
        setEditingMember(member);
        setEditAvatarUrl(member.avatar_url || "");
        setIsEditOpen(true);
    };

    const handleUpdate = async (formData: FormData) => {
        if (!editingMember) return;
        setIsLoading(true);

        const name = formData.get("name") as string;
        const role = formData.get("role") as string;

        await updateStaff(editingMember.id, {
            name,
            role,
            avatar_url: editAvatarUrl || undefined
        });

        setIsLoading(false);
        setIsEditOpen(false);
        setEditingMember(null);
        setEditAvatarUrl("");
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este miembro?")) {
            await deleteStaff(id);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await toggleStaffStatus(id, !currentStatus);
    };

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic">Equipo de Trabajo</h1>
                    <p className="text-muted-foreground font-medium mt-1">Gestiona a tus especialistas, barberos o mecánicos.</p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>Agregar Miembro</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((member) => (
                    <div key={member.id} className="glass-card p-6 rounded-[2rem] relative group border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            {member.avatar_url ? (
                                <img
                                    src={member.avatar_url}
                                    alt={member.name}
                                    className="w-14 h-14 rounded-2xl object-cover border border-border"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                    <UserCog size={28} />
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(member)}
                                    className="p-2 rounded-xl text-muted-foreground bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                                    title="Editar"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleToggle(member.id, member.is_active)}
                                    className={`p-2 rounded-xl transition-colors ${member.is_active ? 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-muted-foreground bg-muted hover:bg-muted/80'}`}
                                    title={member.is_active ? "Activo" : "Inactivo"}
                                >
                                    {member.is_active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id)}
                                    className="p-2 rounded-xl text-destructive/70 bg-destructive/5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground font-medium mt-1 uppercase tracking-wide flex items-center gap-1">
                            <Briefcase size={12} />
                            {member.role || "Sin rol definido"}
                        </p>
                    </div>
                ))}

                {staff.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-50">
                        <p className="font-bold text-lg">No hay miembros registrados aún.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card p-8 rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h2 className="text-2xl font-black mb-6">Nuevo Miembro</h2>
                        <form action={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre</label>
                                <input name="name" required placeholder="Ej. Juan Pérez" className="w-full p-4 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Rol / Especialidad</label>
                                <input name="role" placeholder="Ej. Barbero Senior" className="w-full p-4 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Foto (Opcional)</label>
                                <div className="flex items-center gap-4">
                                    <ImageUpload
                                        currentImageUrl={null}
                                        onImageUploaded={(url) => setNewAvatarUrl(url)}
                                        folder="avatars"
                                        size="md"
                                    />
                                    <span className="text-sm text-muted-foreground">Sube una foto</span>
                                </div>
                                <input type="hidden" name="avatar_url" value={newAvatarUrl} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-4 font-bold rounded-xl text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
                                <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
                                    {isLoading ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card p-8 rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h2 className="text-2xl font-black mb-6">Editar Miembro</h2>
                        <form action={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre</label>
                                <input name="name" required defaultValue={editingMember.name} className="w-full p-4 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Rol / Especialidad</label>
                                <input name="role" defaultValue={editingMember.role || ""} placeholder="Ej. Barbero Senior" className="w-full p-4 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Foto</label>
                                <div className="flex items-center gap-4">
                                    <ImageUpload
                                        currentImageUrl={editingMember.avatar_url || null}
                                        onImageUploaded={(url) => setEditAvatarUrl(url)}
                                        folder="avatars"
                                        size="md"
                                    />
                                    <span className="text-sm text-muted-foreground">Cambiar foto</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { setIsEditOpen(false); setEditingMember(null); }} className="flex-1 py-4 font-bold rounded-xl text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
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
