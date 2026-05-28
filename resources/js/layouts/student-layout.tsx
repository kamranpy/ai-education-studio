import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { index as resultsIndex } from '@/actions/App/Http/Controllers/Student/ResultsController';
import { ThemeDropdown } from '@/components/theme-dropdown';
import { logout } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import { dashboard as studentDashboard } from '@/routes/student';
import type { User } from '@/types';
import type { SiteConfig } from '@/types/global';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function UserAvatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' }) {
    const initials = getInitials(user.name);
    const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

    return (
        <div
            className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
            style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: '2px solid rgba(195, 192, 255, 0.2)',
            }}
        >
            {initials}
        </div>
    );
}

function DashboardIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" />
        </svg>
    );
}

function AnalyticsIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
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

export default function StudentLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage();
    const user = props.auth?.user as User | undefined;
    const site = props.site as SiteConfig | undefined;
    const [mobileOpen, setMobileOpen] = useState(false);

    const dashboardHref = studentDashboard.url();
    const resultsHref = resultsIndex.url();
    const settingsHref = profileEdit.url();

    const isDashboardActive = url.startsWith('/student/dashboard');
    const isResultsActive = url.startsWith('/student/results');

    // Determine breadcrumb label
    const breadcrumbLabel = isResultsActive ? 'My Results' : 'Dashboard';

    const sidebarContent = (
        <>
            {/* Brand */}
            <div className="px-6 mb-10">
                <div className="flex items-center gap-2">
                    {site?.logo_url && (
                        <img
                            src={site.logo_url}
                            alt={site.name}
                            className="h-7 w-auto object-contain"
                        />
                    )}
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--brand-primary)' }}>
                        {site?.name ?? 'AI Education Studio'}
                    </h1>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-2 space-y-1">
                <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-r-full transition-all duration-200"
                    style={isDashboardActive ? {
                        background: 'var(--portal-nav-active-bg)',
                        color: 'var(--portal-nav-active-text)',
                        borderLeft: '4px solid var(--portal-nav-active-border)',
                    } : {
                        color: 'var(--portal-nav-text)',
                    }}
                    onMouseEnter={(e) => {
                        if (!isDashboardActive) {
                            (e.currentTarget as HTMLElement).style.background = 'var(--portal-nav-hover-bg)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isDashboardActive) {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }
                    }}
                >
                    <DashboardIcon />
                    <span className="text-xs font-medium tracking-wider uppercase">Dashboard</span>
                </Link>

                <Link
                    href={resultsHref}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-r-full transition-all duration-200"
                    style={isResultsActive ? {
                        background: 'var(--portal-nav-active-bg)',
                        color: 'var(--portal-nav-active-text)',
                        borderLeft: '4px solid var(--portal-nav-active-border)',
                    } : {
                        color: 'var(--portal-nav-text)',
                    }}
                    onMouseEnter={(e) => {
                        if (!isResultsActive) {
                            (e.currentTarget as HTMLElement).style.background = 'var(--portal-nav-hover-bg)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isResultsActive) {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }
                    }}
                >
                    <AnalyticsIcon />
                    <span className="text-xs font-medium tracking-wider uppercase">My Results</span>
                </Link>
            </nav>

            {/* Bottom actions */}
            <div className="px-2 mt-auto space-y-1">
                <Link
                    href={settingsHref}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200"
                    style={{ color: 'var(--portal-nav-text)' }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--portal-nav-hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                >
                    <SettingsIcon />
                    <span className="text-xs font-medium tracking-wider uppercase">Settings</span>
                </Link>

                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200"
                    style={{ color: 'var(--brand-error)' }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255, 180, 171, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                >
                    <LogoutIcon />
                    <span className="text-xs font-medium tracking-wider uppercase">Logout</span>
                </Link>
            </div>
        </>
    );

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--portal-bg)', fontFamily: 'Inter, sans-serif' }}>
            {/* Desktop sidebar */}
            <aside
                className="hidden md:flex fixed left-0 top-0 h-screen flex-col py-8 z-50"
                style={{
                    width: '280px',
                    backgroundColor: 'var(--portal-sidebar-bg)',
                    borderRight: '1px solid var(--portal-card-border)',
                }}
            >
                {sidebarContent}
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40"
                    onClick={() => setMobileOpen(false)}
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                />
            )}

            {/* Mobile sidebar drawer */}
            <aside
                className="md:hidden fixed left-0 top-0 h-screen flex flex-col py-8 z-50 transition-transform duration-300"
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
                {/* Top bar */}
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
                        <div className="flex items-center gap-2">
                            <span className="hidden md:block text-sm" style={{ color: 'var(--portal-text-muted)' }}>
                                Portal /
                            </span>
                            <span className="text-sm font-semibold" style={{ color: 'var(--portal-text-primary)' }}>
                                {breadcrumbLabel}
                            </span>
                        </div>
                    </div>

                    {/* Right: theme switch + bell + avatar */}
                    <div className="flex items-center gap-2">
                        <ThemeDropdown />
                        <button
                            className="p-2 rounded-full transition-colors"
                            style={{ color: 'var(--portal-text-secondary)' }}
                            aria-label="Notifications"
                        >
                            <BellIcon />
                        </button>
                        {user && (
                            <div className="flex items-center gap-2 ml-1">
                                <UserAvatar user={user} size="sm" />
                                <div className="hidden md:block">
                                    <p className="text-xs font-semibold leading-none" style={{ color: 'var(--portal-text-primary)' }}>
                                        {user.name}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 pb-20 md:pb-0">{children}</main>
            </div>

            {/* Mobile bottom nav */}
            <nav
                className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-6 py-3 z-50"
                style={{
                    backgroundColor: 'var(--portal-sidebar-bg)',
                    borderTop: '1px solid var(--portal-card-border)',
                }}
            >
                <Link
                    href={dashboardHref}
                    className="flex flex-col items-center gap-1 transition-colors"
                    style={{ color: isDashboardActive ? 'var(--brand-primary-text)' : 'var(--portal-nav-text)' }}
                >
                    <DashboardIcon />
                    <span className="text-[10px] font-bold">Dashboard</span>
                </Link>
                <Link
                    href={resultsHref}
                    className="flex flex-col items-center gap-1 transition-colors"
                    style={{ color: isResultsActive ? 'var(--brand-primary-text)' : 'var(--portal-nav-text)' }}
                >
                    <AnalyticsIcon />
                    <span className="text-[10px]">Results</span>
                </Link>
            </nav>
        </div>
    );
}
