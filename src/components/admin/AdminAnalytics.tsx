"use client";

import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    Building2,
    Calendar,
    DollarSign,
    TrendingUp,
    MessageSquare,
    Crown,
    Zap
} from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

interface AdminAnalyticsProps {
    userTrends: { created_at: string }[];
    businessTrends: { created_at: string }[];
    appointmentTrends: { created_at: string; status: string }[];
    revenueTrends: { created_at: string; services: { price: number } | { price: number }[] }[];
    subscriptionStats: { plan: string; status: string; created_at: string }[];
    notificationStats: { type: string; status: string; created_at: string }[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AdminAnalytics({
    userTrends,
    businessTrends,
    appointmentTrends,
    revenueTrends,
    subscriptionStats,
    notificationStats
}: AdminAnalyticsProps) {
    const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d');

    // Process data for charts
    const processTrends = (data: { created_at: string }[], days: number) => {
        const startDate = subDays(new Date(), days);
        const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });

        return dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const count = data.filter(item =>
                format(new Date(item.created_at), 'yyyy-MM-dd') === dateStr
            ).length;

            return {
                date: format(date, 'dd/MM', { locale: es }),
                count
            };
        });
    };

    const userChartData = processTrends(userTrends, timeRange === '7d' ? 7 : 30);
    const businessChartData = processTrends(businessTrends, timeRange === '7d' ? 7 : 30);

    // Process appointment data
    const appointmentChartData = processTrends(appointmentTrends, timeRange === '7d' ? 7 : 30);

    // Process revenue data
    const revenueChartData = processTrends(revenueTrends, timeRange === '7d' ? 7 : 30).map(day => {
        const dayRevenue = revenueTrends
            .filter(item => format(new Date(item.created_at), 'yyyy-MM-dd') === format(subDays(new Date(), timeRange === '7d' ? 7 : 30), 'yyyy-MM-dd'))
            .reduce((sum, item) => {
                const price = Array.isArray(item.services) && item.services[0]?.price
                    ? item.services[0].price
                    : (item.services as any)?.price || 0;
                return sum + Number(price);
            }, 0);

        return {
            ...day,
            revenue: dayRevenue
        };
    });

    // Subscription distribution
    const subscriptionData = subscriptionStats.reduce((acc, sub) => {
        const key = `${sub.plan}_${sub.status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const subscriptionPieData = [
        { name: 'Free Activo', value: subscriptionData.free_active || 0, color: '#2563eb' },
        { name: 'Pro Activo', value: subscriptionData.pro_active || 0, color: '#8b5cf6' },
        { name: 'Free Inactivo', value: subscriptionData.free_cancelled || 0, color: '#9ca3af' },
        { name: 'Pro Inactivo', value: subscriptionData.pro_cancelled || 0, color: '#d1d5db' }
    ].filter(item => item.value > 0);

    // Notification stats
    const notificationData = notificationStats.reduce((acc, notif) => {
        const key = `${notif.type}_${notif.status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const notificationChartData = [
        { name: 'Confirmaciones', sent: notificationData.confirmation_sent || 0, failed: notificationData.confirmation_failed || 0 },
        { name: '24h Recordatorios', sent: notificationData.reminder_24h_sent || 0, failed: notificationData.reminder_24h_failed || 0 },
        { name: '2h Recordatorios', sent: notificationData.reminder_2h_sent || 0, failed: notificationData.reminder_2h_failed || 0 }
    ];

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Período:</span>
                    <div className="flex bg-muted/50 rounded-xl p-1">
                        {[
                            { value: '7d', label: '7 días' },
                            { value: '30d', label: '30 días' },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTimeRange(option.value as any)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    timeRange === option.value
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">General</TabsTrigger>
                    <TabsTrigger value="users">Usuarios</TabsTrigger>
                    <TabsTrigger value="businesses">Negocios</TabsTrigger>
                    <TabsTrigger value="revenue">Ingresos</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userTrends.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{userChartData.slice(-7).reduce((sum, day) => sum + day.count, 0)} esta semana
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Negocios Activos</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{businessTrends.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{businessChartData.slice(-7).reduce((sum, day) => sum + day.count, 0)} esta semana
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Citas Totales</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{appointmentTrends.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    {appointmentTrends.filter(a => a.status === 'confirmed').length} confirmadas
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${revenueTrends.reduce((sum, item) => {
                                        const price = Array.isArray(item.services) && item.services[0]?.price
                                            ? item.services[0].price
                                            : (item.services as any)?.price || 0;
                                        return sum + Number(price);
                                    }, 0).toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Desde el inicio
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Subscription Distribution */}
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Crown className="h-5 w-5" />
                                    Distribución de Suscripciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={subscriptionPieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {subscriptionPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notification Stats */}
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Notificaciones WhatsApp
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={notificationChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#9ca3af"
                                                fontSize={12}
                                                tick={{ fill: '#9ca3af' }}
                                            />
                                            <YAxis
                                                stroke="#9ca3af"
                                                fontSize={12}
                                                tick={{ fill: '#9ca3af' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--background))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="sent" fill="#10b981" name="Enviadas" />
                                            <Bar dataKey="failed" fill="#ef4444" name="Fallidas" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Registro de Usuarios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={userChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tick={{ fill: '#9ca3af' }}
                                        />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tick={{ fill: '#9ca3af' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#2563eb"
                                            fill="#2563eb40"
                                            name="Nuevos usuarios"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="businesses" className="space-y-6">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Registro de Negocios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={businessChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tick={{ fill: '#9ca3af' }}
                                        />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tick={{ fill: '#9ca3af' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                            name="Nuevos negocios"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-6">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Tendencia de Ingresos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tick={{ fill: '#9ca3af' }}
                                        />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={12}
                                            tick={{ fill: '#9ca3af' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                            formatter={(value: any) => [`$${value.toFixed(2)}`, 'Ingresos']}
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#f59e0b"
                                            radius={[4, 4, 0, 0]}
                                            name="Ingresos"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}