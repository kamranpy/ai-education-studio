import {
    index as packagesIndex,
    update as packagesUpdate,
} from '@/actions/App/Http/Controllers/SuperAdmin/CreditPackageController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

interface CreditPackage {
    id: number;
    name: string;
    credits: number;
    price_cents: number;
    currency: string;
    is_active: boolean;
}

interface Props {
    package: CreditPackage;
}

function Edit({ package: pkg }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: pkg.name,
        credits: pkg.credits,
        price_cents: pkg.price_cents,
        currency: pkg.currency,
        is_active: pkg.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(packagesUpdate.url(pkg.id));
    };

    return (
        <>
            <Head title="Edit Credit Package" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={packagesIndex.url()}>
                            <ChevronLeft className="size-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Edit Credit Package
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Package Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="credits">Number of Credits</Label>
                                <Input
                                    id="credits"
                                    type="number"
                                    min="1"
                                    value={data.credits}
                                    onChange={(e) =>
                                        setData('credits', parseInt(e.target.value))
                                    }
                                />
                                {errors.credits && (
                                    <p className="text-sm text-red-500">
                                        {errors.credits}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price_cents">Price (in cents)</Label>
                                <Input
                                    id="price_cents"
                                    type="number"
                                    min="0"
                                    value={data.price_cents}
                                    onChange={(e) =>
                                        setData('price_cents', parseInt(e.target.value))
                                    }
                                />
                                {errors.price_cents && (
                                    <p className="text-sm text-red-500">
                                        {errors.price_cents}
                                    </p>
                                )}
                                <p className="text-xs text-zinc-500">
                                    Format: 1000 = $10.00
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Input
                                id="currency"
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value)}
                                maxLength={3}
                                className="uppercase"
                            />
                            {errors.currency && (
                                <p className="text-sm text-red-500">
                                    {errors.currency}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 space-y-0 rounded-md border p-4">
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', checked)
                                }
                            />
                            <div className="space-y-1 leading-none">
                                <Label htmlFor="is_active">Active Package</Label>
                                <p className="text-sm text-zinc-500">
                                    Make this package available for institutes to purchase.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={processing}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => <SuperAdminLayout>{page}</SuperAdminLayout>;

export default Edit;
