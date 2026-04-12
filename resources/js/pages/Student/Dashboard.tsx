import StudentLayout from '@/layouts/student-layout';

function Dashboard() {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Student Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-500">
                View your available exams, results, and progress.
            </p>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <StudentLayout>{page}</StudentLayout>;

export default Dashboard;
