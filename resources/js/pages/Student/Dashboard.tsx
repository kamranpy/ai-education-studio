import StudentLayout from '@/layouts/student-layout';
import { router } from '@inertiajs/react';
import { BookOpen, Clock, PlayCircle, RotateCcw } from 'lucide-react';

interface Exam {
    id: number;
    title: string;
    description: string | null;
    time_limit_minutes: number | null;
    questions_count: number;
}

interface PaginatedExams {
    data: Exam[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    exams: PaginatedExams;
    inProgressExamIds: number[];
}

function Dashboard({ exams, inProgressExamIds }: Props) {
    const handleStartExam = (examId: number) => {
        router.post(`/student/exams/${examId}/attempts`);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-zinc-900">
                    Available Exams
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Select an exam to begin. Your progress will be saved
                    automatically.
                </p>
            </div>

            {exams.data.length === 0 ? (
                <div className="rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-zinc-300" />
                    <h2 className="mt-4 text-lg font-medium text-zinc-900">
                        No Questions Available
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500">
                        Your exam appears to be empty. Please contact your
                        instructor.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {exams.data.map((exam) => {
                        const isInProgress =
                            inProgressExamIds.includes(exam.id);

                        return (
                            <div
                                key={exam.id}
                                className="group relative flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex flex-1 flex-col p-6">
                                    <h3 className="text-lg font-semibold text-zinc-900">
                                        {exam.title}
                                    </h3>
                                    {exam.description && (
                                        <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                                            {exam.description}
                                        </p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 font-medium">
                                            <BookOpen className="h-3 w-3" />
                                            {exam.questions_count} questions
                                        </span>
                                        {exam.time_limit_minutes && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 font-medium">
                                                <Clock className="h-3 w-3" />
                                                {exam.time_limit_minutes} min
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-zinc-100 px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleStartExam(exam.id)
                                        }
                                        className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                                            isInProgress
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                        }`}
                                    >
                                        {isInProgress ? (
                                            <>
                                                <RotateCcw className="h-4 w-4" />
                                                Resume Exam
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="h-4 w-4" />
                                                Start Exam
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {exams.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    {exams.prev_page_url && (
                        <button
                            type="button"
                            onClick={() =>
                                router.get(exams.prev_page_url as string)
                            }
                            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Previous
                        </button>
                    )}
                    <span className="text-sm text-zinc-500">
                        Page {exams.current_page} of {exams.last_page}
                    </span>
                    {exams.next_page_url && (
                        <button
                            type="button"
                            onClick={() =>
                                router.get(exams.next_page_url as string)
                            }
                            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Next
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <StudentLayout>{page}</StudentLayout>
);

export default Dashboard;
