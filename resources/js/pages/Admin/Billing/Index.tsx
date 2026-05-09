import { router } from '@inertiajs/react';
import { CheckCircle, CreditCard, Sparkles } from 'lucide-react';
import { checkout } from '@/actions/App/Http/Controllers/Institute/BillingController';
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

const FREE_PLAN_ID = 0;

const FREE_PLAN: CreditPackage = {
    id: FREE_PLAN_ID,
    name: 'Free',
    description: 'Get started at no cost',
    features: [
        'No credits included',
        'Manual grading only',
        'Unlimited exams (no AI)',
    ],
    credits: 0,
    price_cents: 0,
    currency: 'usd',
};

function formatPrice(cents: number, currency: string): string {
    if (cents === 0) {
return 'Free';
}

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}

function Index({ credits, packages, current_package_id }: Props) {
    const effectiveCurrentId =
        current_package_id === null ? FREE_PLAN_ID : current_package_id;

    const allPackages = [FREE_PLAN, ...packages];

    const handleBuy = (packageId: number) => {
        router.post(checkout.url(), { package_id: packageId });
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                Billing & Credits
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Purchase exam credits for your institute. Each student exam
                attempt consumes 1 credit.
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

            {/* Plans */}
            <h2 className="mt-8 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Plans
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allPackages.map((pkg) => {
                    const isCurrent = pkg.id === effectiveCurrentId;

                    return (
                        <div
                            key={pkg.id}
                            className={`flex flex-col rounded-xl border p-6 transition-shadow hover:shadow-md ${
                                isCurrent
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-500/5'
                                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                            }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    {pkg.name}
                                </h3>
                                {isCurrent && (
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                        <CheckCircle className="size-3" />
                                        Active
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            {pkg.description && (
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    {pkg.description}
                                </p>
                            )}

                            {/* Price */}
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                    {formatPrice(pkg.price_cents, pkg.currency)}
                                </span>
                                {pkg.price_cents > 0 && (
                                    <span className="text-sm text-zinc-400">
                                        one-time
                                    </span>
                                )}
                            </div>

                            {/* Credits highlight */}
                            <div className="mt-3 flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
                                <Sparkles className="size-4 shrink-0 text-indigo-500" />
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    {pkg.credits === 0
                                        ? 'No credits'
                                        : `${pkg.credits.toLocaleString()} exam credits`}
                                </span>
                            </div>

                            {/* Features list */}
                            {pkg.features && pkg.features.length > 0 && (
                                <ul className="mt-4 space-y-2">
                                    {pkg.features.map((feature, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                                        >
                                            <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Spacer to push button to bottom */}
                            <div className="flex-1" />

                            {/* CTA Button */}
                            {pkg.id === FREE_PLAN_ID ? (
                                <button
                                    type="button"
                                    disabled
                                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${
                                        isCurrent
                                            ? 'cursor-default bg-indigo-600 text-white opacity-80'
                                            : 'cursor-default bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                                    }`}
                                >
                                    {isCurrent ? (
                                        <>
                                            <CheckCircle className="size-4" />
                                            Current Plan
                                        </>
                                    ) : (
                                        'Free'
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => !isCurrent && handleBuy(pkg.id)}
                                    disabled={isCurrent}
                                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                                        isCurrent
                                            ? 'cursor-default bg-indigo-600 text-white opacity-80'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    {isCurrent ? (
                                        <>
                                            <CheckCircle className="size-4" />
                                            Current Plan
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="size-4" />
                                            Buy Now
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {packages.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        No credit packages available at the moment. Please contact
                        your system administrator.
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
