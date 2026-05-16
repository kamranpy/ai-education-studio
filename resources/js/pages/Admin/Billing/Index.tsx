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
import { useState } from 'react';
import { checkout } from '@/actions/App/Http/Controllers/Institute/BillingController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Props {
    credits: number;
    packages: CreditPackage[];
    current_package_id: number | null;
}

// Mock transaction data - replace with actual data from backend
interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    status: 'completed' | 'pending' | 'failed';
}

const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: '1',
        date: 'Oct 24, 2023',
        description: 'Credit Top-up - Visa •••• 4242',
        amount: 45,
        type: 'credit',
        status: 'completed',
    },
    {
        id: '2',
        date: 'Oct 22, 2023',
        description: 'AI Training Compute Consumption',
        amount: -120,
        type: 'debit',
        status: 'completed',
    },
    {
        id: '3',
        date: 'Oct 20, 2023',
        description: 'Curriculum Generation API Units',
        amount: -15,
        type: 'debit',
        status: 'completed',
    },
    {
        id: '4',
        date: 'Oct 18, 2023',
        description: 'Credit Top-up - Visa •••• 4242',
        amount: 10,
        type: 'credit',
        status: 'completed',
    },
];

const TOP_UP_OPTIONS = [
    { amount: 10, credits: 1000, popular: false },
    { amount: 45, credits: 5000, popular: true },
    { amount: 80, credits: 10000, popular: false },
];

function formatPrice(cents: number, currency: string): string {
    if (cents === 0) {
        return 'Free';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}

// Circular Progress Component
function CircularProgress({ percentage, size = 96 }: { percentage: number; size?: number }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    className="text-[#353439]"
                    cx={size / 2}
                    cy={size / 2}
                    fill="transparent"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={8}
                />
                <circle
                    className="text-[#4fdbc8] transition-all duration-500"
                    cx={size / 2}
                    cy={size / 2}
                    fill="transparent"
                    r={radius}
                    stroke="currentColor"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeWidth={8}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-label-md text-label-md text-[#4fdbc8]">{percentage}%</span>
            </div>
        </div>
    );
}

function Index({ credits, packages }: Props) {
    const [customAmount, setCustomAmount] = useState('');

    // Calculate percentage (assume 3000 is max for demo)
    const maxCredits = 3000;
    const percentage = Math.round((credits / maxCredits) * 100);
    const isLowCredit = percentage < 20;

    const handleBuy = (packageId: number) => {
        router.post(checkout.url(), { package_id: packageId });
    };

    const handleTopUp = (option: typeof TOP_UP_OPTIONS[0]) => {
        // Find matching package or use custom flow
        const matchingPackage = packages.find((p) => p.credits === option.credits);

        if (matchingPackage) {
            handleBuy(matchingPackage.id);
        }
    };

    const handleCustomBuy = () => {
        const amount = parseInt(customAmount);

        if (amount > 0) {
            // Handle custom amount purchase
            router.post(checkout.url(), { custom_amount: amount * 100 });
        }
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
                        className="md:col-span-5 rounded-xl p-6 flex flex-col justify-between min-h-[280px]"
                        style={{
                            background: 'rgba(32, 31, 35, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-label-md text-label-md text-[#928f9a] uppercase tracking-widest">
                                    Current Balance
                                </p>
                                <h2 className="font-headline-xl text-headline-xl text-[#e2dfff] mt-2">
                                    {credits.toLocaleString()} <span className="text-headline-md opacity-60">Credits</span>
                                </h2>
                            </div>
                            <div className="bg-[#2a292e] p-3 rounded-full">
                                <Wallet className="size-6 text-[#c3c0ff]" />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-6">
                            <CircularProgress percentage={percentage} />
                            <div>
                                <p className="font-body-md text-body-md text-[#e4e1e7]">Available Quota</p>
                                <p className="font-body-sm text-body-sm text-[#928f9a]">Remaining for current billing cycle</p>
                            </div>
                        </div>
                    </div>

                    {/* Top-up Credits Card */}
                    <div className="md:col-span-7 bg-[#1f1f23] rounded-xl p-6 border border-white/5">
                        <p className="font-label-md text-label-md text-[#928f9a] uppercase tracking-widest mb-6">
                            Top-up Credits
                        </p>
                        <div className="space-y-6">
                            {/* Preset Options */}
                            <div className="grid grid-cols-3 gap-4">
                                {TOP_UP_OPTIONS.map((option) => (
                                    <button
                                        key={option.amount}
                                        onClick={() => handleTopUp(option)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-95 ${
                                            option.popular
                                                ? 'bg-[#c3c0ff]/10 border border-[#c3c0ff]/20 hover:shadow-[0_0_15px_rgba(195,192,255,0.3)]'
                                                : 'bg-[#2a292e] border border-[#928f9a]/30 hover:border-[#c3c0ff]'
                                        }`}
                                    >
                                        <span className={`font-headline-md text-headline-md ${option.popular ? 'text-[#c3c0ff]' : 'text-[#c3c0ff]'}`}>
                                            ${option.amount}
                                        </span>
                                        <span className="font-label-sm text-label-sm text-[#928f9a]">
                                            {option.credits.toLocaleString()} Credits
                                        </span>
                                        {option.popular && (
                                            <span className="mt-2 text-xs bg-[#4fdbc8]/20 text-[#4fdbc8] px-2 py-0.5 rounded-full">
                                                Best Value
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Amount */}
                            <div className="space-y-2">
                                <label className="font-label-md text-label-md text-[#928f9a]">Custom Amount</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-[#928f9a]">$</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full bg-[#131317] border border-[#928f9a]/30 rounded-xl py-3 pl-8 pr-24 text-[#e4e1e7] placeholder:text-[#928f9a]/50 focus:border-[#c3c0ff] focus:ring-1 focus:ring-[#c3c0ff]"
                                    />
                                    <Button
                                        onClick={handleCustomBuy}
                                        disabled={!customAmount || parseInt(customAmount) <= 0}
                                        className="absolute right-2 bg-[#c3c0ff] text-[#161349] font-bold text-label-md px-6 py-2 rounded-lg hover:bg-[#a9a4ff] disabled:opacity-50"
                                    >
                                        Buy
                                    </Button>
                                </div>
                            </div>
                        </div>
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
                                {MOCK_TRANSACTIONS.map((transaction) => (
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
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 flex items-center justify-between border-t border-white/5">
                        <span className="font-body-sm text-body-sm text-[#928f9a]">
                            Showing 1 to {MOCK_TRANSACTIONS.length} of {MOCK_TRANSACTIONS.length} transactions
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

                {/* Available Packages (Original functionality preserved) */}
                {packages.length > 0 && (
                    <div className="pt-6 border-t border-white/5">
                        <h3 className="font-headline-md text-headline-md text-[#e4e1e7] mb-4">Credit Packages</h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className="flex flex-col rounded-xl border border-white/5 bg-[#1f1f23] p-5 transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-label-md text-label-md text-[#e4e1e7]">{pkg.name}</h3>
                                    </div>
                                    {pkg.description && (
                                        <p className="mt-1 font-body-sm text-body-sm text-[#928f9a]">{pkg.description}</p>
                                    )}
                                    <div className="mt-3 flex items-baseline gap-1">
                                        <span className="font-headline-md text-headline-md text-[#e4e1e7]">
                                            {formatPrice(pkg.price_cents, pkg.currency)}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-[#c3c0ff]">
                                        <Wallet className="size-4" />
                                        <span className="font-body-sm text-body-sm">{pkg.credits.toLocaleString()} credits</span>
                                    </div>
                                    <Button
                                        onClick={() => handleBuy(pkg.id)}
                                        className="mt-4 w-full bg-[#c3c0ff] text-[#161349] hover:bg-[#a9a4ff] font-bold"
                                    >
                                        Purchase
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {packages.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[#928f9a]/30 p-8 text-center bg-[#1f1f23]">
                        <p className="font-body-sm text-body-sm text-[#928f9a]">
                            No credit packages available at the moment. Please contact your system administrator.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default Index;
