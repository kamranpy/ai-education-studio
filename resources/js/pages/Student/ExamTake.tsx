import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import StudentLayout from '@/layouts/student-layout';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Circle,
    Clock,
    Send,
    ShieldAlert,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Choice {
    id: number;
    text: string;
}

interface Question {
    id: number;
    type: string;
    text: string;
    points: number;
    choices: Choice[];
}

interface ExamInfo {
    id: number;
    title: string;
    time_limit_minutes: number | null;
}

interface AttemptInfo {
    id: number;
    started_at: string;
}

interface Props {
    exam: ExamInfo;
    attempt: AttemptInfo;
    question: Question;
    questionIndex: number;
    totalQuestions: number;
    existingAnswer: Record<string, unknown> | null;
}

function ExamTake({
    exam,
    attempt,
    question,
    questionIndex,
    totalQuestions,
    existingAnswer,
}: Props) {
    const [answer, setAnswer] = useState<Record<string, unknown>>(
        existingAnswer ?? {},
    );
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [showBlurWarning, setShowBlurWarning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reset answer state when question changes
    useEffect(() => {
        setAnswer(existingAnswer ?? {});
    }, [question.id, existingAnswer]);

    // Timer calculation (client-side visual only — server is authority)
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

            if (remaining <= 0) {
                // Auto-submit on timer expiry (per D-04)
                handleSubmit();
            }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [exam.time_limit_minutes, attempt.started_at]);

    // Tab visibility tracking (per D-03 / TAKE-06)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Fire-and-forget tracking
                fetch(
                    `/student/exams/${exam.id}/attempts/${attempt.id}/track`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') ?? '',
                        },
                        body: JSON.stringify({
                            event: 'blur',
                            timestamp: new Date().toISOString(),
                        }),
                    },
                );
            } else if (document.visibilityState === 'visible') {
                setShowBlurWarning(true);
                // Log focus return
                fetch(
                    `/student/exams/${exam.id}/attempts/${attempt.id}/track`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') ?? '',
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

    const saveAndNavigate = useCallback(
        (nextIndex: number) => {
            setIsSaving(true);
            router.put(
                `/student/exams/${exam.id}/attempts/${attempt.id}`,
                {
                    question_id: question.id,
                    answer_data: answer,
                    action: 'save',
                    next_index: nextIndex,
                },
                {
                    preserveState: false,
                    preserveScroll: true,
                    onFinish: () => setIsSaving(false),
                },
            );
        },
        [exam.id, attempt.id, question.id, answer],
    );

    const handleSubmit = useCallback(() => {
        if (isSaving) return;
        setIsSaving(true);
        router.put(
            `/student/exams/${exam.id}/attempts/${attempt.id}`,
            {
                question_id: question.id,
                answer_data: answer,
                action: 'submit',
            },
            {
                preserveState: false,
                onFinish: () => setIsSaving(false),
            },
        );
    }, [exam.id, attempt.id, question.id, answer, isSaving]);

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isLastQuestion = questionIndex === totalQuestions - 1;
    const isFirstQuestion = questionIndex === 0;
    const isTimeLow = timeLeft !== null && timeLeft <= 60;

    return (
        <div className="mx-auto max-w-3xl">
            {/* Header Bar */}
            <div className="mb-6 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-6 py-4 shadow-sm">
                <div>
                    <h1 className="text-lg font-semibold text-zinc-900">
                        {exam.title}
                    </h1>
                    <p className="mt-0.5 text-sm text-zinc-500">
                        Question {questionIndex + 1} of {totalQuestions}
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

            {/* Progress Bar */}
            <div className="mb-6 flex gap-1">
                {Array.from({ length: totalQuestions }, (_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < questionIndex
                                ? 'bg-zinc-900'
                                : i === questionIndex
                                  ? 'bg-zinc-500'
                                  : 'bg-zinc-200'
                        }`}
                    />
                ))}
            </div>

            {/* Question Card */}
            <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <span className="rounded bg-zinc-100 px-2 py-0.5 uppercase">
                        {question.type === 'mcq'
                            ? 'Multiple Choice'
                            : question.type === 'true_false'
                              ? 'True / False'
                              : question.type === 'written_answer'
                                ? 'Written Answer'
                                : question.type}
                    </span>
                    <span>{question.points} pt{question.points !== 1 ? 's' : ''}</span>
                </div>

                <h2 className="mb-6 text-xl font-medium text-zinc-900">
                    {question.text}
                </h2>

                {/* Answer Input */}
                {(question.type === 'mcq' || question.type === 'true_false') &&
                    question.choices.length > 0 && (
                        <div className="space-y-3">
                            {question.choices.map((choice) => {
                                const isSelected =
                                    (answer as { selected_choice_id?: number })
                                        .selected_choice_id === choice.id;
                                return (
                                    <button
                                        key={choice.id}
                                        type="button"
                                        onClick={() =>
                                            setAnswer({
                                                selected_choice_id: choice.id,
                                            })
                                        }
                                        className={`flex w-full items-center gap-3 rounded-lg border-2 px-5 py-4 text-left text-sm transition-colors ${
                                            isSelected
                                                ? 'border-zinc-900 bg-zinc-50'
                                                : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                                        }`}
                                    >
                                        {isSelected ? (
                                            <CheckCircle2 className="h-5 w-5 shrink-0 text-zinc-900" />
                                        ) : (
                                            <Circle className="h-5 w-5 shrink-0 text-zinc-300" />
                                        )}
                                        <span className="text-zinc-700">
                                            {choice.text}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                {question.type === 'written_answer' && (
                    <textarea
                        value={
                            ((answer as { text?: string }).text as string) ?? ''
                        }
                        onChange={(e) =>
                            setAnswer({ text: e.target.value })
                        }
                        placeholder="Type your answer here..."
                        rows={6}
                        className="w-full resize-y rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                )}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => saveAndNavigate(questionIndex - 1)}
                    disabled={isFirstQuestion || isSaving}
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                </button>

                <div className="flex gap-3">
                    {isLastQuestion ? (
                        <button
                            type="button"
                            onClick={() => setShowSubmitDialog(true)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                            Submit Exam
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() =>
                                saveAndNavigate(questionIndex + 1)
                            }
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                        >
                            Next Question
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Anti-Cheat Warning Overlay (per D-03) */}
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

            {/* Submit Confirmation Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="items-center sm:items-start">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 sm:mx-0">
                            <ShieldAlert className="h-6 w-6 text-amber-600" />
                        </div>
                        <DialogTitle>Submit Exam</DialogTitle>
                        <DialogDescription>
                            Are you sure you are ready to finish? Once
                            submitted, you will not be able to change your
                            answers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowSubmitDialog(false)}
                        >
                            Go Back
                        </Button>
                        <Button
                            onClick={() => {
                                setShowSubmitDialog(false);
                                handleSubmit();
                            }}
                            disabled={isSaving}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {isSaving ? 'Submitting...' : 'Yes, Submit Exam'}
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
