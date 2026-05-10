import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import StudentLayout from '@/layouts/student-layout';

interface Props {
    exam: { id: number; title: string };
    attempt: { id: number; status: string };
}

function Interstitial({ exam, attempt }: Props) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Poll every 5 seconds until status leaves 'grading'
        intervalRef.current = setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['attempt'] });
            }
        }, 5000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Auto-redirect when grading completes
    useEffect(() => {
        if (attempt.status !== 'grading') {
            router.visit(
                `/student/exams/${exam.id}/attempts/${attempt.id}/results`,
            );
        }
    }, [attempt.status, exam.id, attempt.id]);

    return (
        <div
            className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-6"
            style={{ background: 'var(--portal-bg)' }}
        >
            {/* Background orbs */}
            <div
                className="pointer-events-none absolute -left-[10%] -top-[10%] h-[400px] w-[400px] rounded-full"
                style={{
                    background: 'rgba(79, 70, 229, 0.1)',
                    filter: 'blur(120px)',
                }}
            />
            <div
                className="pointer-events-none absolute -bottom-[10%] -right-[10%] h-[400px] w-[400px] rounded-full"
                style={{
                    background: 'rgba(79, 219, 200, 0.1)',
                    filter: 'blur(120px)',
                }}
            />

            {/* Content container */}
            <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
                {/* Spinning indigo ring with brain icon */}
                <div className="relative mb-8">
                    <div
                        className="h-16 w-16 animate-spin rounded-full border-4"
                        style={{
                            borderColor: 'rgba(79, 70, 229, 0.2)',
                            borderTopColor: '#4f46e5',
                            animationDuration: '1.5s',
                        }}
                    />
                    {/* Central icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span
                            className="text-2xl"
                            style={{ color: 'var(--brand-primary-text)' }}
                            aria-hidden="true"
                        >
                            🧠
                        </span>
                    </div>
                </div>

                {/* Heading */}
                <div className="mb-4 space-y-2">
                    <h1
                        className="text-3xl font-semibold tracking-tight"
                        style={{ color: 'var(--portal-text-primary)' }}
                    >
                        Grading your exam...
                    </h1>
                    <p
                        className="mx-auto max-w-md text-base leading-relaxed"
                        style={{ color: 'var(--portal-text-secondary)' }}
                    >
                        Our AI is evaluating your written answers. This usually
                        takes under a minute.
                    </p>
                </div>

                {/* Pulsing teal dot indicator */}
                <div
                    className="mt-4 flex items-center gap-2 rounded-full border px-4 py-2"
                    style={{
                        background: 'rgba(79, 219, 200, 0.05)',
                        borderColor: 'rgba(79, 219, 200, 0.2)',
                    }}
                >
                    <span
                        className="h-2 w-2 animate-pulse rounded-full"
                        style={{ background: '#4fdbc8' }}
                    />
                    <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: '#4fdbc8' }}
                    >
                        AI grading in progress
                    </span>
                </div>

                {/* Skeleton loading section */}
                <div
                    className="mt-8 w-full rounded-xl p-6"
                    style={{
                        background: 'rgba(26, 26, 26, 0.6)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid var(--portal-card-border)',
                    }}
                >
                    {/* Skeleton row 1 — 75% */}
                    <div className="mb-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div
                                className="h-4 w-32 animate-shimmer rounded"
                                style={{
                                    background: 'var(--portal-badge-bg)',
                                }}
                            />
                            <div
                                className="h-4 w-8 animate-shimmer rounded"
                                style={{
                                    background: 'var(--portal-badge-bg)',
                                }}
                            />
                        </div>
                        <div
                            className="h-2 w-full overflow-hidden rounded-full"
                            style={{ background: 'var(--portal-input-bg)' }}
                        >
                            <div
                                className="animate-shimmer h-full w-3/4 rounded-full opacity-50"
                                style={{ background: '#4f46e5' }}
                            />
                        </div>
                    </div>

                    {/* Skeleton row 2 — 50% */}
                    <div className="mb-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div
                                className="h-4 w-40 animate-shimmer rounded"
                                style={{
                                    background: 'var(--portal-badge-bg)',
                                }}
                            />
                            <div
                                className="h-4 w-8 animate-shimmer rounded"
                                style={{
                                    background: 'var(--portal-badge-bg)',
                                }}
                            />
                        </div>
                        <div
                            className="h-2 w-full overflow-hidden rounded-full"
                            style={{ background: 'var(--portal-input-bg)' }}
                        >
                            <div
                                className="animate-shimmer h-full w-1/2 rounded-full opacity-50"
                                style={{ background: '#4fdbc8' }}
                            />
                        </div>
                    </div>

                    {/* Skeleton row 3 — 65% */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div
                                className="h-4 w-24 animate-shimmer rounded"
                                style={{
                                    background: 'var(--portal-badge-bg)',
                                }}
                            />
                            <div
                                className="h-4 w-8 animate-shimmer rounded"
                                style={{
                                    background: 'var(--portal-badge-bg)',
                                }}
                            />
                        </div>
                        <div
                            className="h-2 w-full overflow-hidden rounded-full"
                            style={{ background: 'var(--portal-input-bg)' }}
                        >
                            <div
                                className="animate-shimmer h-full rounded-full opacity-50"
                                style={{
                                    width: '65%',
                                    background: '#4f46e5',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer hint */}
                <p
                    className="mt-8 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--portal-text-muted)', opacity: 0.5 }}
                >
                    Analyzing linguistic patterns &amp; conceptual accuracy
                </p>
            </div>

            {/* Decorative depth card */}
            <div
                className="pointer-events-none absolute -bottom-10 left-1/2 h-32 w-[90%] -translate-x-1/2 rounded-t-[40px] opacity-20"
                style={{
                    background: 'rgba(26, 26, 26, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--portal-card-border)',
                }}
            />
        </div>
    );
}

Interstitial.layout = (page: React.ReactNode) => (
    <StudentLayout>{page}</StudentLayout>
);

export default Interstitial;
