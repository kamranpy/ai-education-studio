import StudentLayout from '@/layouts/student-layout';
import { Link } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Question {
    id: number;
    type: string;
    text: string;
    points: number;
}

interface Answer {
    id: number;
    question: Question;
    answer_data: Record<string, unknown> | null;
    final_score: number | null;
    status: string;
    ai_score: number | null;
}

interface Attempt {
    id: number;
    status: string;
    submitted_at: string | null;
    total_points: number;
    final_score: number;
    answers: Answer[];
}

interface Props {
    exam: { id: number; title: string };
    attempt: Attempt;
}

function Results({ exam, attempt }: Props) {
    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Your results — {exam.title}
                </h1>
                {attempt.status === 'graded' && (
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
                        · Score {attempt.final_score}/
                        {attempt.total_points}
                    </p>
                )}
            </div>

            {/* Pending review banner */}
            {attempt.status === 'needs_review' && (
                <div
                    className="mb-6 rounded-lg border border-border bg-muted p-4 text-sm"
                    role="status"
                >
                    Your exam is being reviewed. We'll let you know
                    once your final grade is ready.
                </div>
            )}

            {/* Grading banner */}
            {attempt.status === 'grading' && (
                <div
                    className="mb-6 rounded-lg border border-border bg-muted p-4 text-sm"
                    role="status"
                >
                    We're grading your written answers. This usually
                    takes under a minute — check back shortly.
                </div>
            )}

            {/* Questions */}
            <Card>
                <CardContent className="divide-y divide-border p-0">
                    {attempt.answers.map((answer, i) => {
                        const q = answer.question;
                        const score = answer.final_score ?? 0;
                        const isCorrect =
                            q.type !== 'written' &&
                            answer.ai_score !== null &&
                            answer.ai_score > 0;

                        return (
                            <div key={answer.id} className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Question {i + 1}
                                        </p>
                                        <p className="mt-1 text-sm">
                                            {q.text}
                                        </p>
                                    </div>

                                    <div className="flex flex-shrink-0 items-center gap-3">
                                        {q.type !== 'written' &&
                                            answer.ai_score !==
                                                null && (
                                                <>
                                                    {isCorrect ? (
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
                                                </>
                                            )}

                                        <span className="font-mono text-sm font-medium">
                                            {score}/{q.points}
                                        </span>
                                    </div>
                                </div>

                                {/* No answer submitted */}
                                {!answer.answer_data && (
                                    <p className="mt-2 text-xs text-muted-foreground italic">
                                        (no answer submitted)
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Score summary */}
            <div className="mt-6 text-center">
                <p className="text-2xl font-semibold text-foreground">
                    {attempt.final_score} / {attempt.total_points}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Final score
                </p>
            </div>

            {/* Back link */}
            <div className="mt-8 text-center">
                <Link
                    href="/student/dashboard"
                    className="text-sm text-primary hover:underline"
                >
                    Back to exams
                </Link>
            </div>
        </div>
    );
}

Results.layout = (page: React.ReactNode) => (
    <StudentLayout>{page}</StudentLayout>
);

export default Results;
