"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
}

interface AdminEditUserFormProps {
    userProfile: UserProfile;
}

export function AdminEditUserForm({ userProfile }: AdminEditUserFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        full_name: userProfile.full_name || "",
        email: userProfile.email,
        role: userProfile.role,
        is_active: userProfile.is_active,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleRoleChange = (value: string) => {
        setFormData(prev => ({ ...prev, role: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, is_active: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from("user_profiles")
                .update({
                    full_name: formData.full_name || null,
                    // email: formData.email, // Email in auth.users is complex to change directly
                    role: formData.role,
                    is_active: formData.is_active,
                })
                .eq("id", userProfile.id);

            if (error) throw error;

            toast({
                title: "Usuario actualizado",
                description: "Los detalles del usuario han sido guardados correctamente.",
            });
            router.refresh(); // Refresh data on the page
        } catch (error: any) {
            console.error("Error updating user:", error);
            toast({
                title: "Error al actualizar",
                description: error.message || "Ocurrió un error inesperado.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible y eliminará todos sus negocios y datos relacionados.")) {
            return;
        }

        setLoading(true);
        try {
            // Primero eliminar el perfil de usuario (cascade delete en auth.users)
            const { error: profileError } = await supabase
                .from("user_profiles")
                .delete()
                .eq("id", userProfile.id);

            if (profileError) throw profileError;

            // Opcionalmente, si quieres eliminar el usuario de auth.users directamente
            // const { error: authError } = await supabase.auth.admin.deleteUser(userProfile.id);
            // if (authError) throw authError;

            toast({
                title: "Usuario eliminado",
                description: "El usuario ha sido eliminado permanentemente.",
            });
            router.push("/admin/users"); // Redirect to users list
        } catch (error: any) {
            console.error("Error deleting user:", error);
            toast({
                title: "Error al eliminar",
                description: error.message || "Ocurrió un error inesperado.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Editar Usuario: {userProfile.email}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email (No editable directamente aquí)</Label>
                        <Input
                            id="email"
                            value={formData.email}
                            disabled
                            className="mt-1 bg-muted/50"
                        />
                    </div>
                    <div>
                        <Label htmlFor="role">Rol</Label>
                        <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
                            <SelectTrigger className="mt-1 w-[180px]">
                                <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Usuario</SelectItem>
                                <SelectItem value="superadmin">Super Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={handleSwitchChange}
                            disabled={loading}
                        />
                        <Label htmlFor="is_active">Activo</Label>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                            Eliminar Usuario
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-sm text-muted-foreground">
                    <p>Creado el: {formatInTimeZone(new Date(userProfile.created_at), "America/El_Salvador", "dd/MM/yyyy HH:mm", { locale: es })}</p>
                </div>
            </CardContent>
        </Card>
    );
}