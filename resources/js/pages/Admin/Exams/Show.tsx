import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    ChevronDown,
    Clock,
    Copy,
    Edit3,
    Eye,
    ListChecks,
    Lock,
    PenLine,
    Target,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { index as attemptsIndex } from '@/actions/App/Http/Controllers/Admin/ExamAttemptAdminController';
import {
    index as examsIndex,
    edit as examsEdit,
    publish as examsPublish,
    unpublish as examsUnpublish,
    announceResults as examsAnnounceResults,
} from '@/actions/App/Http/Controllers/Admin/ExamController';
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
import AdminLayout from '@/layouts/admin-layout';

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
    class_name: string | null;
    subject_name: string | null;
    status: string;
    time_limit_minutes: number | null;
    passing_score: number;
    evaluation_strategy: 'instant' | 'manual';
    results_announced_at: string | null;
    questions_count: number;
    attempts_count?: number;
    questions: Question[];
    created_at: string;
};

function questionTypeIcon(type: string) {
    switch (type) {
        case 'mcq':
            return <ListChecks className="size-4" />;
        case 'true_false':
            return <CheckCircle2 className="size-4" />;
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

function questionTypeColor(type: string) {
    switch (type) {
        case 'mcq':
        case 'true_false':
            return 'bg-brand-secondary/20 text-brand-secondary border-brand-secondary/30';
        case 'written_answer':
            return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/30';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

function statusColor(status: string) {
    switch (status) {
        case 'published':
            return 'bg-brand-secondary/20 text-brand-secondary border-brand-secondary/30';
        case 'draft':
            return 'bg-brand-primary/20 text-brand-primary border-brand-primary/30';
        case 'locked':
            return 'bg-destructive/20 text-destructive border-destructive/30';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

function statusLabel(status: string) {
    switch (status) {
        case 'published':
            return 'Published';
        case 'draft':
            return 'Draft';
        case 'locked':
            return 'Locked';
        default:
            return status;
    }
}

// Status pulse animation style
const statusPulseStyle = `
@keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 219, 200, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(79, 219, 200, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 219, 200, 0); }
}
.status-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4fdbc8;
    box-shadow: 0 0 0 0 rgba(79, 219, 200, 0.7);
    animation: pulse 2s infinite;
}
`;

function ExamShow({ exam }: { exam: Exam }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<
        'publish' | 'unpublish' | 'announce' | null
    >(null);

    function openConfirm(action: 'publish' | 'unpublish' | 'announce') {
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

        if (confirmAction === 'announce') {
            router.post(examsAnnounceResults.url(exam.id));
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
        announce: {
            title: 'Announce Results',
            description:
                'Announce results for this exam? Students will immediately be able to see their scores.',
        },
    };

    return (
        <>
            <style>{statusPulseStyle}</style>
            <Head title={exam.title} />

            {/* Breadcrumb & Header */}
            <div className="mb-8">
                <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    <Link href={examsIndex.url()} className="hover:text-brand-primary transition-colors">
                        Exams
                    </Link>
                    <span className="text-brand-primary">/</span>
                    <span className="text-brand-primary">{exam.title}</span>
                </nav>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-semibold text-card-foreground">{exam.title}</h1>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold uppercase border ${statusColor(exam.status)}`}>
                                {exam.status === 'published' && <div className="status-pulse" />}
                                {statusLabel(exam.status)}
                            </span>
                        </div>
                        {exam.description && (
                            <p className="text-muted-foreground max-w-2xl">{exam.description}</p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            asChild
                            className="bg-transparent border border-border text-muted-foreground hover:text-card-foreground hover:bg-muted"
                        >
                            <Link href={examsEdit.url(exam.id)}>
                                <Edit3 className="mr-2 size-4" />
                                Edit Exam
                            </Link>
                        </Button>
                        {exam.status === 'draft' && (
                            <Button
                                onClick={() => openConfirm('publish')}
                                className="bg-brand-primary text-brand-surface hover:opacity-90"
                            >
                                Publish Exam
                            </Button>
                        )}
                        {exam.status === 'published' && (
                            <Button
                                onClick={() => openConfirm('unpublish')}
                                className="bg-transparent border border-destructive/40 text-destructive hover:bg-destructive/10"
                            >
                                Unpublish
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Main Content */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Locked Alert */}
                    {exam.status === 'locked' && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
                            <Lock className="size-5 text-destructive shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-destructive">Exam Locked</h4>
                                <p className="text-sm text-muted-foreground">
                                    This exam has student attempts and cannot be modified. You can still view questions and grading guidelines.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Exam Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-xl p-4 bg-card border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <ListChecks className="size-4 text-brand-primary" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Questions</span>
                            </div>
                            <p className="text-2xl font-semibold text-card-foreground">{exam.questions_count}</p>
                        </div>
                        <div className="rounded-xl p-4 bg-card border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="size-4 text-brand-secondary" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Passing</span>
                            </div>
                            <p className="text-2xl font-semibold text-card-foreground">{exam.passing_score}%</p>
                        </div>
                        <div className="rounded-xl p-4 bg-card border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="size-4 text-amber-500" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Time Limit</span>
                            </div>
                            <p className="text-2xl font-semibold text-card-foreground">
                                {exam.time_limit_minutes ? `${exam.time_limit_minutes}m` : '—'}
                            </p>
                        </div>
                        <div className="rounded-xl p-4 bg-card border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="size-4 text-brand-tertiary" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Attempts</span>
                            </div>
                            <p className="text-2xl font-semibold text-card-foreground">{exam.attempts_count ?? 0}</p>
                        </div>
                    </div>

                    {/* Manual Evaluation Alert */}
                    {exam.evaluation_strategy === 'manual' &&
                        !exam.results_announced_at &&
                        exam.status !== 'draft' && (
                            <div className="rounded-xl border border-amber-300/30 bg-amber-100/50 dark:bg-amber-900/20 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                            Manual Evaluation Mode
                                        </h3>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Results are hidden from students until you announce them.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => openConfirm('announce')}
                                        className="bg-amber-400 text-amber-950 hover:bg-amber-500 shrink-0"
                                    >
                                        Announce Results
                                    </Button>
                                </div>
                            </div>
                        )}

                    {/* Questions List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-card-foreground">Questions</h2>
                        {exam.questions.length === 0 ? (
                            <p className="text-muted-foreground">No questions added yet.</p>
                        ) : (
                            <div className="space-y-3">
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

                {/* Right Column - Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Quick Actions */}
                    <div className="rounded-2xl p-5 space-y-4 bg-card border border-border">
                        <h3 className="text-lg font-semibold text-card-foreground">Quick Actions</h3>
                        <div className="space-y-2">
                            <Button
                                asChild
                                className="w-full justify-start bg-transparent border border-border text-muted-foreground hover:text-card-foreground hover:bg-muted"
                            >
                                <Link href={attemptsIndex.url({ exam: exam.id })}>
                                    <Eye className="mr-2 size-4" />
                                    View Attempts
                                </Link>
                            </Button>
                            <Button
                                className="w-full justify-start bg-transparent border border-border text-muted-foreground hover:text-card-foreground hover:bg-muted"
                                onClick={() => navigator.clipboard.writeText(window.location.href)}
                            >
                                <Copy className="mr-2 size-4" />
                                Copy Link
                            </Button>
                        </div>
                    </div>

                    {/* Exam Details */}
                    <div className="rounded-2xl p-5 space-y-4 bg-card border border-border">
                        <h3 className="text-lg font-semibold text-card-foreground">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Evaluation</span>
                                <span className="text-card-foreground">
                                    {exam.evaluation_strategy === 'instant' ? 'Instant' : 'Manual'}
                                </span>
                            </div>
                            {exam.class_name && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Class</span>
                                    <span className="text-card-foreground">{exam.class_name}</span>
                                </div>
                            )}
                            {exam.subject_name && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subject</span>
                                    <span className="text-card-foreground">{exam.subject_name}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span className="text-card-foreground">
                                    {new Date(exam.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {exam.results_announced_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Results Announced</span>
                                    <span className="text-brand-secondary">
                                        {new Date(exam.results_announced_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="bg-card border-border text-card-foreground">
                    <DialogHeader>
                        <DialogTitle>
                            {confirmAction ? confirmMessages[confirmAction].title : ''}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {confirmAction ? confirmMessages[confirmAction].description : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="bg-transparent border border-border text-muted-foreground hover:text-card-foreground hover:bg-muted">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button onClick={executeConfirm} className="bg-brand-primary text-brand-surface">
                            Confirm
                        </Button>
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
        <div className="rounded-xl overflow-hidden bg-card border border-border">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50"
            >
                <span className="flex items-center gap-2 text-muted-foreground">
                    {questionTypeIcon(question.type)}
                </span>
                <span className="flex-1 truncate text-sm font-medium text-card-foreground">
                    Q{index + 1}: {question.text}
                </span>
                <span className={`shrink-0 text-xs px-2 py-1 rounded-lg border ${questionTypeColor(question.type)}`}>
                    {questionTypeLabel(question.type)}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                    {question.points} pt{question.points !== 1 ? 's' : ''}
                </span>
                <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div className="border-t border-border px-4 py-4">
                    <p className="text-sm text-muted-foreground mb-3">{question.text}</p>

                    {question.type === 'mcq' && question.choices.length > 0 && (
                        <ul className="space-y-1.5">
                            {question.choices.map((choice, i) => (
                                <li
                                    key={choice.id}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                                        choice.is_correct
                                            ? 'bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30'
                                            : 'bg-muted text-muted-foreground border border-border'
                                    }`}
                                >
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {String.fromCharCode(65 + i)}.
                                    </span>
                                    {choice.text}
                                    {choice.is_correct && (
                                        <CheckCircle2 className="ml-auto size-4 text-brand-secondary" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    {question.type === 'true_false' && (
                        <div className="text-sm">
                            <span className="text-muted-foreground">Correct answer: </span>
                            <span className="font-medium text-card-foreground">
                                {question.choices.find((c) => c.is_correct)?.text ?? '—'}
                            </span>
                        </div>
                    )}

                    {question.type === 'written_answer' && question.grading_guidelines && (
                        <div className="rounded-lg bg-muted p-3 border border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Grading Guidelines</p>
                            <p className="whitespace-pre-line text-sm text-muted-foreground">
                                {question.grading_guidelines}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

ExamShow.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default ExamShow;
