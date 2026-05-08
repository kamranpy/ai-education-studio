import SuperAdminLayout from '@/layouts/super-admin-layout';
import { router } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    Building2,
    ClipboardList,
    CreditCard,
    TrendingUp,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ChartPoint {
    date: string;
    count?: number;
    revenue?: number;
}

interface Stats {
    total_institutes: number;
    total_exams: number;
    total_revenue_cents: number;
    total_credits_sold: number;
}

interface Charts {
    exams_over_time: ChartPoint[];
    revenue_over_time: ChartPoint[];
    institutes_over_time: ChartPoint[];
}

interface Props {
    stats: Stats;
    charts: Charts;
    range: string;
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(cents / 100);
}

function formatRevenueTick(cents: number): string {
    if (cents >= 100000) return `${(cents / 100000).toFixed(1)}k`;
    return `${(cents / 100).toFixed(0)}`;
}

function Dashboard({ stats, charts, range }: Props) {
    function handleRangeChange(value: string) {
        router.get(
            window.location.pathname,
            { range: value },
            { preserveState: true, replace: true },
        );
    }

    const statCards = [
        {
            title: 'Total Institutes',
            value: stats.total_institutes.toLocaleString(),
            description: 'All time',
            icon: Building2,
        },
        {
            title: 'Exams Run',
            value: stats.total_exams.toLocaleString(),
            description: 'Submitted or graded',
            icon: ClipboardList,
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.total_revenue_cents),
            description: 'Stripe purchases only',
            icon: TrendingUp,
        },
        {
            title: 'Credits Sold',
            value: stats.total_credits_sold.toLocaleString(),
            description: 'Via Stripe purchases',
            icon: CreditCard,
        },
    ];

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Analytics
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Platform-wide metrics across all institutes.
                    </p>
                </div>
                <Select value={range} onValueChange={handleRangeChange}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stat Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <card.icon className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {card.value}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="space-y-6">
                {/* Exams Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exams Run Over Time</CardTitle>
                        <CardDescription>
                            Submitted and graded exam attempts per day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={charts.exams_over_time}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 12,
                                        borderRadius: 6,
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Exams"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Revenue Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Over Time</CardTitle>
                        <CardDescription>
                            Stripe purchase revenue per day (USD)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={charts.revenue_over_time}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={formatRevenueTick}
                                />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 12,
                                        borderRadius: 6,
                                    }}
                                    formatter={(value) => [
                                        formatCurrency(Number(value)),
                                        'Revenue',
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Revenue"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* New Institutes Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle>New Institutes Over Time</CardTitle>
                        <CardDescription>
                            Institutes registered per day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={charts.institutes_over_time}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 12,
                                        borderRadius: 6,
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#6366f1"
                                    radius={[3, 3, 0, 0]}
                                    name="Institutes"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <SuperAdminLayout>{page}</SuperAdminLayout>
);

export default Dashboard;
