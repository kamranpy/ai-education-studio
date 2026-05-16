import { Head, Link, usePage } from '@inertiajs/react';
import {
    create as examsCreate,
    index as examsIndex,
    show as examsShow,
} from '@/actions/App/Http/Controllers/Admin/ExamController';
import { index as usersIndex } from '@/actions/App/Http/Controllers/Admin/UserController';
import AdminLayout from '@/layouts/admin-layout';
import type { User } from '@/types/auth';

// ── Types ─────────────────────────────────────────────────────────────────────

type DashboardProps = {
    stats?: {
        totalExams: number;
        activeStudents: number;
        avgScore: number;
        creditsRemaining: number;
    };
    recentExams?: Array<{
        id: number;
        title: string;
        status: string;
        students_count: number;
        avg_score: number | null;
        created_at: string;
    }>;
};

// ── Bar chart data ────────────────────────────────────────────────────────────

const BAR_WEEKS = [
    { label: 'W1', height: '40%', secondary: false },
    { label: 'W2', height: '65%', secondary: false },
    { label: 'W3', height: '50%', secondary: false },
    { label: 'W4', height: '85%', secondary: false },
    { label: 'W5', height: '70%', secondary: true },
    { label: 'W6', height: '95%', secondary: false },
    { label: 'W7', height: '60%', secondary: false },
    { label: 'W8', height: '100%', secondary: true },
] as const;

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const upper = status.toUpperCase();

    let style: React.CSSProperties;

    if (upper === 'PUBLISHED') {
        style = {
            background: 'rgba(79, 219, 200, 0.1)',
            color: 'var(--brand-secondary)',
            border: '1px solid rgba(79, 219, 200, 0.2)',
        };
    } else if (upper === 'DRAFT') {
        style = {
            background: 'rgba(70, 69, 85, 0.3)',
            color: 'var(--portal-text-secondary)',
            border: '1px solid rgba(146, 143, 154, 0.2)',
        };
    } else {
        // CLOSED / anything else
        style = {
            background: 'rgba(147, 0, 10, 0.2)',
            color: 'var(--brand-error)',
            border: '1px solid rgba(255, 180, 171, 0.2)',
        };
    }

    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider"
            style={style}
        >
            {upper}
        </span>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// ── Dashboard page ────────────────────────────────────────────────────────────

function Dashboard({ stats, recentExams = [] }: DashboardProps) {
    const { props } = usePage<{ auth: { user: User } }>();
    const user = props.auth?.user;
    const userName = user?.name ?? 'Admin';

    const totalExams = stats?.totalExams ?? 0;
    const activeStudents = stats?.activeStudents ?? 0;
    const avgScore = stats?.avgScore ?? 0;
    const creditsRemaining = stats?.creditsRemaining ?? 0;

    return (
        <>
            <Head title="Dashboard" />

            <div className="p-8 space-y-8">
                {/* ── Page header ─────────────────────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1
                            className="text-2xl font-semibold"
                            style={{ color: 'var(--portal-text-primary)' }}
                        >
                            Dashboard
                        </h1>
                        <p
                            className="mt-1 text-sm"
                            style={{ color: 'var(--portal-text-secondary)' }}
                        >
                            Welcome back, {userName}. Here is your AI monitoring overview.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* Invite Student — outlined */}
                        <Link
                            href={usersIndex.url()}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{
                                border: '1px solid rgba(195, 192, 255, 0.3)',
                                color: 'var(--brand-primary-text)',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background =
                                    'rgba(195, 192, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: '18px',
                                    fontVariationSettings:
                                        "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                                }}
                            >
                                person_add
                            </span>
                            Invite Student
                        </Link>

                        {/* Create Exam — primary */}
                        <Link
                            href={examsCreate.url()}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{
                                background: 'var(--brand-primary-text)',
                                color: '#2c2a5e',
                                boxShadow: '0 4px 14px rgba(195, 192, 255, 0.15)',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.opacity = '0.9';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.opacity = '1';
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: '18px',
                                    fontVariationSettings:
                                        "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                                }}
                            >
                                add
                            </span>
                            Create Exam
                        </Link>
                    </div>
                </div>

                {/* ── Stat cards ──────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Exams */}
                    <div className="glass-card rounded-xl p-6 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(195, 192, 255, 0.1)' }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{
                                        color: 'var(--brand-primary-text)',
                                        fontSize: '20px',
                                        fontVariationSettings:
                                            "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                                    }}
                                >
                                    description
                                </span>
                            </div>
                            <span
                                className="flex items-center gap-1 text-xs font-bold"
                                style={{ color: 'var(--brand-secondary)' }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: '14px' }}
                                >
                                    trending_up
                                </span>
                                +12%
                            </span>
                        </div>
                        <div className="mt-2">
                            <p
                                className="text-[11px] font-semibold uppercase tracking-wider"
                                style={{ color: 'var(--portal-text-muted)' }}
                            >
                                Total Exams
                            </p>
                            <h3
                                className="text-2xl font-semibold mt-0.5"
                                style={{ color: 'var(--portal-text-primary)' }}
                            >
                                {totalExams}
                            </h3>
                        </div>
                    </div>

                    {/* Active Students */}
                    <div className="glass-card rounded-xl p-6 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(79, 219, 200, 0.1)' }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{
                                        color: 'var(--brand-secondary)',
                                        fontSize: '20px',
                                        fontVariationSettings:
                                            "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                                    }}
                                >
                                    group
                                </span>
                            </div>
                            {/* Animated pulse dot */}
                            <span
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--brand-secondary)',
                                    display: 'inline-block',
                                    animation: 'dashboardPulse 2s infinite',
                                    flexShrink: 0,
                                }}
                            />
                        </div>
                        <div className="mt-2">
                            <p
                                className="text-[11px] font-semibold uppercase tracking-wider"
                                style={{ color: 'var(--portal-text-muted)' }}
                            >
                                Active Students
                            </p>
                            <h3
                                className="text-2xl font-semibold mt-0.5"
                                style={{ color: 'var(--portal-text-primary)' }}
                            >
                                {activeStudents.toLocaleString()}
                            </h3>
                        </div>
                    </div>

                    {/* Avg Score */}
                    <div className="glass-card rounded-xl p-6 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(255, 182, 149, 0.1)' }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{
                                        color: 'var(--brand-tertiary)',
                                        fontSize: '20px',
                                        fontVariationSettings:
                                            "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                                    }}
                                >
                                    star
                                </span>
                            </div>
                            <span
                                className="text-xs font-bold"
                                style={{ color: 'var(--brand-secondary)' }}
                            >
                                Stable
                            </span>
                        </div>
                        <div className="mt-2">
                            <p
                                className="text-[11px] font-semibold uppercase tracking-wider"
                                style={{ color: 'var(--portal-text-muted)' }}
                            >
                                Avg Score
                            </p>
                            <h3
                                className="text-2xl font-semibold mt-0.5"
                                style={{ color: 'var(--portal-text-primary)' }}
                            >
                                {avgScore.toFixed(1)}%
                            </h3>
                        </div>
                    </div>

                    {/* Credits Remaining */}
                    <div className="glass-card rounded-xl p-6 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(255, 180, 171, 0.1)' }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{
                                        color: 'var(--brand-error)',
                                        fontSize: '20px',
                                        fontVariationSettings:
                                            "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                                    }}
                                >
                                    toll
                                </span>
                            </div>
                            <span
                                className="text-xs font-semibold"
                                style={{ color: 'var(--portal-text-muted)' }}
                            >
                                Replenish
                            </span>
                        </div>
                        <div className="mt-2">
                            <p
                                className="text-[11px] font-semibold uppercase tracking-wider"
                                style={{ color: 'var(--portal-text-muted)' }}
                            >
                                Credits Remaining
                            </p>
                            <h3
                                className="text-2xl font-semibold mt-0.5"
                                style={{ color: 'var(--portal-text-primary)' }}
                            >
                                {creditsRemaining.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* ── Bento: chart + AI utilization ───────────────────────── */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Bar chart — 8 col */}
                    <div className="col-span-12 lg:col-span-8 glass-card rounded-xl p-6">
                        {/* Chart header */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8">
                            <div>
                                <h4
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--portal-text-primary)' }}
                                >
                                    Exam Attempts — Last 8 Weeks
                                </h4>
                                <p
                                    className="text-[11px] mt-0.5"
                                    style={{ color: 'var(--portal-text-muted)' }}
                                >
                                    Activity trends across all active educational modules
                                </p>
                            </div>
                            {/* Legend */}
                            <div className="flex items-center gap-4 shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ background: 'var(--brand-primary-text)' }}
                                    />
                                    <span
                                        className="text-[11px]"
                                        style={{ color: 'var(--portal-text-muted)' }}
                                    >
                                        Attempts
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ background: 'var(--brand-secondary)' }}
                                    />
                                    <span
                                        className="text-[11px]"
                                        style={{ color: 'var(--portal-text-muted)' }}
                                    >
                                        Completion
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bars */}
                        <div className="h-64 flex items-end justify-between gap-2 pt-4">
                            {BAR_WEEKS.map((week) => (
                                <div
                                    key={week.label}
                                    className="flex-1 flex flex-col gap-1 items-center"
                                >
                                    <div
                                        className="w-full rounded-t-lg relative overflow-hidden"
                                        style={{
                                            height: week.height,
                                            background: 'rgba(195, 192, 255, 0.12)',
                                        }}
                                    >
                                        <div
                                            className="absolute bottom-0 w-full h-[75%]"
                                            style={{
                                                background: week.secondary
                                                    ? 'linear-gradient(to top, var(--brand-secondary), #71f8e4)'
                                                    : 'linear-gradient(to top, var(--brand-primary-text), #e3dfff)',
                                            }}
                                        />
                                    </div>
                                    <span
                                        className="text-[10px] font-semibold"
                                        style={{ color: 'var(--portal-text-muted)' }}
                                    >
                                        {week.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Utilization — 4 col */}
                    <div className="col-span-12 lg:col-span-4 glass-card rounded-xl p-6 flex flex-col justify-between overflow-hidden relative">
                        {/* Decorative blur blob */}
                        <div
                            className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full pointer-events-none"
                            style={{
                                background: 'rgba(195, 192, 255, 0.05)',
                                filter: 'blur(40px)',
                            }}
                        />

                        <div className="relative z-10">
                            <h4
                                className="text-base font-semibold"
                                style={{ color: 'var(--portal-text-primary)' }}
                            >
                                AI Utilization
                            </h4>
                            <p
                                className="text-[11px] mt-0.5"
                                style={{ color: 'var(--portal-text-muted)' }}
                            >
                                Model efficiency and credit burn rate
                            </p>
                        </div>

                        {/* Circular progress mock */}
                        <div className="relative flex items-center justify-center py-8 z-10">
                            <div
                                className="w-32 h-32 rounded-full flex items-center justify-center relative"
                                style={{
                                    border: '8px solid rgba(70, 69, 85, 0.2)',
                                }}
                            >
                                {/* Simulated arc via rotated border */}
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        border: '8px solid transparent',
                                        borderTopColor: 'var(--brand-secondary)',
                                        borderRightColor: 'var(--brand-secondary)',
                                        borderBottomColor: 'var(--brand-secondary)',
                                        borderLeftColor: 'rgba(79, 219, 200, 0.15)',
                                        transform: 'rotate(45deg)',
                                    }}
                                />
                                <div className="text-center relative z-10">
                                    <span
                                        className="text-2xl font-semibold"
                                        style={{ color: 'var(--portal-text-primary)' }}
                                    >
                                        74%
                                    </span>
                                    <p
                                        className="text-[11px]"
                                        style={{ color: 'var(--portal-text-muted)' }}
                                    >
                                        Optimal
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* System latency row */}
                        <div className="space-y-2 relative z-10">
                            <div className="flex items-center justify-between text-xs">
                                <span style={{ color: 'var(--portal-text-muted)' }}>
                                    System Latency
                                </span>
                                <span
                                    className="font-semibold"
                                    style={{ color: 'var(--brand-secondary)' }}
                                >
                                    42ms
                                </span>
                            </div>
                            <div
                                className="w-full h-1 rounded-full overflow-hidden"
                                style={{ background: 'rgba(70, 69, 85, 0.3)' }}
                            >
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: '80%',
                                        background: 'var(--brand-secondary)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Recent Exams table ───────────────────────────────────── */}
                <div className="glass-card rounded-xl overflow-hidden">
                    {/* Table header */}
                    <div
                        className="px-6 py-4 flex items-center justify-between"
                        style={{ borderBottom: '1px solid rgba(70, 69, 85, 0.3)' }}
                    >
                        <h4
                            className="text-base font-semibold"
                            style={{ color: 'var(--portal-text-primary)' }}
                        >
                            Recent Exams
                        </h4>
                        <Link
                            href={examsIndex.url()}
                            className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                            style={{ color: 'var(--brand-primary-text)' }}
                        >
                            View All Reports
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '16px' }}
                            >
                                arrow_forward
                            </span>
                        </Link>
                    </div>

                    {recentExams.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center py-16 gap-3"
                            style={{ color: 'var(--portal-text-muted)' }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '48px', opacity: 0.4 }}
                            >
                                description
                            </span>
                            <p className="text-sm">No exams yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr
                                        style={{
                                            background: 'rgba(42, 41, 45, 0.5)',
                                        }}
                                    >
                                        {[
                                            'Exam Name',
                                            'Status',
                                            'Students',
                                            'Avg Score',
                                            'Date',
                                            'Actions',
                                        ].map((col) => (
                                            <th
                                                key={col}
                                                className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider"
                                                style={{
                                                    color: 'var(--portal-text-muted)',
                                                }}
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody
                                    style={{
                                        borderTop: '1px solid rgba(70, 69, 85, 0.15)',
                                    }}
                                >
                                    {recentExams.map((exam) => (
                                        <tr
                                            key={exam.id}
                                            className="transition-colors"
                                            style={{
                                                borderBottom:
                                                    '1px solid rgba(70, 69, 85, 0.1)',
                                            }}
                                            onMouseEnter={(e) => {
                                                (
                                                    e.currentTarget as HTMLElement
                                                ).style.background =
                                                    'rgba(53, 52, 56, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                (
                                                    e.currentTarget as HTMLElement
                                                ).style.background = 'transparent';
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={examsShow.url(exam.id)}
                                                    className="text-sm font-medium transition-opacity hover:opacity-70"
                                                    style={{
                                                        color: 'var(--portal-text-primary)',
                                                    }}
                                                >
                                                    {exam.title}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={exam.status} />
                                            </td>
                                            <td
                                                className="px-6 py-4 text-sm"
                                                style={{
                                                    color: 'var(--portal-text-primary)',
                                                }}
                                            >
                                                {exam.students_count}
                                            </td>
                                            <td
                                                className="px-6 py-4 text-sm"
                                                style={{
                                                    color: 'var(--portal-text-primary)',
                                                }}
                                            >
                                                {exam.avg_score != null
                                                    ? `${exam.avg_score.toFixed(0)}%`
                                                    : '—'}
                                            </td>
                                            <td
                                                className="px-6 py-4 text-sm"
                                                style={{
                                                    color: 'var(--portal-text-muted)',
                                                }}
                                            >
                                                {formatDate(exam.created_at)}
                                            </td>
                                            <td
                                                className="px-6 py-4"
                                                style={{
                                                    color: 'var(--portal-text-muted)',
                                                }}
                                            >
                                                <button
                                                    className="transition-colors"
                                                    aria-label="More actions"
                                                    onMouseEnter={(e) => {
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.color =
                                                            'var(--brand-primary-text)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (
                                                            e.currentTarget as HTMLElement
                                                        ).style.color =
                                                            'var(--portal-text-muted)';
                                                    }}
                                                >
                                                    <span
                                                        className="material-symbols-outlined"
                                                        style={{
                                                            fontSize: '20px',
                                                            fontVariationSettings:
                                                                "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                                                        }}
                                                    >
                                                        more_vert
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Pulse animation for active students dot */}
            <style>{`
                @keyframes dashboardPulse {
                    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 219, 200, 0.7); }
                    70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(79, 219, 200, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 219, 200, 0); }
                }
            `}</style>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;
