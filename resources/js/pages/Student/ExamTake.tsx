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
import {
    submitSection as submitSectionAction,
    update as attemptUpdate,
} from '@/actions/App/Http/Controllers/Student/ExamAttemptController';
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
        if (!exam.time_limit_minutes) {
return;
}

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
            if (timerRef.current) {
clearInterval(timerRef.current);
}
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
        if (!submitTarget || isSaving) {
return;
}

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
                    <div
                        className="flex items-center gap-2 rounded-xl px-4 py-3"
                        style={{
                            background: 'rgba(79, 219, 200, 0.08)',
                            border: '1px solid rgba(79, 219, 200, 0.25)',
                        }}
                    >
                        <Lock className="size-4" style={{ color: '#4fdbc8' }} />
                        <p className="text-sm font-medium" style={{ color: '#4fdbc8' }}>
                            {sectionLabel(type)} section has been submitted and locked.
                        </p>
                    </div>
                )}

                {questions.map((q, idx) => (
                    <div
                        key={q.id}
                        className="rounded-xl p-6 transition-all"
                        style={{
                            background: 'var(--portal-card-bg)',
                            border: '1px solid var(--portal-card-border)',
                            opacity: submitted ? 0.65 : 1,
                        }}
                    >
                        {/* Question meta */}
                        <div className="mb-3 flex items-center gap-2">
                            <span
                                className="rounded px-2 py-0.5 text-xs font-bold uppercase"
                                style={{ background: 'rgba(79, 70, 229, 0.15)', color: 'var(--brand-primary-text)' }}
                            >
                                Q{idx + 1}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--portal-text-muted)' }}>
                                {q.points} pt{q.points !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Question text */}
                        <h3 className="mb-5 text-base font-medium" style={{ color: 'var(--portal-text-primary)' }}>
                            {q.text}
                        </h3>

                        {/* MCQ / True-False choices */}
                        {(q.type === 'mcq' || q.type === 'true_false') && q.choices.length > 0 && (
                            <div className="space-y-2">
                                {q.choices.map((choice) => {
                                    const currentAnswer = answers[q.id] as { selected_choice_id?: number } | undefined;
                                    const isSelected = currentAnswer?.selected_choice_id === choice.id;

                                    return (
                                        <button
                                            key={choice.id}
                                            type="button"
                                            disabled={submitted}
                                            onClick={() => {
                                                const newAnswer = { selected_choice_id: choice.id };
                                                setAnswer(q.id, newAnswer);
                                                autoSave(q.id, newAnswer);
                                            }}
                                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all"
                                            style={{
                                                background: isSelected ? 'rgba(79, 70, 229, 0.12)' : 'var(--portal-input-bg)',
                                                border: isSelected ? '1px solid rgba(79, 70, 229, 0.5)' : '1px solid var(--portal-card-border)',
                                                color: isSelected ? 'var(--brand-primary-text)' : 'var(--portal-text-secondary)',
                                                cursor: submitted ? 'not-allowed' : 'pointer',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!submitted && !isSelected) {
                                                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--portal-card-border-hover)';
                                                    (e.currentTarget as HTMLElement).style.color = 'var(--portal-text-primary)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!submitted && !isSelected) {
                                                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--portal-card-border)';
                                                    (e.currentTarget as HTMLElement).style.color = 'var(--portal-text-secondary)';
                                                }
                                            }}
                                        >
                                            {isSelected ? (
                                                <CheckCircle2 className="size-5 shrink-0" style={{ color: 'var(--brand-primary-text)' }} />
                                            ) : (
                                                <Circle className="size-5 shrink-0" style={{ color: 'var(--portal-text-muted)' }} />
                                            )}
                                            <span>{choice.text}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Written answer textarea */}
                        {q.type === 'written_answer' && (
                            <textarea
                                value={((answers[q.id] as { text?: string })?.text as string) ?? ''}
                                disabled={submitted}
                                onChange={(e) => setAnswer(q.id, { text: e.target.value })}
                                onBlur={() => {
                                    if (!submitted && answers[q.id]) {
                                        autoSave(q.id, answers[q.id]);
                                    }
                                }}
                                placeholder="Type your answer here..."
                                rows={5}
                                className="w-full resize-y rounded-xl px-4 py-3 text-sm outline-none transition-all"
                                style={{
                                    background: 'var(--portal-input-bg)',
                                    border: '1px solid var(--portal-input-border)',
                                    color: 'var(--portal-text-primary)',
                                }}
                                onFocus={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-primary)';
                                }}
                                onBlurCapture={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--portal-input-border)';
                                }}
                            />
                        )}
                    </div>
                ))}

                {!submitted && (
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => openSectionSubmitDialog(type)}
                            disabled={isSaving}
                            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                            style={{
                                background: '#4f46e5',
                                color: '#dad7ff',
                                boxShadow: '0 4px 20px rgba(79, 70, 229, 0.25)',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = '#4338ca';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = '#4f46e5';
                            }}
                        >
                            <Send className="size-4" />
                            Submit {sectionLabel(type)}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header Bar */}
            <div
                className="mb-6 flex items-center justify-between rounded-xl px-6 py-4"
                style={{
                    background: 'var(--portal-card-bg)',
                    border: '1px solid var(--portal-card-border)',
                }}
            >
                <div>
                    <h1 className="text-xl font-semibold" style={{ color: 'var(--portal-text-primary)' }}>
                        {exam.title}
                    </h1>
                    <p className="mt-0.5 text-sm" style={{ color: 'var(--portal-text-secondary)' }}>
                        Submit each section when ready. Submitted sections are locked.
                    </p>
                </div>

                {timeLeft !== null && (
                    <div
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${isTimeLow ? 'animate-pulse' : ''}`}
                        style={{
                            background: isTimeLow ? 'rgba(255, 180, 171, 0.1)' : 'var(--portal-badge-bg)',
                            color: isTimeLow ? '#ffb4ab' : 'var(--portal-text-secondary)',
                            border: `1px solid ${isTimeLow ? 'rgba(255, 180, 171, 0.3)' : 'var(--portal-card-border)'}`,
                        }}
                    >
                        <Clock className="h-4 w-4" />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {/* Section Progress Pills */}
            <div className="mb-6 flex gap-3">
                {hasTf && (
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                        style={tfSubmitted
                            ? { background: 'rgba(79, 219, 200, 0.12)', color: '#4fdbc8', border: '1px solid rgba(79, 219, 200, 0.3)' }
                            : { background: 'var(--portal-badge-bg)', color: 'var(--portal-text-secondary)', border: '1px solid var(--portal-card-border)' }}>
                        {tfSubmitted ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
                        True/False
                    </div>
                )}
                {hasMcq && (
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                        style={mcqSubmitted
                            ? { background: 'rgba(79, 219, 200, 0.12)', color: '#4fdbc8', border: '1px solid rgba(79, 219, 200, 0.3)' }
                            : { background: 'var(--portal-badge-bg)', color: 'var(--portal-text-secondary)', border: '1px solid var(--portal-card-border)' }}>
                        {mcqSubmitted ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
                        MCQs
                    </div>
                )}
                {hasWritten && (
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                        style={writtenSubmitted
                            ? { background: 'rgba(79, 219, 200, 0.12)', color: '#4fdbc8', border: '1px solid rgba(79, 219, 200, 0.3)' }
                            : { background: 'var(--portal-badge-bg)', color: 'var(--portal-text-secondary)', border: '1px solid var(--portal-card-border)' }}>
                        {writtenSubmitted ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
                        Written
                    </div>
                )}
            </div>

            {/* Tabbed Sections */}
            <Tabs defaultValue={defaultTab} className="w-full">
                <div className="flex gap-1 rounded-xl p-1 mb-6"
                    style={{ background: 'var(--portal-input-bg)', border: '1px solid var(--portal-card-border)' }}>
                    {hasTf && (
                        <TabsList className="bg-transparent p-0 h-auto flex-1">
                            <TabsTrigger value="true_false"
                                className="flex-1 gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:shadow-none data-[state=active]:bg-[rgba(79,70,229,0.15)] data-[state=active]:text-[#c3c0ff]"
                                style={{ color: 'var(--portal-text-secondary)' }}>
                                <CircleCheck className="size-4" />
                                True/False
                                {tfSubmitted && <Lock className="ml-1 size-3" style={{ color: '#4fdbc8' }} />}
                            </TabsTrigger>
                        </TabsList>
                    )}
                    {hasMcq && (
                        <TabsList className="bg-transparent p-0 h-auto flex-1">
                            <TabsTrigger value="mcq"
                                className="flex-1 gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:shadow-none data-[state=active]:bg-[rgba(79,70,229,0.15)] data-[state=active]:text-[#c3c0ff]"
                                style={{ color: 'var(--portal-text-secondary)' }}>
                                <ListChecks className="size-4" />
                                MCQs
                                {mcqSubmitted && <Lock className="ml-1 size-3" style={{ color: '#4fdbc8' }} />}
                            </TabsTrigger>
                        </TabsList>
                    )}
                    {hasWritten && (
                        <TabsList className="bg-transparent p-0 h-auto flex-1">
                            <TabsTrigger value="written_answer"
                                className="flex-1 gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all data-[state=active]:shadow-none data-[state=active]:bg-[rgba(79,70,229,0.15)] data-[state=active]:text-[#c3c0ff]"
                                style={{ color: 'var(--portal-text-secondary)' }}>
                                <PenLine className="size-4" />
                                Written
                                {writtenSubmitted && <Lock className="ml-1 size-3" style={{ color: '#4fdbc8' }} />}
                            </TabsTrigger>
                        </TabsList>
                    )}
                </div>

                {hasTf && (
                    <TabsContent value="true_false" className="mt-0">
                        {renderSection('true_false', sectionQuestions.true_false, <CircleCheck className="size-4" />)}
                    </TabsContent>
                )}
                {hasMcq && (
                    <TabsContent value="mcq" className="mt-0">
                        {renderSection('mcq', sectionQuestions.mcq, <ListChecks className="size-4" />)}
                    </TabsContent>
                )}
                {hasWritten && (
                    <TabsContent value="written_answer" className="mt-0">
                        {renderSection('written_answer', sectionQuestions.written_answer, <PenLine className="size-4" />)}
                    </TabsContent>
                )}
            </Tabs>

            {/* Anti-Cheat Warning Overlay */}
            {showBlurWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="mx-4 max-w-md rounded-2xl p-8 text-center shadow-2xl"
                        style={{ background: 'var(--portal-card-bg)', border: '1px solid rgba(255, 180, 171, 0.3)' }}>
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                            style={{ background: 'rgba(255, 180, 171, 0.1)' }}>
                            <AlertTriangle className="h-7 w-7" style={{ color: '#ffb4ab' }} />
                        </div>
                        <h3 className="mt-2 text-lg font-semibold" style={{ color: 'var(--portal-text-primary)' }}>
                            Tab Activity Recorded
                        </h3>
                        <p className="mt-2 text-sm" style={{ color: 'var(--portal-text-secondary)' }}>
                            Action logged: You must remain on this tab while testing. Your instructor will be able to see when you left this page.
                        </p>
                        <button type="button" onClick={() => setShowBlurWarning(false)}
                            className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
                            style={{ background: 'var(--brand-primary)', color: '#dad7ff' }}>
                            I Understand
                        </button>
                    </div>
                </div>
            )}

            {/* Section Submit Confirmation Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent className="sm:max-w-md"
                    style={{ background: 'var(--portal-card-bg)', border: '1px solid var(--portal-card-border)', color: 'var(--portal-text-primary)' }}>
                    <DialogHeader className="items-center sm:items-start">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full sm:mx-0"
                            style={{ background: 'rgba(255, 182, 149, 0.1)' }}>
                            <ShieldAlert className="h-6 w-6" style={{ color: '#ffb695' }} />
                        </div>
                        <DialogTitle style={{ color: 'var(--portal-text-primary)' }}>
                            Submit {submitTarget ? sectionLabel(submitTarget) : ''}
                        </DialogTitle>
                        <DialogDescription style={{ color: 'var(--portal-text-secondary)' }}>
                            Are you sure you want to submit this section? Once submitted, you will not be able to change your answers for{' '}
                            {submitTarget ? sectionLabel(submitTarget) : 'this section'}.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="w-full gap-2 sm:justify-between sm:space-x-0">
                        <button type="button" onClick={() => setShowSubmitDialog(false)}
                            className="rounded-xl px-5 py-2.5 text-sm font-medium transition-all"
                            style={{ border: '1px solid var(--portal-card-border)', color: 'var(--portal-text-secondary)', background: 'transparent' }}>
                            Go Back
                        </button>
                        <button type="button" onClick={handleSectionSubmit} disabled={isSaving}
                            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
                            style={{ background: 'var(--brand-primary)', color: '#dad7ff' }}>
                            <Send className="h-4 w-4" />
                            {isSaving ? 'Submitting...' : `Yes, Submit ${submitTarget ? sectionLabel(submitTarget) : ''}`}
                        </button>
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
