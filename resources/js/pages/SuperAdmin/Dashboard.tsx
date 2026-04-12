import SuperAdminLayout from '@/layouts/super-admin-layout';

function Dashboard() {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Super Admin Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-500">
                Manage all institutes, global billing, and platform settings.
            </p>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <SuperAdminLayout>{page}</SuperAdminLayout>;

export default Dashboard;
