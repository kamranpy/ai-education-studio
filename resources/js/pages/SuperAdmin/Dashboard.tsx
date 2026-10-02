import { router } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardList,
    Download,
    School,
    TrendingUp,
    Wallet,
} from 'lucide-react';
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
    AreaChart,
    Area,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/super-admin-layout';

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
    if (cents >= 100000) {
return `${(cents / 100000).toFixed(1)}k`;
}

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

    return (
        <div className="w-full">
            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        Global Analytics
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Real-time system performance and financial metrics.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <CalendarDays className="size-4" />
                            Last 30 Days
                        </Button>
                    </div>
                    <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Download className="size-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Institutes */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                                <School className="size-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                            Total Institutes
                        </p>
                        <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {stats.total_institutes.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Exams */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                                <ClipboardList className="size-5 text-slate-600 dark:text-slate-400" />
                            </div>
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                            Total Exams
                        </p>
                        <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {stats.total_exams.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Revenue */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                                <TrendingUp className="size-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                            Total Revenue
                        </p>
                        <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(stats.total_revenue_cents)}
                        </p>
                    </CardContent>
                </Card>

                {/* Credits Sold */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                                <Wallet className="size-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                            Credits Sold
                        </p>
                        <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {stats.total_credits_sold.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts - 3 Column Layout */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Exams Over Time */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Exams Over Time</CardTitle>
                        <CardDescription>
                            Activity trends for the last 30 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={charts.exams_over_time}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                    vertical={false}
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
                                    radius={[4, 4, 0, 0]}
                                    name="Exams"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Revenue Over Time */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Revenue Over Time</CardTitle>
                        <CardDescription>
                            Financial growth in USD
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={charts.revenue_over_time}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                    vertical={false}
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
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    name="Revenue"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Institutes Over Time */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Institutes Over Time</CardTitle>
                        <CardDescription>
                            New institutes registered per day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={charts.institutes_over_time}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                    vertical={false}
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
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
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
