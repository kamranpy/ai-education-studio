import { router, useForm } from '@inertiajs/react';
import {
    Eye,
    Globe,
    Image as ImageIcon,
    Loader2,
    Mail,
    Settings as SettingsIcon,
    Trash2,
    Upload,
} from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import {
    deleteFavicon,
    deleteLogo,
    updateBranding,
    updateContact,
    updateFlags,
    uploadFavicon,
    uploadLogo,
} from '@/actions/App/Http/Controllers/SuperAdmin/SiteSettingController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SuperAdminLayout from '@/layouts/super-admin-layout';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BrandingProps {
    site_name: string;
    site_tagline: string;
    logo_url: string | null;
    favicon_url: string | null;
}

interface ContactProps {
    support_email: string;
    social_facebook: string;
    social_twitter: string;
    social_linkedin: string;
    social_instagram: string;
    footer_text: string;
}

interface FlagsProps {
    registration_open: boolean;
    maintenance_mode: boolean;
}

interface Props {
    branding: BrandingProps;
    contact: ContactProps;
    flags: FlagsProps;
}

// ── Branding Tab ──────────────────────────────────────────────────────────────

function BrandingTab({ branding }: { branding: BrandingProps }) {
    const textForm = useForm({
        site_name: branding.site_name,
        site_tagline: branding.site_tagline,
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const logoForm = useForm<{ logo: File | null }>({
        logo: null,
    });

    const faviconForm = useForm<{ favicon: File | null }>({
        favicon: null,
    });

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: 'logo' | 'favicon' | null;
    }>({ open: false, type: null });

    function handleTextSave(e: FormEvent) {
        e.preventDefault();
        textForm.post(updateBranding.url(), { preserveScroll: true });
    }

    function handleLogoUpload(e: FormEvent) {
        e.preventDefault();
        if (!logoForm.data.logo) return;
        logoForm.post(uploadLogo.url(), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                logoForm.reset('logo');
                if (logoInputRef.current) logoInputRef.current.value = '';
            },
        });
    }

    function openDeleteDialog(type: 'logo' | 'favicon') {
        setDeleteDialog({ open: true, type });
    }

    function closeDeleteDialog() {
        setDeleteDialog({ open: false, type: null });
    }

    function confirmDelete() {
        if (deleteDialog.type === 'logo') {
            router.delete(deleteLogo.url(), { preserveScroll: true });
        } else if (deleteDialog.type === 'favicon') {
            router.delete(deleteFavicon.url(), { preserveScroll: true });
        }
        closeDeleteDialog();
    }

    function handleFaviconUpload(e: FormEvent) {
        e.preventDefault();
        if (!faviconForm.data.favicon) return;
        faviconForm.post(uploadFavicon.url(), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                faviconForm.reset('favicon');
                if (faviconInputRef.current) faviconInputRef.current.value = '';
            },
        });
    }

    function handleFaviconDelete() {
        openDeleteDialog('favicon');
    }

    return (
        <div className="space-y-6">
            {/* Site identity */}
            <form onSubmit={handleTextSave}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="size-5" />
                            Site Identity
                        </CardTitle>
                        <CardDescription>
                            Your site name appears in browser tabs and across
                            all portal headers. The tagline appears on the
                            public homepage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="site_name">Site name</Label>
                            <Input
                                id="site_name"
                                value={textForm.data.site_name}
                                onChange={(e) =>
                                    textForm.setData('site_name', e.target.value)
                                }
                                placeholder="My Education Platform"
                            />
                            {textForm.errors.site_name && (
                                <p className="text-sm text-destructive">
                                    {textForm.errors.site_name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="site_tagline">Tagline</Label>
                            <Input
                                id="site_tagline"
                                value={textForm.data.site_tagline}
                                onChange={(e) =>
                                    textForm.setData(
                                        'site_tagline',
                                        e.target.value,
                                    )
                                }
                                placeholder="AI-powered exam platform"
                            />
                            <p className="text-xs text-muted-foreground">
                                Shown in the homepage hero.
                            </p>
                            {textForm.errors.site_tagline && (
                                <p className="text-sm text-destructive">
                                    {textForm.errors.site_tagline}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={textForm.processing}>
                            {textForm.processing && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Save branding
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            {/* Logo */}
            <form onSubmit={handleLogoUpload}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="size-5" />
                            Site logo
                        </CardTitle>
                        <CardDescription>
                            Resized to max 400px wide on upload. Accepted: PNG,
                            JPG, SVG, ICO, WebP (max 2MB).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {branding.logo_url && (
                            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                                <div className="flex h-16 items-center justify-center rounded-md bg-muted px-4">
                                    <img
                                        src={branding.logo_url}
                                        alt="Current logo"
                                        className="h-12 w-auto object-contain"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        Current logo
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Shown in sidebar headers and the
                                        homepage navbar.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDeleteDialog('logo')}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Remove
                                </Button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="logo">Upload new logo</Label>
                            <Input
                                ref={logoInputRef}
                                id="logo"
                                type="file"
                                accept=".png,.jpg,.jpeg,.svg,.ico,.webp"
                                onChange={(e) => {
                                    logoForm.setData(
                                        'logo',
                                        e.target.files?.[0] ?? null,
                                    );
                                }}
                            />
                            {logoForm.errors.logo && (
                                <p className="text-sm text-destructive">
                                    {logoForm.errors.logo}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            disabled={
                                logoForm.processing || !logoForm.data.logo
                            }
                        >
                            {logoForm.processing ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 size-4" />
                            )}
                            Upload logo
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && closeDeleteDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Remove {deleteDialog.type === 'logo' ? 'Logo' : 'Favicon'}
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove the current {deleteDialog.type}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDeleteDialog}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            <Trash2 className="mr-2 size-4" />
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Favicon */}
            <form onSubmit={handleFaviconUpload}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="size-5" />
                            Favicon
                        </CardTitle>
                        <CardDescription>
                            Resized to 64×64. Accepted: PNG, JPG, ICO, WebP
                            (max 1MB).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {branding.favicon_url && (
                            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                                    <img
                                        src={branding.favicon_url}
                                        alt="Current favicon"
                                        className="size-8 object-contain"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        Current favicon
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Shown in browser tabs.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleFaviconDelete}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Remove
                                </Button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="favicon">Upload new favicon</Label>
                            <Input
                                ref={faviconInputRef}
                                id="favicon"
                                type="file"
                                accept=".png,.jpg,.jpeg,.ico,.webp"
                                onChange={(e) => {
                                    faviconForm.setData(
                                        'favicon',
                                        e.target.files?.[0] ?? null,
                                    );
                                }}
                            />
                            {faviconForm.errors.favicon && (
                                <p className="text-sm text-destructive">
                                    {faviconForm.errors.favicon}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            disabled={
                                faviconForm.processing ||
                                !faviconForm.data.favicon
                            }
                        >
                            {faviconForm.processing ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 size-4" />
                            )}
                            Upload favicon
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}

// ── Contact Tab ───────────────────────────────────────────────────────────────

function ContactTab({ contact }: { contact: ContactProps }) {
    const form = useForm({
        support_email: contact.support_email,
        social_facebook: contact.social_facebook,
        social_twitter: contact.social_twitter,
        social_linkedin: contact.social_linkedin,
        social_instagram: contact.social_instagram,
        footer_text: contact.footer_text,
    });

    function handleSave(e: FormEvent) {
        e.preventDefault();
        form.post(updateContact.url(), { preserveScroll: true });
    }

    return (
        <form onSubmit={handleSave}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="size-5" />
                        Contact & Social
                    </CardTitle>
                    <CardDescription>
                        Support email, social media links, and footer copy.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="support_email">Support email</Label>
                        <Input
                            id="support_email"
                            type="email"
                            value={form.data.support_email}
                            onChange={(e) =>
                                form.setData('support_email', e.target.value)
                            }
                            placeholder="support@example.com"
                        />
                        {form.errors.support_email && (
                            <p className="text-sm text-destructive">
                                {form.errors.support_email}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="social_facebook">Facebook URL</Label>
                            <Input
                                id="social_facebook"
                                type="url"
                                value={form.data.social_facebook}
                                onChange={(e) =>
                                    form.setData(
                                        'social_facebook',
                                        e.target.value,
                                    )
                                }
                                placeholder="https://facebook.com/..."
                            />
                            {form.errors.social_facebook && (
                                <p className="text-sm text-destructive">
                                    {form.errors.social_facebook}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="social_twitter">Twitter URL</Label>
                            <Input
                                id="social_twitter"
                                type="url"
                                value={form.data.social_twitter}
                                onChange={(e) =>
                                    form.setData(
                                        'social_twitter',
                                        e.target.value,
                                    )
                                }
                                placeholder="https://twitter.com/..."
                            />
                            {form.errors.social_twitter && (
                                <p className="text-sm text-destructive">
                                    {form.errors.social_twitter}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="social_linkedin">LinkedIn URL</Label>
                            <Input
                                id="social_linkedin"
                                type="url"
                                value={form.data.social_linkedin}
                                onChange={(e) =>
                                    form.setData(
                                        'social_linkedin',
                                        e.target.value,
                                    )
                                }
                                placeholder="https://linkedin.com/..."
                            />
                            {form.errors.social_linkedin && (
                                <p className="text-sm text-destructive">
                                    {form.errors.social_linkedin}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="social_instagram">
                                Instagram URL
                            </Label>
                            <Input
                                id="social_instagram"
                                type="url"
                                value={form.data.social_instagram}
                                onChange={(e) =>
                                    form.setData(
                                        'social_instagram',
                                        e.target.value,
                                    )
                                }
                                placeholder="https://instagram.com/..."
                            />
                            {form.errors.social_instagram && (
                                <p className="text-sm text-destructive">
                                    {form.errors.social_instagram}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="footer_text">Footer text</Label>
                        <Input
                            id="footer_text"
                            value={form.data.footer_text}
                            onChange={(e) =>
                                form.setData('footer_text', e.target.value)
                            }
                            placeholder="© 2026 My Education Platform"
                        />
                        {form.errors.footer_text && (
                            <p className="text-sm text-destructive">
                                {form.errors.footer_text}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing && (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Save contact &amp; social
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

// ── Feature Flags Tab ─────────────────────────────────────────────────────────

function FlagsTab({ flags }: { flags: FlagsProps }) {
    const form = useForm({
        registration_open: flags.registration_open,
        maintenance_mode: flags.maintenance_mode,
    });

    function handleSave(e: FormEvent) {
        e.preventDefault();
        form.post(updateFlags.url(), { preserveScroll: true });
    }

    return (
        <form onSubmit={handleSave}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="size-5" />
                        Feature Flags
                    </CardTitle>
                    <CardDescription>
                        Toggle platform-wide registration and maintenance.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                        <div className="space-y-1">
                            <Label
                                htmlFor="registration_open"
                                className="text-base"
                            >
                                Registration open
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                When off, the register page shows a closed
                                notice and the form is hidden.
                            </p>
                        </div>
                        <Switch
                            id="registration_open"
                            checked={form.data.registration_open}
                            onCheckedChange={(checked) =>
                                form.setData('registration_open', checked)
                            }
                        />
                    </div>

                    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                        <div className="space-y-1">
                            <Label
                                htmlFor="maintenance_mode"
                                className="text-base"
                            >
                                Maintenance mode
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Only Super Admin can access the platform. All
                                others see a maintenance page.
                            </p>
                        </div>
                        <Switch
                            id="maintenance_mode"
                            checked={form.data.maintenance_mode}
                            onCheckedChange={(checked) =>
                                form.setData('maintenance_mode', checked)
                            }
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing && (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Save feature flags
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function WebsiteSettings({ branding, contact, flags }: Props) {
    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Website Settings
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Configure global branding, contact details, and feature
                    flags.
                </p>
            </div>

            <Tabs defaultValue="branding" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="branding" className="gap-2">
                        <ImageIcon className="size-4" />
                        Branding
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="gap-2">
                        <Mail className="size-4" />
                        Contact &amp; Social
                    </TabsTrigger>
                    <TabsTrigger value="flags" className="gap-2">
                        <SettingsIcon className="size-4" />
                        Feature Flags
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="branding">
                    <BrandingTab branding={branding} />
                </TabsContent>

                <TabsContent value="contact">
                    <ContactTab contact={contact} />
                </TabsContent>

                <TabsContent value="flags">
                    <FlagsTab flags={flags} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

WebsiteSettings.layout = (page: React.ReactNode) => (
    <SuperAdminLayout>{page}</SuperAdminLayout>
);

export default WebsiteSettings;
