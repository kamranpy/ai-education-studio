import { Link, usePage } from '@inertiajs/react';
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

// ── Icons ────────────────────────────────────────────────────────────────────

function MenuIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
    );
}

function BellIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
    );
}

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
        <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
            style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: '2px solid rgba(195, 192, 255, 0.2)',
                color: '#fff',
            }}
        >
            {initials}
        </div>
    );
}

// ── Nav item config ───────────────────────────────────────────────────────────

type NavItem = {
    title: string;
    href: string;
    icon: string; // Material Symbols icon name
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
            icon: 'dashboard',
            matchPrefix: '/admin/dashboard',
        },
        {
            title: 'Exams',
            href: examsIndex.url(),
            icon: 'quiz',
            matchPrefix: '/admin/exams',
        },
        {
            title: 'Users',
            href: usersIndex.url(),
            icon: 'group',
            matchPrefix: '/admin/users',
        },
        {
            title: 'Billing',
            href: billingIndex.url(),
            icon: 'payments',
            matchPrefix: '/institute/billing',
        },
        {
            title: 'Settings',
            href: profileEdit.url(),
            icon: 'settings',
            matchPrefix: '/settings',
        },
    ];

    const breadcrumbLabel = getBreadcrumbLabel(url);

    const sidebarContent = (
        <>
            {/* Brand header */}
            <div className="px-3 pb-5 mb-2" style={{ borderBottom: '1px solid var(--portal-card-border)' }}>
                <div className="flex items-center gap-3 mb-3">
                    {/* School icon in rounded square */}
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(195, 192, 255, 0.15)' }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{
                                color: 'var(--brand-primary-text)',
                                fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20",
                                fontSize: '22px',
                            }}
                        >
                            school
                        </span>
                    </div>
                    <h1
                        className="text-sm font-bold tracking-tight leading-tight"
                        style={{ color: 'var(--brand-primary-text)' }}
                    >
                        AI Education Studio
                    </h1>
                </div>

                {/* Institute badge */}
                {instituteName?.name && (
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                        style={{
                            background: 'rgba(79, 219, 200, 0.08)',
                            border: '1px solid rgba(79, 219, 200, 0.25)',
                        }}
                    >
                        <span
                            className="institute-pulse-dot"
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--brand-secondary)',
                                display: 'inline-block',
                                flexShrink: 0,
                                animation: 'institutePulse 2s infinite',
                            }}
                        />
                        <span
                            className="text-xs font-semibold truncate max-w-[160px]"
                            style={{ color: 'var(--brand-secondary)' }}
                        >
                            {instituteName.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = url.startsWith(item.matchPrefix);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200"
                            style={
                                isActive
                                    ? {
                                          background: 'var(--portal-nav-active-bg)',
                                          color: 'var(--portal-nav-active-text)',
                                          borderRight: '2px solid var(--portal-nav-active-border)',
                                          fontWeight: 700,
                                      }
                                    : {
                                          color: 'var(--portal-nav-text)',
                                      }
                            }
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLElement).style.background =
                                        'var(--portal-nav-hover-bg)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLElement).style.background =
                                        'transparent';
                                }
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: '20px',
                                    fontVariationSettings:
                                        "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                                }}
                            >
                                {item.icon}
                            </span>
                            <span className="text-xs font-medium tracking-wide">{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div
                className="px-2 pt-3 mt-auto space-y-1"
                style={{ borderTop: '1px solid var(--portal-card-border)' }}
            >
                <Link
                    href={profileEdit.url()}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200"
                    style={{ color: 'var(--portal-nav-text)' }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                            'var(--portal-nav-hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{
                            fontSize: '20px',
                            fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                        }}
                    >
                        account_circle
                    </span>
                    <span className="text-xs font-medium tracking-wide">Profile</span>
                </Link>

                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200"
                    style={{ color: 'var(--brand-error)' }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                            'rgba(255, 180, 171, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{
                            fontSize: '20px',
                            fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20",
                        }}
                    >
                        logout
                    </span>
                    <span className="text-xs font-medium tracking-wide">Logout</span>
                </Link>
            </div>
        </>
    );

    return (
        <>
            {/* Pulse animation for institute badge */}
            <style>{`
                @keyframes institutePulse {
                    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 219, 200, 0.7); }
                    70%  { transform: scale(1);    box-shadow: 0 0 0 6px rgba(79, 219, 200, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 219, 200, 0); }
                }
            `}</style>

            {/* Force dark mode — admin portal is dark-only by design */}
            <div
                className="dark min-h-screen"
                style={{ backgroundColor: 'var(--portal-bg)', fontFamily: 'Inter, sans-serif' }}
            >
                {/* Desktop sidebar */}
                <aside
                    className="hidden md:flex fixed left-0 top-0 h-screen flex-col py-6 z-50"
                    style={{
                        width: '280px',
                        backgroundColor: 'var(--portal-sidebar-bg)',
                        borderRight: '1px solid var(--portal-card-border)',
                    }}
                >
                    {sidebarContent}
                </aside>

                {/* Mobile overlay */}
                {mobileOpen && (
                    <div
                        className="md:hidden fixed inset-0 z-40"
                        onClick={() => setMobileOpen(false)}
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    />
                )}

                {/* Mobile drawer */}
                <aside
                    className="md:hidden fixed left-0 top-0 h-screen flex flex-col py-6 z-50 transition-transform duration-300"
                    style={{
                        width: '280px',
                        backgroundColor: 'var(--portal-sidebar-bg)',
                        borderRight: '1px solid var(--portal-card-border)',
                        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                    }}
                >
                    {sidebarContent}
                </aside>

                {/* Main content */}
                <div className="md:ml-[280px] flex flex-col min-h-screen">
                    {/* Topbar */}
                    <header
                        className="sticky top-0 z-40 flex items-center justify-between h-16 px-6"
                        style={{
                            backgroundColor: 'var(--portal-topbar-bg)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderBottom: '1px solid var(--portal-card-border)',
                        }}
                    >
                        {/* Left: hamburger (mobile) + breadcrumb */}
                        <div className="flex items-center gap-3">
                            <button
                                className="md:hidden p-2 rounded-full transition-colors"
                                style={{ color: 'var(--portal-text-secondary)' }}
                                onClick={() => setMobileOpen((v) => !v)}
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                            </button>

                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-1">
                                <span
                                    className="text-sm"
                                    style={{ color: 'var(--portal-text-muted)' }}
                                >
                                    Admin
                                </span>
                                <span style={{ color: 'var(--portal-text-muted)' }}>
                                    <ChevronRightIcon />
                                </span>
                                <span
                                    className="text-sm font-semibold"
                                    style={{ color: 'var(--portal-text-primary)' }}
                                >
                                    {breadcrumbLabel}
                                </span>
                            </nav>
                        </div>

                        {/* Right: notifications + theme + user */}
                        <div className="flex items-center gap-2">
                            {/* Notification bell with red dot */}
                            <div className="relative">
                                <button
                                    className="p-2 rounded-full transition-colors"
                                    style={{ color: 'var(--portal-text-secondary)' }}
                                    aria-label="Notifications"
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.color =
                                            'var(--portal-text-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.color =
                                            'var(--portal-text-secondary)';
                                    }}
                                >
                                    <BellIcon />
                                </button>
                                {/* Red dot badge */}
                                <span
                                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: 'var(--brand-error)',
                                        border: '1.5px solid var(--portal-topbar-bg)',
                                    }}
                                />
                            </div>

                            {/* Theme Switcher */}
                            <div className="pl-1">
                                <ThemeDropdown />
                            </div>

                            {/* User avatar + name */}
                            {user && (
                                <div className="flex items-center gap-2 ml-1">
                                    <UserAvatar user={user} />
                                    <div className="hidden md:block">
                                        <p
                                            className="text-xs font-semibold leading-none"
                                            style={{ color: 'var(--portal-text-primary)' }}
                                        >
                                            {user.name}
                                        </p>
                                        <p
                                            className="text-[10px] mt-0.5 uppercase tracking-wider"
                                            style={{ color: 'var(--portal-text-muted)' }}
                                        >
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
