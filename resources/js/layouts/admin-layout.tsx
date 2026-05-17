import { Link, usePage } from '@inertiajs/react';
import {
    AccountCircle,
    BarChart,
    Close,
    Group,
    Logout,
    Menu,
    Notifications,
    Payments,
    Quiz,
    School,
    Settings,
} from '@material-symbols-svg/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { index as examsIndex } from '@/actions/App/Http/Controllers/Admin/ExamController';
import { index as usersIndex } from '@/actions/App/Http/Controllers/Admin/UserController';
import { index as billingIndex } from '@/actions/App/Http/Controllers/Institute/BillingController';
import { ThemeDropdown } from '@/components/theme-dropdown';
import { logout } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { edit as profileEdit } from '@/routes/profile';
import type { User } from '@/types/auth';

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
    const initials = getInitials(user.name);

    return (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 text-white bg-linear-to-br from-indigo-500 to-violet-600 ring-2 ring-white/20">
            {initials}
        </div>
    );
}

// ── Nav item config ───────────────────────────────────────────────────────────

type NavItem = {
    title: string;
    href: string;
    icon: (props: { className?: string }) => ReactNode;
    matchPrefix: string;
};

// ── Breadcrumb derivation ─────────────────────────────────────────────────────

function getBreadcrumbLabel(url: string): string {
    if (url.startsWith('/admin/dashboard')) {
return 'Dashboard';
}

    if (url.startsWith('/admin/exams')) {
return 'Exams';
}

    if (url.startsWith('/admin/users')) {
return 'Users';
}

    if (url.startsWith('/admin/billing') || url.startsWith('/institute/billing')) {
return 'Billing';
}

    if (url.startsWith('/settings') || url.startsWith('/profile')) {
return 'Settings';
}

    return 'Admin';
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage();
    const user = props.auth?.user as User | undefined;
    const instituteName = (user as Record<string, unknown> | undefined)
        ?.institute as { name?: string } | undefined;
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: adminDashboard.url(),
            icon: BarChart,
            matchPrefix: '/admin/dashboard',
        },
        {
            title: 'Exams',
            href: examsIndex.url(),
            icon: Quiz,
            matchPrefix: '/admin/exams',
        },
        {
            title: 'Users',
            href: usersIndex.url(),
            icon: Group,
            matchPrefix: '/admin/users',
        },
        {
            title: 'Billing',
            href: billingIndex.url(),
            icon: Payments,
            matchPrefix: '/institute/billing',
        },
        {
            title: 'Settings',
            href: profileEdit.url(),
            icon: Settings,
            matchPrefix: '/settings',
        },
    ];

    const breadcrumbLabel = getBreadcrumbLabel(url);

    const sidebarContent = (
        <>
            {/* Brand header */}
            <div className="px-4 pb-0 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    {/* School icon in rounded square */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-primary/15">
                        <School className="size-5 text-brand-primary-text" />
                    </div>
                    <h1 className="text-sm font-bold tracking-tight leading-tight text-brand-primary-text">
                        AI Education Studio
                    </h1>
                </div>

                {/* Institute badge */}
                {instituteName?.name && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/8 border border-brand-secondary/25">
                        <span className="w-2 h-2 rounded-full bg-brand-secondary shrink-0 animate-pulse" />
                        <span className="text-xs font-semibold truncate max-w-[160px] text-brand-secondary">
                            {instituteName.name}
                        </span>
                    </div>
                )}
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
                <Link
                    href={profileEdit.url()}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 text-(--portal-nav-text) hover:bg-(--portal-nav-hover-bg)"
                >
                    <AccountCircle className="size-5" />
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
        <>
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

                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2">
                                <span className="hidden md:block text-sm text-(--portal-text-muted)">Admin /</span>
                                <span className="text-sm font-semibold text-(--portal-text-primary)">
                                    {breadcrumbLabel}
                                </span>
                            </div>
                        </div>

                        {/* Right: theme + notifications + user */}
                        <div className="flex items-center gap-2">
                            <ThemeDropdown />

                            <button
                                className="p-2 rounded-full transition-colors text-(--portal-text-secondary) hover:text-(--portal-text-primary)"
                                aria-label="Notifications"
                            >
                                <Notifications className="size-5" />
                            </button>

                            {/* User avatar + name */}
                            {user && (
                                <div className="flex items-center gap-2 ml-1">
                                    <UserAvatar user={user} />
                                    <div className="hidden md:block">
                                        <p className="text-xs font-semibold leading-none text-(--portal-text-primary)">
                                            {user.name}
                                        </p>
                                        <p className="text-[10px] mt-0.5 uppercase tracking-wider text-(--portal-text-muted)">
                                            Admin
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-6 overflow-x-auto">{children}</main>
                </div>
            </div>
        </>
    );
}
