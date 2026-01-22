"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    MoreHorizontal,
    Crown,
    Zap,
    Edit,
    CreditCard,
    AlertTriangle
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
import { format, isAfter, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";

interface Subscription {
    id: string;
    business_id: string;
    plan: string;
    status: string;
    valid_until: string | null;
    created_at: string;
    businesses: {
        id: string;
        name: string;
        slug: string;
        user_profiles: {
            full_name: string | null;
            email: string;
        };
    };
}

interface AdminSubscriptionTableProps {
    subscriptions: Subscription[];
}

export function AdminSubscriptionTable({ subscriptions }: AdminSubscriptionTableProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const supabase = createClient();

    const updateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
        setLoading(subscriptionId);
        try {
            const { error } = await supabase
                .from("subscriptions")
                .update({ status: newStatus })
                .eq("id", subscriptionId);

            if (error) throw error;

            // Refresh the page
            window.location.reload();
        } catch (error) {
            console.error("Error updating subscription status:", error);
            alert("Error al actualizar el estado de la suscripción");
        } finally {
            setLoading(null);
        }
    };

    const upgradeToPro = async (businessId: string) => {
        setLoading(businessId);
        try {
            const validUntil = addDays(new Date(), 30); // 30 days trial

            const { error } = await supabase
                .from("subscriptions")
                .update({
                    plan: "pro",
                    status: "active",
                    valid_until: validUntil.toISOString()
                })
                .eq("business_id", businessId);

            if (error) throw error;

            // Refresh the page
            window.location.reload();
        } catch (error) {
            console.error("Error upgrading subscription:", error);
            alert("Error al actualizar la suscripción");
        } finally {
            setLoading(null);
        }
    };

    const getPlanIcon = (plan: string) => {
        return plan === "pro" ? Crown : Zap;
    };

    const getStatusBadgeColor = (status: string, validUntil: string | null) => {
        const now = new Date();

        if (status !== 'active') {
            return "bg-gray-500/10 text-gray-700 border-gray-500/20";
        }

        if (validUntil && isBefore(new Date(validUntil), addDays(now, 7))) {
            return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
        }

        return "bg-green-500/10 text-green-700 border-green-500/20";
    };

    const getStatusText = (status: string, validUntil: string | null) => {
        const now = new Date();

        if (status !== 'active') return status;

        if (validUntil && isBefore(new Date(validUntil), addDays(now, 7))) {
            return "expira pronto";
        }

        return status;
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Suscripciones ({subscriptions.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Negocio</TableHead>
                            <TableHead>Propietario</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Válida hasta</TableHead>
                            <TableHead>Registro</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions.map((subscription) => {
                            const PlanIcon = getPlanIcon(subscription.plan);
                            const isExpiringSoon = subscription.valid_until &&
                                isBefore(new Date(subscription.valid_until), addDays(new Date(), 7));

                            return (
                                <TableRow key={subscription.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{subscription.businesses?.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                @{subscription.businesses?.slug}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {subscription.businesses?.user_profiles?.full_name || "Sin nombre"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {subscription.businesses?.user_profiles?.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <PlanIcon className="h-4 w-4" />
                                            <Badge variant={subscription.plan === "pro" ? "default" : "secondary"}>
                                                {subscription.plan === "pro" ? "Pro" : "Free"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getStatusBadgeColor(subscription.status, subscription.valid_until)}>
                                                {getStatusText(subscription.status, subscription.valid_until)}
                                            </Badge>
                                            {isExpiringSoon && (
                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {subscription.valid_until ? (
                                            <div className={`text-sm ${isExpiringSoon ? 'text-yellow-600 font-medium' : ''}`}>
                                                {format(new Date(subscription.valid_until), "dd/MM/yyyy", { locale: es })}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Sin límite</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(subscription.created_at), "dd/MM/yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    disabled={loading === subscription.business_id}
                                                >
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuSeparator />

                                                {subscription.plan === "free" && (
                                                    <DropdownMenuItem
                                                        onClick={() => upgradeToPro(subscription.business_id)}
                                                    >
                                                        <Crown className="mr-2 h-4 w-4" />
                                                        Upgrade to Pro
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuItem
                                                    onClick={() => updateSubscriptionStatus(subscription.id, "active")}
                                                    disabled={subscription.status === "active"}
                                                >
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Activar
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => updateSubscriptionStatus(subscription.id, "cancelled")}
                                                    disabled={subscription.status === "cancelled"}
                                                >
                                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                                    Cancelar
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar suscripción
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