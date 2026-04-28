import StudentLayout from '@/layouts/student-layout';
import { Head, Link } from '@inertiajs/react';
import { Clock, FileText } from 'lucide-react';

interface Props {
    exam: { id: number; title: string };
    attempt: { id: number; status: string; submitted_at: string | null };
}

function ResultsPending({ exam, attempt }: Props) {
    return (
        <>
            <Head title="Results Pending" />

            <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-20 text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-amber-50">
                    <Clock className="size-8 text-amber-500" />
                </div>

                <h1 className="text-2xl font-semibold text-zinc-900">
                    Results Not Yet Available
                </h1>

                <p className="mt-3 max-w-md text-sm text-zinc-500">
                    Your exam <strong>{exam.title}</strong> has been submitted
                    and graded. However, your instructor has chosen to review
                    all submissions before releasing results.
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                    You will be able to view your results once your instructor
                    announces them.
                </p>

                {attempt.submitted_at && (
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400">
                        <FileText className="size-3.5" />
                        Submitted on{' '}
                        {new Date(attempt.submitted_at).toLocaleString()}
                    </p>
                )}

                <Link
                    href="/student/dashboard"
                    className="mt-8 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                >
                    Back to Dashboard
                </Link>
            </div>
        </>
    );
}

ResultsPending.layout = (page: React.ReactNode) => (
    <StudentLayout>{page}</StudentLayout>
);

export default ResultsPending;
