import { router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    Loader2,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

interface Question {
    id: number;
    type: string;
    text: string;
    points: number;
    grading_guidelines: string | null;
    choices: Array<{ id: number; text: string; is_correct: boolean }>;
}

interface Override {
    id: number;
    from_score: number | null;
    to_score: number;
    comment: string | null;
    actor: { id: string; name: string };
    created_at: string;
}

interface Answer {
    id: number;
    question_id: number;
    question: Question;
    answer_data: Record<string, unknown> | null;
    ai_score: number | null;
    ai_confidence: number | null;
    ai_explanation: string | null;
    ai_axes: Record<string, number> | null;
    ai_provider: string | null;
    ai_model: string | null;
    tokens_in: number | null;
    tokens_out: number | null;
    override_score: number | null;
    override_comment: string | null;
    status: string;
    overrides: Override[];
    final_score: number | null;
}

interface Attempt {
    id: number;
    user: { id: string; name: string; email: string };
    status: string;
    submitted_at: string | null;
    answers: Answer[];
    total_points: number;
    final_score: number;
}

interface Props {
    exam: { id: number; title: string };
    attempt: Attempt;
}

function ConfidenceIndicator({
    confidence,
}: {
    confidence: number | string | null;
}) {
    if (confidence === null || confidence === undefined) {
return null;
}

    const value = typeof confidence === 'string' ? parseFloat(confidence) : confidence;

    if (isNaN(value)) {
return null;
}

    if (value >= 0.85) {
        return (
            <span className="text-sm text-foreground">
                Confidence: {value.toFixed(2)}
            </span>
        );
    }

    if (value >= 0.7) {
        return (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Info className="size-3.5" />
                Confidence: {value.toFixed(2)}
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1 text-sm text-destructive">
            <AlertTriangle className="size-3.5" />
            Confidence: {value.toFixed(2)}
        </span>
    );
}

function OverrideForm({
    answer,
    examId,
    attemptId,
}: {
    answer: Answer;
    examId: number;
    attemptId: number;
}) {
    const form = useForm({
        answer_id: answer.id,
        override_score: answer.override_score?.toString() || '',
        override_comment: answer.override_comment || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(
            `/admin/exams/${examId}/attempts/${attemptId}/override`,
            { preserveScroll: true },
        );
    }

    const scoreDiff =
        form.data.override_score &&
        answer.ai_score !== null &&
        Math.abs(
            parseFloat(form.data.override_score) - parseFloat(String(answer.ai_score)),
        ) >
            answer.question.points * 0.3;

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor={`override-${answer.id}`}>
                    Override score
                </Label>
                <Input
                    id={`override-${answer.id}`}
                    type="number"
                    min={0}
                    max={answer.question.points}
                    step={0.5}
                    value={form.data.override_score}
                    onChange={(e) =>
                        form.setData('override_score', e.target.value)
                    }
                    placeholder={`0–${answer.question.points}`}
                    className="w-32 font-mono"
                    aria-label={`Score 0 to ${answer.question.points}`}
                />
                <p className="text-xs text-muted-foreground">
                    Leave blank to keep AI score. Range 0–
                    {answer.question.points}.
                </p>
                {form.errors.override_score && (
                    <p className="text-sm text-destructive">
                        {form.errors.override_score}
                    </p>
                )}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor={`comment-${answer.id}`}>
                    Note (optional)
                </Label>
                <Textarea
                    id={`comment-${answer.id}`}
                    value={form.data.override_comment}
                    onChange={(e) =>
                        form.setData('override_comment', e.target.value)
                    }
                    placeholder="Why are you overriding this grade?"
                    rows={2}
                />
                {scoreDiff && !form.data.override_comment && (
                    <p className="text-xs text-muted-foreground">
                        Consider explaining the override for future
                        audits.
                    </p>
                )}
            </div>
            <Button
                type="submit"
                size="sm"
                disabled={
                    form.processing || !form.data.override_score
                }
            >
                {form.processing && (
                    <Loader2 className="mr-2 size-3.5 animate-spin" />
                )}
                Save override
            </Button>
        </form>
    );
}

function QuestionBlock({
    answer,
    index,
    total,
    examId,
    attemptId,
}: {
    answer: Answer;
    index: number;
    total: number;
    examId: number;
    attemptId: number;
}) {
    const [open, setOpen] = useState(
        answer.status === 'needs_review',
    );
    const q = answer.question;

    // Get student's answer text
    const studentAnswer =
        q.type === 'written_answer'
            ? ((answer.answer_data as Record<string, string>)?.text ||
              '(no answer submitted)')
            : q.choices?.find(
                  (c) =>
                      c.id ===
                      (answer.answer_data as Record<string, number>)
                          ?.selected_choice_id,
              )?.text || '(no answer submitted)';

    const finalScore = parseFloat(String(answer.override_score ?? answer.ai_score ?? 0));

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                        Question {index + 1} of {total}
                    </span>
                    <span className="text-sm">
                        {q.text.length > 60
                            ? q.text.slice(0, 60) + '…'
                            : q.text}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {answer.status === 'needs_review' && (
                        <Badge
                            variant="destructive"
                            className="bg-destructive/10 text-destructive"
                        >
                            <AlertTriangle className="mr-1 size-3" />
                            Needs review
                        </Badge>
                    )}
                    <span className="font-mono text-sm font-medium">
                        {finalScore}/{q.points}
                    </span>
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2 space-y-4 rounded-lg border border-border bg-card p-4">
                {/* Question text */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Question
                    </p>
                    <p className="mt-1 text-sm">{q.text}</p>
                </div>

                {/* Student answer */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Student answer
                    </p>
                    <p className="mt-1 max-w-prose text-sm">
                        {studentAnswer}
                    </p>
                </div>

                {/* MC/TF: show correct answer */}
                {q.type !== 'written_answer' && (
                    <div className="flex items-center gap-2">
                        {answer.ai_score !== null &&
                        parseFloat(String(answer.ai_score)) > 0 ? (
                            <span className="flex items-center gap-1 text-sm text-foreground">
                                <CheckCircle2 className="size-4" />
                                Correct
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <XCircle className="size-4" />
                                Incorrect
                            </span>
                        )}
                    </div>
                )}

                {/* AI Grading block — only for written questions */}
                {q.type === 'written_answer' && answer.ai_score !== null && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <p className="text-sm font-medium">
                                AI grading
                            </p>

                            <div className="flex items-center gap-4">
                                <span className="font-mono text-sm">
                                    Score: {answer.ai_score}/{q.points}
                                </span>
                                <ConfidenceIndicator
                                    confidence={answer.ai_confidence}
                                />
                            </div>

                            {/* Axes */}
                            {answer.ai_axes && (
                                <div className="flex gap-4">
                                    {Object.entries(answer.ai_axes).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="text-sm"
                                            >
                                                <span className="font-medium capitalize">
                                                    {key}
                                                </span>
                                                :{' '}
                                                <span className="font-mono">
                                                    {parseFloat(String(value)).toFixed(1)}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}

                            {/* Explanation */}
                            {answer.ai_explanation && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Explanation
                                    </p>
                                    <p className="mt-1 max-w-prose text-sm leading-relaxed">
                                        {answer.ai_explanation}
                                    </p>
                                </div>
                            )}

                            {/* Provider/model footer */}
                            {answer.ai_provider && (
                                <p className="pt-1 font-mono text-xs text-muted-foreground">
                                    Graded by {answer.ai_provider} ·{' '}
                                    {answer.ai_model} ·{' '}
                                    {answer.tokens_in}/
                                    {answer.tokens_out} tokens
                                </p>
                            )}
                        </div>

                        <Separator />

                        {/* Override form */}
                        <OverrideForm
                            answer={answer}
                            examId={examId}
                            attemptId={attemptId}
                        />

                        {/* Override history */}
                        {answer.overrides.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Override history
                                </p>
                                {answer.overrides.map((o) => (
                                    <div
                                        key={o.id}
                                        className="text-xs text-muted-foreground"
                                    >
                                        {o.actor.name} changed{' '}
                                        {o.from_score ?? '—'} →{' '}
                                        {o.to_score}
                                        {o.comment && ` — "${o.comment}"`}{' '}
                                        ·{' '}
                                        {new Date(
                                            o.created_at,
                                        ).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}

function AttemptsShow({ exam, attempt }: Props) {
    // Poll for status changes while grading
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(
        null,
    );

    useEffect(() => {
        if (attempt.status === 'grading') {
            intervalRef.current = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    router.reload({ only: ['attempt'] });
                }
            }, 5000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [attempt.status]);

    function handleMarkReviewed() {
        router.post(
            `/admin/exams/${exam.id}/attempts/${attempt.id}/mark-reviewed`,
            {},
            { preserveScroll: true },
        );
    }

    const needsReviewCount = attempt.answers.filter(
        (a) => a.status === 'needs_review',
    ).length;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    {attempt.user.name} — {exam.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Submitted{' '}
                    {attempt.submitted_at
                        ? new Date(
                              attempt.submitted_at,
                          ).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                          })
                        : '—'}{' '}
                    · Final score {attempt.final_score}/
                    {attempt.total_points}
                </p>
            </div>

            {/* Status banners */}
            {attempt.status === 'grading' && (
                <div
                    className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-muted p-4 text-sm"
                    role="status"
                >
                    <Loader2 className="size-4 animate-spin" />
                    Grading in progress — written answers usually take
                    under a minute.
                </div>
            )}

            {attempt.status === 'needs_review' &&
                needsReviewCount > 0 && (
                    <div
                        className="mb-6 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                        role="status"
                        aria-live="assertive"
                    >
                        <span>
                            {needsReviewCount} answer
                            {needsReviewCount !== 1 ? 's' : ''} need
                            {needsReviewCount === 1 ? 's' : ''} your
                            review.
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkReviewed}
                        >
                            Mark reviewed
                        </Button>
                    </div>
                )}

            {/* Question blocks */}
            <div className="space-y-3">
                {attempt.answers.map((answer, i) => (
                    <QuestionBlock
                        key={answer.id}
                        answer={answer}
                        index={i}
                        total={attempt.answers.length}
                        examId={exam.id}
                        attemptId={attempt.id}
                    />
                ))}
            </div>
        </div>
    );
}

AttemptsShow.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default AttemptsShow;
