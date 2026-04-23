import AdminLayout from '@/layouts/admin-layout';

function ExamBuilder() {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
                Exam Builder
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
                Create or edit an exam.
            </p>
        </div>
    );
}

ExamBuilder.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default ExamBuilder;
