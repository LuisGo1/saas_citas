"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
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
import { Calendar, TrendingUp, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedStatisticsProps {
    businessId: string;
}

interface ChartData {
    date: string;
    appointments: number;
    revenue: number;
    clients: number;
}

interface StatusData {
    name: string;
    value: number;
    color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedStatistics({ businessId }: AdvancedStatisticsProps) {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [statusData, setStatusData] = useState<StatusData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            setError(null);

            const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Fetch appointments data
            const { data: appointments, error: appointmentsError } = await supabase
                .from('appointments')
                .select(`
                    appointment_date,
                    status,
                    client_phone,
                    services (price)
                `)
                .eq('business_id', businessId)
                .gte('appointment_date', startDate.toISOString().split('T')[0])
                .order('appointment_date');

            if (appointmentsError) throw appointmentsError;

            // Process data for charts
            const dateMap = new Map<string, {
                appointments: number;
                revenue: number;
                clients: Set<string>;
                statuses: { [key: string]: number };
            }>();

            const statusCounts: { [key: string]: number } = {};

            appointments?.forEach(apt => {
                const date = apt.appointment_date;
                const price = Array.isArray(apt.services) && apt.services[0]?.price
                    ? apt.services[0].price
                    : (apt.services as any)?.price || 0;

                if (!dateMap.has(date)) {
                    dateMap.set(date, {
                        appointments: 0,
                        revenue: 0,
                        clients: new Set(),
                        statuses: {}
                    });
                }

                const dayData = dateMap.get(date)!;
                dayData.appointments++;
                dayData.revenue += Number(price);
                dayData.clients.add(apt.client_phone);

                // Count statuses
                statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1;
                dayData.statuses[apt.status] = (dayData.statuses[apt.status] || 0) + 1;
            });

            // Convert to chart data
            const chartDataArray: ChartData[] = [];
            const sortedDates = Array.from(dateMap.keys()).sort();

            sortedDates.forEach(date => {
                const dayData = dateMap.get(date)!;
                chartDataArray.push({
                    date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                    appointments: dayData.appointments,
                    revenue: dayData.revenue,
                    clients: dayData.clients.size,
                });
            });

            // Convert status counts to pie chart data
            const statusDataArray: StatusData[] = Object.entries(statusCounts).map(([status, count], index) => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: count,
                color: COLORS[index % COLORS.length],
            }));

            setChartData(chartDataArray);
            setStatusData(statusDataArray);

        } catch (err: any) {
            console.error('Error fetching statistics:', err);
            setError('Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [businessId, timeRange]);

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-8 rounded-2xl animate-pulse">
                        <div className="h-6 bg-muted/50 rounded w-1/4 mb-4"></div>
                        <div className="h-64 bg-muted/50 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-8 rounded-2xl border-destructive/20 bg-destructive/5">
                <p className="text-destructive font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Análisis Detallado</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Período:</span>
                    <div className="flex bg-muted/50 rounded-xl p-1">
                        {[
                            { value: '7d', label: '7 días' },
                            { value: '30d', label: '30 días' },
                            { value: '90d', label: '90 días' },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTimeRange(option.value as any)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                    timeRange === option.value
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Appointments Over Time */}
            <div className="glass-card p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        <Calendar size={20} />
                    </div>
                    <h3 className="text-xl font-bold">Citas a lo largo del tiempo</h3>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={12}
                                tick={{ fill: '#374151', fontWeight: 500 }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tick={{ fill: '#374151', fontWeight: 500 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--foreground))',
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="appointments"
                                stroke="#2563eb"
                                fill="#2563eb40"
                                fillOpacity={1}
                                name="Citas"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue and Clients */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="text-xl font-bold">Ingresos Diarios</h3>
                </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tick={{ fill: '#374151', fontWeight: 500 }}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tick={{ fill: '#374151', fontWeight: 500 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--foreground))',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'Ingresos']}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#059669"
                                    radius={[4, 4, 0, 0]}
                                    name="Ingresos"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                        <Users size={20} />
                    </div>
                    <h3 className="text-xl font-bold">Clientes por Día</h3>
                </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tick={{ fill: '#374151', fontWeight: 500 }}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tick={{ fill: '#374151', fontWeight: 500 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--foreground))',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="clients"
                                    stroke="#7c3aed"
                                    strokeWidth={3}
                                    dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
                                    name="Clientes únicos"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Appointment Status Distribution */}
            <div className="glass-card p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <Clock size={20} />
                    </div>
                    <h3 className="text-xl font-bold">Estado de las Citas</h3>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={{
                                    value: ({ percent }: any) => percent > 8 ? `${(percent * 100).toFixed(0)}%` : '',
                                    style: { fill: '#2563eb', fontSize: '11px', fontWeight: '700' }
                                }}
                                outerRadius={75}
                                innerRadius={30}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="#ffffff"
                                strokeWidth={2}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--foreground))',
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{
                                    paddingTop: '15px',
                                    fontSize: '11px',
                                    fontWeight: '500'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Summary */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    {statusData.map((status, index) => (
                        <div key={index} className="glass-card p-4 rounded-2xl relative overflow-hidden group">
                            <div className="absolute -bottom-4 -right-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform rotate-12">
                                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: status.color }} />
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div
                                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                                    style={{ backgroundColor: status.color }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{status.name}</p>
                                    <p className="text-xs text-muted-foreground font-medium">{status.value} citas</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}