import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Add,
    ChevronLeft,
    ChevronRight,
    Description,
    Event,
    FilterList,
    Quiz,
    Search,
    Sort,
    Warning,
} from '@material-symbols-svg/react';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import {
    index as examsIndex,
    create as examsCreate,
    show as examsShow,
    edit as examsEdit,
    publish as examsPublish,
    unpublish as examsUnpublish,
} from '@/actions/App/Http/Controllers/Admin/ExamController';
import { index as billingIndex } from '@/actions/App/Http/Controllers/Institute/BillingController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';

// ── Pulse animation for ACTIVE status ────────────────────────────────────────
const pulseStyle = `
@keyframes statusPulse {
    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79,219,200,0.7); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 6px rgba(79,219,200,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79,219,200,0); }
}
.status-pulse {
    width: 8px; height: 8px; border-radius: 50%;
    background-color: var(--brand-secondary);
    animation: statusPulse 2s infinite;
}
`;

type ExamRecord = {
    id: number;
    title: string;
    class_name: string | null;
    subject_name: string | null;
    status: string;
    questions_count: number;
    time_limit_minutes: number | null;
    passing_score: number;
    created_at: string;
};

type PaginatedExams = {
    data: ExamRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Filters = {
    search?: string;
    status?: string;
};

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();

    if (s === 'published') {
        return (
            <div
                className="flex items-center gap-2 px-3 py-1 rounded-lg"
                style={{ background: 'rgba(79,219,200,0.1)' }}
            >
                <span className="status-pulse" />
                <span
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: 'var(--brand-secondary)' }}
                >
                    ACTIVE
                </span>
            </div>
        );
    }

    if (s === 'locked') {
        return (
            <div
                className="flex items-center gap-2 px-3 py-1 rounded-lg"
                style={{ background: 'rgba(255,180,171,0.2)' }}
            >
                <span
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: 'var(--brand-error)' }}
                >
                    COMPLETED
                </span>
            </div>
        );
    }

    // draft / scheduled / fallback
    return (
        <div
            className="flex items-center gap-2 px-3 py-1 rounded-lg"
            style={{ background: 'rgba(53,52,62,0.6)' }}
        >
            <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--portal-text-muted)' }}
            >
                {s === 'draft' ? 'DRAFT' : status.toUpperCase()}
            </span>
        </div>
    );
}

// ── Subject tag pill ──────────────────────────────────────────────────────────

function SubjectTag({ label }: { label: string }) {
    return (
        <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase"
            style={{
                color: 'var(--brand-primary-text)',
                border: '1px solid rgba(195,192,255,0.3)',
                background: 'rgba(195,192,255,0.05)',
            }}
        >
            {label}
        </span>
    );
}

// ── Exam card ─────────────────────────────────────────────────────────────────

function ExamCard({
    exam,
    onPublish,
    onUnpublish,
}: {
    exam: ExamRecord;
    onPublish: (exam: ExamRecord) => void;
    onUnpublish: (exam: ExamRecord) => void;
}) {
    const subjectLabel = exam.subject_name ?? exam.class_name ?? 'Exam';
    const dateLabel = exam.created_at
        ? new Date(exam.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : '—';

    return (
        <div
            className="glass-card p-8 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(195,192,255,0.15)] relative overflow-hidden"
        >
            {/* Card header */}
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <SubjectTag label={subjectLabel} />
                    <h3
                        className="text-xl font-semibold leading-tight"
                        style={{ color: 'var(--portal-text-primary)' }}
                    >
                        <Link
                            href={examsShow.url(exam.id)}
                            className="hover:underline"
                        >
                            {exam.title}
                        </Link>
                    </h3>
                </div>
                <StatusBadge status={exam.status} />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                    <p
                        className="text-xs font-semibold tracking-wider uppercase"
                        style={{ color: 'var(--portal-text-muted)' }}
                    >
                        Questions
                    </p>
                    <div className="flex items-center gap-2">
                        <Quiz className="size-5" style={{ color: 'var(--brand-primary-text)' }} />
                        <span
                            className="text-xl font-medium"
                            style={{ color: 'var(--portal-text-primary)' }}
                        >
                            {exam.questions_count}
                        </span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p
                        className="text-xs font-semibold tracking-wider uppercase"
                        style={{ color: 'var(--portal-text-muted)' }}
                    >
                        Created
                    </p>
                    <div className="flex items-center gap-2">
                        <Event className="size-5" style={{ color: 'var(--brand-primary-text)' }} />
                        <span
                            className="text-xl font-medium"
                            style={{ color: 'var(--portal-text-primary)' }}
                        >
                            {dateLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Card footer */}
            <div
                className="flex gap-3 pt-6"
                style={{ borderTop: '1px solid rgba(146,143,154,0.1)' }}
            >
                <Link
                    href={examsShow.url(exam.id)}
                    className="flex-1 py-2 rounded-lg text-center text-sm font-bold transition-opacity hover:opacity-90"
                    style={{
                        background: 'var(--brand-primary)',
                        color: 'var(--brand-primary-text)',
                    }}
                >
                    View
                </Link>
                <Link
                    href={examsEdit.url(exam.id)}
                    className="px-4 py-2 rounded-lg text-sm font-bold transition-colors hover:opacity-80"
                    style={{
                        border: '1px solid rgba(146,143,154,0.3)',
                        color: 'var(--portal-text-secondary)',
                    }}
                >
                    Edit
                </Link>
                <ExamCardActions
                    exam={exam}
                    onPublish={onPublish}
                    onUnpublish={onUnpublish}
                />
            </div>
        </div>
    );
}

// ── Pagination helpers ────────────────────────────────────────────────────────

function buildPageNumbers(current: number, last: number): (number | '...')[] {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (current > 3) {
pages.push('...');
}

    for (let p = Math.max(2, current - 1); p <= Math.min(last - 1, current + 1); p++) {
        pages.push(p);
    }

    if (current < last - 2) {
pages.push('...');
}

    pages.push(last);

    return pages;
}

function ExamsIndex({
    exams,
    filters,
}: {
    exams: PaginatedExams;
    filters: Filters;
}) {
    const { auth } = usePage<{ auth: { user: { institute?: { credits: number } } } }>().props;
    const credits = auth?.user?.institute?.credits ?? 0;
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(value: string) {
        setSearch(value);
        router.get(
            examsIndex.url({
                query: {
                    search: value || undefined,
                    status: filters.status,
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
    }

    function handleFilter(value: string) {
        router.get(
            examsIndex.url({
                query: {
                    search: filters.search,
                    status: value === 'all' ? undefined : value,
                },
            }),
            {},
            { preserveState: true, replace: true },
        );
    }

    function handlePublish(exam: ExamRecord) {
        router.post(examsPublish.url(exam.id));
    }

    function handleUnpublish(exam: ExamRecord) {
        router.post(examsUnpublish.url(exam.id));
    }

    function goToPage(page: number) {
        router.get(
            examsIndex.url({ query: { search: filters.search, status: filters.status, page } }),
            {},
            { preserveState: true, replace: true },
        );
    }

    const pageNumbers = buildPageNumbers(exams.current_page, exams.last_page);
    const showingFrom = exams.total === 0 ? 0 : (exams.current_page - 1) * exams.per_page + 1;
    const showingTo = Math.min(exams.current_page * exams.per_page, exams.total);

    return (
        <>
            <Head title="Exams" />
            {/* Inject pulse keyframes */}
            <style>{pulseStyle}</style>

            <div className="p-6 space-y-6">
                {/* Page header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1
                            className="text-2xl font-semibold"
                            style={{ color: 'var(--portal-text-primary)' }}
                        >
                            Exams
                        </h1>
                        <p
                            className="mt-1 text-sm"
                            style={{ color: 'var(--portal-text-secondary)' }}
                        >
                            Manage and monitor academic performance via AI-proctored sessions.
                        </p>
                    </div>
                    <Link
                        href={examsCreate.url()}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg"
                        style={{
                            background: 'var(--brand-primary)',
                            color: 'var(--brand-primary-text)',
                        }}
                    >
                        <Add className="size-4" />
                        Create Exam
                    </Link>
                </div>

                {/* Zero-credits warning */}
                {credits <= 0 && (
                    <div
                        className="glass-card rounded-xl p-4 flex items-start gap-3"
                        style={{ borderColor: 'rgba(255,182,149,0.3)' }}
                    >
                        <Warning className="mt-0.5 shrink-0 size-5" style={{ color: 'var(--brand-tertiary)' }} />
                        <div>
                            <p
                                className="text-sm font-semibold"
                                style={{ color: 'var(--brand-tertiary)' }}
                            >
                                Your institute has 0 exam credits remaining.
                            </p>
                            <p
                                className="mt-1 text-sm"
                                style={{ color: 'var(--portal-text-secondary)' }}
                            >
                                Students will not be able to start new exams until you purchase a credit package.{' '}
                                <Link
                                    href={billingIndex.url()}
                                    className="font-semibold underline hover:no-underline"
                                    style={{ color: 'var(--brand-tertiary)' }}
                                >
                                    Go to Billing →
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                {/* Filter bar */}
                <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span
                            className="text-xs font-semibold tracking-wider uppercase"
                            style={{ color: 'var(--portal-text-muted)' }}
                        >
                            Status:
                        </span>
                        <Select
                            value={filters.status ?? 'all'}
                            onValueChange={handleFilter}
                        >
                            <SelectTrigger
                                className="h-8 text-xs border-0 rounded-lg px-3"
                                style={{
                                    background: 'var(--portal-input-bg)',
                                    color: 'var(--portal-text-primary)',
                                    border: '1px solid var(--portal-input-border)',
                                }}
                            >
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="locked">Locked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className="text-xs font-semibold tracking-wider uppercase"
                            style={{ color: 'var(--portal-text-muted)' }}
                        >
                            Search:
                        </span>
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4" style={{ color: 'var(--portal-text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search exams..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="h-8 pl-8 pr-3 rounded-lg text-xs outline-none transition-all"
                                style={{
                                    background: 'var(--portal-input-bg)',
                                    border: '1px solid var(--portal-input-border)',
                                    color: 'var(--portal-text-primary)',
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                            style={{ color: 'var(--portal-text-muted)' }}
                        >
                            <FilterList className="size-4" />
                            More Filters
                        </button>
                        <div
                            className="h-5 w-px"
                            style={{ background: 'var(--portal-divider)' }}
                        />
                        <button
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                            style={{ color: 'var(--portal-text-muted)' }}
                        >
                            <Sort className="size-4" />
                            Latest First
                        </button>
                    </div>
                </div>

                {/* Exam cards grid / empty state */}
                {exams.data.length === 0 ? (
                    <div
                        className="rounded-2xl flex flex-col items-center justify-center p-16 transition-all duration-300"
                        style={{
                            border: '2px dashed rgba(146,143,154,0.2)',
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                            style={{ background: 'rgba(53,52,62,0.6)' }}
                        >
                            <Description
                                className="size-10"
                                style={{ color: 'var(--brand-primary-text)' }}
                            />
                        </div>
                        <h2
                            className="text-xl font-semibold mb-2"
                            style={{ color: 'var(--portal-text-primary)' }}
                        >
                            No exams yet
                        </h2>
                        <p
                            className="text-sm text-center max-w-xs mb-6"
                            style={{ color: 'var(--portal-text-secondary)' }}
                        >
                            Start building your next assessment or import from a template.
                        </p>
                        <Link
                            href={examsCreate.url()}
                            className="px-6 py-2 rounded-lg text-sm font-bold transition-colors hover:opacity-80"
                            style={{
                                border: '1px solid var(--brand-primary)',
                                color: 'var(--brand-primary-text)',
                            }}
                        >
                            Quick Create
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {exams.data.map((exam) => (
                                <ExamCard
                                    key={exam.id}
                                    exam={exam}
                                    onPublish={handlePublish}
                                    onUnpublish={handleUnpublish}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {exams.last_page > 1 && (
                            <div
                                className="flex items-center justify-between pt-6"
                                style={{ borderTop: '1px solid rgba(146,143,154,0.1)' }}
                            >
                                <p
                                    className="text-xs font-semibold"
                                    style={{ color: 'var(--portal-text-muted)' }}
                                >
                                    Showing{' '}
                                    <span style={{ color: 'var(--portal-text-primary)', fontWeight: 700 }}>
                                        {showingFrom}–{showingTo}
                                    </span>{' '}
                                    of{' '}
                                    <span style={{ color: 'var(--portal-text-primary)', fontWeight: 700 }}>
                                        {exams.total}
                                    </span>{' '}
                                    exams
                                </p>

                                <div className="flex items-center gap-2">
                                    {/* Prev */}
                                    <button
                                        disabled={!exams.prev_page_url}
                                        onClick={() =>
                                            exams.prev_page_url &&
                                            router.get(exams.prev_page_url)
                                        }
                                        className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                                        style={{
                                            border: '1px solid rgba(146,143,154,0.3)',
                                            color: 'var(--portal-text-muted)',
                                        }}
                                    >
                                        <ChevronLeft className="size-5" />
                                    </button>

                                    {/* Page numbers */}
                                    <div className="flex items-center gap-1">
                                        {pageNumbers.map((p, i) =>
                                            p === '...' ? (
                                                <span
                                                    key={`ellipsis-${i}`}
                                                    className="px-2 text-sm"
                                                    style={{ color: 'var(--portal-text-muted)' }}
                                                >
                                                    ...
                                                </span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    onClick={() => goToPage(p as number)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-sm transition-colors"
                                                    style={
                                                        p === exams.current_page
                                                            ? {
                                                                  background: 'var(--brand-primary)',
                                                                  color: 'var(--brand-primary-text)',
                                                                  fontWeight: 700,
                                                              }
                                                            : {
                                                                  color: 'var(--portal-text-muted)',
                                                              }
                                                    }
                                                >
                                                    {p}
                                                </button>
                                            ),
                                        )}
                                    </div>

                                    {/* Next */}
                                    <button
                                        disabled={!exams.next_page_url}
                                        onClick={() =>
                                            exams.next_page_url &&
                                            router.get(exams.next_page_url)
                                        }
                                        className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                                        style={{
                                            border: '1px solid rgba(146,143,154,0.3)',
                                            color: 'var(--portal-text-muted)',
                                        }}
                                    >
                                        <ChevronRight className="size-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function ExamCardActions({
    exam,
    onPublish,
    onUnpublish,
}: {
    exam: ExamRecord;
    onPublish: (exam: ExamRecord) => void;
    onUnpublish: (exam: ExamRecord) => void;
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<
        'publish' | 'unpublish' | null
    >(null);

    function openConfirm(action: 'publish' | 'unpublish') {
        setConfirmAction(action);
        setConfirmOpen(true);
    }

    function executeConfirm() {
        if (confirmAction === 'publish') {
            onPublish(exam);
        }

        if (confirmAction === 'unpublish') {
            onUnpublish(exam);
        }

        setConfirmOpen(false);
    }

    const confirmMessages = {
        publish: {
            title: 'Publish Exam',
            description: 'Publish this exam? Students will be able to see it.',
        },
        unpublish: {
            title: 'Unpublish Exam',
            description:
                'Unpublish this exam? Active student attempts will not be affected.',
        },
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="px-2"
                        style={{ color: 'var(--portal-text-muted)' }}
                    >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">More actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {exam.status === 'draft' && (
                        <DropdownMenuItem
                            onClick={() => openConfirm('publish')}
                        >
                            Publish
                        </DropdownMenuItem>
                    )}
                    {exam.status === 'published' && (
                        <DropdownMenuItem
                            onClick={() => openConfirm('unpublish')}
                        >
                            Unpublish
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {confirmAction
                                ? confirmMessages[confirmAction].title
                                : ''}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmAction
                                ? confirmMessages[confirmAction].description
                                : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={executeConfirm}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ExamsIndex.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default ExamsIndex;
