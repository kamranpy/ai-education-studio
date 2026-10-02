import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    Plus,
    Receipt,
    Wallet,
} from 'lucide-react';
import { checkout } from '@/actions/App/Http/Controllers/Institute/BillingController';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

interface CreditPackage {
    id: number;
    name: string;
    description: string | null;
    features: string[] | null;
    credits: number;
    price_cents: number;
    currency: string;
}

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    credits: number;
    type: 'credit' | 'debit';
    status: 'completed' | 'pending' | 'failed';
}

interface Props {
    credits: number;
    packages: CreditPackage[];
    current_package_id: number | null;
    transactions: Transaction[];
}

function formatPrice(cents: number, currency: string): string {
    if (cents === 0) {
        return 'Free';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}

// Compact Credit Usage Bar
function CreditUsageBar({ consumed, total }: { consumed: number; total: number }) {
    const consumedPercentage = total > 0 ? Math.round((consumed / total) * 100) : 0;
    const remaining = total - consumed;

    return (
        <div className="space-y-2">
            {/* Progress bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                        style={{ width: `${consumedPercentage}%` }}
                    />
                </div>
                <span className="font-label-md text-label-md text-red-500 font-bold">
                    {consumedPercentage}%
                </span>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Used: <span className="text-red-500 font-medium">{consumed.toLocaleString()}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-secondary" />
                    <span className="text-muted-foreground">Left: <span className="text-brand-secondary font-medium">{remaining.toLocaleString()}</span></span>
                </div>
            </div>
        </div>
    );
}

function Index({ credits, packages, transactions }: Props) {
    // Calculate percentage (assume 3000 is max for demo)
    const maxCredits = 3000;
    const percentage = Math.round((credits / maxCredits) * 100);
    const isLowCredit = percentage < 20;

    const handleBuy = (packageId: number) => {
        router.post(checkout.url(), { package_id: packageId });
    };

    return (
        <>
            <Head title="Billing & Credits" />

            <div className="space-y-6">
                {/* Warning Banner */}
                {isLowCredit && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100 px-6 py-4 rounded-xl flex items-center justify-between border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                            <div>
                                <p className="font-label-md text-label-md">Low Credit Warning</p>
                                <p className="font-body-sm text-body-sm opacity-80">
                                    Your account balance is reaching the critical threshold. AI modeling capabilities may be restricted soon.
                                </p>
                            </div>
                        </div>
                        <button className="bg-amber-600 dark:bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-label-sm hover:opacity-90 transition-opacity">
                            RECHARGE NOW
                        </button>
                    </div>
                )}

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Current Balance Card - Compact */}
                    <div className="md:col-span-5 rounded-xl p-4 bg-card border border-border">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
                                <h2 className="text-2xl font-bold text-card-foreground">
                                    {credits.toLocaleString()} <span className="text-base font-normal opacity-60">Credits</span>
                                </h2>
                            </div>
                            <div className="bg-secondary p-2 rounded-full">
                                <Wallet className="size-4 text-brand-primary" />
                            </div>
                        </div>

                        <CreditUsageBar consumed={maxCredits - credits} total={maxCredits} />
                    </div>

                    {/* Credit Packages - Original Cards */}
                    <div className="md:col-span-7 space-y-4">
                        <p className="font-label-md text-label-md text-muted-foreground uppercase tracking-widest">
                            Available Plans
                        </p>
                        <div className="grid gap-4">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="flex items-center justify-between bg-card rounded-xl p-5 border border-border hover:border-brand-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                            <Wallet className="size-6 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-label-md text-label-md text-card-foreground">{pkg.name}</h3>
                                            {pkg.description && (
                                                <p className="font-body-sm text-body-sm text-muted-foreground">{pkg.description}</p>
                                            )}
                                            {pkg.features && pkg.features.length > 0 && (
                                                <ul className="mt-1 flex gap-3">
                                                    {pkg.features.slice(0, 2).map((feature, i) => (
                                                        <li key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Check className="size-3 text-brand-secondary" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-headline-md text-headline-md text-card-foreground">
                                                {formatPrice(pkg.price_cents, pkg.currency)}
                                            </p>
                                            <p className="font-body-sm text-body-sm text-brand-primary">
                                                {pkg.credits.toLocaleString()} credits
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => handleBuy(pkg.id)}
                                            className="bg-brand-primary text-brand-surface hover:bg-brand-inverse-primary font-bold px-6"
                                        >
                                            Purchase
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {packages.length === 0 && (
                            <div className="rounded-xl border border-dashed border-border p-6 text-center bg-card">
                                <p className="font-body-sm text-body-sm text-muted-foreground">
                                    No credit packages available at the moment.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-card rounded-xl overflow-hidden border border-border">
                    <div className="p-6 flex justify-between items-center bg-muted/50">
                        <h3 className="font-headline-md text-headline-md text-card-foreground">Transaction History</h3>
                        <div className="flex gap-2">
                            <button className="p-2 text-muted-foreground hover:text-card-foreground transition-colors">
                                <Filter className="size-5" />
                            </button>
                            <button className="p-2 text-muted-foreground hover:text-card-foreground transition-colors">
                                <Download className="size-5" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="p-6 font-label-md text-label-md text-muted-foreground">Date</th>
                                    <th className="p-6 font-label-md text-label-md text-muted-foreground">Description</th>
                                    <th className="p-6 font-label-md text-label-md text-muted-foreground">Amount</th>
                                    <th className="p-6 font-label-md text-label-md text-muted-foreground">Status</th>
                                    <th className="p-6 font-label-md text-label-md text-muted-foreground text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center">
                                            <p className="font-body-md text-body-md text-muted-foreground">
                                                No transactions yet. Purchase credits to get started.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-6 font-body-md text-body-md text-card-foreground">{transaction.date}</td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-8 h-8 rounded flex items-center justify-center ${
                                                        transaction.type === 'credit'
                                                            ? 'bg-brand-primary/10'
                                                            : 'bg-destructive/10'
                                                    }`}
                                                >
                                                    {transaction.type === 'credit' ? (
                                                        <Plus className={`size-4 text-brand-primary`} />
                                                    ) : (
                                                        <ArrowRight className={`size-4 text-destructive rotate-45`} />
                                                    )}
                                                </div>
                                                <span className="font-body-md text-body-md text-card-foreground">
                                                    {transaction.description}
                                                </span>
                                            </div>
                                        </td>
                                        <td
                                            className={`p-6 font-body-md text-body-md font-bold ${
                                                transaction.type === 'credit'
                                                    ? 'text-brand-secondary'
                                                    : 'text-destructive'
                                            }`}
                                        >
                                            {transaction.type === 'credit' ? '+' : ''}
                                            ${Math.abs(transaction.amount).toFixed(2)}
                                        </td>
                                        <td className="p-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-label-sm bg-brand-secondary/10 text-brand-secondary">
                                                <Check className="size-3 mr-1" />
                                                Completed
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button className="text-muted-foreground hover:text-brand-primary transition-colors">
                                                <Receipt className="size-5" />
                                            </button>
                                        </td>
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 flex items-center justify-between border-t border-border">
                        <span className="font-body-sm text-body-sm text-muted-foreground">
                            Showing 1 to {transactions.length} of {transactions.length} transactions
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-card-foreground disabled:opacity-50 flex items-center gap-1"
                                disabled
                            >
                                <ChevronLeft className="size-4" />
                                Previous
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 flex items-center gap-1">
                                Next
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default Index;
