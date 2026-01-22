"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";

interface Business {
    id: string;
    name: string;
    slug: string;
    whatsapp_number: string | null;
    timezone: string;
    created_at: string;
    is_active: boolean;
}

interface AdminEditBusinessFormProps {
    business: Business;
}

export function AdminEditBusinessForm({ business }: AdminEditBusinessFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: business.name,
        slug: business.slug,
        whatsapp_number: business.whatsapp_number || "",
        timezone: business.timezone,
        is_active: business.is_active,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [id]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, is_active: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from("businesses")
                .update({
                    name: formData.name,
                    slug: formData.slug,
                    whatsapp_number: formData.whatsapp_number || null,
                    timezone: formData.timezone,
                    is_active: formData.is_active,
                })
                .eq("id", business.id);

            if (error) throw error;

            toast({
                title: "Negocio actualizado",
                description: "Los detalles del negocio han sido guardados correctamente.",
            });
            router.refresh(); // Refresh data on the page
        } catch (error: any) {
            console.error("Error updating business:", error);
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
        if (!confirm("¿Estás seguro de que quieres eliminar este negocio? Esta acción es irreversible.")) {
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from("businesses")
                .delete()
                .eq("id", business.id);

            if (error) throw error;

            toast({
                title: "Negocio eliminado",
                description: "El negocio ha sido eliminado permanentemente.",
            });
            router.push("/admin/businesses"); // Redirect to businesses list
        } catch (error: any) {
            console.error("Error deleting business:", error);
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
                <CardTitle>Editar Negocio: {business.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="name">Nombre del Negocio</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (URL único)</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="whatsapp_number">Número de WhatsApp</Label>
                        <Input
                            id="whatsapp_number"
                            value={formData.whatsapp_number}
                            onChange={handleChange}
                            className="mt-1"
                            placeholder="Ej: +5037xxxxxxx"
                        />
                    </div>
                    <div>
                        <Label htmlFor="timezone">Zona Horaria</Label>
                        <Input
                            id="timezone"
                            value={formData.timezone}
                            onChange={handleChange}
                            required
                            className="mt-1"
                            placeholder="Ej: America/El_Salvador"
                        />
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
                            Eliminar Negocio
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-sm text-muted-foreground">
                    <p>Creado el: {formatInTimeZone(new Date(business.created_at), business.timezone, "dd/MM/yyyy HH:mm", { locale: es })}</p>
                </div>
            </CardContent>
        </Card>
    );
}