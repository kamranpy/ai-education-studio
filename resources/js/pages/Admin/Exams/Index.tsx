import {
    index as examsIndex,
    create as examsCreate,
    show as examsShow,
    edit as examsEdit,
    publish as examsPublish,
    unpublish as examsUnpublish,
} from '@/actions/App/Http/Controllers/Admin/ExamController';
import { ExamStatusBadge } from '@/components/exam/exam-status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    FileText,
    MoreHorizontal,
    Search,
} from 'lucide-react';
import { useState } from 'react';

type ExamRecord = {
    id: number;
    title: string;
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

function ExamsIndex({
    exams,
    filters,
}: {
    exams: PaginatedExams;
    filters: Filters;
}) {
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

    return (
        <>
            <Head title="Exams" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Exams
                    </h1>
                    <Button asChild>
                        <Link href={examsCreate.url()}>+ New Exam</Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search exams..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={handleFilter}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">
                                Published
                            </SelectItem>
                            <SelectItem value="locked">Locked</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {exams.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                        <FileText className="mb-4 size-12 text-muted-foreground" />
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            No exams yet
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create your first exam to start assessing students.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={examsCreate.url()}>Create Exam</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead scope="col">
                                            Exam Name
                                        </TableHead>
                                        <TableHead scope="col">
                                            Questions
                                        </TableHead>
                                        <TableHead scope="col">
                                            Status
                                        </TableHead>
                                        <TableHead scope="col">
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exams.data.map((exam) => (
                                        <TableRow key={exam.id}>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={examsShow.url(
                                                        exam.id,
                                                    )}
                                                    className="hover:underline"
                                                >
                                                    {exam.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {exam.questions_count}
                                            </TableCell>
                                            <TableCell>
                                                <ExamStatusBadge
                                                    status={exam.status}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ExamRowActions
                                                    exam={exam}
                                                    onPublish={handlePublish}
                                                    onUnpublish={
                                                        handleUnpublish
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {exams.last_page > 1 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Showing{' '}
                                    {(exams.current_page - 1) *
                                        exams.per_page +
                                        1}
                                    –
                                    {Math.min(
                                        exams.current_page * exams.per_page,
                                        exams.total,
                                    )}{' '}
                                    of {exams.total}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!exams.prev_page_url}
                                        onClick={() =>
                                            exams.prev_page_url &&
                                            router.get(exams.prev_page_url)
                                        }
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!exams.next_page_url}
                                        onClick={() =>
                                            exams.next_page_url &&
                                            router.get(exams.next_page_url)
                                        }
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function ExamRowActions({
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
        if (confirmAction === 'publish') onPublish(exam);
        if (confirmAction === 'unpublish') onUnpublish(exam);
        setConfirmOpen(false);
    }

    const confirmMessages = {
        publish: {
            title: 'Publish Exam',
            description:
                'Publish this exam? Students will be able to see it.',
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
                    <Button variant="ghost" size="sm">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={examsShow.url(exam.id)}>View</Link>
                    </DropdownMenuItem>

                    {exam.status === 'draft' && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href={examsEdit.url(exam.id)}>
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => openConfirm('publish')}
                            >
                                Publish
                            </DropdownMenuItem>
                        </>
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
