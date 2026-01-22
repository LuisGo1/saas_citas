"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    MoreHorizontal,
    CheckCircle,
    XCircle,
    Eye,
    Clock,
    Calendar as CalendarIcon,
    User,
    Phone,
    Building2,
    DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

interface Appointment {
    id: string;
    business_id: string;
    service_id: string | null;
    client_name: string;
    client_phone: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    created_at: string;
    services: {
        name: string;
        price: number;
    } | null;
    businesses: {
        name: string;
        slug: string;
        owner_id: string;
        owner_profile?: {
            id: string;
            full_name: string | null;
            email: string;
        };
    } | null;
}

interface AdminAppointmentTableProps {
    appointments: Appointment[];
}

export function AdminAppointmentTable({ appointments }: AdminAppointmentTableProps) {
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
        setLoading(appointmentId);
        try {
            const { error } = await supabase
                .from("appointments")
                .update({ status: newStatus })
                .eq("id", appointmentId);

            if (error) throw error;

            toast({
                title: "Estado de cita actualizado",
                description: `La cita ha sido marcada como ${newStatus}.`,
            });
            router.refresh();
        } catch (error: any) {
            console.error("Error updating appointment status:", error);
            toast({
                title: "Error al actualizar estado",
                description: error.message || "Ocurrió un error inesperado.",
                variant: "destructive",
            });
        } finally {
            setLoading(null);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-500/10 text-green-700 border-green-500/20";
            case "pending":
                return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
            case "cancelled":
                return "bg-red-500/10 text-red-700 border-red-500/20";
            case "completed":
                return "bg-blue-500/10 text-blue-700 border-blue-500/20";
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-500/20";
        }
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Citas Globales ({appointments.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Negocio</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Servicio</TableHead>
                            <TableHead>Fecha / Hora</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                                <TableCell>
                                    {appointment.businesses ? (
                                        <div>
                                            <div className="font-medium">{appointment.businesses.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                <span className="font-semibold">Propietario:</span>{" "}
                                                {appointment.businesses.owner_profile?.full_name || "N/A"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {appointment.businesses.owner_profile?.email || "N/A"}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Negocio eliminado</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium flex items-center gap-1">
                                        <User className="h-3 w-3" /> {appointment.client_name}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-3 w-3" /> {appointment.client_phone}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {appointment.services ? (
                                        <div>
                                            <div className="font-medium">{appointment.services.name}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" /> {appointment.services.price.toFixed(2)}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Servicio eliminado</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" /> {format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: es })}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {appointment.appointment_time}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusBadgeColor(appointment.status)}>
                                        {appointment.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                disabled={loading === appointment.id}
                                            >
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                                disabled={appointment.status === "confirmed"}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                Marcar como Confirmada
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                                                disabled={appointment.status === "cancelled"}
                                            >
                                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                Marcar como Cancelada
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                                disabled={appointment.status === "completed"}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                                                Marcar como Completada
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver Detalles
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}