import SuperAdminLayout from '@/layouts/super-admin-layout';
import {
    store as billingStore,
} from '@/actions/App/Http/Controllers/SuperAdmin/StripeSettingController';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, KeyRound, Loader2, Receipt } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StripeConfig {
    has_secret_key: boolean;
    masked_secret_key: string | null;
    has_webhook_secret: boolean;
    masked_webhook_secret: string | null;
}

interface TransactionItem {
    id: number;
    institute: { id: string; name: string } | null;
    credits_added: number;
    amount_cents: number;
    currency: string;
    status: string;
    type: string;
    notes: string | null;
    created_at: string;
}

interface PaginatedTransactions {
    data: TransactionItem[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    stripe: StripeConfig;
    transactions: PaginatedTransactions;
}

function formatCurrency(cents: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
    }).format(cents / 100);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function TypeBadge({ type }: { type: string }) {
    const isManual = type === 'manual_adjustment';
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isManual
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}
        >
            {isManual ? 'Manual' : 'Stripe'}
        </span>
    );
}

function BillingConfig({ stripe, transactions }: Props) {
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [replacingSecretKey, setReplacingSecretKey] = useState(
        !stripe.has_secret_key,
    );
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);
    const [replacingWebhookSecret, setReplacingWebhookSecret] = useState(
        !stripe.has_webhook_secret,
    );

    const form = useForm({
        secret_key: '',
        webhook_secret: '',
    });

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        form.post(billingStore.url(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Billing Configuration
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Configure Stripe keys and view the global transaction
                    log.
                </p>
            </div>

            {/* Stripe Keys Form */}
            <form onSubmit={handleSave}>
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyRound className="size-5" />
                            Stripe Configuration
                        </CardTitle>
                        <CardDescription>
                            Keys are stored encrypted. Only the last 4
                            characters are shown after saving.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Secret Key */}
                        <div className="space-y-2">
                            <Label htmlFor="secret_key">Secret Key</Label>
                            {stripe.has_secret_key && !replacingSecretKey ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 flex-1 items-center rounded-md border border-input bg-muted px-3 font-mono text-xs text-muted-foreground">
                                        {stripe.masked_secret_key ??
                                            'sk_•••••••'}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setReplacingSecretKey(true)
                                        }
                                    >
                                        Replace key
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Input
                                        id="secret_key"
                                        type={
                                            showSecretKey ? 'text' : 'password'
                                        }
                                        value={form.data.secret_key}
                                        onChange={(e) =>
                                            form.setData(
                                                'secret_key',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="sk_live_..."
                                        className="pr-10 font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                                        onClick={() =>
                                            setShowSecretKey(!showSecretKey)
                                        }
                                    >
                                        {showSecretKey ? (
                                            <EyeOff className="size-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="size-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            )}
                            {form.errors.secret_key && (
                                <p className="text-sm text-destructive">
                                    {form.errors.secret_key}
                                </p>
                            )}
                        </div>

                        {/* Webhook Secret */}
                        <div className="space-y-2">
                            <Label htmlFor="webhook_secret">
                                Webhook Secret
                            </Label>
                            {stripe.has_webhook_secret &&
                            !replacingWebhookSecret ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 flex-1 items-center rounded-md border border-input bg-muted px-3 font-mono text-xs text-muted-foreground">
                                        {stripe.masked_webhook_secret ??
                                            'whsec_•••••••'}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setReplacingWebhookSecret(true)
                                        }
                                    >
                                        Replace key
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Input
                                        id="webhook_secret"
                                        type={
                                            showWebhookSecret
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={form.data.webhook_secret}
                                        onChange={(e) =>
                                            form.setData(
                                                'webhook_secret',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="whsec_..."
                                        className="pr-10 font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                                        onClick={() =>
                                            setShowWebhookSecret(
                                                !showWebhookSecret,
                                            )
                                        }
                                    >
                                        {showWebhookSecret ? (
                                            <EyeOff className="size-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="size-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            )}
                            {form.errors.webhook_secret && (
                                <p className="text-sm text-destructive">
                                    {form.errors.webhook_secret}
                                </p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Save settings
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            {/* Global Transaction Log */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="size-5" />
                        Transaction Log
                    </CardTitle>
                    <CardDescription>
                        All credit transactions across all institutes (
                        {transactions.total} total)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.data.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No transactions yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        <th className="pb-3 pr-4">
                                            Institute
                                        </th>
                                        <th className="pb-3 pr-4 text-right">
                                            Credits
                                        </th>
                                        <th className="pb-3 pr-4 text-right">
                                            Amount
                                        </th>
                                        <th className="pb-3 pr-4">Date</th>
                                        <th className="pb-3 pr-4">Status</th>
                                        <th className="pb-3 pr-4">Type</th>
                                        <th className="pb-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {transactions.data.map((tx) => (
                                        <tr key={tx.id}>
                                            <td className="py-3 pr-4 font-medium text-foreground">
                                                {tx.institute?.name ?? (
                                                    <span className="italic text-muted-foreground">
                                                        Deleted
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 text-right tabular-nums text-foreground">
                                                {tx.credits_added > 0
                                                    ? `+${tx.credits_added.toLocaleString()}`
                                                    : tx.credits_added.toLocaleString()}
                                            </td>
                                            <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                                                {tx.amount_cents > 0
                                                    ? formatCurrency(
                                                          tx.amount_cents,
                                                          tx.currency,
                                                      )
                                                    : '—'}
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {formatDate(tx.created_at)}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        tx.status ===
                                                        'completed'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                    }`}
                                                >
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <TypeBadge type={tx.type} />
                                            </td>
                                            <td className="max-w-xs truncate py-3 text-muted-foreground">
                                                {tx.notes ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-1">
                            {transactions.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (link.url) {
                                            window.location.href = link.url;
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

BillingConfig.layout = (page: React.ReactNode) => (
    <SuperAdminLayout>{page}</SuperAdminLayout>
);

export default BillingConfig;
