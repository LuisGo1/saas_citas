"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
    MoreHorizontal,
    ExternalLink,
    Eye,
    Edit,
    Trash2,
    Calendar,
    User
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

interface Business {
    id: string;
    name: string;
    slug: string;
    whatsapp_number: string | null;
    timezone: string;
    created_at: string;
    user_profiles: {
        full_name: string | null;
        email: string;
    };
    subscriptions: {
        plan: string;
        status: string;
        valid_until: string | null;
    }[];
    appointments: {
        id: string;
        status: string;
    }[];
}

interface AdminBusinessTableProps {
    businesses: Business[];
}

export function AdminBusinessTable({ businesses }: AdminBusinessTableProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const getSubscriptionBadgeColor = (plan: string, status: string) => {
        if (status !== 'active') {
            return "bg-gray-500/10 text-gray-700 border-gray-500/20";
        }

        switch (plan) {
            case "pro":
                return "bg-purple-500/10 text-purple-700 border-purple-500/20";
            case "free":
                return "bg-blue-500/10 text-blue-700 border-blue-500/20";
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-500/20";
        }
    };

    const getAppointmentStats = (appointments: Business['appointments']) => {
        const total = appointments.length;
        const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
        return { total, confirmed };
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Negocios Registrados ({businesses.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Negocio</TableHead>
                            <TableHead>Propietario</TableHead>
                            <TableHead>Suscripción</TableHead>
                            <TableHead>Citas</TableHead>
                            <TableHead>Registro</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {businesses.map((business) => {
                            const subscription = business.subscriptions?.[0];
                            const { total: totalAppointments, confirmed } = getAppointmentStats(business.appointments || []);

                            return (
                                <TableRow key={business.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{business.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                @{business.slug}
                                            </div>
                                            {business.whatsapp_number && (
                                                <div className="text-xs text-muted-foreground">
                                                    📱 {business.whatsapp_number}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {business.user_profiles?.full_name || "Sin nombre"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {business.user_profiles?.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {subscription ? (
                                            <Badge className={getSubscriptionBadgeColor(subscription.plan, subscription.status)}>
                                                {subscription.plan === "pro" ? "Pro" : "Free"}
                                                {subscription.status !== 'active' && " (Inactiva)"}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Sin suscripción</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="font-medium">{totalAppointments} total</div>
                                            <div className="text-muted-foreground">{confirmed} confirmadas</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(business.created_at), "dd/MM/yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    disabled={loading === business.id}
                                                >
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    onClick={() => window.open(`/${business.slug}`, '_blank')}
                                                >
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Ver página pública
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        console.log("DEBUG: Navigating to business ID:", business.id);
                                                        router.push(`/admin/businesses/${business.id}`);
                                                    }}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Ver/Editar detalles
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar negocio
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}