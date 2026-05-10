import { Head, Link } from '@inertiajs/react';
import {
    Award,
    CalendarDays,
    CheckCircle2,
    Clock,
    Eye,
    XCircle,
} from 'lucide-react';
import { results as attemptResults } from '@/actions/App/Http/Controllers/Student/ExamAttemptController';
import { Badge } from '@/components/ui/badge';
import StudentLayout from '@/layouts/student-layout';

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

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-zinc-900">
                        <Award className="mr-2 inline-block size-6" />
                        My Results
                    </h1>
                    <p className="text-sm text-zinc-500">
                        View your exam scores and performance history.
                    </p>
                </div>

                {attempts.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                        <CalendarDays className="size-10 text-zinc-300" />
                        <p className="mt-3 text-sm text-zinc-500">
                            No results yet. Complete an exam to see your scores
                            here.
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
                                    className="rounded-lg border bg-white p-5 shadow-sm transition-colors hover:bg-zinc-50"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-base font-medium text-zinc-900">
                                                {exam.title}
                                            </h3>
                                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                                                {exam.class_name && (
                                                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">
                                                        {exam.class_name}
                                                    </span>
                                                )}
                                                {exam.subject_name && (
                                                    <span className="rounded bg-purple-50 px-1.5 py-0.5 text-purple-700">
                                                        {exam.subject_name}
                                                    </span>
                                                )}
                                                {attempt.submitted_at && (
                                                    <span className="flex items-center gap-1">
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
                                                                className={`text-xl font-bold ${passed ? 'text-emerald-600' : 'text-red-600'}`}
                                                            >
                                                                {percentage}%
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs">
                                                                {passed ? (
                                                                    <>
                                                                        <CheckCircle2 className="size-3 text-emerald-500" />
                                                                        <span className="text-emerald-600">
                                                                            Passed
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle className="size-3 text-red-500" />
                                                                        <span className="text-red-600">
                                                                            Failed
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <Link
                                                        href={attemptResults.url(
                                                            {
                                                                exam: exam.id,
                                                                attempt:
                                                                    attempt.id,
                                                            },
                                                        )}
                                                        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        View
                                                    </Link>
                                                </>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="text-amber-600"
                                                >
                                                    <Clock className="mr-1 size-3" />
                                                    Awaiting Announcement
                                                </Badge>
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
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                    link.active
                                        ? 'bg-zinc-900 text-white'
                                        : link.url
                                            ? 'text-zinc-600 hover:bg-zinc-100'
                                            : 'cursor-not-allowed text-zinc-300'
                                }`}
                                preserveScroll
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
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
