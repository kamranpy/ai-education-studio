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
import { ChevronLeft, Plus, X } from 'lucide-react';

interface CreditPackage {
    id: number;
    name: string;
    description: string | null;
    features: string[] | null;
    credits: number;
    price_cents: number;
    currency: string;
    is_active: boolean;
}

interface Props {
    package: CreditPackage;
}

function Edit({ package: pkg }: Props) {
    const { data, setData, put, processing, errors } = useForm<{
        name: string;
        description: string;
        features: string[];
        credits: number;
        price_cents: number;
        currency: string;
        is_active: boolean;
    }>({
        name: pkg.name,
        description: pkg.description ?? '',
        features: pkg.features ?? [],
        credits: pkg.credits,
        price_cents: pkg.price_cents,
        currency: pkg.currency,
        is_active: pkg.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(packagesUpdate.url(pkg.id));
    };

    const addFeature = () => {
        setData('features', [...data.features, '']);
    };

    const updateFeature = (index: number, value: string) => {
        const updated = [...data.features];
        updated[index] = value;
        setData('features', updated);
    };

    const removeFeature = (index: number) => {
        setData(
            'features',
            data.features.filter((_, i) => i !== index),
        );
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
                        {/* Name */}
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

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description{' '}
                                <span className="text-zinc-400">(optional)</span>
                            </Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="e.g. Perfect for small institutes getting started"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Credits & Price */}
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
                                        setData(
                                            'price_cents',
                                            parseInt(e.target.value),
                                        )
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

                        {/* Currency */}
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

                        {/* Features */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>
                                    Features{' '}
                                    <span className="text-zinc-400">(optional)</span>
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addFeature}
                                >
                                    <Plus className="mr-1 size-3" />
                                    Add Feature
                                </Button>
                            </div>
                            {data.features.length === 0 && (
                                <p className="text-sm text-zinc-400">
                                    No features added yet. These appear as bullet points
                                    on the billing page.
                                </p>
                            )}
                            <div className="space-y-2">
                                {data.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) =>
                                                updateFeature(index, e.target.value)
                                            }
                                            placeholder="e.g. AI-assisted grading included"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFeature(index)}
                                            className="shrink-0 text-zinc-400 hover:text-red-500"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active toggle */}
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
                                    Make this package available for institutes to
                                    purchase.
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

Edit.layout = (page: React.ReactNode) => (
    <SuperAdminLayout>{page}</SuperAdminLayout>
);

export default Edit;
