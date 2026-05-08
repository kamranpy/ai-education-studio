import SuperAdminLayout from '@/layouts/super-admin-layout';
import {
    index,
    toggleStatus,
    adjustCredits,
    destroy,
} from '@/actions/App/Http/Controllers/SuperAdmin/InstituteController';
import { router, useForm } from '@inertiajs/react';
import { Building2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
        if (!adjustTarget) return;

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

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Institutes
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Manage all registered institutes, their credit balances,
                    and access status.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="size-5" />
                        All Institutes
                    </CardTitle>
                    <CardDescription>
                        {institutes.length} institute
                        {institutes.length !== 1 ? 's' : ''} registered
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {institutes.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No institutes registered yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        <th className="pb-3 pr-4">Name</th>
                                        <th className="pb-3 pr-4">Status</th>
                                        <th className="pb-3 pr-4 text-right">
                                            Credits
                                        </th>
                                        <th className="pb-3 pr-4 text-right">
                                            Exams
                                        </th>
                                        <th className="pb-3 pr-4 text-right">
                                            Users
                                        </th>
                                        <th className="pb-3 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {institutes.map((institute) => (
                                        <tr
                                            key={institute.id}
                                            className="group"
                                        >
                                            <td className="py-3 pr-4 font-medium text-foreground">
                                                {institute.name}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        institute.status
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                    }`}
                                                >
                                                    {institute.status
                                                        ? 'Active'
                                                        : 'Suspended'}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-right tabular-nums text-foreground">
                                                {institute.credits.toLocaleString()}
                                            </td>
                                            <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                                                {institute.exam_count.toLocaleString()}
                                            </td>
                                            <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                                                {institute.user_count.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                institute,
                                                            )
                                                        }
                                                    >
                                                        {institute.status
                                                            ? 'Suspend'
                                                            : 'Activate'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setAdjustTarget(
                                                                institute,
                                                            );
                                                            adjustForm.reset();
                                                        }}
                                                    >
                                                        Adjust Credits
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
