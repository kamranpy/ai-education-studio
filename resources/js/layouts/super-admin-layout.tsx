import { Link, usePage } from '@inertiajs/react';
import {
    Close,
    CreditCard,
    Dashboard,
    Language,
    Logout,
    Menu,
    Notifications,
    School,
    Settings,
    SmartToy,
    VpnKey,
} from '@material-symbols-svg/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { index as creditPackagesIndex } from '@/actions/App/Http/Controllers/SuperAdmin/CreditPackageController';
import { index as institutesIndex } from '@/actions/App/Http/Controllers/SuperAdmin/InstituteController';
import { index as websiteSettingsIndex } from '@/actions/App/Http/Controllers/SuperAdmin/SiteSettingController';
import { index as billingIndex } from '@/actions/App/Http/Controllers/SuperAdmin/StripeSettingController';
import { ThemeDropdown } from '@/components/theme-dropdown';
import { logout } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import type { User } from '@/types';
import type { SiteConfig } from '@/types/global';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function UserAvatar({ user }: { user: User }) {
    return (
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white bg-linear-to-br from-indigo-500 to-violet-600 ring-2 ring-white/20">
            {getInitials(user.name)}
        </div>
    );
}

// ── Nav config ────────────────────────────────────────────────────────────────

type NavItem = {
    title: string;
    href: string;
    icon: (props: { className?: string }) => ReactNode;
    matchPrefix: string;
};

// ── Layout ────────────────────────────────────────────────────────────────────

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage();
    const user = props.auth?.user as User | undefined;
    const site = props.site as SiteConfig | undefined;
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems: NavItem[] = [
        { title: 'Dashboard', href: '/super-admin/dashboard', icon: Dashboard, matchPrefix: '/super-admin/dashboard' },
        { title: 'Institutes', href: institutesIndex.url(), icon: School, matchPrefix: '/super-admin/institutes' },
        { title: 'LLM Provider', href: '/super-admin/llm', icon: SmartToy, matchPrefix: '/super-admin/llm' },
        { title: 'Billing', href: billingIndex.url(), icon: CreditCard, matchPrefix: '/super-admin/billing' },
        { title: 'Credit Packages', href: creditPackagesIndex.url(), icon: CreditCard, matchPrefix: '/super-admin/credit-packages' },
        { title: 'Website Settings', href: websiteSettingsIndex.url(), icon: Language, matchPrefix: '/super-admin/settings/website' },
        { title: 'License', href: '/super-admin/license', icon: VpnKey, matchPrefix: '/super-admin/license' },
    ];

    const getPageTitle = () => {
        if (url.startsWith('/super-admin/dashboard')) {
            return 'Dashboard';
        }

        if (url.startsWith('/super-admin/institutes')) {
            return 'Institutes';
        }

        if (url.startsWith('/super-admin/llm')) {
            return 'LLM Provider';
        }

        if (url.startsWith('/super-admin/billing')) {
            return 'Billing';
        }

        if (url.startsWith('/super-admin/credit-packages')) {
            return 'Credit Packages';
        }

        if (url.startsWith('/super-admin/settings/website')) {
            return 'Website Settings';
        }

        if (url.startsWith('/super-admin/license')) {
            return 'License';
        }

        return 'Super Admin';
    };

    const sidebarContent = (
        <>
            {/* Brand header */}
            <div className="px-4 pb-0 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-primary/15 overflow-hidden">
                        {site?.logo_url ? (
                            <img src={site.logo_url} alt={site.name} className="size-7 object-contain" />
                        ) : (
                            <School className="size-5 text-brand-primary-text" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight leading-tight text-brand-primary-text">
                            {site?.name ?? 'Admin Portal'}
                        </h1>
                        <p className="text-xs text-(--portal-text-muted)">Super User</p>
                    </div>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = url.startsWith(item.matchPrefix);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-r-full transition-all duration-200 ${
                                isActive
                                    ? 'bg-(--portal-nav-active-bg) text-(--portal-nav-active-text) border-l-4 border-(--portal-nav-active-border)'
                                    : 'text-(--portal-nav-text) hover:bg-(--portal-nav-hover-bg)'
                            }`}
                        >
                            <Icon className="size-5" />
                            <span className="text-xs font-medium tracking-wider uppercase">{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-2 mt-auto space-y-1">
                {user && (
                    <div className="flex items-center gap-3 px-4 py-2.5 mb-1">
                        <UserAvatar user={user} />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold leading-none truncate text-(--portal-text-primary)">
                                {user.name}
                            </p>
                            <p className="text-[10px] mt-0.5 uppercase tracking-wider text-(--portal-text-muted)">
                                Super Admin
                            </p>
                        </div>
                    </div>
                )}
                <Link
                    href={profileEdit()}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 text-(--portal-nav-text) hover:bg-(--portal-nav-hover-bg)"
                >
                    <Settings className="size-5" />
                    <span className="text-xs font-medium tracking-wider uppercase">Profile</span>
                </Link>
                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 text-brand-error hover:bg-red-500/10"
                >
                    <Logout className="size-5" />
                    <span className="text-xs font-medium tracking-wider uppercase">Logout</span>
                </Link>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-(--portal-bg) font-sans">
            {/* Desktop sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[280px] flex-col py-8 z-50 bg-(--portal-sidebar-bg) border-r border-(--portal-card-border)">
                {sidebarContent}
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/60"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={`md:hidden fixed left-0 top-0 h-screen w-[280px] flex flex-col py-8 z-50 transition-transform duration-300 bg-(--portal-sidebar-bg) border-r border-(--portal-card-border) ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebarContent}
            </aside>

            {/* Main content */}
            <div className="md:ml-[280px] flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-(--portal-topbar-bg) backdrop-blur-xl border-b border-(--portal-card-border)">
                    {/* Left: hamburger (mobile) + breadcrumb */}
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 rounded-full transition-colors text-(--portal-text-secondary)"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <Close className="size-6" /> : <Menu className="size-6" />}
                        </button>
                        <nav className="flex items-center gap-1 text-sm">
                            <span className="text-(--portal-text-muted)">Super Admin /</span>
                            <span className="font-semibold text-(--portal-text-primary)">{getPageTitle()}</span>
                        </nav>
                    </div>

                    {/* Right: theme + bell + avatar */}
                    <div className="flex items-center gap-2">
                        <ThemeDropdown />
                        <button
                            className="p-2 rounded-full transition-colors text-(--portal-text-secondary) hover:text-(--portal-text-primary)"
                            aria-label="Notifications"
                        >
                            <Notifications className="size-5" />
                        </button>
                        {user && (
                            <div className="flex items-center gap-2 ml-1">
                                <UserAvatar user={user} />
                                <div className="hidden md:block">
                                    <p className="text-xs font-semibold leading-none text-(--portal-text-primary)">
                                        {user.name}
                                    </p>
                                    <p className="text-[10px] mt-0.5 uppercase tracking-wider text-(--portal-text-muted)">
                                        Super Admin
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
