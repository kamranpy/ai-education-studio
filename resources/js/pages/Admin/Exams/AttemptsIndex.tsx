import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Filter,
    Loader2,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import { index as examsIndex, show as examsShow } from '@/actions/App/Http/Controllers/Admin/ExamController';
import { show as attemptsShow } from '@/actions/App/Http/Controllers/Admin/ExamAttemptAdminController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';

interface Attempt {
    id: number;
    user: { id: string; name: string; email: string };
    status: string;
    submitted_at: string | null;
    score?: number | null;
    total_points?: number;
}

interface Props {
    exam: { id: number; title: string; status: string; passing_score: number };
    attempts: {
        data: Attempt[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: { status?: string; search?: string };
}

const statusTabs = [
    { value: '', label: 'All', count: null as number | null },
    { value: 'grading', label: 'Grading', count: null as number | null },
    { value: 'needs_review', label: 'Needs Review', count: null as number | null },
    { value: 'graded', label: 'Graded', count: null as number | null },
];

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'grading':
            return (
                <Badge className="gap-1 bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/30">
                    <Loader2 className="size-3 animate-spin" />
                    Grading
                </Badge>
            );
        case 'needs_review':
            return (
                <Badge className="bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30">
                    <AlertTriangle className="mr-1 size-3" />
                    Needs Review
                </Badge>
            );
        case 'graded':
            return (
                <Badge className="bg-brand-secondary/20 text-brand-secondary border-brand-secondary/30 hover:bg-brand-secondary/30">
                    <CheckCircle2 className="mr-1 size-3" />
                    Graded
                </Badge>
            );
        default:
            return <Badge className="bg-muted text-muted-foreground">{status}</Badge>;
    }
}

function ScoreBadge({ score, passingScore }: { score: number | null | undefined; passingScore: number }) {
    if (score === null || score === undefined) {
        return <span className="text-muted-foreground">—</span>;
    }
    const passed = score >= passingScore;
    return (
        <span className={`font-semibold ${passed ? 'text-brand-secondary' : 'text-destructive'}`}>
            {score.toFixed(1)}%
        </span>
    );
}

function AttemptsIndex({ exam, attempts, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');

    function handleFilter(status: string) {
        router.get(
            `/admin/exams/${exam.id}/attempts`,
            { status, search: searchTerm },
            { preserveState: true, replace: true },
        );
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            `/admin/exams/${exam.id}/attempts`,
            { status: filters.status, search: searchTerm },
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    <Link href={examsIndex.url()} className="hover:text-brand-primary transition-colors">
                        Exams
                    </Link>
                    <span className="text-brand-primary">/</span>
                    <Link href={examsShow.url(exam.id)} className="hover:text-brand-primary transition-colors">
                        {exam.title}
                    </Link>
                    <span className="text-brand-primary">/</span>
                    <span className="text-brand-primary">Attempts</span>
                </nav>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-card-foreground">
                            Attempts — {exam.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-brand-secondary" />
                            <span className="text-sm text-muted-foreground">
                                {attempts.total} student {attempts.total !== 1 ? 'attempts' : 'attempt'} recorded
                            </span>
                        </div>
                    </div>
                    <Button
                        className="bg-transparent border border-border text-muted-foreground hover:text-card-foreground hover:bg-muted"
                    >
                        <Download className="mr-2 size-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Status Tabs */}
                <div className="flex p-1 bg-muted rounded-xl gap-1">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => handleFilter(tab.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filters.status === tab.value || (!filters.status && !tab.value)
                                    ? 'bg-card text-card-foreground'
                                    : 'text-muted-foreground hover:text-card-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by student name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-muted border-border text-card-foreground placeholder:text-muted-foreground/50 focus:border-brand-primary"
                        />
                    </div>
                </form>
            </div>

            {/* Attempts Table */}
            <div className="rounded-xl overflow-hidden bg-card border border-border">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Student
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Status
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Submitted
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Score
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {attempts.data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                    <Filter className="mx-auto size-8 mb-3 opacity-50" />
                                    <p>No attempts found</p>
                                    <p className="text-sm mt-1">Try adjusting your filters</p>
                                </td>
                            </tr>
                        ) : (
                            attempts.data.map((attempt) => (
                                <tr
                                    key={attempt.id}
                                    className="border-b border-border hover:bg-muted/30 transition-colors"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center text-sm font-semibold text-brand-primary">
                                                {attempt.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-card-foreground">{attempt.user.name}</p>
                                                <p className="text-sm text-muted-foreground">{attempt.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={attempt.status} />
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">
                                        {attempt.submitted_at
                                            ? new Date(attempt.submitted_at).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <ScoreBadge score={attempt.score} passingScore={exam.passing_score} />
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/10"
                                        >
                                            <Link href={attemptsShow.url({ exam: exam.id, attempt: attempt.id })}>
                                                <Eye className="mr-2 size-4" />
                                                Review
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {attempts.last_page > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                        Page {attempts.current_page} of {attempts.last_page}
                    </p>
                    <div className="flex gap-2">
                        {attempts.links.map((link, idx) => {
                            if (idx === 0) {
                                return (
                                    <Button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className="bg-transparent border border-border text-muted-foreground hover:text-card-foreground hover:bg-muted disabled:opacity-30"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                );
                            }
                            if (idx === attempts.links.length - 1) {
                                return (
                                    <Button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className="bg-transparent border border-border text-muted-foreground hover:text-card-foreground hover:bg-muted disabled:opacity-30"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                );
                            }
                            return (
                                <Button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={
                                        link.active
                                            ? 'bg-brand-primary text-brand-surface'
                                            : 'bg-transparent border border-border text-muted-foreground hover:text-card-foreground hover:bg-muted'
                                    }
                                >
                                    {link.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}

AttemptsIndex.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AttemptsIndex;
