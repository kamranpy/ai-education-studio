import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    BarChart,
    Close,
    Dashboard,
    Logout,
    Menu,
    Notifications,
    Settings,
} from '@material-symbols-svg/react';
import { index as resultsIndex } from '@/actions/App/Http/Controllers/Student/ResultsController';
import { ThemeDropdown } from '@/components/theme-dropdown';
import { logout } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import { dashboard as studentDashboard } from '@/routes/student';
import type { User } from '@/types';

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
            className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white shrink-0 bg-linear-to-br from-indigo-500 to-violet-600 ring-2 ring-white/20`}
        >
            {initials}
        </div>
    );
}

export default function StudentLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage();
    const user = props.auth?.user as User | undefined;
    const [mobileOpen, setMobileOpen] = useState(false);

    const dashboardHref = studentDashboard.url();
    const resultsHref = resultsIndex.url();
    const settingsHref = profileEdit.url();

    const isDashboardActive = url.startsWith('/student/dashboard');
    const isResultsActive = url.startsWith('/student/results');

    const breadcrumbLabel = isResultsActive ? 'My Results' : 'Dashboard';

    const sidebarContent = (
        <>
            {/* Brand */}
            <div className="px-6 mb-10">
                <h1 className="text-xl font-bold tracking-tight text-brand-primary">
                    AI Education Studio
                </h1>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-2 space-y-1">
                <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-r-full transition-all duration-200 ${
                        isDashboardActive
                            ? 'bg-(--portal-nav-active-bg) text-(--portal-nav-active-text) border-l-4 border-(--portal-nav-active-border)'
                            : 'text-(--portal-nav-text) hover:bg-(--portal-nav-hover-bg)'
                    }`}
                >
                    <Dashboard className="size-5" />
                    <span className="text-xs font-medium tracking-wider uppercase">Dashboard</span>
                </Link>

                <Link
                    href={resultsHref}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-r-full transition-all duration-200 ${
                        isResultsActive
                            ? 'bg-(--portal-nav-active-bg) text-(--portal-nav-active-text) border-l-4 border-(--portal-nav-active-border)'
                            : 'text-(--portal-nav-text) hover:bg-(--portal-nav-hover-bg)'
                    }`}
                >
                    <BarChart className="size-5" />
                    <span className="text-xs font-medium tracking-wider uppercase">My Results</span>
                </Link>
            </nav>

            {/* Bottom actions */}
            <div className="px-2 mt-auto space-y-1">
                <Link
                    href={settingsHref}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 text-(--portal-nav-text) hover:bg-(--portal-nav-hover-bg)"
                >
                    <Settings className="size-5" />
                    <span className="text-xs font-medium tracking-wider uppercase">Settings</span>
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

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/60"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar drawer */}
            <aside
                className={`md:hidden fixed left-0 top-0 h-screen w-[280px] flex flex-col py-8 z-50 transition-transform duration-300 bg-(--portal-sidebar-bg) border-r border-(--portal-card-border) ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebarContent}
            </aside>

            {/* Main content */}
            <div className="md:ml-[280px] flex flex-col min-h-screen">
                {/* Top bar */}
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
                        <div className="flex items-center gap-2">
                            <span className="hidden md:block text-sm text-(--portal-text-muted)">
                                Portal /
                            </span>
                            <span className="text-sm font-semibold text-(--portal-text-primary)">
                                {breadcrumbLabel}
                            </span>
                        </div>
                    </div>

                    {/* Right: theme switch + bell + avatar */}
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
                                <UserAvatar user={user} size="sm" />
                                <div className="hidden md:block">
                                    <p className="text-xs font-semibold leading-none text-(--portal-text-primary)">
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
            <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-6 py-3 z-50 bg-(--portal-sidebar-bg) border-t border-(--portal-card-border)">
                <Link
                    href={dashboardHref}
                    className={`flex flex-col items-center gap-1 transition-colors ${isDashboardActive ? 'text-brand-primary-text' : 'text-(--portal-nav-text)'}`}
                >
                    <Dashboard className="size-5" />
                    <span className="text-[10px] font-bold">Dashboard</span>
                </Link>
                <Link
                    href={resultsHref}
                    className={`flex flex-col items-center gap-1 transition-colors ${isResultsActive ? 'text-brand-primary-text' : 'text-(--portal-nav-text)'}`}
                >
                    <BarChart className="size-5" />
                    <span className="text-[10px]">Results</span>
                </Link>
            </nav>
        </div>
    );
}
