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

// Credit Usage Indicator - Shows CONSUMED percentage with improved UI
function CreditUsageIndicator({ consumed, total }: { consumed: number; total: number }) {
    const consumedPercentage = total > 0 ? Math.round((consumed / total) * 100) : 0;
    const remaining = total - consumed;

    return (
        <div className="flex items-center gap-5">
            {/* Circular Progress */}
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background track */}
                    <circle
                        className="text-[#2a292e]"
                        cx={48}
                        cy={48}
                        fill="transparent"
                        r={42}
                        stroke="currentColor"
                        strokeWidth={10}
                    />
                    {/* Consumed arc - red/orange gradient effect */}
                    <circle
                        className="text-[#ff6b6b]"
                        cx={48}
                        cy={48}
                        fill="transparent"
                        r={42}
                        stroke="currentColor"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (consumedPercentage / 100) * 264}
                        strokeWidth={10}
                        strokeLinecap="round"
                        style={{
                            filter: 'drop-shadow(0 0 4px rgba(255, 107, 107, 0.5))',
                        }}
                    />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-md text-headline-md text-[#ff6b6b] font-bold">
                        {consumedPercentage}%
                    </span>
                    <span className="text-[10px] text-[#928f9a] uppercase">used</span>
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
                <div>
                    <p className="text-xs text-[#928f9a] uppercase tracking-wide">Consumed</p>
                    <p className="font-body-md text-body-md text-[#ff6b6b]">
                        {consumed.toLocaleString()} credits
                    </p>
                </div>
                <div>
                    <p className="text-xs text-[#928f9a] uppercase tracking-wide">Remaining</p>
                    <p className="font-body-md text-body-md text-[#4fdbc8]">
                        {remaining.toLocaleString()} credits
                    </p>
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
                    <div className="bg-[#93000a] text-[#ffdad6] px-6 py-4 rounded-xl flex items-center justify-between border border-[#ffb4ab]/20">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="size-5" />
                            <div>
                                <p className="font-label-md text-label-md">Low Credit Warning</p>
                                <p className="font-body-sm text-body-sm opacity-90">
                                    Your account balance is reaching the critical threshold. AI modeling capabilities may be restricted soon.
                                </p>
                            </div>
                        </div>
                        <button className="bg-[#ffdad6] text-[#93000a] px-4 py-2 rounded-lg font-bold text-label-sm hover:opacity-90 transition-opacity">
                            RECHARGE NOW
                        </button>
                    </div>
                )}

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Current Balance Card */}
                    <div
                        className="md:col-span-5 rounded-xl p-5"
                        style={{
                            background: 'rgba(32, 31, 35, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-label-md text-label-md text-[#928f9a] uppercase tracking-wider text-xs">
                                    Current Balance
                                </p>
                                <h2 className="font-headline-lg text-headline-lg text-[#e2dfff] mt-1">
                                    {credits.toLocaleString()} <span className="text-headline-md opacity-60">Credits</span>
                                </h2>
                            </div>
                            <div className="bg-[#2a292e] p-2.5 rounded-full">
                                <Wallet className="size-5 text-[#c3c0ff]" />
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5">
                            <CreditUsageIndicator consumed={maxCredits - credits} total={maxCredits} />
                        </div>
                    </div>

                    {/* Credit Packages - Original Cards */}
                    <div className="md:col-span-7 space-y-4">
                        <p className="font-label-md text-label-md text-[#928f9a] uppercase tracking-widest">
                            Available Plans
                        </p>
                        <div className="grid gap-4">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="flex items-center justify-between bg-[#1f1f23] rounded-xl p-5 border border-white/5 hover:border-[#c3c0ff]/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-[#c3c0ff]/10 flex items-center justify-center">
                                            <Wallet className="size-6 text-[#c3c0ff]" />
                                        </div>
                                        <div>
                                            <h3 className="font-label-md text-label-md text-[#e4e1e7]">{pkg.name}</h3>
                                            {pkg.description && (
                                                <p className="font-body-sm text-body-sm text-[#928f9a]">{pkg.description}</p>
                                            )}
                                            {pkg.features && pkg.features.length > 0 && (
                                                <ul className="mt-1 flex gap-3">
                                                    {pkg.features.slice(0, 2).map((feature, i) => (
                                                        <li key={i} className="flex items-center gap-1 text-xs text-[#928f9a]">
                                                            <Check className="size-3 text-[#4fdbc8]" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-headline-md text-headline-md text-[#e4e1e7]">
                                                {formatPrice(pkg.price_cents, pkg.currency)}
                                            </p>
                                            <p className="font-body-sm text-body-sm text-[#c3c0ff]">
                                                {pkg.credits.toLocaleString()} credits
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => handleBuy(pkg.id)}
                                            className="bg-[#c3c0ff] text-[#161349] hover:bg-[#a9a4ff] font-bold px-6"
                                        >
                                            Purchase
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {packages.length === 0 && (
                            <div className="rounded-xl border border-dashed border-[#928f9a]/30 p-6 text-center bg-[#1f1f23]">
                                <p className="font-body-sm text-body-sm text-[#928f9a]">
                                    No credit packages available at the moment.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-[#1f1f23] rounded-xl overflow-hidden border border-white/5">
                    <div className="p-6 flex justify-between items-center bg-white/5">
                        <h3 className="font-headline-md text-headline-md text-[#e4e1e7]">Transaction History</h3>
                        <div className="flex gap-2">
                            <button className="p-2 text-[#928f9a] hover:text-[#e4e1e7] transition-colors">
                                <Filter className="size-5" />
                            </button>
                            <button className="p-2 text-[#928f9a] hover:text-[#e4e1e7] transition-colors">
                                <Download className="size-5" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr>
                                    <th className="p-6 font-label-md text-label-md text-[#928f9a]">Date</th>
                                    <th className="p-6 font-label-md text-label-md text-[#928f9a]">Description</th>
                                    <th className="p-6 font-label-md text-label-md text-[#928f9a]">Amount</th>
                                    <th className="p-6 font-label-md text-label-md text-[#928f9a]">Status</th>
                                    <th className="p-6 font-label-md text-label-md text-[#928f9a] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center">
                                            <p className="font-body-md text-body-md text-[#928f9a]">
                                                No transactions yet. Purchase credits to get started.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-6 font-body-md text-body-md text-[#e4e1e7]">{transaction.date}</td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-8 h-8 rounded flex items-center justify-center ${
                                                        transaction.type === 'credit'
                                                            ? 'bg-[#c3c0ff]/10'
                                                            : 'bg-[#ffb4ab]/10'
                                                    }`}
                                                >
                                                    {transaction.type === 'credit' ? (
                                                        <Plus className={`size-4 text-[#c3c0ff]`} />
                                                    ) : (
                                                        <ArrowRight className={`size-4 text-[#ffb4ab] rotate-45`} />
                                                    )}
                                                </div>
                                                <span className="font-body-md text-body-md text-[#e4e1e7]">
                                                    {transaction.description}
                                                </span>
                                            </div>
                                        </td>
                                        <td
                                            className={`p-6 font-body-md text-body-md font-bold ${
                                                transaction.type === 'credit'
                                                    ? 'text-[#4fdbc8]'
                                                    : 'text-[#ffb4ab]'
                                            }`}
                                        >
                                            {transaction.type === 'credit' ? '+' : ''}
                                            ${Math.abs(transaction.amount).toFixed(2)}
                                        </td>
                                        <td className="p-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-label-sm bg-[#4fdbc8]/10 text-[#4fdbc8]">
                                                <Check className="size-3 mr-1" />
                                                Completed
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button className="text-[#928f9a] hover:text-[#c3c0ff] transition-colors">
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
                    <div className="p-6 flex items-center justify-between border-t border-white/5">
                        <span className="font-body-sm text-body-sm text-[#928f9a]">
                            Showing 1 to {transactions.length} of {transactions.length} transactions
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 rounded-lg bg-[#2a292e] text-[#928f9a] hover:text-[#e4e1e7] disabled:opacity-50 flex items-center gap-1"
                                disabled
                            >
                                <ChevronLeft className="size-4" />
                                Previous
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-[#c3c0ff]/10 text-[#c3c0ff] hover:bg-[#c3c0ff]/20 flex items-center gap-1">
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
