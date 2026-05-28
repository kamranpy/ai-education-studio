import { Head, useForm } from '@inertiajs/react';
import { KeyRound, RefreshCw, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LicenseData {
    status: string;
    domain: string | null;
    activated_at: string | null;
    last_verified_at: string | null;
}

interface Props {
    license: LicenseData;
}

export default function Index({ license }: Props) {
    const [activateForm, setActivateForm] = useState(false);

    const form = useForm({
        license_key: '',
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30">
                        <ShieldCheck className="mr-1 size-3" />
                        Active
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30">
                        <AlertTriangle className="mr-1 size-3" />
                        Pending
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/30">
                        <XCircle className="mr-1 size-3" />
                        Invalid
                    </Badge>
                );
        }
    };

    return (
        <div>
            <Head title="License" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#e5e2e1]">
                        License Management
                    </h1>
                    <p className="mt-1 text-[#c7c4d8]">
                        View and manage your platform license.
                    </p>
                </div>

                {/* Status Card */}
                <Card className="border-[#464555] bg-[#1c1c1c]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#e5e2e1]">
                            <KeyRound className="size-5 text-[#c3c0ff]" />
                            License Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[#c7c4d8]">Status:</span>
                            {getStatusBadge(license.status)}
                        </div>

                        {license.domain && (
                            <div className="text-sm text-[#c7c4d8]">
                                <span className="text-[#8e8b9e]">
                                    Domain:
                                </span>{' '}
                                {license.domain}
                            </div>
                        )}

                        {license.activated_at && (
                            <div className="text-sm text-[#c7c4d8]">
                                <span className="text-[#8e8b9e]">
                                    Activated:
                                </span>{' '}
                                {new Date(
                                    license.activated_at,
                                ).toLocaleString()}
                            </div>
                        )}

                        {license.last_verified_at && (
                            <div className="text-sm text-[#c7c4d8]">
                                <span className="text-[#8e8b9e]">
                                    Last Verified:
                                </span>{' '}
                                {new Date(
                                    license.last_verified_at,
                                ).toLocaleString()}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={() => setActivateForm(!activateForm)}
                                variant="outline"
                                className="border-[#464555] bg-[#131313] text-[#c7c4d8] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]"
                            >
                                <KeyRound className="mr-2 size-4" />
                                {activateForm
                                    ? 'Cancel'
                                    : 'Change License Key'}
                            </Button>
                            <Button
                                onClick={() =>
                                    form.post('/super-admin/license/verify')
                                }
                                disabled={form.processing}
                                className="bg-[#c3c0ff] text-[#131313] hover:bg-[#d0bcff] disabled:opacity-50"
                            >
                                <RefreshCw className="mr-2 size-4" />
                                Re-verify Now
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Activate Form */}
                {activateForm && (
                    <Card className="border-[#464555] bg-[#1c1c1c]">
                        <CardHeader>
                            <CardTitle className="text-[#e5e2e1]">
                                Activate License
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.post(
                                        '/super-admin/license',
                                        {
                                            onSuccess: () => {
                                                setActivateForm(false);
                                                form.reset();
                                            },
                                        },
                                    );
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label className="text-[#c7c4d8]">
                                        License Key
                                    </Label>
                                    <Input
                                        value={form.data.license_key}
                                        onChange={(e) =>
                                            form.setData(
                                                'license_key',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter your CRM-generated license key"
                                        className="mt-1 border-[#464555] bg-[#131313] text-[#e5e2e1] placeholder:text-[#464555]"
                                    />
                                    {form.errors.license_key && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {form.errors.license_key}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="bg-[#c3c0ff] text-[#131313] hover:bg-[#d0bcff] disabled:opacity-50"
                                >
                                    Activate
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
