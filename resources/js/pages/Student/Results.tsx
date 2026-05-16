import { Link } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';

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

function getQuestionTypeLabel(type: string): string {
    switch (type) {
        case 'mcq':
            return 'Multiple Choice';
        case 'true_false':
            return 'True / False';
        case 'written_answer':
            return 'Written Answer';
        default:
            return 'Short Answer';
    }
}

function Results({ exam, attempt }: Props) {
    const percentage =
        attempt.total_points > 0
            ? Math.round((attempt.final_score / attempt.total_points) * 100)
            : 0;

    // Determine pass/fail — use 60% as default threshold if not provided
    const passed = percentage >= 60;

    return (
        <div
            className="mx-auto max-w-3xl px-6 py-8"
            style={{ color: 'var(--portal-text-primary)' }}
        >
            {/* Back link */}
            <Link
                href="/student/dashboard"
                className="mb-6 inline-flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
                style={{ color: 'var(--portal-text-muted)' }}
            >
                <span style={{ fontSize: '16px' }}>←</span>
                Back to Exams
            </Link>

            {/* Header */}
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <h1
                        className="text-3xl font-semibold tracking-tight"
                        style={{ color: 'var(--portal-text-primary)' }}
                    >
                        {exam.title}
                    </h1>
                    {attempt.status === 'graded' && (
                        <p
                            className="mt-1.5 text-sm"
                            style={{ color: 'var(--portal-text-secondary)' }}
                        >
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

                {/* Score badge */}
                {attempt.status === 'graded' && (
                    <div
                        className="flex h-24 w-24 flex-shrink-0 flex-col items-center justify-center rounded-2xl border"
                        style={{
                            background: passed
                                ? 'rgba(79, 219, 200, 0.1)'
                                : 'rgba(255, 180, 171, 0.1)',
                            borderColor: passed
                                ? 'rgba(79, 219, 200, 0.3)'
                                : 'rgba(255, 180, 171, 0.3)',
                        }}
                    >
                        <span
                            className="text-3xl font-bold"
                            style={{ color: passed ? '#4fdbc8' : '#ffb4ab' }}
                        >
                            {percentage}%
                        </span>
                        <span
                            className="text-[10px] font-semibold uppercase tracking-wider"
                            style={{
                                color: passed
                                    ? 'rgba(79,219,200,0.8)'
                                    : 'rgba(255,180,171,0.8)',
                            }}
                        >
                            SCORE
                        </span>
                    </div>
                )}
            </div>

            {/* Status banners */}
            <div className="mb-10 space-y-3">
                {attempt.status === 'needs_review' && (
                    <div
                        className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
                        style={{
                            background: 'rgba(255, 182, 149, 0.08)',
                            borderColor: 'rgba(255, 182, 149, 0.2)',
                            color: '#ffb695',
                        }}
                        role="status"
                    >
                        <span className="text-base">⏱</span>
                        Needs Review: Some written answers are awaiting teacher
                        feedback.
                    </div>
                )}
                {attempt.status === 'grading' && (
                    <div
                        className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
                        style={{
                            background: 'rgba(79, 70, 229, 0.08)',
                            borderColor: 'rgba(79, 70, 229, 0.2)',
                            color: 'var(--brand-primary-text)',
                        }}
                        role="status"
                    >
                        <span className="animate-spin text-base">⟳</span>
                        Grading: AI is evaluating your written answers.
                    </div>
                )}
            </div>

            {/* Question cards */}
            <div className="space-y-5">
                {attempt.answers.map((answer, i) => {
                    const q = answer.question;
                    const score = answer.final_score ?? 0;
                    const isWritten = q.type === 'written_answer';
                    const hasAnswer = answer.answer_data !== null;
                    const isCorrect =
                        !isWritten &&
                        answer.ai_score !== null &&
                        answer.ai_score > 0;
                    const isScored =
                        !isWritten && answer.ai_score !== null;

                    return (
                        <div
                            key={answer.id}
                            className="rounded-2xl p-6 transition-transform duration-300 hover:scale-[1.005]"
                            style={{
                                background: 'var(--portal-card-bg)',
                                border: '1px solid var(--portal-card-border)',
                                opacity: !hasAnswer ? 0.8 : 1,
                            }}
                        >
                            {/* Card header */}
                            <div className="mb-4 flex items-start justify-between">
                                <span
                                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                                    style={{
                                        background:
                                            'rgba(79, 70, 229, 0.12)',
                                        color: 'var(--brand-primary-text)',
                                    }}
                                >
                                    Q{i + 1} · {getQuestionTypeLabel(q.type)}
                                </span>
                                <span
                                    className="text-xs font-semibold"
                                    style={{
                                        color:
                                            !isScored && !isWritten
                                                ? 'var(--portal-text-muted)'
                                                : isWritten
                                                  ? 'var(--brand-primary-text)'
                                                  : isCorrect
                                                    ? '#4fdbc8'
                                                    : '#ffb4ab',
                                    }}
                                >
                                    {score} / {q.points} pts
                                </span>
                            </div>

                            {/* Question text */}
                            <p
                                className="mb-4 text-base font-medium"
                                style={{ color: 'var(--portal-text-primary)' }}
                            >
                                {q.text}
                            </p>

                            {/* Answer display */}
                            {!hasAnswer ? (
                                /* No answer submitted */
                                <div
                                    className="rounded-xl border border-dashed p-4"
                                    style={{
                                        borderColor:
                                            'var(--portal-card-border)',
                                    }}
                                >
                                    <span
                                        className="text-sm italic"
                                        style={{
                                            color: 'var(--portal-text-muted)',
                                        }}
                                    >
                                        (no answer submitted)
                                    </span>
                                </div>
                            ) : isWritten ? (
                                /* Written answer */
                                <div>
                                    <div
                                        className="rounded-xl border p-4"
                                        style={{
                                            background:
                                                'var(--portal-input-bg)',
                                            borderColor:
                                                'var(--portal-card-border)',
                                        }}
                                    >
                                        <span
                                            className="mb-2 block text-xs font-medium uppercase tracking-wider"
                                            style={{
                                                color: 'var(--portal-text-muted)',
                                            }}
                                        >
                                            Your answer:
                                        </span>
                                        <p
                                            className="text-sm italic leading-relaxed"
                                            style={{
                                                color: 'var(--portal-text-primary)',
                                            }}
                                        >
                                            "
                                            {(
                                                answer.answer_data as Record<
                                                    string,
                                                    string
                                                >
                                            )?.text || '(empty)'}
                                            "
                                        </p>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <span
                                            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase"
                                            style={{
                                                background:
                                                    'rgba(79, 70, 229, 0.12)',
                                                color: 'var(--brand-primary-text)',
                                            }}
                                        >
                                            AI Reviewed
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* MCQ / True-False */
                                <div>
                                    <div
                                        className="flex items-center justify-between rounded-xl border p-4"
                                        style={{
                                            background: isCorrect
                                                ? 'rgba(79, 219, 200, 0.05)'
                                                : 'rgba(255, 180, 171, 0.05)',
                                            borderColor: isCorrect
                                                ? 'rgba(79, 219, 200, 0.2)'
                                                : 'rgba(255, 180, 171, 0.2)',
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="text-sm"
                                                style={{
                                                    color: 'var(--portal-text-muted)',
                                                }}
                                            >
                                                Your answer:
                                            </span>
                                            <span
                                                className="text-sm font-medium"
                                                style={{
                                                    color: 'var(--portal-text-primary)',
                                                }}
                                            >
                                                {String(
                                                    (
                                                        answer.answer_data as Record<
                                                            string,
                                                            unknown
                                                        >
                                                    )?.selected_choice_id ??
                                                        (
                                                            answer.answer_data as Record<
                                                                string,
                                                                unknown
                                                            >
                                                        )?.value ??
                                                        '—',
                                                )}
                                            </span>
                                        </div>
                                        {isScored &&
                                            (isCorrect ? (
                                                <CheckCircle2
                                                    className="size-5 flex-shrink-0"
                                                    style={{
                                                        color: '#4fdbc8',
                                                    }}
                                                />
                                            ) : (
                                                <XCircle
                                                    className="size-5 flex-shrink-0"
                                                    style={{
                                                        color: '#ffb4ab',
                                                    }}
                                                />
                                            ))}
                                    </div>

                                    {/* Incorrect: show hint */}
                                    {isScored && !isCorrect && (
                                        <div
                                            className="mt-3 rounded-xl border p-4"
                                            style={{
                                                background:
                                                    'var(--portal-input-bg)',
                                                borderColor:
                                                    'var(--portal-card-border)',
                                            }}
                                        >
                                            <p
                                                className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
                                                style={{
                                                    color: 'var(--portal-text-muted)',
                                                }}
                                            >
                                                Correct Answer
                                            </p>
                                            <p
                                                className="text-sm"
                                                style={{ color: '#4fdbc8' }}
                                            >
                                                Review your course material for
                                                this topic.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Score summary footer */}
            <footer
                className="relative mt-12 mb-20 overflow-hidden rounded-3xl p-8"
                style={{
                    background: 'var(--portal-card-bg)',
                    border: '1px solid var(--portal-card-border)',
                }}
            >
                {/* Subtle mesh gradient */}
                <div
                    className="pointer-events-none absolute inset-0 -z-10 opacity-10"
                    style={{
                        background:
                            'radial-gradient(circle at top right, #4fdbc8, transparent 50%), radial-gradient(circle at bottom left, #4f46e5, transparent 50%)',
                    }}
                />

                <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                    {/* Score display */}
                    <div className="flex items-center gap-6">
                        <div className="text-center md:text-left">
                            <p
                                className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                                style={{ color: 'var(--portal-text-muted)' }}
                            >
                                Final Score
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span
                                    className="text-5xl font-bold"
                                    style={{
                                        color: 'var(--portal-text-primary)',
                                    }}
                                >
                                    {attempt.final_score}
                                </span>
                                <span
                                    className="text-2xl"
                                    style={{
                                        color: 'var(--portal-text-muted)',
                                    }}
                                >
                                    / {attempt.total_points}
                                </span>
                            </div>
                        </div>

                        <div
                            className="hidden h-12 w-px md:block"
                            style={{
                                background: 'var(--portal-card-border)',
                            }}
                        />

                        {/* Pass/Fail badge */}
                        <div
                            className="flex items-center gap-2 rounded-full border px-6 py-2 text-lg font-bold"
                            style={{
                                background: passed
                                    ? 'rgba(79, 219, 200, 0.15)'
                                    : 'rgba(255, 180, 171, 0.15)',
                                borderColor: passed
                                    ? 'rgba(79, 219, 200, 0.3)'
                                    : 'rgba(255, 180, 171, 0.3)',
                                color: passed ? '#4fdbc8' : '#ffb4ab',
                            }}
                        >
                            {passed ? '✓ Passed' : '✗ Failed'}
                        </div>
                    </div>

                    {/* Back to Dashboard button */}
                    <Link
                        href="/student/dashboard"
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold transition-all duration-300 hover:shadow-[0_4px_20px_rgba(79,70,229,0.25)] md:w-auto"
                        style={{
                            background: '#4f46e5',
                            color: '#dad7ff',
                        }}
                    >
                        <span>⌂</span>
                        Back to Dashboard
                    </Link>
                </div>
            </footer>
        </div>
    );
}

Results.layout = (page: React.ReactNode) => (
    <StudentLayout>{page}</StudentLayout>
);

export default Results;
