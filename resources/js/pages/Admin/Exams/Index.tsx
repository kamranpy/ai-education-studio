import AdminLayout from '@/layouts/admin-layout';

function ExamsIndex() {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Exams</h1>
            <p className="mt-2 text-sm text-zinc-500">
                Manage your exams.
            </p>
        </div>
    );
}

ExamsIndex.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default ExamsIndex;
