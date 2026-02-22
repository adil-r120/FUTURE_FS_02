import { useMemo } from "react";
import { Lead } from "@/types/lead";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Legend
} from "recharts";
import { BarChart3 } from "lucide-react";

interface AnalyticsViewProps {
    leads: Lead[];
}

const COLORS = ["#ff9f43", "#ffb8b8", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];

const AnalyticsView = ({ leads }: AnalyticsViewProps) => {
    if (leads.length === 0) {
        return (
            <div className="bg-card rounded-2xl border border-border/60 shadow-xl overflow-hidden animate-fade-in p-12 text-center h-[500px] flex flex-col items-center justify-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-6">
                    <BarChart3 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">Analytics will appear here</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    Once you've added your first lead and updated their status, conversion trends and source charts will automatically populate.
                </p>
            </div>
        );
    }

    const statusData = useMemo(() => {
        const counts = leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        }));
    }, [leads]);

    const sourceData = useMemo(() => {
        const counts = leads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        }));
    }, [leads]);

    const timelineData = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return d.toISOString().split("T")[0];
        });

        const counts = leads.reduce((acc, lead) => {
            const date = lead.createdAt.toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return last30Days.map(date => ({
            date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            count: counts[date] || 0
        }));
    }, [leads]);

    const metrics = useMemo(() => {
        const total = leads.length;
        const converted = leads.filter(l => l.status === "converted").length;
        const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0";

        // Weighted active leads (new + contacted)
        const active = leads.filter(l => l.status === "new" || l.status === "contacted").length;

        return [
            { label: "Total Leads", value: total, sub: "All time" },
            { label: "Conversion Rate", value: `${conversionRate}%`, sub: "Lead to Customer" },
            { label: "Active Pipeline", value: active, sub: "New & Contacted" },
            { label: "Lost Leads", value: leads.filter(l => l.status === "lost").length, sub: "Requires follow-up" }
        ];
    }, [leads]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m) => (
                    <div key={m.label} className="bg-card p-5 rounded-xl border border-border shadow-sm">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.label}</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">{m.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{m.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pipeline Status */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col h-[350px]">
                    <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Pipeline Status Breakdown
                    </h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                />
                                <Tooltip
                                    cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        borderColor: "hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        color: "hsl(var(--foreground))"
                                    }}
                                />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lead Sources */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Lead Sources Breakdown
                    </h3>
                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 min-h-0">
                        <div className="flex-1 w-full h-[220px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        dataKey="value"
                                        labelLine={false}
                                        label={({ percent }) => (
                                            percent > 0.05 ? (
                                                <text
                                                    fill="hsl(var(--foreground))"
                                                    fontSize={10}
                                                    fontWeight={600}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    {`${(percent * 100).toFixed(0)}%`}
                                                </text>
                                            ) : null
                                        )}
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "8px",
                                            fontSize: "10px"
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <p className="text-xl font-bold text-foreground leading-none">{leads.length}</p>
                                <p className="text-[9px] text-muted-foreground uppercase mt-0.5 tracking-wider">Total</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full sm:w-48 overflow-y-auto max-h-full pr-2">
                            {sourceData.sort((a, b) => b.value - a.value).map((item, idx) => {
                                const percent = ((item.value / leads.length) * 100).toFixed(0);
                                return (
                                    <div key={item.name} className="flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                            />
                                            <span className="text-muted-foreground truncate max-w-[70px]">{item.name}</span>
                                        </div>
                                        <div className="font-semibold text-foreground flex gap-2">
                                            <span>{item.value}</span>
                                            <span className="text-muted-foreground/60 w-7 text-right">{percent}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Lead Growth Trend */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm lg:col-span-2 flex flex-col h-[350px]">
                    <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Lead Acquisition Trend (Last 30 Days)
                    </h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                    interval={4}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        borderColor: "hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "12px"
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="hsl(var(--primary))"
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
