import AdminLayout from '@/layouts/admin-layout';

function Dashboard() {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Institute Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-500">
                Manage your exams, students, and institute settings.
            </p>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;
