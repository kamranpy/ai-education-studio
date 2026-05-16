import { router, useForm } from '@inertiajs/react';
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus,
    School,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import {
    index,
    toggleStatus,
    adjustCredits,
    destroy,
} from '@/actions/App/Http/Controllers/SuperAdmin/InstituteController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperAdminLayout from '@/layouts/super-admin-layout';

interface Institute {
    id: number;
    name: string;
    status: boolean;
    credits: number;
    user_count: number;
    exam_count: number;
}

interface Props {
    institutes: Institute[];
}

function Institutes({ institutes }: Props) {
    const [adjustTarget, setAdjustTarget] = useState<Institute | null>(null);

    const adjustForm = useForm({
        amount: '' as unknown as number,
        notes: '',
    });

    function handleToggleStatus(institute: Institute) {
        router.patch(
            toggleStatus.url({ institute: institute.id }),
            {},
            { preserveScroll: true },
        );
    }

    function handleAdjustSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!adjustTarget) {
return;
}

        adjustForm.post(adjustCredits.url({ institute: adjustTarget.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setAdjustTarget(null);
                adjustForm.reset();
            },
        });
    }

    function handleDelete(institute: Institute) {
        if (
            !confirm(
                `Delete "${institute.name}"? This will permanently delete all users, exams, and exam attempts. This cannot be undone.`,
            )
        ) {
            return;
        }

        router.delete(destroy.url({ institute: institute.id }), {
            preserveScroll: true,
        });
    }

    const totalExams = institutes.reduce((sum, i) => sum + i.exam_count, 0);

    return (
        <div className="w-full">
            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        Institutes
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Manage and monitor educational institutions and their performance metrics.
                    </p>
                </div>
                <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="size-4" />
                    Add Institute
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Total Revenue Card - Placeholder for real data */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Total Revenue
                        </p>
                        <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                            $0.00
                        </p>
                        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Revenue data coming soon
                        </div>
                    </CardContent>
                </Card>

                {/* Active Exams Card */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Active Exams
                        </p>
                        <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {totalExams.toLocaleString()}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                            <School className="size-4" />
                            Across {institutes.length} institutes
                        </div>
                    </CardContent>
                </Card>

                {/* Platform Status Card */}
                <Card className="relative overflow-hidden border-indigo-200 bg-indigo-600 text-white dark:border-indigo-800 dark:bg-indigo-700">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium opacity-80">Platform Status</p>
                        <p className="mt-1 text-xl font-semibold">Active</p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="size-2 animate-pulse rounded-full bg-emerald-400"></span>
                            <span className="text-sm">{institutes.length} Institutes</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-3">
                    <select className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Suspended</option>
                        <option>Pending</option>
                    </select>
                    <select className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <option>Sort by: Newest</option>
                        <option>Name (A-Z)</option>
                        <option>Revenue (High)</option>
                        <option>Exams (High)</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-0">
                    {institutes.length === 0 ? (
                        <div className="py-12 text-center">
                            <Building2 className="mx-auto size-12 text-slate-300 dark:text-slate-600" />
                            <p className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                                No institutes found
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Try adjusting filters or add a new institute
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-900/50">
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                            Name & Email
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                            Credits
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                            Exams
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                            Users
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {institutes.map((institute) => (
                                        <tr
                                            key={institute.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                        {institute.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                                            {institute.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        institute.status
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {institute.status ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                                                {institute.credits.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-slate-700 dark:text-slate-300">
                                                {institute.exam_count.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-slate-700 dark:text-slate-300">
                                                {institute.user_count.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleToggleStatus(institute)
                                                        }
                                                    >
                                                        {institute.status ? 'Suspend' : 'Activate'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setAdjustTarget(institute);
                                                            adjustForm.reset();
                                                        }}
                                                    >
                                                        Adjust
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                institute,
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing {institutes.length} of {institutes.length} institutes
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" disabled>
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button variant="outline" size="icon" disabled>
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Credit Adjustment Dialog */}
            <Dialog
                open={adjustTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setAdjustTarget(null);
                        adjustForm.reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Credits</DialogTitle>
                        <DialogDescription>
                            Adjust the credit balance for{' '}
                            <strong>{adjustTarget?.name}</strong>. Use a
                            positive number to add credits or a negative
                            number to deduct them.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAdjustSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">
                                    Amount (positive to add, negative to
                                    deduct)
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={adjustForm.data.amount}
                                    onChange={(e) =>
                                        adjustForm.setData(
                                            'amount',
                                            parseInt(e.target.value, 10),
                                        )
                                    }
                                    placeholder="e.g. 100 or -50"
                                    className="tabular-nums"
                                />
                                {adjustForm.errors.amount && (
                                    <p className="text-sm text-destructive">
                                        {adjustForm.errors.amount}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">
                                    Notes{' '}
                                    <span className="text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <textarea
                                    id="notes"
                                    value={adjustForm.data.notes}
                                    onChange={(e) =>
                                        adjustForm.setData(
                                            'notes',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Reason for adjustment..."
                                    rows={3}
                                    maxLength={500}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {adjustForm.errors.notes && (
                                    <p className="text-sm text-destructive">
                                        {adjustForm.errors.notes}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setAdjustTarget(null);
                                    adjustForm.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={adjustForm.processing}
                            >
                                {adjustForm.processing && (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                )}
                                Apply Adjustment
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Institutes.layout = (page: React.ReactNode) => (
    <SuperAdminLayout>{page}</SuperAdminLayout>
);

export default Institutes;
