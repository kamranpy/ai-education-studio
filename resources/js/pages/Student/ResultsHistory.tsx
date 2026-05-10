import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock, Eye, XCircle } from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import { results as attemptResults } from '@/actions/App/Http/Controllers/Student/ExamAttemptController';

interface AttemptExam {
    id: number;
    title: string;
    class_name: string | null;
    subject_name: string | null;
    passing_score: number;
    evaluation_strategy: 'instant' | 'manual';
    results_announced: boolean;
}

interface Attempt {
    id: number;
    exam: AttemptExam | null;
    status: string;
    submitted_at: string | null;
    can_see_results: boolean;
    final_score: number | null;
    total_points: number | null;
}

interface Props {
    attempts: {
        data: Attempt[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

function ResultsHistory({ attempts }: Props) {
    return (
        <>
            <Head title="My Results" />

            <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
                {/* Page header */}
                <div className="space-y-1">
                    <h1
                        className="text-2xl font-semibold flex items-center gap-2"
                        style={{ color: '#e4e1ee' }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            style={{ color: '#c3c0ff' }}
                        >
                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                        </svg>
                        My Results
                    </h1>
                    <p className="text-sm" style={{ color: '#c7c4d8' }}>
                        View your exam scores and performance history.
                    </p>
                </div>

                {/* Empty state */}
                {attempts.data.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center rounded-xl py-16"
                        style={{
                            border: '2px dashed rgba(70, 69, 85, 0.3)',
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            style={{ color: 'rgba(70, 69, 85, 0.6)' }}
                        >
                            <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                        </svg>
                        <p className="mt-3 text-sm" style={{ color: '#c7c4d8' }}>
                            No results yet. Complete an exam to see your scores here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {attempts.data.map((attempt) => {
                            if (!attempt.exam) {
return null;
}

                            const exam = attempt.exam;
                            const percentage =
                                attempt.can_see_results &&
                                attempt.final_score !== null &&
                                attempt.total_points
                                    ? Math.round(
                                          (attempt.final_score /
                                              attempt.total_points) *
                                              100,
                                      )
                                    : null;
                            const passed =
                                percentage !== null &&
                                percentage >= exam.passing_score;

                            return (
                                <div
                                    key={attempt.id}
                                    className="rounded-xl p-5 transition-colors"
                                    style={{
                                        background: '#1c1b1b',
                                        border: '1px solid rgba(70, 69, 85, 0.3)',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.borderColor =
                                            'rgba(70, 69, 85, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.borderColor =
                                            'rgba(70, 69, 85, 0.3)';
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <h3
                                                className="truncate text-base font-medium"
                                                style={{ color: '#e4e1ee' }}
                                            >
                                                {exam.title}
                                            </h3>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                {exam.class_name && (
                                                    <span
                                                        className="rounded px-1.5 py-0.5"
                                                        style={{
                                                            background:
                                                                'rgba(79, 70, 229, 0.12)',
                                                            color: '#c3c0ff',
                                                        }}
                                                    >
                                                        {exam.class_name}
                                                    </span>
                                                )}
                                                {exam.subject_name && (
                                                    <span
                                                        className="rounded px-1.5 py-0.5"
                                                        style={{
                                                            background:
                                                                'rgba(79, 219, 200, 0.12)',
                                                            color: '#4fdbc8',
                                                        }}
                                                    >
                                                        {exam.subject_name}
                                                    </span>
                                                )}
                                                {attempt.submitted_at && (
                                                    <span
                                                        className="flex items-center gap-1"
                                                        style={{ color: '#c7c4d8' }}
                                                    >
                                                        <Clock className="size-3" />
                                                        {new Date(
                                                            attempt.submitted_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {attempt.can_see_results ? (
                                                <>
                                                    {percentage !== null && (
                                                        <div className="text-right">
                                                            <div
                                                                className={`text-xl font-bold ${
                                                                    passed
                                                                        ? 'text-emerald-400'
                                                                        : 'text-red-400'
                                                                }`}
                                                            >
                                                                {percentage}%
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs">
                                                                {passed ? (
                                                                    <>
                                                                        <CheckCircle2 className="size-3 text-emerald-400" />
                                                                        <span className="text-emerald-400">
                                                                            Passed
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle className="size-3 text-red-400" />
                                                                        <span className="text-red-400">
                                                                            Failed
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <Link
                                                        href={attemptResults.url({
                                                            exam: exam.id,
                                                            attempt: attempt.id,
                                                        })}
                                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                                                        style={{
                                                            border: '1px solid rgba(70, 69, 85, 0.3)',
                                                            color: '#c7c4d8',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            (
                                                                e.currentTarget as HTMLElement
                                                            ).style.background =
                                                                '#2a2933';
                                                            (
                                                                e.currentTarget as HTMLElement
                                                            ).style.color =
                                                                '#e4e1ee';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            (
                                                                e.currentTarget as HTMLElement
                                                            ).style.background =
                                                                'transparent';
                                                            (
                                                                e.currentTarget as HTMLElement
                                                            ).style.color =
                                                                '#c7c4d8';
                                                        }}
                                                    >
                                                        <Eye className="size-3.5" />
                                                        View
                                                    </Link>
                                                </>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                                                    style={{
                                                        border: '1px solid rgba(255, 182, 149, 0.3)',
                                                        color: '#ffb695',
                                                        background:
                                                            'rgba(255, 182, 149, 0.08)',
                                                    }}
                                                >
                                                    <Clock className="size-3" />
                                                    Awaiting Announcement
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {attempts.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 pt-4">
                        {attempts.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                                style={
                                    link.active
                                        ? {
                                              background: '#c3c0ff',
                                              color: '#1d00a5',
                                          }
                                        : link.url
                                          ? {
                                                color: '#c7c4d8',
                                                border: '1px solid rgba(70, 69, 85, 0.3)',
                                            }
                                          : {
                                                color: 'rgba(199, 196, 216, 0.3)',
                                                cursor: 'not-allowed',
                                                pointerEvents: 'none',
                                            }
                                }
                                preserveScroll
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ResultsHistory.layout = (page: React.ReactNode) => (
    <StudentLayout>{page}</StudentLayout>
);

export default ResultsHistory;
