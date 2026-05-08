import {
    create as packagesCreate,
    edit as packagesEdit,
    destroy as packagesDestroy,
} from '@/actions/App/Http/Controllers/SuperAdmin/CreditPackageController';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { CreditCard, Edit, Trash } from 'lucide-react';

interface CreditPackage {
    id: number;
    name: string;
    credits: number;
    price_cents: number;
    currency: string;
    is_active: boolean;
}

interface Props {
    packages: CreditPackage[];
}

function formatPrice(cents: number, currency: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}

function Index({ packages }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this package?')) {
            router.delete(packagesDestroy.url(id));
        }
    };

    return (
        <>
            <Head title="Billing Configuration" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Billing Configuration
                    </h1>
                    <Button asChild>
                        <Link href={packagesCreate.url()}>+ New Package</Link>
                    </Button>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Package Name</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center text-zinc-500"
                                    >
                                        No credit packages found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                packages.map((pkg) => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {pkg.name}
                                        </TableCell>
                                        <TableCell>{pkg.credits}</TableCell>
                                        <TableCell>
                                            {formatPrice(pkg.price_cents, pkg.currency)}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    pkg.is_active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                                                }`}
                                            >
                                                {pkg.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link href={packagesEdit.url(pkg.id)}>
                                                        <Edit className="size-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(pkg.id)}
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50"
                                                >
                                                    <Trash className="size-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => <SuperAdminLayout>{page}</SuperAdminLayout>;

export default Index;
