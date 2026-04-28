import {
    submitSection as submitSectionAction,
    update as attemptUpdate,
} from '@/actions/App/Http/Controllers/Student/ExamAttemptController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentLayout from '@/layouts/student-layout';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Circle,
    CircleCheck,
    Clock,
    ListChecks,
    Lock,
    PenLine,
    Send,
    ShieldAlert,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Choice {
    id: number;
    text: string;
}

interface SectionQuestion {
    id: number;
    type: string;
    text: string;
    points: number;
    choices: Choice[];
    existing_answer: Record<string, unknown> | null;
}

interface ExamInfo {
    id: number;
    title: string;
    time_limit_minutes: number | null;
}

interface AttemptInfo {
    id: number;
    started_at: string;
    tf_submitted_at: string | null;
    mcqs_submitted_at: string | null;
    written_submitted_at: string | null;
}

interface SectionQuestions {
    true_false: SectionQuestion[];
    mcq: SectionQuestion[];
    written_answer: SectionQuestion[];
}

interface Props {
    exam: ExamInfo;
    attempt: AttemptInfo;
    sectionQuestions: SectionQuestions;
}

type SectionType = 'true_false' | 'mcq' | 'written_answer';

function ExamTake({ exam, attempt, sectionQuestions }: Props) {
    // Local answer state per question
    const [answers, setAnswers] = useState<Record<number, Record<string, unknown>>>(() => {
        const initial: Record<number, Record<string, unknown>> = {};
        for (const section of Object.values(sectionQuestions)) {
            for (const q of section) {
                if (q.existing_answer) {
                    initial[q.id] = q.existing_answer;
                }
            }
        }
        return initial;
    });

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [showBlurWarning, setShowBlurWarning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [submitTarget, setSubmitTarget] = useState<SectionType | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const tfSubmitted = !!attempt.tf_submitted_at;
    const mcqSubmitted = !!attempt.mcqs_submitted_at;
    const writtenSubmitted = !!attempt.written_submitted_at;

    const hasTf = sectionQuestions.true_false.length > 0;
    const hasMcq = sectionQuestions.mcq.length > 0;
    const hasWritten = sectionQuestions.written_answer.length > 0;

    // Determine default tab
    const defaultTab = hasTf && !tfSubmitted
        ? 'true_false'
        : hasMcq && !mcqSubmitted
            ? 'mcq'
            : hasWritten && !writtenSubmitted
                ? 'written_answer'
                : 'true_false';

    // Timer calculation
    useEffect(() => {
        if (!exam.time_limit_minutes) return;

        const startedAt = new Date(attempt.started_at).getTime();
        const durationMs = exam.time_limit_minutes * 60 * 1000;
        const endTime = startedAt + durationMs;

        const updateTimer = () => {
            const remaining = Math.max(
                0,
                Math.floor((endTime - Date.now()) / 1000),
            );
            setTimeLeft(remaining);

            if (remaining <= 0 && timerRef.current) {
                clearInterval(timerRef.current);
            }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [exam.time_limit_minutes, attempt.started_at]);

    // Tab visibility tracking
    useEffect(() => {
        const handleVisibilityChange = () => {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') ?? '';

            if (document.visibilityState === 'hidden') {
                fetch(
                    `/student/exams/${exam.id}/attempts/${attempt.id}/track`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                        },
                        body: JSON.stringify({
                            event: 'blur',
                            timestamp: new Date().toISOString(),
                        }),
                    },
                );
            } else if (document.visibilityState === 'visible') {
                setShowBlurWarning(true);
                fetch(
                    `/student/exams/${exam.id}/attempts/${attempt.id}/track`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                        },
                        body: JSON.stringify({
                            event: 'focus',
                            timestamp: new Date().toISOString(),
                        }),
                    },
                );
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () =>
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
    }, [exam.id, attempt.id]);

    function setAnswer(questionId: number, data: Record<string, unknown>) {
        setAnswers((prev) => ({ ...prev, [questionId]: data }));
    }

    // Auto-save individual question answer
    const autoSave = useCallback(
        (questionId: number, answerData: Record<string, unknown>) => {
            router.put(
                attemptUpdate.url({ exam: exam.id, attempt: attempt.id }),
                {
                    question_id: questionId,
                    answer_data: answerData as Record<string, string | number | boolean>,
                    action: 'save',
                    next_index: 0,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [exam.id, attempt.id],
    );

    function openSectionSubmitDialog(section: SectionType) {
        setSubmitTarget(section);
        setShowSubmitDialog(true);
    }

    function handleSectionSubmit() {
        if (!submitTarget || isSaving) return;
        setIsSaving(true);
        setShowSubmitDialog(false);

        const sectionData = sectionQuestions[submitTarget];
        const sectionAnswers = sectionData.map((q) => ({
            question_id: q.id,
            answer_data: (answers[q.id] ?? {}) as Record<string, string | number | boolean>,
        }));

        router.post(
            submitSectionAction.url({
                exam: exam.id,
                attempt: attempt.id,
            }),
            {
                section: submitTarget,
                answers: sectionAnswers as unknown as Record<string, string | number | boolean>,
            },
            {
                preserveState: false,
                onFinish: () => setIsSaving(false),
            },
        );
    }

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isTimeLow = timeLeft !== null && timeLeft <= 60;

    const sectionLabel = (type: SectionType) =>
        type === 'true_false'
            ? 'True/False'
            : type === 'mcq'
                ? 'Multiple Choice'
                : 'Written Answers';

    const isSectionSubmitted = (type: SectionType) =>
        type === 'true_false'
            ? tfSubmitted
            : type === 'mcq'
                ? mcqSubmitted
                : writtenSubmitted;

    function renderSection(
        type: SectionType,
        questions: SectionQuestion[],
        icon: React.ReactNode,
    ) {
        const submitted = isSectionSubmitted(type);

        if (questions.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                    <p className="text-sm text-zinc-500">
                        No {sectionLabel(type)} questions in this exam.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {submitted && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <Lock className="size-4 text-emerald-600" />
                        <p className="text-sm font-medium text-emerald-700">
                            {sectionLabel(type)} section has been submitted and
                            locked.
                        </p>
                    </div>
                )}

                {questions.map((q, idx) => (
                    <div
                        key={q.id}
                        className={`rounded-lg border bg-white p-6 shadow-sm ${submitted ? 'opacity-60' : ''}`}
                    >
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-400">
                            <span className="rounded bg-zinc-100 px-2 py-0.5 uppercase">
                                Q{idx + 1}
                            </span>
                            <span>
                                {q.points} pt{q.points !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <h3 className="mb-4 text-base font-medium text-zinc-900">
                            {q.text}
                        </h3>

                        {(q.type === 'mcq' || q.type === 'true_false') &&
                            q.choices.length > 0 && (
                                <div className="space-y-2">
                                    {q.choices.map((choice) => {
                                        const currentAnswer = answers[q.id] as
                                            | {
                                                  selected_choice_id?: number;
                                              }
                                            | undefined;
                                        const isSelected =
                                            currentAnswer?.selected_choice_id ===
                                            choice.id;
                                        return (
                                            <button
                                                key={choice.id}
                                                type="button"
                                                disabled={submitted}
                                                onClick={() => {
                                                    const newAnswer = {
                                                        selected_choice_id:
                                                            choice.id,
                                                    };
                                                    setAnswer(q.id, newAnswer);
                                                    autoSave(q.id, newAnswer);
                                                }}
                                                className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm transition-colors ${
                                                    isSelected
                                                        ? 'border-zinc-900 bg-zinc-50'
                                                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                                                } ${submitted ? 'pointer-events-none' : ''}`}
                                            >
                                                {isSelected ? (
                                                    <CheckCircle2 className="size-5 shrink-0 text-zinc-900" />
                                                ) : (
                                                    <Circle className="size-5 shrink-0 text-zinc-300" />
                                                )}
                                                <span className="text-zinc-700">
                                                    {choice.text}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                        {q.type === 'written_answer' && (
                            <textarea
                                value={
                                    ((answers[q.id] as { text?: string })
                                        ?.text as string) ?? ''
                                }
                                disabled={submitted}
                                onChange={(e) =>
                                    setAnswer(q.id, { text: e.target.value })
                                }
                                onBlur={() => {
                                    if (!submitted && answers[q.id]) {
                                        autoSave(q.id, answers[q.id]);
                                    }
                                }}
                                placeholder="Type your answer here..."
                                rows={5}
                                className="w-full resize-y rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:bg-zinc-50"
                            />
                        )}
                    </div>
                ))}

                {!submitted && (
                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={() => openSectionSubmitDialog(type)}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            <Send className="size-4" />
                            Submit {sectionLabel(type)}
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl">
            {/* Header Bar */}
            <div className="mb-6 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-6 py-4 shadow-sm">
                <div>
                    <h1 className="text-lg font-semibold text-zinc-900">
                        {exam.title}
                    </h1>
                    <p className="mt-0.5 text-sm text-zinc-500">
                        Submit each section when ready. Submitted sections are
                        locked.
                    </p>
                </div>

                {timeLeft !== null && (
                    <div
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                            isTimeLow
                                ? 'animate-pulse bg-red-50 text-red-700'
                                : 'bg-zinc-100 text-zinc-700'
                        }`}
                    >
                        <Clock className="h-4 w-4" />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {/* Section Progress */}
            <div className="mb-6 flex gap-3">
                {hasTf && (
                    <div
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            tfSubmitted
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-zinc-100 text-zinc-600'
                        }`}
                    >
                        {tfSubmitted ? (
                            <CheckCircle2 className="size-3.5" />
                        ) : (
                            <Circle className="size-3.5" />
                        )}
                        True/False
                    </div>
                )}
                {hasMcq && (
                    <div
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            mcqSubmitted
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-zinc-100 text-zinc-600'
                        }`}
                    >
                        {mcqSubmitted ? (
                            <CheckCircle2 className="size-3.5" />
                        ) : (
                            <Circle className="size-3.5" />
                        )}
                        MCQs
                    </div>
                )}
                {hasWritten && (
                    <div
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            writtenSubmitted
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-zinc-100 text-zinc-600'
                        }`}
                    >
                        {writtenSubmitted ? (
                            <CheckCircle2 className="size-3.5" />
                        ) : (
                            <Circle className="size-3.5" />
                        )}
                        Written
                    </div>
                )}
            </div>

            {/* Tabbed Sections */}
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="w-full justify-start">
                    {hasTf && (
                        <TabsTrigger value="true_false" className="gap-1.5">
                            <CircleCheck className="size-4" />
                            True/False
                            {tfSubmitted && (
                                <Lock className="ml-1 size-3 text-emerald-600" />
                            )}
                        </TabsTrigger>
                    )}
                    {hasMcq && (
                        <TabsTrigger value="mcq" className="gap-1.5">
                            <ListChecks className="size-4" />
                            MCQs
                            {mcqSubmitted && (
                                <Lock className="ml-1 size-3 text-emerald-600" />
                            )}
                        </TabsTrigger>
                    )}
                    {hasWritten && (
                        <TabsTrigger value="written_answer" className="gap-1.5">
                            <PenLine className="size-4" />
                            Written
                            {writtenSubmitted && (
                                <Lock className="ml-1 size-3 text-emerald-600" />
                            )}
                        </TabsTrigger>
                    )}
                </TabsList>

                {hasTf && (
                    <TabsContent value="true_false" className="mt-4">
                        {renderSection(
                            'true_false',
                            sectionQuestions.true_false,
                            <CircleCheck className="size-4" />,
                        )}
                    </TabsContent>
                )}
                {hasMcq && (
                    <TabsContent value="mcq" className="mt-4">
                        {renderSection(
                            'mcq',
                            sectionQuestions.mcq,
                            <ListChecks className="size-4" />,
                        )}
                    </TabsContent>
                )}
                {hasWritten && (
                    <TabsContent value="written_answer" className="mt-4">
                        {renderSection(
                            'written_answer',
                            sectionQuestions.written_answer,
                            <PenLine className="size-4" />,
                        )}
                    </TabsContent>
                )}
            </Tabs>

            {/* Anti-Cheat Warning Overlay */}
            {showBlurWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="mx-4 max-w-md rounded-xl bg-white p-8 text-center shadow-2xl">
                        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
                        <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                            Tab Activity Recorded
                        </h3>
                        <p className="mt-2 text-sm text-zinc-600">
                            Action logged: You must remain on this tab while
                            testing. Your instructor will be able to see when
                            you left this page.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowBlurWarning(false)}
                            className="mt-6 rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            )}

            {/* Section Submit Confirmation Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="items-center sm:items-start">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 sm:mx-0">
                            <ShieldAlert className="h-6 w-6 text-amber-600" />
                        </div>
                        <DialogTitle>
                            Submit {submitTarget ? sectionLabel(submitTarget) : ''}
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to submit this section? Once
                            submitted, you will not be able to change your
                            answers for{' '}
                            {submitTarget ? sectionLabel(submitTarget) : 'this section'}
                            .
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="w-full gap-2 sm:justify-between sm:space-x-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowSubmitDialog(false)}
                        >
                            Go Back
                        </Button>
                        <Button
                            onClick={handleSectionSubmit}
                            disabled={isSaving}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {isSaving
                                ? 'Submitting...'
                                : `Yes, Submit ${submitTarget ? sectionLabel(submitTarget) : ''}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

ExamTake.layout = (page: React.ReactNode) => (
    <StudentLayout>{page}</StudentLayout>
);

export default ExamTake;
