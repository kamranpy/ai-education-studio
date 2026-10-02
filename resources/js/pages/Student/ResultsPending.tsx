import { Head, Link } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';

interface Props {
    exam: { id: number; title: string };
    attempt: { id: number; status: string; submitted_at: string | null };
}

function ResultsPending({ exam, attempt }: Props) {
    return (
        <>
            <Head title="Results Pending" />

            <div
                className="flex min-h-[80vh] items-center justify-center px-4 py-12"
                style={{ color: 'var(--portal-text-primary)' }}
            >
                <div className="w-full max-w-lg">
                    {/* Main card */}
                    <div
                        className="flex flex-col items-center rounded-xl p-8 text-center"
                        style={{
                            background: 'var(--portal-card-bg)',
                            border: '1px solid var(--portal-card-border)',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        {/* Amber clock icon */}
                        <div
                            className="mb-8 flex h-24 w-24 items-center justify-center rounded-full"
                            style={{
                                background: 'rgba(255, 182, 149, 0.1)',
                                boxShadow:
                                    '0 0 20px rgba(255, 182, 149, 0.05)',
                            }}
                        >
                            <span
                                className="text-5xl"
                                style={{ color: '#ffb695' }}
                                aria-hidden="true"
                            >
                                ⏱
                            </span>
                        </div>

                        {/* Heading */}
                        <h1
                            className="mb-2 text-2xl font-semibold"
                            style={{ color: 'var(--portal-text-primary)' }}
                        >
                            Results Not Yet Available
                        </h1>

                        {/* Body text */}
                        <p
                            className="mb-8 max-w-md text-base leading-relaxed"
                            style={{ color: 'var(--portal-text-secondary)' }}
                        >
                            Your exam{' '}
                            <span
                                className="font-medium"
                                style={{ color: 'var(--brand-primary-text)' }}
                            >
                                {exam.title}
                            </span>{' '}
                            has been submitted. Your instructor has chosen to
                            review all submissions before releasing results. You
                            will be notified when results are announced.
                        </p>

                        {/* Submitted timestamp */}
                        {attempt.submitted_at && (
                            <div
                                className="mb-8 flex items-center gap-2 rounded-lg border px-4 py-2"
                                style={{
                                    background: 'var(--portal-input-bg)',
                                    borderColor: 'var(--portal-card-border)',
                                }}
                            >
                                <Calendar
                                    className="size-4 flex-shrink-0"
                                    style={{
                                        color: 'var(--portal-text-muted)',
                                    }}
                                />
                                <span
                                    className="text-xs font-medium"
                                    style={{
                                        color: 'var(--portal-text-secondary)',
                                    }}
                                >
                                    Submitted on{' '}
                                    {new Date(
                                        attempt.submitted_at,
                                    ).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        )}

                        {/* Back to Dashboard button */}
                        <Link
                            href="/student/dashboard"
                            className="mb-6 w-full rounded-xl py-4 text-center text-base font-semibold transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                            style={{
                                background: '#4f46e5',
                                color: '#dad7ff',
                                boxShadow:
                                    '0 4px 20px rgba(79, 70, 229, 0.25)',
                                display: 'block',
                            }}
                        >
                            Back to Dashboard
                        </Link>

                        {/* Pulsing teal dot status */}
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span
                                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                                    style={{ background: '#4fdbc8' }}
                                />
                                <span
                                    className="relative inline-flex h-2 w-2 rounded-full"
                                    style={{ background: '#4fdbc8' }}
                                />
                            </span>
                            <span
                                className="text-xs font-medium tracking-wider"
                                style={{ color: '#4fdbc8' }}
                            >
                                Awaiting Instructor Review
                            </span>
                        </div>
                    </div>

                    {/* Decorative info cards */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {/* AI Insights card */}
                        <div
                            className="flex items-center gap-3 rounded-lg p-4"
                            style={{
                                background: 'var(--portal-card-bg)',
                                border: '1px solid var(--portal-card-border)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                                style={{
                                    background: 'rgba(79, 70, 229, 0.12)',
                                }}
                            >
                                <span
                                    className="text-sm"
                                    style={{
                                        color: 'var(--brand-primary-text)',
                                    }}
                                >
                                    ✦
                                </span>
                            </div>
                            <div className="flex flex-col text-left">
                                <span
                                    className="text-[10px] font-semibold uppercase tracking-wider"
                                    style={{
                                        color: 'var(--portal-text-muted)',
                                    }}
                                >
                                    AI Insights
                                </span>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: 'var(--portal-text-primary)',
                                    }}
                                >
                                    Generating Preview...
                                </span>
                            </div>
                        </div>

                        {/* Submission ID card */}
                        <div
                            className="flex items-center gap-3 rounded-lg p-4"
                            style={{
                                background: 'var(--portal-card-bg)',
                                border: '1px solid var(--portal-card-border)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                                style={{
                                    background: 'rgba(79, 219, 200, 0.12)',
                                }}
                            >
                                <span
                                    className="text-sm"
                                    style={{ color: '#4fdbc8' }}
                                >
                                    ✓
                                </span>
                            </div>
                            <div className="flex flex-col text-left">
                                <span
                                    className="text-[10px] font-semibold uppercase tracking-wider"
                                    style={{
                                        color: 'var(--portal-text-muted)',
                                    }}
                                >
                                    Submission
                                </span>
                                <span
                                    className="text-sm"
                                    style={{
                                        color: 'var(--portal-text-primary)',
                                    }}
                                >
                                    ID: #{attempt.id}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ResultsPending.layout = (page: React.ReactNode) => (
    <StudentLayout>{page}</StudentLayout>
);

export default ResultsPending;
