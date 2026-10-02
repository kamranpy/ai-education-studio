import { Head, router } from '@inertiajs/react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    ShieldCheck,
    Database,
    Server,
    KeyRound,
    Rocket,
    User,
    ChevronRight,
    ChevronLeft,
    AlertTriangle,
    FolderOpen,
    HardDrive,
    FileCode,
} from 'lucide-react';

const STEPS = [
    { id: 0, label: 'Requirements', icon: ShieldCheck },
    { id: 1, label: 'License', icon: KeyRound },
    { id: 2, label: 'Server', icon: Server },
    { id: 3, label: 'Database', icon: Database },
    { id: 4, label: 'Admin', icon: User },
    { id: 5, label: 'Install', icon: Rocket },
];

interface Requirement {
    name: string;
    installed: boolean;
}

interface RequirementCheck {
    php_version: string;
    php_version_ok: boolean;
    extensions: Requirement[];
    all_extensions_installed: boolean;
    storage_writable: boolean;
    cache_writable: boolean;
    env_exists: boolean;
    all_ok: boolean;
}

export default function Install() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 0: Requirements
    const [requirements, setRequirements] = useState<RequirementCheck | null>(null);

    // Step 1: License
    const [licenseKey, setLicenseKey] = useState('');

    // Step 2: Server
    const [appUrl, setAppUrl] = useState(window.location.origin);

    // Step 3: Database
    const [dbHost, setDbHost] = useState('127.0.0.1');
    const [dbPort, setDbPort] = useState('3306');
    const [dbDatabase, setDbDatabase] = useState('');
    const [dbUsername, setDbUsername] = useState('');
    const [dbPassword, setDbPassword] = useState('');

    // Step 4: Admin
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Step 5: Install
    const [installProgress, setInstallProgress] = useState('');
    const [installComplete, setInstallComplete] = useState(false);

    useEffect(() => {
        if (step === 0) {
            checkRequirements();
        }
    }, [step]);

    const checkRequirements = () => {
        setLoading(true);
        fetch('/install/requirements')
            .then((res) => res.json())
            .then((data) => {
                setRequirements(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to check requirements.');
                setLoading(false);
            });
    };

    const validateLicense = () => {
        if (!licenseKey.trim()) {
            setError('License key is required.');
            return false;
        }
        setLoading(true);
        setError('');

        fetch('/install/license', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
            body: JSON.stringify({ license_key: licenseKey }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.valid) {
                    setStep(2);
                    setError('');
                } else {
                    setError(data.message || 'Invalid license key.');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to validate license. Please try again.');
                setLoading(false);
            });

        return false;
    };

    const testDatabase = () => {
        setLoading(true);
        setError('');

        fetch('/install/database', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
            body: JSON.stringify({
                host: dbHost,
                port: parseInt(dbPort),
                database: dbDatabase,
                username: dbUsername,
                password: dbPassword,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setStep(4);
                    setError('');
                } else {
                    setError(data.message || 'Database connection failed.');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to test database connection.');
                setLoading(false);
            });
    };

    const runInstall = () => {
        if (!adminEmail || !adminPassword || adminPassword.length < 8) {
            setError('Please provide a valid admin email and password (min 8 characters).');
            return;
        }

        setLoading(true);
        setError('');
        setStep(5);
        setInstallProgress('Writing configuration...');

        fetch('/install', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
            body: JSON.stringify({
                license_key: licenseKey,
                app_url: appUrl,
                host: dbHost,
                port: parseInt(dbPort),
                database: dbDatabase,
                username: dbUsername,
                password: dbPassword,
                admin_email: adminEmail,
                admin_password: adminPassword,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setInstallProgress('Installation complete!');
                    setInstallComplete(true);
                } else {
                    setInstallProgress('');
                    setError(data.message || 'Installation failed.');
                    setStep(4);
                }
                setLoading(false);
            })
            .catch(() => {
                setInstallProgress('');
                setError('Installation failed. Please check server logs.');
                setStep(4);
                setLoading(false);
            });
    };

    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta?.getAttribute('content') || '';
    };

    const canProceed = () => {
        switch (step) {
            case 0:
                return requirements?.all_ok ?? false;
            case 1:
                return licenseKey.trim().length > 0;
            case 2:
                return appUrl.trim().length > 0;
            case 3:
                return (
                    dbHost &&
                    dbPort &&
                    dbDatabase &&
                    dbUsername &&
                    dbPassword
                );
            case 4:
                return (
                    adminEmail &&
                    adminPassword.length >= 8
                );
            default:
                return false;
        }
    };

    const nextStep = () => {
        setError('');
        if (step === 1) {
            validateLicense();
        } else if (step === 3) {
            testDatabase();
        } else if (step === 4) {
            runInstall();
        } else if (step < 5) {
            setStep(step + 1);
        }
    };

    return (
        <div className="min-h-screen bg-brand-surface text-brand-on-surface font-sans">
            <Head title="Install" />

            <div className="mx-auto max-w-3xl px-4 py-12">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10">
                        <Rocket className="size-7 text-brand-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-brand-primary">
                        AI Education Studio
                    </h1>
                    <p className="mt-2 text-brand-on-surface-variant">Installation Wizard</p>
                </div>

                {/* Step Indicator */}
                <div className="mb-10">
                    <div className="flex items-center justify-between">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const isActive = i === step;
                            const isDone = i < step;
                            const isLast = i === STEPS.length - 1;

                            return (
                                <div key={s.id} className="flex flex-1 items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                                                isDone
                                                    ? 'bg-green-500 text-white'
                                                    : isActive
                                                      ? 'bg-brand-primary text-brand-surface'
                                                      : 'bg-brand-outline-variant text-brand-on-surface-variant'
                                            }`}
                                        >
                                            {isDone ? (
                                                <CheckCircle className="size-5" />
                                            ) : (
                                                <Icon className="size-5" />
                                            )}
                                        </div>
                                        <span
                                            className={`mt-2 hidden text-xs font-medium sm:block ${
                                                isActive
                                                    ? 'text-brand-primary'
                                                    : isDone
                                                      ? 'text-green-400'
                                                      : 'text-brand-on-surface-variant'
                                            }`}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                    {!isLast && (
                                        <div
                                            className={`mx-2 hidden h-px flex-1 sm:block ${
                                                isDone
                                                    ? 'bg-green-500/60'
                                                    : 'bg-brand-outline-variant'
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <Card className="border-brand-outline-variant bg-brand-surface-container-low">
                    <CardHeader>
                        <CardTitle className="text-brand-on-surface flex items-center gap-2">
                            {(() => {
                                const Icon = STEPS[step].icon;
                                return <Icon className="size-5 text-brand-primary" />;
                            })()}
                            {STEPS[step].label}
                        </CardTitle>
                        <CardDescription>
                            {step === 0 && 'Verify that your server meets the minimum requirements.'}
                            {step === 1 && 'Activate your license key to continue with installation.'}
                            {step === 2 && 'Set the base URL for your application.'}
                            {step === 3 && 'Connect to your MySQL database.'}
                            {step === 4 && 'Create the first Super Admin account.'}
                            {step === 5 && (installComplete ? 'Your application is ready to use.' : 'Setting up your application...')}
                        </CardDescription>
                    </CardHeader>

                    <Separator className="bg-brand-outline-variant" />

                    <CardContent className="pt-6">
                        {error && (
                            <Alert variant="destructive" className="mb-6 border-brand-error/30 bg-brand-error/10 text-brand-error">
                                <AlertTriangle className="size-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Step 0: Requirements */}
                        {step === 0 && (
                            <div className="space-y-4">
                                {loading && !requirements && (
                                    <div className="flex items-center gap-3 text-brand-on-surface-variant">
                                        <Spinner className="size-5" />
                                        Checking requirements...
                                    </div>
                                )}
                                {requirements && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between rounded-lg border border-brand-outline-variant bg-brand-surface p-4">
                                            <div className="flex items-center gap-3">
                                                <FileCode className="size-5 text-brand-on-surface-variant" />
                                                <span className="text-brand-on-surface">PHP Version</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-brand-on-surface-variant">{requirements.php_version}</span>
                                                <StatusBadge ok={requirements.php_version_ok} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border border-brand-outline-variant bg-brand-surface p-4">
                                            <div className="flex items-center gap-3">
                                                <HardDrive className="size-5 text-brand-on-surface-variant" />
                                                <span className="text-brand-on-surface">PHP Extensions</span>
                                            </div>
                                            <StatusBadge ok={requirements.all_extensions_installed} />
                                        </div>
                                        {!requirements.all_extensions_installed && (
                                            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">
                                                Missing: {requirements.extensions
                                                    .filter((e) => !e.installed)
                                                    .map((e) => e.name)
                                                    .join(', ')}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between rounded-lg border border-brand-outline-variant bg-brand-surface p-4">
                                            <div className="flex items-center gap-3">
                                                <FolderOpen className="size-5 text-brand-on-surface-variant" />
                                                <span className="text-brand-on-surface">Storage Writable</span>
                                            </div>
                                            <StatusBadge ok={requirements.storage_writable} />
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border border-brand-outline-variant bg-brand-surface p-4">
                                            <div className="flex items-center gap-3">
                                                <Database className="size-5 text-brand-on-surface-variant" />
                                                <span className="text-brand-on-surface">Cache Writable</span>
                                            </div>
                                            <StatusBadge ok={requirements.cache_writable} />
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border border-brand-outline-variant bg-brand-surface p-4">
                                            <div className="flex items-center gap-3">
                                                <FileCode className="size-5 text-brand-on-surface-variant" />
                                                <span className="text-brand-on-surface">.env File Exists</span>
                                            </div>
                                            <StatusBadge ok={requirements.env_exists} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 1: License */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="license-key">License Key</Label>
                                    <Input
                                        id="license-key"
                                        value={licenseKey}
                                        onChange={(e) => setLicenseKey(e.target.value)}
                                        placeholder="XXXX-XXXX-XXXX-XXXX"
                                        className="border-brand-outline-variant bg-brand-surface text-brand-on-surface placeholder:text-brand-outline"
                                    />
                                    <p className="text-xs text-brand-on-surface-variant">
                                        Enter the license key provided by your CRM.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Server */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="app-url">Application URL</Label>
                                    <Input
                                        id="app-url"
                                        value={appUrl}
                                        onChange={(e) => setAppUrl(e.target.value)}
                                        placeholder="https://yourdomain.com"
                                        className="border-brand-outline-variant bg-brand-surface text-brand-on-surface placeholder:text-brand-outline"
                                    />
                                    <p className="text-xs text-brand-on-surface-variant">
                                        This must match the domain where the application is hosted.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Database */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="db-host">Host</Label>
                                        <Input
                                            id="db-host"
                                            value={dbHost}
                                            onChange={(e) => setDbHost(e.target.value)}
                                            className="border-brand-outline-variant bg-brand-surface text-brand-on-surface"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="db-port">Port</Label>
                                        <Input
                                            id="db-port"
                                            value={dbPort}
                                            onChange={(e) => setDbPort(e.target.value)}
                                            className="border-brand-outline-variant bg-brand-surface text-brand-on-surface"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="db-name">Database Name</Label>
                                    <Input
                                        id="db-name"
                                        value={dbDatabase}
                                        onChange={(e) => setDbDatabase(e.target.value)}
                                        className="border-brand-outline-variant bg-brand-surface text-brand-on-surface"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="db-user">Database User</Label>
                                    <Input
                                        id="db-user"
                                        value={dbUsername}
                                        onChange={(e) => setDbUsername(e.target.value)}
                                        className="border-brand-outline-variant bg-brand-surface text-brand-on-surface"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="db-pass">Database Password</Label>
                                    <Input
                                        id="db-pass"
                                        type="password"
                                        value={dbPassword}
                                        onChange={(e) => setDbPassword(e.target.value)}
                                        className="border-brand-outline-variant bg-brand-surface text-brand-on-surface"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Admin */}
                        {step === 4 && (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-email">Admin Email</Label>
                                    <Input
                                        id="admin-email"
                                        type="email"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        className="border-brand-outline-variant bg-brand-surface text-brand-on-surface placeholder:text-brand-outline"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admin-pass">Admin Password</Label>
                                    <Input
                                        id="admin-pass"
                                        type="password"
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        className="border-brand-outline-variant bg-brand-surface text-brand-on-surface placeholder:text-brand-outline"
                                    />
                                    <p className="text-xs text-brand-on-surface-variant">
                                        This account will have full Super Admin access.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Installing */}
                        {step === 5 && (
                            <div className="py-10 text-center">
                                {!installComplete ? (
                                    <div className="flex flex-col items-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10">
                                            <Spinner className="size-8 text-brand-primary" />
                                        </div>
                                        <p className="text-lg font-medium text-brand-on-surface">
                                            {installProgress || 'Installing...'}
                                        </p>
                                        <p className="mt-1 text-sm text-brand-on-surface-variant">
                                            Please do not close this window.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                                            <CheckCircle className="size-8 text-green-500" />
                                        </div>
                                        <p className="text-xl font-semibold text-brand-on-surface">
                                            Installation Complete!
                                        </p>
                                        <p className="mt-2 text-brand-on-surface-variant">
                                            You can now log in with your admin credentials.
                                        </p>
                                        <Button
                                            onClick={() => router.visit('/login')}
                                            className="mt-6 bg-brand-primary text-brand-surface hover:bg-brand-tertiary"
                                        >
                                            Go to Login
                                            <ChevronRight className="ml-1 size-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>

                    {step < 5 && (
                        <>
                            <Separator className="bg-brand-outline-variant" />
                            <CardFooter className="flex justify-between pt-6">
                                {step > 0 ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(step - 1)}
                                        className="border-brand-outline-variant bg-brand-surface text-brand-on-surface-variant hover:bg-brand-surface-container-high hover:text-brand-on-surface"
                                    >
                                        <ChevronLeft className="mr-1 size-4" />
                                        Back
                                    </Button>
                                ) : (
                                    <div />
                                )}
                                <Button
                                    onClick={nextStep}
                                    disabled={!canProceed() || loading}
                                    className="bg-brand-primary text-brand-surface hover:bg-brand-tertiary disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner className="mr-2 size-4" />
                                            Processing...
                                        </>
                                    ) : step === 4 ? (
                                        <>
                                            Install
                                            <Rocket className="ml-1 size-4" />
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ChevronRight className="ml-1 size-4" />
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}

function StatusBadge({ ok }: { ok: boolean }) {
    return ok ? (
        <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
            <CheckCircle className="mr-1 size-3" />
            Pass
        </Badge>
    ) : (
        <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
            <XCircle className="mr-1 size-3" />
            Fail
        </Badge>
    );
}
