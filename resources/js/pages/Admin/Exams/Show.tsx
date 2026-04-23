import {
    index as examsIndex,
    edit as examsEdit,
    publish as examsPublish,
    unpublish as examsUnpublish,
} from '@/actions/App/Http/Controllers/Admin/ExamController';
import { ExamStatusBadge } from '@/components/exam/exam-status-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    CircleCheck,
    Clock,
    ListChecks,
    Lock,
    PenLine,
    Target,
} from 'lucide-react';
import { useState } from 'react';

type QuestionChoice = {
    id: number;
    text: string;
    is_correct: boolean;
};

type Question = {
    id: number;
    type: 'mcq' | 'true_false' | 'written_answer';
    text: string;
    points: number;
    grading_guidelines: string | null;
    order: number;
    choices: QuestionChoice[];
};

type Exam = {
    id: number;
    title: string;
    description: string | null;
    status: string;
    time_limit_minutes: number | null;
    passing_score: number;
    questions_count: number;
    questions: Question[];
    created_at: string;
};

function questionTypeIcon(type: string) {
    switch (type) {
        case 'mcq':
            return <ListChecks className="size-4" />;
        case 'true_false':
            return <CircleCheck className="size-4" />;
        case 'written_answer':
            return <PenLine className="size-4" />;
        default:
            return null;
    }
}

function questionTypeLabel(type: string) {
    switch (type) {
        case 'mcq':
            return 'Multiple Choice';
        case 'true_false':
            return 'True/False';
        case 'written_answer':
            return 'Written Answer';
        default:
            return type;
    }
}

function ExamShow({ exam }: { exam: Exam }) {
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
            router.post(examsPublish.url(exam.id));
        }
        if (confirmAction === 'unpublish') {
            router.post(examsUnpublish.url(exam.id));
        }
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
            <Head title={exam.title} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link
                                href={examsIndex.url()}
                                className="text-sm text-muted-foreground hover:underline"
                            >
                                Exams
                            </Link>
                            <span className="text-sm text-muted-foreground">
                                /
                            </span>
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                {exam.title}
                            </span>
                        </div>
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                            {exam.title}
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        {exam.status === 'draft' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={examsEdit.url(exam.id)}>
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    onClick={() => openConfirm('publish')}
                                >
                                    Publish
                                </Button>
                            </>
                        )}
                        {exam.status === 'published' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={examsEdit.url(exam.id)}>
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => openConfirm('unpublish')}
                                >
                                    Unpublish
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {exam.status === 'locked' && (
                    <Alert variant="destructive">
                        <Lock className="size-4" />
                        <AlertTitle>Exam Locked</AlertTitle>
                        <AlertDescription>
                            This exam has student attempts and cannot be
                            modified. You can still view questions and grading
                            guidelines.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <ExamStatusBadge status={exam.status} />
                    <span className="flex items-center gap-1.5">
                        <ListChecks className="size-4" />
                        {exam.questions_count} question
                        {exam.questions_count !== 1 ? 's' : ''}
                    </span>
                    {exam.time_limit_minutes && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="size-4" />
                            {exam.time_limit_minutes} min
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <Target className="size-4" />
                        Passing: {exam.passing_score}%
                    </span>
                </div>

                {exam.description && (
                    <div className="rounded-lg border p-6">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            Description
                        </h2>
                        <p className="mt-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">
                            {exam.description}
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                        Questions ({exam.questions.length})
                    </h2>

                    {exam.questions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No questions added yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {exam.questions.map((question, idx) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    index={idx}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

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

function QuestionCard({
    question,
    index,
}: {
    question: Question;
    index: number;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div className="rounded-lg border">
                <CollapsibleTrigger asChild>
                    <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                        <span className="flex items-center gap-2 text-muted-foreground">
                            {questionTypeIcon(question.type)}
                        </span>
                        <span className="flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Q{index + 1}: {question.text}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                            {questionTypeLabel(question.type)} &middot;{' '}
                            {question.points} pt
                            {question.points !== 1 ? 's' : ''}
                        </span>
                        <ChevronDown
                            className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="border-t px-4 py-4">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                            {question.text}
                        </p>

                        {question.type === 'mcq' &&
                            question.choices.length > 0 && (
                                <ul className="mt-3 space-y-1.5">
                                    {question.choices.map((choice, i) => (
                                        <li
                                            key={choice.id}
                                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                                                choice.is_correct
                                                    ? 'bg-emerald-50 font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                    : 'text-zinc-600 dark:text-zinc-400'
                                            }`}
                                        >
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {String.fromCharCode(
                                                    65 + i,
                                                )}
                                                .
                                            </span>
                                            {choice.text}
                                            {choice.is_correct && (
                                                <CircleCheck className="ml-auto size-4 text-emerald-600 dark:text-emerald-400" />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}

                        {question.type === 'true_false' && (
                            <div className="mt-3 text-sm">
                                <span className="text-muted-foreground">
                                    Correct answer:{' '}
                                </span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {question.choices.find((c) => c.is_correct)
                                        ?.text ?? '—'}
                                </span>
                            </div>
                        )}

                        {question.type === 'written_answer' &&
                            question.grading_guidelines && (
                                <div className="mt-3 rounded-md bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Grading Guidelines
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">
                                        {question.grading_guidelines}
                                    </p>
                                </div>
                            )}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

ExamShow.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default ExamShow;
