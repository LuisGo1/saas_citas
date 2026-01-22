"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    MoreHorizontal,
    UserCheck,
    UserX,
    Shield,
    ShieldCheck,
    Edit,
    Trash2
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

interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
    businesses?: {
        id: string;
        name: string;
        slug: string;
        created_at: string;
    }[];
}

interface AdminUserTableProps {
    users: User[];
}

export function AdminUserTable({ users }: AdminUserTableProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const updateUserRole = async (userId: string, newRole: string) => {
        setLoading(userId);
        try {
            const { error } = await supabase
                .from("user_profiles")
                .update({ role: newRole })
                .eq("id", userId);

            if (error) throw error;

            // Refresh the page
            window.location.reload();
        } catch (error) {
            console.error("Error updating user role:", error);
            alert("Error al actualizar el rol del usuario");
        } finally {
            setLoading(null);
        }
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        setLoading(userId);
        try {
            const { error } = await supabase
                .from("user_profiles")
                .update({ is_active: !currentStatus })
                .eq("id", userId);

            if (error) throw error;

            // Refresh the page
            window.location.reload();
        } catch (error) {
            console.error("Error updating user status:", error);
            alert("Error al actualizar el estado del usuario");
        } finally {
            setLoading(null);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "superadmin":
                return "bg-red-500/10 text-red-700 border-red-500/20";
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-500/20";
        }
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Usuarios Registrados ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Negocios</TableHead>
                            <TableHead>Registro</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    {user.full_name || "Sin nombre"}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge className={getRoleBadgeColor(user.role)}>
                                        {user.role === "superadmin" ? "Super Admin" : "Usuario"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.is_active ? "default" : "secondary"}>
                                        {user.is_active ? "Activo" : "Inactivo"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.businesses && user.businesses.length > 0 ? (
                                        <div className="space-y-1">
                                            {user.businesses.map((business) => (
                                                <div key={business.id} className="text-sm">
                                                    {business.name}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Sin negocios</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(user.created_at), "dd/MM/yyyy", { locale: es })}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                disabled={loading === user.id}
                                            >
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => router.push(`/admin/users/${user.id}`)}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Ver/Editar detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                                onClick={() => toggleUserStatus(user.id, user.is_active)}
                                            >
                                                {user.is_active ? (
                                                    <>
                                                        <UserX className="mr-2 h-4 w-4" />
                                                        Desactivar
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                        Activar
                                                    </>
                                                )}
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                                onClick={() => updateUserRole(user.id, "user")}
                                                disabled={user.role === "user"}
                                            >
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Hacer Usuario
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => updateUserRole(user.id, "superadmin")}
                                                disabled={user.role === "superadmin"}
                                            >
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                Hacer Super Admin
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