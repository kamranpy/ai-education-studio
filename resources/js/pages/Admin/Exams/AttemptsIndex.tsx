import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface Attempt {
    id: number;
    user: { id: string; name: string; email: string };
    status: string;
    submitted_at: string | null;
    answers?: Array<{
        final_score: number | null;
        question: { points: number };
    }>;
}

interface Props {
    exam: { id: number; title: string; status: string };
    attempts: {
        data: Attempt[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    filters: { status?: string };
}

const statusTabs = [
    { value: '', label: 'All' },
    { value: 'grading', label: 'Grading' },
    { value: 'needs_review', label: 'Needs review' },
    { value: 'graded', label: 'Graded' },
];

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'grading':
            return (
                <Badge variant="secondary" className="gap-1">
                    <Loader2 className="size-3 animate-spin" />
                    Grading
                </Badge>
            );
        case 'needs_review':
            return (
                <Badge
                    variant="destructive"
                    className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                    <AlertTriangle className="mr-1 size-3" />
                    Needs review
                </Badge>
            );
        case 'graded':
            return (
                <Badge variant="secondary">
                    <CheckCircle2 className="mr-1 size-3" />
                    Graded
                </Badge>
            );
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

function AttemptsIndex({ exam, attempts, filters }: Props) {
    function handleFilter(status: string) {
        router.get(
            `/admin/exams/${exam.id}/attempts`,
            status ? { status } : {},
            { preserveState: true, replace: true },
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Attempts — {exam.title}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {attempts.total} student attempt
                        {attempts.total !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <a
                        href={`/admin/exams/${exam.id}/attempts/export`}
                        download
                    >
                        <Download className="mr-2 size-4" />
                        Download CSV
                    </a>
                </Button>
            </div>

            {/* Status filter tabs */}
            <div className="mb-4 flex gap-1 rounded-lg border border-border bg-muted p-1">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => handleFilter(tab.value)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            (filters.status || '') === tab.value
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {attempts.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <CheckCircle2 className="mb-4 size-12 text-muted-foreground" />
                    <h2 className="text-xl font-semibold text-foreground">
                        No attempts yet
                    </h2>
                    <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                        Once students submit this exam, their attempts and
                        AI grades will appear here.
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Score
                                </TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attempts.data.map((attempt) => (
                                <TableRow key={attempt.id}>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {attempt.user.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {attempt.user.email}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {attempt.submitted_at
                                            ? new Date(
                                                  attempt.submitted_at,
                                              ).toLocaleDateString(
                                                  undefined,
                                                  {
                                                      month: 'short',
                                                      day: 'numeric',
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                  },
                                              )
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge
                                            status={attempt.status}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                        —
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/admin/exams/${exam.id}/attempts/${attempt.id}`}
                                            className="text-sm font-medium text-primary hover:underline"
                                        >
                                            Review
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination */}
            {attempts.links && attempts.links.length > 3 && (
                <div className="mt-4 flex justify-center gap-1">
                    {attempts.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`rounded-md px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'bg-primary text-primary-foreground'
                                    : link.url
                                      ? 'text-muted-foreground hover:bg-muted'
                                      : 'pointer-events-none text-muted-foreground/50'
                            }`}
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

AttemptsIndex.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AttemptsIndex;
