import { checkout } from '@/actions/App/Http/Controllers/Institute/BillingController';
import AdminLayout from '@/layouts/admin-layout';
import { router } from '@inertiajs/react';
import { CreditCard, Sparkles } from 'lucide-react';

interface CreditPackage {
    id: number;
    name: string;
    credits: number;
    price_cents: number;
    currency: string;
}

interface Props {
    credits: number;
    packages: CreditPackage[];
}

function formatPrice(cents: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}

function Index({ credits, packages }: Props) {
    const handleBuy = (packageId: number) => {
        router.post(checkout.url(), {
            package_id: packageId,
        });
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                Billing & Credits
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Purchase exam credits for your institute. Each student
                exam attempt consumes 1 credit.
            </p>

            {/* Current Balance */}
            <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                        <Sparkles className="size-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Available Credits
                        </p>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                            {credits.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Credit Packages */}
            <h2 className="mt-8 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Purchase Credits
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {pkg.name}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                {pkg.credits.toLocaleString()} exam credits
                            </p>
                            <p className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                {formatPrice(pkg.price_cents, pkg.currency)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleBuy(pkg.id)}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                        >
                            <CreditCard className="size-4" />
                            Buy Now
                        </button>
                    </div>
                ))}
            </div>

            {packages.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        No credit packages available at the moment.
                        Please contact your system administrator.
                    </p>
                </div>
            )}
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

export default Index;
